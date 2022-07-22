import type { Ref } from 'vue'
import { levels } from '../modules/levels'
import { delay, getRockByPoint, handleDirect, isFull, isGameOver, random024, random24 } from '~/modules/tool'
import type { rock } from '~/types'
const { width } = useWindowSize()
enum color {
  '#eee4da' = 2,
  '#ede0c8' = 4,
  '#f2b179' = 8,
  '#f59563' = 16,
  '#f67c5f' = 32,
  '#f65e3b' = 64,
  '#edcf72' = 128,
  '#edcc61' = 256,
  '#0444BF' = 512,
  '#F56C6C' = 666,
  '#E6A23C' = 777,
  '#A79674' = 1024,
  '#282726' = 2048,
  '#280b21' = 4096,
  '#281d04' = 8192,
}
// todo  1 tackle number show && disable status
type GameStatus = 'ready' | 'play' | 'won' | 'lost'
type tacklesStatus = 'ready' | 'active' | 'disable'

interface GameState {
  rocks: Array<rock | null>
  score: number // 当前分数
  level: number // 关卡
  tackle: number[] // 道具
  tackleStatus: Array<tacklesStatus> // 道具状态
  status: GameStatus
  startMS?: number
  endMS?: number
  difficulty: 'easy' | 'medium' | 'hard'
}
export class GamePlay {
  state = ref() as Ref<GameState>
  highestScore = ref<number>(0) // 最高分
  levelCounts = levels.length // 关卡数
  swapRocks = ref<Array<rock>>([]) // 道具对调的2个块

  tackle = {
    clear: (rock: rock | null) => rock && this.clear(rock),
    handleRock: (rock: rock | null) => this.handleRock(rock),
    useTackle: (i: number) => this.useTackle(i),
    rearrange: (i: number) => this.rearrange(i),
    swap: (rock: rock | null) => rock && this.swap(rock),
  }

  constructor(
    public targetScore: number,
    public difficulty: 'easy' | 'medium' | 'hard',
  ) {
    this.reset(targetScore, difficulty)
  }

  get currentLevel() {
    return levels[this.state.value.level]
  }

  reset(
    targetScore = this.targetScore,
    difficulty = this.difficulty,
  ) {
    this.targetScore = targetScore
    this.difficulty = difficulty
    this.state.value = {
      score: 0,
      status: 'ready',
      level: 0,
      tackle: [1, 1, 1],
      tackleStatus: ['ready', 'ready', 'ready'], // ready, active, disable
      rocks: Array(16).fill(null),
      difficulty: this.difficulty,
    }
    this.addRocks()
  }

  addRocks() {
    switch (this.difficulty) {
      case 'easy':
        this.add()
        this.add()
        this.add()
        break
      case 'medium':
        this.add()
        this.add(666)
        this.add()
        break
      case 'hard':
        this.add(666)
        this.add(777)
        this.add()
        break
    }
  }

  next() {
    this.state.value.level += 1
    this.state.value.score = 0
    this.state.value.status = 'ready'
    this.state.value.rocks = Array(16).fill(null)
    this.addRocks()
  }

  add(mine?: number) {
    if (isFull(this.state.value.rocks)) {
      return false
    }
    else {
      const ids: Array<number> = []
      for (let i = 0; i < 16; i++) {
        if (!this.state.value.rocks[i])
          ids.push(i)
      }
      const index = ids[~~(Math.random() * ids.length)]
      this.createRock(index, mine)
    }
  }

  /**
 * 创建一个不存在数字块
 * return rock
 */
  createRock(index: number, mine?: number): any {
    const num = mine || random24()
    const result = {
      x: random024(this.currentLevel.map[0].length),
      y: random024(this.currentLevel.map[0].length),
      num,
      isNew: true,
      id: index + 1,
      color: color[num],
    }
    const _isExist = getRockByPoint({
      x: result.x,
      y: result.y,
    }, this.state.value.rocks)
    const isDisableRock = this.currentLevel.map[result.y][result.x] === 0
    if (_isExist || isDisableRock)
      return this.createRock(index)
    else
      this.state.value.rocks[index] = result
  }

  cssTransition(e: rock | null) {
    if (width.value <= 640) {
      return {
        zIndex: e ? e.num : 0,
        transition: (e && e.isNew) ? 'none' : '100ms ease-in-out',
        transform: `translate(${(e ? e.x : 0) * 24}vw, ${(e ? e.y : 0) * 24}vw)`,
      }
    }
    else {
      return {
        zIndex: e ? e.num : 0,
        transition: (e && e.isNew) ? 'none' : '100ms ease-in-out',
        transform: `translate(${(e ? e.x : 0) * 120}px, ${(e ? e.y : 0) * 120}px)`,
      }
    }
  }

  turn(direct: 'right' | 'left' | 'up' | 'down') {
    this.state.value.rocks.forEach((e) => {
      if (e) {
        e.canCalc = true
        e.isNew = false
      }
    })

    if (this.state.value.status === 'ready') {
      this.state.value.status = 'play'
      this.state.value.startMS = +new Date()
    }

    Promise.all(
      handleDirect(direct, this.state.value.level).handleArr(this.state.value.rocks)
        .filter((rock: rock) => rock)
        .map(async (e: rock) => {
          const flag = this.calcAxis({ e, direct })
          return flag
        }),
    ).then((res) => {
      if (res.includes(true)) {
        if (this.isSuccess(this.state.value.rocks)) {
          this.state.value.status = 'won'
          if (this.state.value.level === levels.length - 1) {
            // Clearance reset
            this.reset()
          }
          else {
            delay(1000).then(() => {
              this.next()
            })
          }
        }
        this.add()
      }
      else {
        if (isGameOver(this.state.value.rocks, this.currentLevel.map)) {
          this.state.value.status = 'lost'
          alert('game over!')
        }
        else if (this.isSuccess(this.state.value.rocks)) {
          this.state.value.status = 'won'
          alert('you won，next level!')
          this.next()
        }
      }
    })
  }

