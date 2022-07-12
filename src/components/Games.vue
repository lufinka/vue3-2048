<script setup lang="ts">
import { GamePlay } from '~/composables/logic'
const directX = 30
const play = new GamePlay(2048)

const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS ?? +now) - (play.state.value.startMS ?? +now)) / 1000))
useStorage('2048-state', play.state)

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
      mxw-500
      w-full
      pd-20
      justify-between
    >
      <span
        text-2xl
        inline-flex
        items-center
      >总分：{{ play.state.value.score }}</span>
      <button
        bg-coolgray
        text-white
        border-none
        text-2xl
        pd-20
        cursor-pointer
        border-rd-2

        @click="play.reset(2048)"
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
          v-for="(e, index) in play.state.value.rocks"
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
          :style="play.cssTransition(e)"
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
