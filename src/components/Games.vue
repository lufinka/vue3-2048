<script setup lang="ts">
import { delay, getRockByPoint, handleDirect, isFull, isGameOver, isMobile, isSuccess, random0123, random24 } from '~/modules/tool'
import type { rock } from '~/types'

const score = ref(0)
let rocks = reactive<Array<rock | null>>([])
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
  '#A79674' = 1024,
  '#282726' = 2048,
  '#280b21' = 4096,
  '#281d04' = 8192,
}
const directX = 30

onMounted(() => {
  init()
  document.addEventListener('keydown', (e) => {
    switch (e.key.toLocaleUpperCase()) {
      case 'ARROWRIGHT':
      case 'D':
        turn('right')
        break
      case 'ARROWLEFT':
      case 'A':
        turn('left')
        break
      case 'ARROWDOWN':
      case 'S':
        turn('down')
        break
      case 'ARROWUP':
      case 'W':
        turn('up')
        break
    }
  })
  document.addEventListener('touchstart', (start) => {
    const moveFunc = (move) => {
      move && move.preventDefault()
      const dx = move.touches[0].clientX - start.touches[0].clientX
      const dy = move.touches[0].clientY - start.touches[0].clientY
      if (dx > directX) {
        turn('right')
        document.removeEventListener('touchmove', moveFunc)
      }
      else if (dx < -directX) {
        turn('left')
        document.removeEventListener('touchmove', moveFunc)
      }
      else if (dy > directX) {
        turn('down')
        document.removeEventListener('touchmove', moveFunc)
      }
      else if (dy < -directX) {
        turn('up')
        document.removeEventListener('touchmove', moveFunc)
      }
    }
    document.addEventListener('touchmove', moveFunc)
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', moveFunc)
    })
  })
})
function init() {
  score.value = 0
  initRocks()
}

function initRocks() {
  rocks = Array(16).fill(null)
  add()
  add()
  add()
}

