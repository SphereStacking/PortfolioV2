<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  colors: {
    type: Array,
    default: () => ['#f3ec78', '#af4261', '#4286f4', '#373B44'],
  },
})

const colorArray = computed(() => {
  return props.colors.length >= 4 ? props.colors : ['#f3ec78', '#af4261', '#4286f4', '#373B44']
})

// ホログラムパーティクル
const holoParticles = ref(Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 5 + 3,
  delay: Math.random() * 3,
})))
</script>

<template>
  <div :class="['relative overflow-hidden rounded-lg size-full']">
    <!-- ホログラフィック背景 -->
    <div
      class="absolute inset-0"
      :style="{
        background: `linear-gradient(45deg, ${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, ${colorArray[3]})`,
        backgroundSize: '300% 300%',
        animation: 'holographic 10s ease infinite',
        opacity: 0.7,
      }"></div>

    <!-- 虹色レイヤー -->
    <div class="absolute inset-0 rainbow-layer"></div>

    <!-- ストライプパターン -->
    <div
      class="absolute inset-0" style="
        background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 4px);
        animation: stripe-shift 20s linear infinite;
      "></div>

    <!-- ホログラムパーティクル -->
    <div class="absolute inset-0">
      <div
        v-for="particle in holoParticles" :key="`particle-${particle.id}`"
        class="holo-particle"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
        }"></div>
    </div>

    <!-- 中央の光彩 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="w-1/3 h-1/3 rounded-full" style="
          background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%);
          animation: pulse-holo 5s ease-in-out infinite;
          filter: blur(15px);
          mix-blend-mode: overlay;
        "></div>
    </div>

    <!-- スキャンライン -->
    <div class="absolute inset-0 holo-scan"></div>

    <!-- メインコンテンツ -->
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3
          class="holo-title text-white text-3xl font-bold" style="
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5);
            letter-spacing: 2px;
            mix-blend-mode: difference;
            perspective: 800px;
            transform-style: preserve-3d;
          ">
          <span
            v-for="(char, index) in 'ホログラフィック'.split('')" :key="index"
            :style="`--char-index: ${index}`"
            class="holo-char">{{ char }}</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
@keyframes holographic {
  0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
  50% { background-position: 100% 50%; filter: hue-rotate(180deg); }
  100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
}

@keyframes stripe-shift {
  0% { background-position: 0px 0px; }
  100% { background-position: 100px 100px; }
}

@keyframes pulse-holo {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* 虹色レイヤー */
.rainbow-layer {
  background: linear-gradient(
    90deg,
    rgba(255, 0, 0, 0.1) 0%,
    rgba(255, 154, 0, 0.1) 10%,
    rgba(208, 222, 33, 0.1) 20%,
    rgba(79, 220, 74, 0.1) 30%,
    rgba(63, 218, 216, 0.1) 40%,
    rgba(47, 201, 226, 0.1) 50%,
    rgba(28, 127, 238, 0.1) 60%,
    rgba(95, 21, 242, 0.1) 70%,
    rgba(186, 12, 248, 0.1) 80%,
    rgba(251, 7, 217, 0.1) 90%,
    rgba(255, 0, 0, 0.1) 100%
  );
  animation: rainbow-shift 5s linear infinite;
  mix-blend-mode: screen;
}

@keyframes rainbow-shift {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

/* ホログラムパーティクル */
.holo-particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255,255,255,0.9), transparent);
  border-radius: 50%;
  animation: particle-float linear infinite;
  filter: blur(0.5px);
}

@keyframes particle-float {
  from {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  to {
    transform: translateY(-100px) scale(0.5);
    opacity: 0;
  }
}

/* スキャンライン */
.holo-scan {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255,255,255,0.1) 50%,
    transparent 100%
  );
  height: 20%;
  animation: scan-move 3s linear infinite;
}

@keyframes scan-move {
  from { transform: translateY(-100%); }
  to { transform: translateY(500%); }
}

/* 元のスタイルのホログラム文字 */
.holo-char {
  display: inline-block;
  animation: holo-shimmer 4s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
  transform-style: preserve-3d;
  will-change: transform, filter;
}

@keyframes holo-shimmer {
  0%, 100% {
    transform: rotateY(0deg) translateZ(0px);
    filter: hue-rotate(0deg) brightness(1);
  }
  25% {
    transform: rotateY(15deg) translateZ(10px);
    filter: hue-rotate(90deg) brightness(1.2);
  }
  50% {
    transform: rotateY(-15deg) translateZ(5px);
    filter: hue-rotate(180deg) brightness(1.5);
  }
  75% {
    transform: rotateY(10deg) translateZ(15px);
    filter: hue-rotate(270deg) brightness(1.3);
  }
}

/* タイトルのグラスモーフィズム背景 */
.holo-title {
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* パフォーマンス最適化 */
.holo-char,
.holo-particle {
  will-change: transform, filter, opacity;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
