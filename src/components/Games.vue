<script setup lang="ts">
import { GamePlay } from '~/composables/logic'
import { levels } from '~/modules/levels'
const directX = 30
const play = new GamePlay(2048, 'easy')
const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS ?? +now) - (play.state.value.startMS ?? +now)) / 1000))
useStorage('2048-state', play.state)
useStorage('highest-score', play.highestScore)
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
    lg:p-x-4px
    lg:max-w-500px
    lg:p-10px
    sm:w-screen
    p-x-2vw
    m-auto
  >
    <header
      flex="~"
      w-full
      p-10px
      items-center
      justify-between
    >
      <p text-xl>
        关卡：<span><b text-3xl text-green font-bold>{{ play.state.value.level + 1 }}</b>/{{ play.levelCounts }}</span>
      </p>
      <p
        lg:text-2xl
        lg:p-x-8
        text-xl
      >
        分数 <br>
        <span text-xl text-blue font-bold>{{ play.state.value.score }}</span>
      </p>
      <p
        lg:text-2xl
        lg:p-x-8px
        text-xl
      >
        最高分 <br>
        <span text-xl text-red font-bold>{{ play.highestScore }}</span>
      </p>
    </header>
    <div
      important-text-left
      lg:w-500px
      w-96vw
    >
      <div
        box-content
        bg-white
        inline-flex
        flex-wrap
        justify-between
        border-rd-2
        lg:w-480px
        w-96vw
        position-absolute
        z-0
      >
        <div
          v-for="(mapItem, index) in levels[play.state.value.level].map"
          :key="index"
          z-1
          lg:h-120px
          h-24vw
          w-full
        >
          <span
            v-for="(item, i) in mapItem"
            :key="`${index}${i}`"
            :class="{ 'bg-gray-500': item === 0, 'bg-gray-100': item !== 0 }"
            inline-block
            lg:w-100px
            lg:h-100px
            lg:m-10px
            m-2vw
            h-20vw
            w-20vw
            border-rd-2
            z-2
          />
        </div>
      </div>
      <div
        z-0
        lg:w-480px
        w-96vw
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
          lg:m-10px
          lg:w-100px
          lg:h-100px
          h-20vw
          w-20vw
          m-2vw
          border-rd-2
          position-absolute
          :class="{ 'text-5xl': e && e.num < 999, 'text-4xl': e && e.num > 999 }"
          font-500
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
        lg:h-120px
        h-24vw
        w-full
      >
        占位专用
      </div>
    </div>
    <div
      flex="~"
      p-10px
      items-center
      justify-between
    >
      <div>
        <button
          bg-green
          border-green
          border-2
          border-rd-2
          :class="{ 'bg-white': play.state.value.difficulty === 'easy', 'text-white': play.state.value.difficulty !== 'easy', 'text-green': play.state.value.difficulty === 'easy' }"
          lg:text-2xl
          sm:text-sm
          p-x-2
          p-y-2px
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
          p-y-2px
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
          p-y-2px
          outline-none
          cursor-pointer
          border-2
          border-rd-2
          @click="play.reset(2048, 'hard')"
        >
          困难
        </button>
      </div>
      <div inline-flex>
        <div p-x-10px>
          <p text-2xl i-carbon-cicsplex />
          <span h-14px m-t--10px>对调</span>
        </div>
        <div p-x-10px>
          <p text-2xl i-carbon-scan-disabled />
          <span>消除</span>
        </div>
        <div pl-10px>
          <p text-2xl i-carbon-ibm-cloud-vpc-endpoints />
          <span>重排</span>
        </div>
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
