<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

defineProps({
  style: {
    type: Object,
    default: () => ({}),
  },
})

// パフォーマンス最適化：要素の可視性を追跡
const target = ref(null)
const isVisible = ref(false)

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting
  },
  { threshold: 0.1 }
)

onUnmounted(() => {
  stop()
})

// 星の数を固定値で管理（CSSで制御）
const starCounts = {
  far: 20,
  mid: 15,
  near: 10,
  shooting: 3
}
</script>

<template>
  <div
    ref="target"
    class="relative size-full overflow-hidden rounded-lg cosmos-container">
    <!-- Deep Space Background -->
    <div class="absolute inset-0 cosmos-background"></div>
    <div class="absolute inset-0 cosmos-shadow"></div>

    <!-- Parallax Star Layers - CSSで制御 -->
    <!-- Far stars layer -->
    <div
      v-if="isVisible"
      class="absolute inset-0 star-layer star-layer-far">
      <div
        v-for="i in starCounts.far"
        :key="`far-${i}`"
        :class="`star-far star-${i}`"
        :style="`--star-index: ${i}`"></div>
    </div>

    <!-- Mid stars layer -->
    <div
      v-if="isVisible"
      class="absolute inset-0 star-layer star-layer-mid">
      <div
        v-for="i in starCounts.mid"
        :key="`mid-${i}`"
        :class="`star-mid star-${i} star-color-${i % 4}`"
        :style="`--star-index: ${i}`"></div>
    </div>

    <!-- Near stars layer -->
    <div
      v-if="isVisible"
      class="absolute inset-0 star-layer star-layer-near">
      <div
        v-for="i in starCounts.near"
        :key="`near-${i}`"
        :class="`star-near star-${i}`"
        :style="`--star-index: ${i}`"></div>
    </div>

    <!-- Aurora Effect -->
    <div class="absolute inset-0 aurora-container">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>

    <!-- Multiple Shooting Stars - CSSで制御 -->
    <div
      v-for="i in starCounts.shooting"
      v-if="isVisible"
      :key="`shooting-${i}`"
      :class="`shooting-star shooting-${i}`"
      :style="`--star-index: ${i}`"></div>

    <!-- Enhanced Nebula -->
    <div class="absolute inset-0 nebula-container">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="nebula nebula-3"></div>
    </div>

    <!-- Galaxy Spiral -->
    <div class="absolute inset-0 galaxy-spiral"></div>

    <!-- Content -->
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-2xl font-bold cosmos-text">
          <span class="cosmos-letter" style="--delay: 0">C</span>
          <span class="cosmos-letter" style="--delay: 1">O</span>
          <span class="cosmos-letter" style="--delay: 2">S</span>
          <span class="cosmos-letter" style="--delay: 3">M</span>
          <span class="cosmos-letter" style="--delay: 4">O</span>
          <span class="cosmos-letter" style="--delay: 5">S</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.cosmos-container {
  background: #000814;
  perspective: 1000px;
  /* GPU加速を有効化 */
  transform: translateZ(0);
  will-change: auto;
}

