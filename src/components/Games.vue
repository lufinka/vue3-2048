<script setup lang="ts">
import { delay, getRockByPoint, handleDirect, isFull, isGameOver, isMobile, isSuccess, random0123, random24 } from '~/modules/tool'
import type { rock } from '~/types'

const score = ref(0)
const rocks = ref<Array<rock | null>>([])
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
    const moveFunc = (move: any) => {
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
  rocks.value = Array(16).fill(null)
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
  if (isFull(rocks.value)) {
    return false
  }
  else {
    const ids: Array<number> = []
    for (let i = 0; i < 16; i++) {
      if (!rocks.value[i])
        ids.push(i)
    }
    const index = ids[~~(Math.random() * ids.length)]
    createRock(index)
  }
}

function turn(direct: 'right' | 'left' | 'up' | 'down') {
  rocks.value.forEach((e) => {
    if (e) {
      e.canCalc = true
      e.isNew = false
    }
  })
  Promise.all(
    handleDirect(direct).handleArr(rocks.value)
      .filter((rock: rock) => rock)
      .map(async (e: rock) => {
        const flag = calcAxis({ e, direct })
        return flag
      }),
  ).then((res) => {
    if (res.includes(true)) {
      if (isSuccess(rocks.value)) {
        alert('你真牛逼，你赢了，我服了')
        return
      }
      else {
        add()
      }
    }
    else {
      if (isGameOver(rocks.value)) {
        alert('游戏结束请重新开始')
        return
      }
      else if (isSuccess(rocks.value)) {
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
    const next = getRockByPoint(handleDirect(direct).next(e), rocks.value)
    if (next && next.num !== e.num) {
      resolve(false)
    }
    else if (next && next.canCalc && next.num === e.num) {
      // 进行数字块的移动
      handleDirect(direct).handleMove(e)
      rocks.value.splice(getIndex(e.id), 1, null)
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
  return rocks.value.findIndex(rock => rock && rock.id === id)
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
  }, rocks.value)
  if (_isExist)
    return createRock(index)
  else
    rocks.value[index] = result
}
</script>

<template>
  <div
    class="layout"
    overflow-auto
    flex="~ col"
    items-center
    h-full
    scrolling-touch
    justify-center
  >
    <header
      flex="~"
      mxw-600
      w-full
      pd-20
      justify-between
    >
      <span
        wh-100
        inline-flex
        items-center
        justify-center
      >总分：{{ score }}</span>
      <button
        bg-coolgray
        text-white
        border-none
        text-2xl
        pd-20
        cursor-pointer
        border-rd-2

        @click="init"
      >
        开始新的游戏
      </button>
    </header>
    <div important-text-left wh-500 hh-500>
      <div
        box-content
        bg-white
        inline-flex
        flex-wrap
        p-2
        justify-between
        border-rd-2
        wh-480
        position-absolute
        z-0
      >
        <span
          v-for="v in 16"
          :key="v"
          bg-gray-100
          mg-10
          wh-100
          hh-100
          border-rd-2 z-1
        />
      </div>
      <div
        z-0
        pd-10
        wh-480
        hh-480
        inline-flex
        position-absolute
        justify-start
        items-start
        touch-none
        select-none
      >
        <span
          v-for="(e, index) in rocks"
          :key="index"
          mr-1
          wh-100
          hh-100
          border-rd-2
          position-absolute
          text-5xl
          fw500
          mg-10
          transition-property-transform
          :style="cssTransition(e)"
        >
          <span
            :id="`r${e && e.id}`"
            inline-flex
            w-full
            h-full
            text-white
            items-center
            justify-content
            border-rd-2
            :style="`background-color: ${e ? e.color : ''}`"
          >
            {{ e ? e.num : '' }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
