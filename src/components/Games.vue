<script setup lang="ts">
import { GamePlay } from '~/composables/logic'
import { levels } from '~/modules/levels'
const directX = 30
const play = new GamePlay(2048, 'easy')
const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS ?? +now) - (play.state.value.startMS ?? +now)) / 1000))
useStorage('2048-state', play.state)
// 关卡（X）  当前分数  最高分
// 游戏
// 游戏
// 游戏
// 游戏
// 对调位置  消除 重排
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    switch (e.key.toLocaleUpperCase()) {
      case 'ARROWRIGHT':
      case 'D':
        play.turn('right')
        break
      case 'ARROWLEFT':
      case 'A':
        play.turn('left')
        break
      case 'ARROWDOWN':
      case 'S':
        play.turn('down')
        break
      case 'ARROWUP':
      case 'W':
        play.turn('up')
        break
    }
  })

  document.addEventListener('touchstart', (start) => {
    const moveFunc = (move: any) => {
      move && move.preventDefault()
      const dx = move.touches[0].clientX - start.touches[0].clientX
      const dy = move.touches[0].clientY - start.touches[0].clientY
      if (dx > directX) {
        play.turn('right')
        document.removeEventListener('touchmove', moveFunc)
      }
      else if (dx < -directX) {
        play.turn('left')
        document.removeEventListener('touchmove', moveFunc)
      }
      else if (dy > directX) {
        play.turn('down')
        document.removeEventListener('touchmove', moveFunc)
      }
      else if (dy < -directX) {
        play.turn('up')
        document.removeEventListener('touchmove', moveFunc)
      }
    }
    document.addEventListener('touchmove', moveFunc)
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', moveFunc)
    })
  })
})
</script>

<template>
  <div
    scrolling-touch
    w-full
    lg:px-4
    lg:mxw-500
    lg:pd-10
    sm:w-screen
    px-v-2
    m-auto
  >
    {{ levels }}
    <header
      flex="~"
      w-full
      pd-10
      items-center
      justify-between
    >
      <span
        lg:text-2xl
        sm:text-sm
        inline-flex
        items-center
      >总分：{{ play.state.value.score }}
      </span>
      <div>
        <button
          bg-green
          border-green
          border-2
          border-rd-2
          active:border-none
          :class="{ 'bg-white': play.state.value.difficulty === 'easy', 'text-white': play.state.value.difficulty !== 'easy', 'text-green': play.state.value.difficulty === 'easy' }"
          lg:text-2xl
          sm:text-sm
          p-x-2
          p-y-1
          outline-none
          cursor-pointer
          @click="play.reset(2048, 'easy')"
        >
          简单
        </button>
        <button
          bg-blue
          :class="{ 'bg-white': play.state.value.difficulty === 'medium', 'text-white': play.state.value.difficulty !== 'medium', 'text-blue': play.state.value.difficulty === 'medium' }"
          border-blue
          lg:text-2xl
          sm:text-sm
          p-x-2
          p-y-1
          m-x-3
          outline-none
          cursor-pointer
          border-2
          border-rd-2
          @click="play.reset(2048, 'medium')"
        >
          中等
        </button>
        <button
          bg-red
          :class="{ 'bg-white': play.state.value.difficulty === 'hard', 'text-white': play.state.value.difficulty !== 'hard', 'text-red': play.state.value.difficulty === 'hard' }"
          border-red
          lg:text-2xl
          sm:text-sm
          p-x-2
          p-y-1
          outline-none
          cursor-pointer
          border-2
          border-rd-2
          @click="play.reset(2048, 'hard')"
        >
          困难
        </button>
      </div>
    </header>
    <div
      important-text-left
      lg:wh-500
      vw-96
    >
      <div
        box-content
        bg-white
        inline-flex
        flex-wrap
        justify-between
        border-rd-2
        lg:wh-480
        vw-96
        position-absolute
        z-0
      >
        <div
          v-for="(mapItem, index) in levels[play.state.value.level].map"
          :key="index"
          z-1
          lg:hh-100
          lg:mg-y-10
          vh-24
          w-full
        >
          <span
            v-for="(item, i) in mapItem"
            :key="`${index}${i}`"
            :class="{ 'bg-gray-500': item === 0, 'bg-gray-100': item !== 0 }"
            inline-block
            lg:wh-100
            lg:hh-100
            lg:mg-x-10
            mg-vh-2
            vh-20
            vw-20
            border-rd-2
            z-2
          />
        </div>
      </div>
      <div
        z-0
        lg:wh-480
        vw-96
        inline-flex
        position-absolute
        justify-start
        items-start
        touch-none
        select-none
      >
        <span
          v-for="(e, index) in play.state.value.rocks"
          :key="index"
          lg:mg-10
          lg:wh-100
          lg:hh-100
          vh-20
          vw-20
          mg-vh-2
          border-rd-2
          position-absolute
          :class="{ 'text-5xl': e && e.num < 999, 'text-4xl': e && e.num > 999 }"
          fw500
          transition-property-transform
          :style="play.cssTransition(e)"
        >
          <span
            :id="`r${e && e.id}`"
            inline-flex
            w-full
            h-full
            important-text-center
            text-white
            items-center
            justify-center
            border-rd-2
            :style="`background-color: ${e ? e.color : ''}`"
          >
            <span v-if="e?.num === 666 || e?.num === 777" i-carbon-warning-square-filled text-5xl />
            <span v-else>{{ e ? e.num : '' }}</span>
          </span>
        </span>
      </div>
      <div
        v-for="(mapItem, index) in levels[play.state.value.level].map"
        :key="index"
        z--1
        lg:hh-100
        vh-24
        w-full
      >
        占位专用
      </div>
    </div>
    <Confetti :passed="play.state.value.status === 'won'" />
  </div>
</template>

<style lang="scss">
body{
  height: 100vh;
  overflow: hidden;
}
@screen mobile {
   .container {
     height: 100px;
     width: 100px;
   }
}
</style>
