import type { handleDirectResult, rock } from '~/types'
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const pointSort = (property: 'x' | 'y') => (firstRocks: rock, secondRocks: rock) => {
  const firstPoint = firstRocks[property]
  const secondPoint = secondRocks[property]
  return firstPoint < secondPoint ? -1 : 1
}

export const isMobile = () => window.navigator.userAgent.match(/Mobile/)

// 生成2/4数字(4出现的概率为10%)
export const random24 = () => Math.random() > 0.9 ? 4 : 2
// 生成0/1/2/3数字做为坐标
export const random0123 = () => ~~(Math.random() * 4)

export const handleDirect = (direct: 'right' | 'left' | 'up' | 'down'): handleDirectResult => {
  if (direct === 'right') {
    return {
      handleArr: (arr: Array<rock>) => arr
        .filter((e: rock) => e && e.x !== 3)
        .sort(pointSort('x'))
        .reverse(),
      handleCondition: (e: rock) => e.x < 3,
      next: (e: rock) => ({ x: e.x + 1, y: e.y }),
      handleMove: (e: rock) => e.x++,
    }
  }
  else if (direct === 'left') {
    return {
      handleArr: (arr: Array<rock>) => arr
        .filter((e: rock) => e && e.x !== 0)
        .sort(pointSort('x')),
      handleCondition: (e: rock) => e.x > 0,
      next: (e: rock) => ({ x: e.x - 1, y: e.y }),
      handleMove(e: rock) { e.x-- },
    }
  }
  else if (direct === 'up') {
    return {
      handleArr: (arr: Array<rock>) => arr
        .filter((e: rock) => e && e.y !== 0)
        .sort(pointSort('y')),
      handleCondition: (e: rock) => e.y > 0,
      next: (e: rock) => ({ x: e.x, y: e.y - 1 }),
      handleMove(e: rock) { e.y-- },
    }
  }
  return {
    handleArr: (arr: Array<rock>) => arr
      .filter((e: rock) => e && e.y !== 3)
      .sort(pointSort('y'))
      .reverse(),
    handleCondition: (e: rock) => e.y < 3,
    next: (e: rock) => ({ x: e.x, y: e.y + 1 }),
    handleMove(e: rock) { e.y++ },
  }
}

/**
 * 通过坐标获取数字块
 * @param x
 * @param y
 * @returns {undefined|T|T}
 */
export const getRockByPoint = ({ x, y }: { x: number; y: number }, rocks: Array<rock | null>) => rocks.filter(rock => rock).find(rock => rock.x === x && rock.y === y)

/**
 * 罗盘是否已经填充满了
 */
export const isFull = (rocks: Array<rock | null>) => rocks?.filter(e => e).length > 15

/**
 * 是否游戏失败
 * return true失败，反之没有结束
 */
export const isGameOver = (rocks: Array<rock | null>) => {
  const result = isFull(rocks) && rocks
    .filter(e => e && (e.x !== 3 || e.y !== 3))
    .find((e) => {
      const nextX = getRockByPoint({ x: e.x + 1, y: e.y }, rocks)
      const nextY = getRockByPoint({ x: e.x, y: e.y + 1 }, rocks)
      return (e.num === (nextX && nextX.num)
              || e.num === (nextY && nextY.num))
    })
  return result === undefined
}

/**
 * 游戏是否过关
 * return true过关，反之未过关
 */
export const isSuccess = (rocks: Array<rock | null>) => {
  const result = rocks.find((e) => {
    return e && e.num === 8192
  })
  return result !== undefined
}
