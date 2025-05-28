<script setup>
import { ref, computed } from 'vue'

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
  colors: {
    type: Array,
    default: () => ['#ff3d00', '#0bff99', '#ffb300', '#9c27b0'],
  },
})

const colorArray = computed(() => {
  return props.colors.length >= 4 ? props.colors : ['#ff3d00', '#0bff99', '#ffb300', '#9c27b0']
})

const mousePosition = ref({ x: 0, y: 0 })
const isHovering = ref(false)

const handleMouseMove = (e) => {
  const containerRect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - containerRect.left) / containerRect.width * 100
  const y = (e.clientY - containerRect.top) / containerRect.height * 100
  mousePosition.value = { x, y }
}
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style"
    @mousemove="handleMouseMove"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false">
    <!-- 液体の背景レイヤー -->
    <div
      class="absolute inset-0 liquid-bg"
      :style="{
        background: `radial-gradient(circle at 0% 0%, ${colorArray[0]}, transparent 40%), radial-gradient(circle at 100% 0%, ${colorArray[1]}, transparent 40%), radial-gradient(circle at 100% 100%, ${colorArray[2]}, transparent 40%), radial-gradient(circle at 0% 100%, ${colorArray[3]}, transparent 40%)`,
        filter: 'blur(30px) contrast(1.5)',
        transform: 'scale(1.2)',
        opacity: 0.8,
        animation: 'liquid-shift 15s ease-in-out infinite',
      }"></div>

    <!-- 液体の泡エフェクト -->
    <div class="absolute inset-0">
      <div
        v-for="i in 15" :key="`bubble-${i}`"
        class="liquid-bubble"
        :style="{
          '--bubble-size': `${Math.random() * 30 + 10}px`,
          '--bubble-left': `${Math.random() * 100}%`,
          '--bubble-duration': `${Math.random() * 10 + 5}s`,
          '--bubble-delay': `${Math.random() * 5}s`,
        }"></div>
    </div>

    <!-- マウス追従エフェクト -->
    <div
      v-if="isHovering"
      class="absolute liquid-cursor"
      :style="{
        top: `${mousePosition.y}%`,
        left: `${mousePosition.x}%`,
        transform: 'translate(-50%, -50%)',
      }"></div>

    <!-- メインコンテンツ -->
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="liquid-title">
          <span class="liquid-container">
            <span
              v-for="(char, index) in '液体'.split('')" :key="`main-${index}`"
              :style="`--char-index: ${index}`"
              class="liquid-char-main">{{ char }}</span>
          </span>
          <span class="liquid-drop"></span>
          <span class="liquid-container">
            <span
              v-for="(char, index) in 'グラデーション'.split('')" :key="`sub-${index}`"
              :style="`--char-index: ${index + 2}`"
              class="liquid-char-sub">{{ char }}</span>
          </span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* 液体背景のアニメーション */
@keyframes liquid-shift {
  0%, 100% {
    background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%;
    background-size: 50% 50%, 50% 50%, 50% 50%, 50% 50%;
  }
  25% {
    background-position: 10% 30%, 70% 10%, 90% 90%, 30% 70%;
    background-size: 60% 40%, 40% 60%, 40% 50%, 50% 40%;
  }
  50% {
    background-position: 20% 20%, 80% 20%, 80% 80%, 20% 80%;
    background-size: 40% 60%, 60% 40%, 60% 40%, 40% 60%;
  }
  75% {
    background-position: 30% 10%, 90% 30%, 70% 70%, 10% 90%;
    background-size: 50% 50%, 50% 50%, 50% 50%, 50% 50%;
  }
}

/* 泡のアニメーション */
.liquid-bubble {
  position: absolute;
  width: var(--bubble-size);
  height: var(--bubble-size);
  left: var(--bubble-left);
  bottom: -50px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 50%;
  animation: bubble-rise var(--bubble-duration) ease-in-out infinite var(--bubble-delay);
  opacity: 0.6;
}

@keyframes bubble-rise {
  0% {
    transform: translateY(0) translateX(0) scale(0);
    opacity: 0;
  }
  10% {
    transform: translateY(-20px) translateX(5px) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-200px) translateX(-10px) scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: translateY(-400px) translateX(15px) scale(0.8);
    opacity: 0;
  }
}

/* マウス追従エフェクト */
.liquid-cursor {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  mix-blend-mode: overlay;
  transition: all 0.2s ease;
  pointer-events: none;
  animation: cursor-pulse 2s ease-in-out infinite;
}

@keyframes cursor-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

/* タイトルスタイル */
.liquid-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  position: relative;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.liquid-container {
  display: inline-block;
  position: relative;
}

/* メイン文字のアニメーション（液体） */
.liquid-char-main {
  display: inline-block;
  animation: liquid-drip 4s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.2s);
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 61, 0, 0.5);
  will-change: transform;
}

@keyframes liquid-drip {
  0%, 100% {
    transform: translateY(0) scaleY(1) rotate(0deg);
  }
  15% {
    transform: translateY(5px) scaleY(1.3) rotate(-2deg);
  }
  30% {
    transform: translateY(-3px) scaleY(0.9) rotate(1deg);
  }
  45% {
    transform: translateY(8px) scaleY(1.2) rotate(-1deg);
  }
  60% {
    transform: translateY(-5px) scaleY(0.95) rotate(2deg);
  }
  75% {
    transform: translateY(3px) scaleY(1.1) rotate(-1deg);
  }
}

/* サブ文字のアニメーション（流れる） */
.liquid-char-sub {
  display: inline-block;
  animation: liquid-flow 6s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(11, 255, 153, 0.5);
  will-change: transform;
}

@keyframes liquid-flow {
  0%, 100% {
    transform: translateX(0) translateY(0) skewX(0deg);
  }
  20% {
    transform: translateX(2px) translateY(-2px) skewX(5deg);
  }
  40% {
    transform: translateX(-3px) translateY(1px) skewX(-3deg);
  }
  60% {
    transform: translateX(1px) translateY(-1px) skewX(2deg);
  }
  80% {
    transform: translateX(-2px) translateY(2px) skewX(-4deg);
  }
}

/* 液滴アニメーション */
.liquid-drop {
  position: absolute;
  width: 6px;
  height: 10px;
  background: linear-gradient(to bottom, transparent, #0bff99);
  border-radius: 50% 50% 80% 80%;
  top: 100%;
  left: 35%;
  animation: drop-fall 3s ease-in-out infinite;
}

@keyframes drop-fall {
  0%, 90% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  95% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
}

/* パフォーマンス最適化 */
.liquid-char-main,
.liquid-char-sub,
.liquid-bubble,
.liquid-drop {
  will-change: transform, opacity;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
