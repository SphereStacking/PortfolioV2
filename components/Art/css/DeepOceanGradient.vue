<script setup>
import { ref, onUnmounted } from 'vue'
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

// 動的な泡の生成（最適化: 40→15要素）
const bubbles = ref(Array.from({ length: 15 }, (_, i) => {
  const size = 10 + (i % 3) * 5
  const wobbleRange = size * 3
  return {
    id: i,
    size,
    left: (i * 6.6) % 100,
    opacity: 0.3 + (i % 3) * 0.2,
    duration: 20 + (i % 3) * 5,
    delay: Math.random() * 20, // ランダムな初期遅延
    wobbleRange,
    wobbleDuration: 3 + (i % 2),
  }
}))

// 小さな泡の群れ（最適化: 60→10要素）
const smallBubbles = ref(Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: 2 + (i % 3),
  left: (i * 10) % 100,
  opacity: 0.2 + (i % 3) * 0.1,
  duration: 15 + (i % 3) * 5,
  delay: Math.random() * 10, // ランダムな初期遅延
  wobbleRange: 8 + (i % 2) * 2,
})))

// 光の筋のランダム遅延
const lightRayDelays = ref(Array.from({ length: 3 }, () => Math.random() * 5))
</script>

<template>
  <div
    ref="target"
    :class="['relative overflow-hidden rounded-lg size-full']"
    :style="style">
    <!-- 深海のグラデーション背景 -->
    <div class="absolute inset-0 ocean-gradient"></div>

    <!-- 深層の暗い層 -->
    <div class="absolute inset-0 deep-layer"></div>

    <!-- 光の筋（最適化: 5→3要素）-->
    <div v-if="isVisible" class="absolute inset-0 light-rays-container">
      <div
        v-for="(delay, i) in lightRayDelays" :key="`ray-${i}`"
        class="light-ray"
        :style="{
          left: `${25 + i * 25}%`,
          animationDelay: `${delay}s`,
          opacity: 0.12 + (i * 0.02),
          transform: 'translateZ(0)',
        }"></div>
    </div>

    <!-- メインの泡（揺れながら上昇） -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="bubble in bubbles"
        :key="`bubble-${bubble.id}`"
        class="bubble-container"
        :style="{
          left: `${bubble.left}%`,
          animationDuration: `${bubble.duration}s`,
          animationDelay: `${bubble.delay}s`,
          transform: 'translateZ(0)',
          willChange: 'transform',
        }">
        <div
          class="bubble"
          :style="{
            'width': `${bubble.size}px`,
            'height': `${bubble.size}px`,
            'opacity': bubble.opacity,
            '--wobble-range': `${bubble.wobbleRange}px`,
            '--wobble-duration': `${bubble.wobbleDuration}s`,
          }">
          <div class="bubble-shine"></div>
        </div>
      </div>
    </div>

    <!-- 小さな泡の群れ -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="bubble in smallBubbles"
        :key="`small-${bubble.id}`"
        class="small-bubble"
        :style="{
          'width': `${bubble.size}px`,
          'height': `${bubble.size}px`,
          'left': `${bubble.left}%`,
          'opacity': bubble.opacity,
          'animationDuration': `${bubble.duration}s`,
          'animationDelay': `${bubble.delay}s`,
          '--wobble': `${bubble.wobbleRange}px`,
          transform: 'translateZ(0)',
          willChange: 'transform',
        }"></div>
    </div>

    <!-- 水流エフェクト -->
    <div class="absolute inset-0 water-current"></div>

    <!-- 深海の粒子（削除）-->

    <!-- コンテンツ -->
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold ocean-text">
          深海
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* 深海のグラデーション */
.ocean-gradient {
  background:
    linear-gradient(180deg,
      #042f4b 0%,
      #041e3a 20%,
      #031525 40%,
      #020c1b 60%,
      #010611 80%,
      #000309 100%
    );
}

.deep-layer {
  background:
    radial-gradient(ellipse at center 120%, transparent 0%, #000309 70%),
    radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 40%);
  mix-blend-mode: multiply;
}

/* 光の筋 */
.light-rays-container {
  opacity: 0.6;
  mix-blend-mode: screen;
}

.light-ray {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 20%,
    rgba(59, 130, 246, 0.2) 50%,
    transparent 80%
  );
  filter: blur(3px);
  animation: light-flicker 10s ease-in-out infinite;
  backface-visibility: hidden;
}

@keyframes light-flicker {
  0%, 100% { opacity: 0.15; transform: scaleX(1) translateZ(0); }
  50% { opacity: 0.075; transform: scaleX(1.5) translateZ(0); }
}

/* 泡のコンテナ（上昇アニメーション） */
.bubble-container {
  position: absolute;
  bottom: -50px; /* グロー要素が隠れるように調整 */
  animation: bubble-rise linear infinite;
}

@keyframes bubble-rise {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100vh - 100px)); /* 上部でも完全に隠れるように調整 */
  }
}

/* 泡本体（揺れアニメーション） */
.bubble {
  position: relative;
  background: radial-gradient(circle at 30% 30%,
    rgba(255, 255, 255, 0.8),
    rgba(147, 197, 253, 0.4)
  );
  border-radius: 50%;
  box-shadow:
    0 0 10px rgba(147, 197, 253, 0.6),
    inset -2px -2px 5px rgba(0, 0, 0, 0.2);
  animation: bubble-wobble var(--wobble-duration) ease-in-out infinite;
  backface-visibility: hidden;
}

@keyframes bubble-wobble {
  0%, 100% {
    transform: translateX(0) scale(1) translateZ(0);
  }
  25% {
    transform: translateX(15px) scale(0.98) translateZ(0);
  }
  50% {
    transform: translateX(-10px) scale(1.02) translateZ(0);
  }
  75% {
    transform: translateX(5px) scale(0.99) translateZ(0);
  }
}

/* 泡の光沢 */
.bubble-shine {
  position: absolute;
  top: 15%;
  left: 20%;
  width: 30%;
  height: 30%;
  background: radial-gradient(circle,
    rgba(255, 255, 255, 0.9) 0%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(1px);
}

/* 小さな泡 */
.small-bubble {
  position: absolute;
  background: radial-gradient(circle,
    rgba(255, 255, 255, 0.6),
    rgba(219, 234, 254, 0.3)
  );
  border-radius: 50%;
  bottom: -30px; /* グロー要素が隠れるように調整 */
  animation: small-bubble-rise linear infinite;
}

@keyframes small-bubble-rise {
  from {
    transform: translateY(0) translateX(0);
  }
  to {
    transform: translateY(calc(-100vh - 50px)) translateX(var(--wobble)); /* 上部でも完全に隠れるように調整 */
  }
}

/* 水流エフェクト */
.water-current {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(59, 130, 246, 0.05) 50%,
    transparent 100%
  );
  animation: current-flow 20s linear infinite;
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

@keyframes current-flow {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}


/* テキストスタイル */
.ocean-text {
  text-shadow:
    0 2px 20px rgba(0, 0, 0, 0.8),
    0 0 40px rgba(59, 130, 246, 0.5);
  letter-spacing: 4px;
  animation: text-glow 3s ease-in-out infinite;
}

@keyframes text-glow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
    text-shadow:
      0 2px 20px rgba(0, 0, 0, 0.8),
      0 0 60px rgba(59, 130, 246, 0.7);
  }
}

/* パフォーマンス最適化 */
.bubble-container,
.bubble,
.small-bubble,
.light-ray {
  will-change: transform, opacity;
  perspective: 1000px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
