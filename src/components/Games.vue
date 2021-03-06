<script setup lang="ts">
import { GamePlay } from '~/composables/logic'
import { levels } from '~/modules/levels'
const directX = 30
const play = new GamePlay(2048, 'easy')
const now = $(useNow())
// const timerMS = $computed(() => Math.round(((play.state.value.endMS ?? +now) - (play.state.value.startMS ?? +now)) / 1000))
useStorage('2048-state', play.state)
useStorage('highest-score', play.highestScore)
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
      <p
        lg:text-2xl
        lg:p-x-8
        text-xl
      >
        关卡 <br>
        <span><b text-2xl text-green font-bold>{{ play.state.value.level + 1 }}</b>/{{ play.levelCounts }}</span>
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
          :class="{ 'text-5xl': e && e.num < 99, 'text-4xl': e && e.num > 99 && e.num < 999, 'text-3xl': e && e.num > 999 && e.num < 9999 }"
          font-500
          transition-property-transform
          :style="play.cssTransition(e)"
          @click="play.tackle.handleRock(e)"
        >
          <span
            :id="`r${e && e.id}`"
            inline-flex
            position-relative
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
            <span v-if="e && play.state.value.tackleStatus[1] === 'active'" position-absolute i-carbon-close text-gray text-5xl />
            <span v-if="e && play.state.value.tackleStatus[0] === 'active' && !play.swapRocksIds.includes(e.id)" position-absolute i-carbon-arrows-horizontal text-gray text-5xl />
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
        <div p-x-10px position-relative @click="play.tackle.useTackle(0)">
          <i
            v-if="play.state.value.tackle[0]" position-absolute not-italic lh-12px w-12px text="sm white center" h-12px top--2px right-2px bg-red
            border-rd-6px
          >{{ play.state.value.tackle[0] }}</i>
          <p :class="{ 'text-gray': play.state.value.tackle[0] === 0, 'text-blue': play.state.value.tackle[0] !== 0 }" text-2xl m-b--2px i-carbon-cicsplex />
          <span h-14px text-gray text-sm>对调</span>
        </div>
        <div p-x-10px position-relative @click="play.tackle.useTackle(1)">
          <i
            v-if="play.state.value.tackle[1]" position-absolute not-italic lh-12px w-12px text="sm white center" h-12px top--2px right-2px bg-red
            border-rd-6px
          >{{ play.state.value.tackle[1] }}</i>
          <p :class="{ 'text-gray': play.state.value.tackle[1] === 0, 'text-blue': play.state.value.tackle[1] !== 0 }" text-2xl m-b--2px i-carbon-scan-disabled />
          <span h-14px text-gray text-sm>消除</span>
        </div>
        <div pl-10px position-relative @click="() => { play.tackle.useTackle(2);play.tackle.rearrange(2) }">
          <i
            v-if="play.state.value.tackle[2]" position-absolute not-italic lh-12px w-12px text="sm white center" h-12px top--2px right--4px bg-red
            border-rd-6px
          >{{ play.state.value.tackle[2] }}</i>
          <p :class="{ 'text-gray': play.state.value.tackle[2] === 0, 'text-blue': play.state.value.tackle[2] !== 0 }" text-2xl m-b--2px i-carbon-ibm-cloud-vpc-endpoints />
          <span h-14px text-gray text-sm>重排</span>
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
