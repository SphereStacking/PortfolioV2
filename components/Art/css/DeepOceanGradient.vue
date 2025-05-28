<script setup>
import { ref } from 'vue'

defineProps({
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
})

// 動的な泡の生成
const bubbles = ref(Array.from({ length: 40 }, (_, i) => {
  const size = Math.random() * 15 + 5
  const wobbleRange = size * 3 // 大きい泡ほど大きく揺れる
  return {
    id: i,
    size,
    left: Math.random() * 100,
    opacity: Math.random() * 0.6 + 0.2,
    duration: Math.random() * 10 + 15, // 15-25秒
    delay: Math.random() * 20,
    wobbleRange,
    wobbleDuration: Math.random() * 3 + 2, // 2-5秒
  }
}))

// 小さな泡の群れ
const smallBubbles = ref(Array.from({ length: 60 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 1,
  left: Math.random() * 100,
  opacity: Math.random() * 0.4 + 0.1,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 30,
  wobbleRange: Math.random() * 10 + 5,
})))
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <!-- 深海のグラデーション背景 -->
    <div class="absolute inset-0 ocean-gradient"></div>

    <!-- 深層の暗い層 -->
    <div class="absolute inset-0 deep-layer"></div>

    <!-- 光の筋 -->
    <div class="absolute inset-0 light-rays-container">
      <div
        v-for="i in 5" :key="`ray-${i}`"
        class="light-ray"
        :style="{
          left: `${i * 20}%`,
          animationDelay: `${i * 2}s`,
          opacity: 0.1 + (i * 0.02),
        }"></div>
    </div>

    <!-- メインの泡（揺れながら上昇） -->
    <div class="absolute inset-0">
      <div
        v-for="bubble in bubbles"
        :key="`bubble-${bubble.id}`"
        class="bubble-container"
        :style="{
          left: `${bubble.left}%`,
          animationDuration: `${bubble.duration}s`,
          animationDelay: `${bubble.delay}s`,
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
    <div class="absolute inset-0">
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
        }"></div>
    </div>

    <!-- 水流エフェクト -->
    <div class="absolute inset-0 water-current"></div>

    <!-- 深海の粒子 -->
    <div class="absolute inset-0">
      <div
        v-for="i in 30" :key="`particle-${i}`"
        class="ocean-particle"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${Math.random() * 20 + 10}s`,
        }"></div>
    </div>

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
}

@keyframes light-flicker {
  0%, 100% { opacity: var(--opacity, 0.15); transform: scaleX(1); }
  50% { opacity: calc(var(--opacity, 0.15) * 0.5); transform: scaleX(1.5); }
}

/* 泡のコンテナ（上昇アニメーション） */
.bubble-container {
  position: absolute;
  bottom: -20px;
  animation: bubble-rise linear infinite;
}

@keyframes bubble-rise {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100vh - 50px));
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
}

@keyframes bubble-wobble {
  0%, 100% {
    transform: translateX(0) scale(1);
  }
  25% {
    transform: translateX(calc(var(--wobble-range) * 0.7)) scale(0.98);
  }
  50% {
    transform: translateX(calc(var(--wobble-range) * -0.5)) scale(1.02);
  }
  75% {
    transform: translateX(calc(var(--wobble-range) * 0.3)) scale(0.99);
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
  bottom: -10px;
  animation: small-bubble-rise linear infinite;
}

@keyframes small-bubble-rise {
  from {
    transform: translateY(0) translateX(0);
  }
  to {
    transform: translateY(calc(-100vh - 20px)) translateX(var(--wobble));
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
}

@keyframes current-flow {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

/* 深海の粒子 */
.ocean-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(219, 234, 254, 0.5);
  border-radius: 50%;
  animation: particle-float linear infinite;
}

@keyframes particle-float {
  from {
    transform: translateY(0) translateX(0);
  }
  to {
    transform: translateY(-50px) translateX(20px);
  }
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
.light-ray,
.ocean-particle {
  will-change: transform, opacity;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