  /**
   * 合并数字块时添加移动样式
   * @param next
   */
  mergeNumericBlockAddStyle(next: rock) {
    (document.querySelector(`#r${next.id}`) as Element).animate([
      { transform: 'scale(0.95)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1.03)' },
      { transform: 'scale(1)' },
    ], {
      duration: 200,
    })
  }

  // 处理移动距离的函数
  calcAxis({ e, direct }: { e: rock; direct: 'right' | 'left' | 'up' | 'down' }) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const next = getRockByPoint(handleDirect(direct, this.state.value.level).next(e), this.state.value.rocks)
      if (next && next.num !== e.num) {
        resolve(false)
      }
      else if (next && next.canCalc && next.num === e.num) {
        // 进行数字块的移动
        handleDirect(direct, this.state.value.level).handleMove(e)
        this.state.value.rocks.splice(this.getIndex(e.id), 1, null)
        next.num *= 2
        this.state.value.score += next.num
        if ((this.state.value.level === 0 && this.state.value.score >= this.highestScore.value))
          this.highestScore.value = this.state.value.score

        if (this.state.value.level !== 0)
          this.highestScore.value = next.num + this.highestScore.value

        next.canCalc = false
        next.color = color[next.num]
        this.mergeNumericBlockAddStyle(next)
        await delay(200)
        resolve(true)
      }
      else if (next === undefined) {
        const nextRock = handleDirect(direct, this.state.value.level).next(e)
        if (this.currentLevel.map[nextRock.y][nextRock.x] === 0) {
          resolve(false)
        }
        else {
          if (handleDirect(direct, this.state.value.level).handleCondition(e)) {
            handleDirect(direct, this.state.value.level).handleMove(e)
            this.calcAxis({ e, direct })
          }
          resolve(true)
        }
      }
    })
  }

  getIndex(id: number) {
    return this.state.value.rocks.findIndex(rock => rock && rock.id === id)
  }

  /**
   * 游戏是否过关
   * return true过关，反之未过关
   */
  isSuccess(rocks: Array<rock | null>) {
    const result = rocks.find((e) => {
      return e && e.num === this.targetScore
    })
    return result !== undefined
  }

  clear(rock: rock) {
    const index = this.state.value.rocks.findIndex(e => e && e.id === rock?.id)
    const currentRock = this.state.value.rocks[index]
    const obstacleRock = currentRock && [666, 777].includes(currentRock.num)
    if (this.state.value.tackleStatus[1] === 'active' && currentRock && !obstacleRock) {
      this.state.value.tackle[1]--
      this.state.value.rocks.splice(index, 1, null)
      this.state.value.tackleStatus[1] = 'disable'
    }
  }

  handleRock(rock: rock | null) {
    const acriveIndex = this.state.value.tackleStatus.findIndex(e => e === 'active')
    switch (acriveIndex) {
      case 0:
        this.tackle.swap(rock)
        break
      case 1:
        this.tackle.clear(rock)
        break
    }
  }

  useTackle(i: number) {
    switch (this.state.value.tackleStatus[i]) {
      case 'ready':
        this.state.value.tackleStatus[i] = 'active'
        break
      case 'active':
        this.state.value.tackleStatus[i] = 'ready'
        break
    }
  }

  rearrange(i: number) {
    if (this.state.value.tackleStatus[i] === 'active') {
      this.state.value.tackle[i]--
      const emptyRocks = this.state.value.rocks.filter((rock: rock | null) => !rock)
      const arr = emptyRocks.concat(this.state.value.rocks.filter((rock: rock | null) => rock).sort((a: rock | null, b: rock | null) => {
        return (a ? a.num : 0) - (b ? b.num : 0)
      }))

      let len = arr.length - 1
      for (let i = this.currentLevel.map[0].length; i >= 0; i--) {
        for (let j = 0; j <= 3; j++) {
          const isDisableRock = this.currentLevel.map[i][j] === 0
          const element = arr[len]
          if (isDisableRock) {
            continue
          }
          else {
            if (element) {
              element.x = j
              element.y = i
              len -= 1
            }
            else {
              break
            }
          }
        }
      }
    }
  }

  swap(rock: rock) {
    this.swapRocks.value.push({ ...rock })
    if (this.swapRocks.value.length === 2) {
      const rock1 = this.state.value.rocks.find(e => e && e.id === this.swapRocks.value[0].id)
      const rock2 = this.state.value.rocks.find(e => e && e.id === this.swapRocks.value[1].id)
      if (rock1 && rock2) {
        rock1.x = this.swapRocks.value[1].x
        rock1.y = this.swapRocks.value[1].y
        this.mergeNumericBlockAddStyle(rock1)
        rock2.x = this.swapRocks.value[0].x
        rock2.y = this.swapRocks.value[0].y
        this.mergeNumericBlockAddStyle(rock2)
        this.swapRocks.value = []
        this.state.value.tackleStatus[0] = 'disable'
      }
    }
  }
}