/* Deep Space Background */
.cosmos-background {
  background:
    radial-gradient(ellipse at top, #001d3d 0%, #000814 50%, #000000 100%),
    radial-gradient(circle at 20% 80%, #003566 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, #001d3d 0%, transparent 50%);
  animation: cosmos-pulse 20s ease infinite;
}

@keyframes cosmos-pulse {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate3d(0, 0, 0) scale(1.05);
    opacity: 0.9;
  }
}

.cosmos-shadow {
  background:
    radial-gradient(circle at 20% 30%, rgba(106, 17, 203, 0.2) 0%, transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(37, 117, 252, 0.2) 0%, transparent 25%),
    radial-gradient(circle at 40% 70%, rgba(131, 52, 235, 0.2) 0%, transparent 35%),
    radial-gradient(circle at 70% 60%, rgba(72, 52, 212, 0.2) 0%, transparent 20%);
  mix-blend-mode: screen;
}

/* Parallax Star Layers */
.star-layer {
  will-change: transform;
  transform: translateZ(0);
}

/* パララックス効果 */
.star-layer-far:hover { transform: translate3d(5px, 5px, 0); }
.star-layer-mid:hover { transform: translate3d(10px, 10px, 0); }
.star-layer-near:hover { transform: translate3d(20px, 20px, 0); }

/* 星の基本スタイル */
.star-far, .star-mid, .star-near {
  position: absolute;
  border-radius: 50%;
  background-color: white;
}

/* 遠い星 */
.star-far {
  width: 1px;
  height: 1px;
  opacity: 0.5;
  animation: twinkle-slow 6s ease-in-out infinite;
  filter: blur(0.5px);
  animation-delay: calc(var(--star-index) * 0.5s);
}

/* 各星の位置を固定（遠い星） */
.star-far.star-1 { top: 10%; left: 15%; }
.star-far.star-2 { top: 20%; left: 80%; width: 1.5px; height: 1.5px; }
.star-far.star-3 { top: 35%; left: 25%; }
.star-far.star-4 { top: 40%; left: 60%; width: 0.8px; height: 0.8px; }
.star-far.star-5 { top: 55%; left: 40%; }
.star-far.star-6 { top: 70%; left: 70%; width: 1.2px; height: 1.2px; }
.star-far.star-7 { top: 15%; left: 45%; }
.star-far.star-8 { top: 80%; left: 20%; }
.star-far.star-9 { top: 25%; left: 55%; width: 1.3px; height: 1.3px; }
.star-far.star-10 { top: 50%; left: 85%; }
.star-far.star-11 { top: 65%; left: 10%; }
.star-far.star-12 { top: 30%; left: 90%; width: 0.7px; height: 0.7px; }
.star-far.star-13 { top: 85%; left: 50%; }
.star-far.star-14 { top: 5%; left: 30%; }
.star-far.star-15 { top: 45%; left: 5%; width: 1.4px; height: 1.4px; }
.star-far.star-16 { top: 75%; left: 85%; }
.star-far.star-17 { top: 90%; left: 65%; }
.star-far.star-18 { top: 60%; left: 25%; width: 0.9px; height: 0.9px; }
.star-far.star-19 { top: 12%; left: 72%; }
.star-far.star-20 { top: 95%; left: 35%; }

/* 中間の星 */
.star-mid {
  width: 2px;
  height: 2px;
  opacity: 0.7;
  animation: twinkle 4s ease-in-out infinite;
  animation-delay: calc(var(--star-index) * 0.4s);
}

/* 色のバリエーション */
.star-color-0 { box-shadow: 0 0 2px #ffffff; }
.star-color-1 { box-shadow: 0 0 2px #ffeaa7; }
.star-color-2 { box-shadow: 0 0 2px #74b9ff; }
.star-color-3 { box-shadow: 0 0 2px #a29bfe; }

/* 各星の位置を固定（中間の星） */
.star-mid.star-1 { top: 8%; left: 22%; }
.star-mid.star-2 { top: 18%; left: 68%; width: 2.5px; height: 2.5px; }
.star-mid.star-3 { top: 28%; left: 35%; }
.star-mid.star-4 { top: 38%; left: 82%; width: 1.8px; height: 1.8px; }
.star-mid.star-5 { top: 48%; left: 12%; }
.star-mid.star-6 { top: 58%; left: 55%; width: 2.2px; height: 2.2px; }
.star-mid.star-7 { top: 68%; left: 28%; }
.star-mid.star-8 { top: 78%; left: 75%; }
.star-mid.star-9 { top: 22%; left: 42%; width: 2.3px; height: 2.3px; }
.star-mid.star-10 { top: 42%; left: 92%; }
.star-mid.star-11 { top: 62%; left: 8%; }
.star-mid.star-12 { top: 32%; left: 62%; width: 1.7px; height: 1.7px; }
.star-mid.star-13 { top: 72%; left: 48%; }
.star-mid.star-14 { top: 12%; left: 88%; }
.star-mid.star-15 { top: 52%; left: 32%; width: 2.4px; height: 2.4px; }

/* 近い星 */
.star-near {
  width: 3px;
  height: 3px;
  opacity: 1;
  animation: twinkle-fast 2s ease-in-out infinite;
  box-shadow: 0 0 4px #ffffff, 0 0 8px rgba(255, 255, 255, 0.5);
  animation-delay: calc(var(--star-index) * 0.3s);
}

/* 各星の位置を固定（近い星） */
.star-near.star-1 { top: 15%; left: 30%; width: 3.5px; height: 3.5px; }
.star-near.star-2 { top: 25%; left: 75%; }
.star-near.star-3 { top: 45%; left: 20%; width: 2.8px; height: 2.8px; }
.star-near.star-4 { top: 55%; left: 65%; }
.star-near.star-5 { top: 75%; left: 40%; width: 3.2px; height: 3.2px; }
.star-near.star-6 { top: 35%; left: 85%; }
.star-near.star-7 { top: 65%; left: 15%; width: 2.5px; height: 2.5px; }
.star-near.star-8 { top: 85%; left: 55%; }
.star-near.star-9 { top: 20%; left: 50%; width: 3.3px; height: 3.3px; }
.star-near.star-10 { top: 50%; left: 90%; }

@keyframes twinkle {
  0%, 100% {
    opacity: var(--opacity, 1);
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translate3d(0, 0, 0) scale(0.8);
  }
}

@keyframes twinkle-slow {
  0%, 100% { opacity: var(--opacity, 0.5); }
  50% { opacity: 0.1; }
}

@keyframes twinkle-fast {
  0%, 100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  25% {
    opacity: 0.6;
    transform: translate3d(0, 0, 0) scale(1.2);
  }
  50% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(0.9);
  }
  75% {
    opacity: 0.8;
    transform: translate3d(0, 0, 0) scale(1.1);
  }
}

/* Aurora Effect */
.aurora-container {
  opacity: 0.6;
}

.aurora {
  position: absolute;
  width: 100%;
  height: 100%;
  mix-blend-mode: screen;
  will-change: transform;
  transform: translateZ(0);
}

.aurora-1 {
  background: linear-gradient(45deg, transparent 30%, rgba(52, 211, 153, 0.4) 50%, transparent 70%);
  animation: aurora-flow1 15s ease-in-out infinite;
}

.aurora-2 {
  background: linear-gradient(-45deg, transparent 40%, rgba(139, 92, 246, 0.3) 60%, transparent 80%);
  animation: aurora-flow2 18s ease-in-out infinite reverse;
}

.aurora-3 {
  background: linear-gradient(90deg, transparent 20%, rgba(236, 72, 153, 0.3) 50%, transparent 80%);
  animation: aurora-flow3 12s ease-in-out infinite;
}

@keyframes aurora-flow1 {
  0%, 100% {
    transform: translate3d(-20%, 0, 0) rotate(0deg);
    opacity: 0.4;
  }
  50% {
    transform: translate3d(20%, -10%, 0) rotate(5deg);
    opacity: 0.7;
  }
}

@keyframes aurora-flow2 {
  0%, 100% {
    transform: translate3d(20%, 0, 0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translate3d(-20%, 10%, 0) rotate(-3deg);
    opacity: 0.6;
  }
}

@keyframes aurora-flow3 {
  0%, 100% {
    transform: translate3d(0, -20%, 0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translate3d(0, 20%, 0) rotate(2deg);
    opacity: 0.5;
  }
}

/* Shooting Stars */
.shooting-star {
  position: absolute;
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffffff, transparent);
  animation: shooting 8s linear infinite;
  will-change: transform;
  transform: translateZ(0);
}

/* 各流れ星の設定 */
.shooting-1 { 
  top: 20%; 
  left: -30%;
  animation-delay: 0s;
  width: 100px;
}

.shooting-2 { 
  top: 40%; 
  left: -20%;
  animation-delay: 3s;
  width: 60px;
}

.shooting-3 { 
  top: 10%; 
  left: -25%;
  animation-delay: 5s;
  width: 80px;
}

@keyframes shooting {
  0% {
    transform: translate3d(-100px, 0, 0) rotate(45deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translate3d(calc(100vw + 100px), calc(100vh + 100px), 0) rotate(45deg);
    opacity: 0;
  }
}

/* Nebula */
.nebula-container {
  opacity: 0.4;
}

.nebula {
  position: absolute;
  width: 100%;
  height: 100%;
  mix-blend-mode: screen;
  will-change: transform;
  transform: translateZ(0);
}

.nebula-1 {
  background: radial-gradient(ellipse at 30% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 60%);
  animation: nebula-drift1 25s ease-in-out infinite;
}

.nebula-2 {
  background: radial-gradient(ellipse at 70% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%);
  animation: nebula-drift2 30s ease-in-out infinite reverse;
}

.nebula-3 {
  background: radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
  animation: nebula-drift3 20s ease-in-out infinite;
}

@keyframes nebula-drift1 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-10%, 5%, 0) scale(1.1);
  }
}

@keyframes nebula-drift2 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(10%, -5%, 0) scale(0.9);
  }
}

@keyframes nebula-drift3 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(5%, 10%, 0) scale(1.05);
  }
}

/* Galaxy Spiral */
.galaxy-spiral {
  background: radial-gradient(ellipse at center, transparent 20%, rgba(139, 92, 246, 0.1) 40%, transparent 80%);
  animation: galaxy-rotate 60s linear infinite;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes galaxy-rotate {
  from {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  to {
    transform: translate3d(0, 0, 0) rotate(360deg);
  }
}

/* Text */
.cosmos-text {
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
}

.cosmos-letter {
  display: inline-block;
  animation: cosmos-glow 3s ease-in-out infinite;
  animation-delay: calc(var(--delay) * 0.2s);
  will-change: transform;
  transform: translateZ(0);
}

@keyframes cosmos-glow {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
  }
  50% {
    transform: translate3d(0, -2px, 0) scale(1.05);
    text-shadow: 0 0 30px rgba(139, 92, 246, 1);
  }
}

/* パフォーマンス最適化 */
.star-far,
.star-mid,
.star-near,
.aurora,
.shooting-star,
.nebula,
.galaxy-spiral,
.cosmos-letter {
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
