<script setup>
import { computed } from 'vue'

const props = defineProps({
  height: {
    type: String,
    default: 'h-64',
  },
  width: {
    type: String,
    default: 'w-full',
  },
  className: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
  gridCols: {
    type: Number,
    default: 4,
  },
  gridRows: {
    type: Number,
    default: 3,
  },
  colors: {
    type: Array,
    default: () => ['#ff00cc', '#00ffcc', '#ffcc00', '#00ccff'],
  },
})

const colorArray = computed(() => {
  return props.colors.length > 0 ? props.colors : ['#ff00cc', '#00ffcc', '#ffcc00', '#00ccff']
})

const totalGridCells = computed(() => props.gridCols * props.gridRows)

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.gridCols}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${props.gridRows}, minmax(0, 1fr))`,
}))

const cellAnimations = computed(() => {
  const animations = []
  for (let i = 0; i < totalGridCells.value; i++) {
    const duration = Math.floor(Math.random() * 2) + 1.5 // 1.5-3.5秒
    const delay = Math.random() * 2 // 0-2秒の遅延
    const angle = Math.floor(Math.random() * 360)

    animations.push({
      animationDuration: `${duration}s, ${duration * 0.6}s`,
      animationDelay: `${delay}s, ${delay}s`,
      background: `linear-gradient(${angle}deg, ${colorArray.value[i % colorArray.value.length]}, ${colorArray.value[(i + 1) % colorArray.value.length]})`,
      filter: 'blur(2px)',
    })
  }
  return animations
})
</script>

<template>
  <div :class="['relative overflow-hidden rounded-lg bg-gray-900', height, width, className]" :style="style">
    <div class="absolute inset-0 grid gap-2 p-4" :style="gridStyle">
      <div
        v-for="(_, i) in Array.from({ length: totalGridCells })"
        :key="i"
        class="relative w-full h-full bg-gray-800 rounded-sm overflow-hidden window-cell"
        :style="{ animationDelay: `${i * 0.1}s` }">
        <div
          class="absolute inset-0 window-glow window-pulse"
          :style="cellAnimations[i]"></div>
        <!-- 窓の枠線効果 -->
        <div class="absolute inset-0 border border-gray-600 rounded-sm opacity-60"></div>
      </div>
    </div>
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <div
          class="w-1/2 h-1/3 relative rounded bg-gray-800 border-2 border-gray-700 flex items-center justify-center" style="
            box-shadow: 0 0 30px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.5);
          ">
          <div class="absolute top-0 left-0 w-3 h-3 bg-gray-700 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div class="absolute top-0 right-0 w-3 h-3 bg-gray-700 transform translate-x-1/2 -translate-y-1/2"></div>
          <div class="absolute bottom-0 left-0 w-3 h-3 bg-gray-700 transform -translate-x-1/2 translate-y-1/2"></div>
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-gray-700 transform translate-x-1/2 translate-y-1/2"></div>
          <h3
            class="brutalist-title text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-2xl font-bold" style="
              animation: text-neo 4s ease infinite;
            ">
            <span
              v-for="(char, index) in 'ネオブルータリズム'.split('')" :key="index"
              :style="`--char-index: ${index}`"
              class="brutalist-char">{{ char }}</span>
          </h3>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* 窓の点滅アニメーション */
@keyframes neo-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.98);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

/* 窓のちらつき効果 */
@keyframes window-flicker {
  0%, 100% {
    filter: blur(2px) brightness(0.7);
  }
  25% {
    filter: blur(1px) brightness(1.3);
  }
  50% {
    filter: blur(3px) brightness(0.5);
  }
  75% {
    filter: blur(1px) brightness(1.2);
  }
}

/* 窓の点滅クラス */
.window-pulse {
  animation: neo-pulse 2s ease-in-out infinite, window-flicker 1.5s ease-in-out infinite;
  opacity: 0.6;
}

/* 窓セルのホバー効果 */
.window-cell {
  transition: all 0.3s ease;
}

.window-cell:hover .window-glow {
  animation-duration: 0.5s, 0.3s !important;
  opacity: 1 !important;
  transform: scale(1.05) !important;
}

/* テキストのネオン効果 */
@keyframes text-neo {
  0%, 100% {
    filter: blur(0px) drop-shadow(0 0 5px rgba(255, 0, 204, 0.5));
  }
  50% {
    filter: blur(1px) drop-shadow(0 0 10px rgba(0, 255, 204, 0.8));
  }
}

/* グリッチ文字のスタイル */
.brutalist-char {
  display: inline-block;
  animation: brutalist-glitch 2s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
  will-change: transform;
  position: relative;
}

/* メインのグリッチアニメーション */
@keyframes brutalist-glitch {
  0%, 90%, 100% {
    transform: translate(0) skew(0deg);
  }
  10% {
    transform: translate(-2px, 1px) skew(-2deg);
  }
  20% {
    transform: translate(2px, -1px) skew(2deg);
  }
  30% {
    transform: translate(-1px, 2px) skew(-1deg);
  }
  40% {
    transform: translate(1px, -2px) skew(1deg);
  }
  50% {
    transform: translate(-2px, -1px) skew(-2deg);
  }
  60% {
    transform: translate(2px, 1px) skew(2deg);
  }
  70% {
    transform: translate(-1px, -1px) skew(-1deg);
  }
  80% {
    transform: translate(1px, 1px) skew(1deg);
  }
}

/* グリッチ疑似要素 */
.brutalist-char::before,
.brutalist-char::after {
  content: attr(data-char);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.brutalist-char::before {
  animation: glitch-1 2s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
  color: #ff00cc;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  transform: translate(-2px, 0);
}

.brutalist-char::after {
  animation: glitch-2 2s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s + 0.05s);
  color: #00ffcc;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  transform: translate(2px, 0);
}

@keyframes glitch-1 {
  0%, 90%, 100% {
    opacity: 0;
    transform: translate(-2px, 0);
  }
  10%, 15% {
    opacity: 0.9;
    transform: translate(-4px, 0);
  }
  20%, 25% {
    opacity: 0.8;
    transform: translate(-2px, 0);
  }
}

@keyframes glitch-2 {
  0%, 90%, 100% {
    opacity: 0;
    transform: translate(2px, 0);
  }
  15%, 20% {
    opacity: 0.9;
    transform: translate(4px, 0);
  }
  25%, 30% {
    opacity: 0.8;
    transform: translate(2px, 0);
  }
}

/* 追加のグロー効果 */
.window-glow {
  transition: all 0.3s ease;
}

.brutalist-title {
  text-shadow:
    0 0 5px rgba(255, 0, 204, 0.5),
    0 0 10px rgba(0, 255, 204, 0.3),
    0 0 15px rgba(255, 204, 0, 0.2);
}
</style>