function cssTransition(e: rock | null) {
  if (isMobile()) {
    return {
      zIndex: e ? e.num : 0,
      transition: (e && e.isNew) ? 'none' : '100ms ease-in-out',
      transform: `translate(${(e ? e.x : 0) * 23.5}vw, ${(e ? e.y : 0) * 23.5}vw)`,
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

function add() {
  if (isFull(rocks)) {
    return false
  }
  else {
    const ids: Array<number> = []
    for (let i = 0; i < 16; i++) {
      if (!rocks[i])
        ids.push(i)
    }
    const index = ids[~~(Math.random() * ids.length)]
    createRock(index)
  }
}

function turn(direct: 'right' | 'left' | 'up' | 'down') {
  rocks.forEach((e) => {
    if (e) {
      e.canCalc = true
      e.isNew = false
    }
  })
  Promise.all(
    handleDirect(direct).handleArr(rocks)
      .filter((rock: rock) => rock)
      .map(async (e: rock) => {
        const flag = calcAxis({ e, direct })
        return flag
      }),
  ).then((res) => {
    if (res.includes(true)) {
      if (isSuccess(rocks)) {
        alert('你真牛逼，你赢了，我服了')
        return
      }
      else {
        add()
      }
    }
    else {
      if (isGameOver(rocks)) {
        alert('游戏结束请重新开始')
        return
      }
      else if (isSuccess(rocks)) {
        alert('你真牛逼，你赢了，我服了')
        return
      }
    }
    setTimeout(() => {
    }, 10)
  })
}

/**
       * 合并数字块时添加移动样式
       * @param next
       */
function mergeNumericBlockAddStyle(next: rock) {
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
function calcAxis({ e, direct }: { e: rock; direct: 'right' | 'left' | 'up' | 'down' }) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const next = getRockByPoint(handleDirect(direct).next(e), rocks)
    if (next && next.num !== e.num) {
      resolve(false)
    }
    else if (next && next.canCalc && next.num === e.num) {
      // 进行数字块的移动
      handleDirect(direct).handleMove(e)
      rocks.splice(getIndex(e.id), 1, null)
      next.num *= 2
      score.value += next.num
      next.canCalc = false
      next.color = color[next.num]
      mergeNumericBlockAddStyle(next)
      await delay(200)
      resolve(true)
    }
    else if (next === undefined) {
      if (handleDirect(direct).handleCondition(e)) {
        handleDirect(direct).handleMove(e)
        calcAxis({ e, direct })
      }
      resolve(true)
    }
  })
}

function getIndex(id: number) {
  return rocks.findIndex(rock => rock && rock.id === id)
}

/**
 * 创建一个不存在数字块
 * return rock
 */
function createRock(index: number): any {
  const num = random24()
  const result = {
    x: random0123(),
    y: random0123(),
    num,
    isNew: true,
    id: index + 1,
    color: color[num],
  }
  const _isExist = getRockByPoint({
    x: result.x,
    y: result.y,
  }, rocks)
  if (_isExist) {
    return createRock(index)
  }
  else {
    // rocks[index] = result
    // $set(rocks, [index], result)
    rocks[index] = result
  }
}
</script>

<template>
  <div class="layout">
    <header>
      <span class="score">总分：{{ score }}</span>
      <button class="star" @click="init">
        开始新的游戏
      </button>
      <span class="sd" />
    </header>
    {{ rocks }}
    <div class="all-container">
      <div class="background">
        <span v-for="v in 16" :key="v" />
      </div>
      <div class="container">
        <span
          v-for="(e, index) in rocks"
          :key="index"
          class="list"
          :style="cssTransition(e)"
        >
          <span
            :id="`r${e && e.id}`"
            class="inner"
            :style="`backgroundColor: ${e ? e.color : ''}`"
          >
            {{ e ? e.num : '' }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .show {
    position: fixed;
    bottom: 50vh;
    left: 20px;
    display: flex;
    flex-direction: column;
    margin-bottom: -27%;
  }
  body {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .layout {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    height: 100%;
    overflow: auto;
    header {
      display: flex;
      max-width: 600px;
      width: 100%;
      padding: 20px;
      flex-direction: row;
      justify-content: space-around;
      button {
        border: none;
        background: #8f7a66;
        color: #fff;
        font-size: 20px;
        padding: 10px 30px;
        cursor: pointer;
        border-radius: 10px;
      }
      span {
        width: 100px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
    .all-container {
      height: 500px;
      width: 500px;
      text-align: left !important;
      .background {
        box-sizing: content-box;
        background-color: #bbada0;
        display: inline-flex;
        flex-wrap: wrap;
        padding: 10px;
        justify-content: space-between;
        border-radius: 10px;
        width: 480px;
        position: absolute;
        z-index: 0;
        & > span {
          background-color: rgba(238,228,218,0.35);
          margin: 10px;
          width: 100px;
          height: 100px;
          border-radius: 10px;
          z-index: 1;
        }
      }
      .container {
        z-index: 0;
        padding: 10px;
        width: 480px;
        height: 480px;
        display: inline-flex;
        position: absolute;
        justify-content: flex-start;
        align-items: flex-start;
        -webkit-touch-callout: none;
        -ms-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -ms-touch-action: none;
        touch-action: none;
        .list {
          margin: 10px;
          width: 100px;
          height: 100px;
          border-radius: 10px;
          position: absolute;
          font-size: 50px;
          font-weight: bold;
          transition-property: transform;
          border-radius: 10px;
          .inner {
            width: 100%;
            height: 100%;
            color: #fff;
            display: inline-flex;
            align-items: center;
            border-radius: 10px;
            justify-content: center;
            animation-fill-mode: backwards;
            animation: appear 200ms ease-in-out;
          }
        }
      }
    }
  }
  @media screen and (max-width: 900px) {
    html,body{
      overflow: hidden;
    }
    .layout{
      overflow: hidden;
      header {
        span{
          width: 70px;
        }
        button {
          padding: 10px 15px;
        }
      }
      .all-container {
        margin: 2vw;
        width: 96vw;
        height: 96vw;

        .background,.container {
          width: 96vw;
          height: 96vw;
          box-sizing: border-box;
          padding: 1vw;
          & > span,.list {
            width: 21vw;
            height: 21vw;
            margin: 1vw;
            font-size: 8vw;
          }
        }
      }
    }
  }
  @keyframes appear {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    80% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
