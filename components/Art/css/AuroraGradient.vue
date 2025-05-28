<script setup>
import { computed } from 'vue'

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

// 星の配置を事前に計算（リアクティブな変更を避ける）
const stars = computed(() => {
  return Array.from({ length: 80 }, (_, i) => ({
    id: i,
    width: Math.random() * 2 + 0.5,
    height: Math.random() * 2 + 0.5,
    top: Math.random() * 60,
    left: Math.random() * 100,
    opacity: Math.random() * 0.9 + 0.1,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 3,
  }))
})

// 粒子の配置を事前に計算
const particles = computed(() => {
  const colors = ['#84cc16', '#10b981', '#06b6d4', '#6366f1', '#8b5cf6']
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    width: Math.random() * 4 + 2,
    height: Math.random() * 4 + 2,
    top: Math.random() * 50 + 10,
    left: Math.random() * 100,
    opacity: Math.random() * 0.6 + 0.2,
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    blur: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }))
})
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 aurora-sky"></div>

    <!-- 星空の背景 -->
    <div class="absolute inset-0">
      <div
        v-for="star in stars"
        :key="`star-${star.id}`"
        class="absolute rounded-full bg-white star-twinkle"
        :style="{
          'width': `${star.width}px`,
          'height': `${star.height}px`,
          'top': `${star.top}%`,
          'left': `${star.left}%`,
          '--star-opacity': star.opacity,
          'animationDuration': `${star.duration}s`,
          'animationDelay': `${star.delay}s`,
        }"></div>
    </div>

    <!-- オーロラの波形アニメーション -->
    <div class="absolute inset-x-0 top-10 h-3/5 aurora-waves-container">
      <div class="aurora-wave aurora-wave1"></div>
      <div class="aurora-wave aurora-wave2"></div>
      <div class="aurora-wave aurora-wave3"></div>
      <!-- 追加の微細な波形 -->
      <div class="aurora-wave aurora-wave4"></div>
      <div class="aurora-wave aurora-wave5"></div>
    </div>

    <!-- 地平線と山の影 -->
    <div class="absolute inset-x-0 bottom-0 h-2/5 landscape-container">
      <!-- 遠景の山々 -->
      <div class="absolute inset-x-0 bottom-0 h-full mountain-far"></div>
      <!-- 中景の山々 -->
      <div class="absolute inset-x-0 bottom-0 h-4/5 mountain-mid"></div>
      <!-- 近景の山々 -->
      <div class="absolute inset-x-0 bottom-0 h-3/5 mountain-near"></div>
      <!-- 地面 -->
      <div class="absolute inset-x-0 bottom-0 h-1/6 ground"></div>
    </div>

    <!-- オーロラの光の粒子 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="particle in particles"
        :key="`particle-${particle.id}`"
        class="absolute aurora-particle"
        :style="{
          width: `${particle.width}px`,
          height: `${particle.height}px`,
          top: `${particle.top}%`,
          left: `${particle.left}%`,
          opacity: particle.opacity,
          backgroundColor: particle.backgroundColor,
          filter: `blur(${particle.blur}px)`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
        }"></div>
    </div>

    <div class="absolute inset-0 flex items-center justify-center z-10 pt-20">
      <slot>
        <h3 class="text-white text-2xl font-bold aurora-text">
          オーロラ
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.aurora-sky {
  background: linear-gradient(to bottom, #0f172a 0%, #1e293b 70%, #334155 100%);
}

.star-twinkle {
  opacity: var(--star-opacity, 0.5);
  animation: twinkle-aurora ease-in-out infinite;
}

@keyframes twinkle-aurora {
  0%, 100% {
    opacity: var(--star-opacity, 0.5);
    transform: scale(1);
  }
  50% {
    opacity: calc(var(--star-opacity, 0.5) * 0.2);
    transform: scale(0.8);
  }
}

.aurora-waves-container {
  position: relative;
  overflow: hidden;
  perspective: 1000px;
}

.aurora-wave {
  position: absolute;
  left: -20%;
  right: -20%;
  width: 140%;
  height: 100%;
  opacity: 0.9;
  filter: blur(15px);
  will-change: transform, opacity;
  transform-origin: center bottom;
}

.aurora-wave1 {
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(6, 182, 212, 0.9) 15%,
    rgba(8, 145, 178, 0.7) 35%,
    rgba(6, 182, 212, 0.5) 55%,
    rgba(8, 145, 178, 0.3) 75%,
    transparent 90%
  );
  animation: aurora-wave1 18s ease-in-out infinite;
  z-index: 3;
}

.aurora-wave2 {
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(16, 185, 129, 0.8) 20%,
    rgba(5, 150, 105, 0.6) 40%,
    rgba(16, 185, 129, 0.4) 60%,
    rgba(5, 150, 105, 0.2) 80%,
    transparent 95%
  );
  animation: aurora-wave2 22s ease-in-out infinite reverse;
  z-index: 2;
}

.aurora-wave3 {
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(139, 92, 246, 0.85) 10%,
    rgba(124, 58, 237, 0.65) 30%,
    rgba(139, 92, 246, 0.45) 50%,
    rgba(124, 58, 237, 0.25) 70%,
    transparent 85%
  );
  animation: aurora-wave3 16s ease-in-out infinite;
  z-index: 1;
}

.aurora-wave4 {
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(236, 72, 153, 0.6) 25%,
    rgba(219, 39, 119, 0.4) 45%,
    rgba(236, 72, 153, 0.3) 65%,
    transparent 85%
  );
  animation: aurora-wave4 14s ease-in-out infinite reverse;
  z-index: 4;
  filter: blur(25px);
}

.aurora-wave5 {
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(34, 197, 94, 0.7) 18%,
    rgba(22, 163, 74, 0.5) 38%,
    rgba(34, 197, 94, 0.3) 58%,
    rgba(22, 163, 74, 0.2) 78%,
    transparent 90%
  );
  animation: aurora-wave5 20s ease-in-out infinite;
  z-index: 0;
  filter: blur(30px);
}

@keyframes aurora-wave1 {
  0% {
    transform: translateX(-15%) scale(1.2) skewX(-3deg) rotateY(5deg);
    opacity: 0.7;
  }
  25% {
    transform: translateX(-5%) scale(1.1) skewX(-1deg) rotateY(2deg);
    opacity: 0.9;
  }
  50% {
    transform: translateX(5%) scale(1.3) skewX(1deg) rotateY(-2deg);
    opacity: 0.8;
  }
  75% {
    transform: translateX(10%) scale(1.0) skewX(2deg) rotateY(-5deg);
    opacity: 0.9;
  }
  100% {
    transform: translateX(15%) scale(1.2) skewX(3deg) rotateY(-3deg);
    opacity: 0.7;
  }
}

@keyframes aurora-wave2 {
  0% {
    transform: translateX(20%) scale(0.9) skewX(4deg) rotateY(-8deg);
    opacity: 0.6;
  }
  30% {
    transform: translateX(5%) scale(1.4) skewX(1deg) rotateY(-3deg);
    opacity: 0.8;
  }
  60% {
    transform: translateX(-10%) scale(1.1) skewX(-2deg) rotateY(3deg);
    opacity: 0.7;
  }
  90% {
    transform: translateX(-15%) scale(1.2) skewX(-3deg) rotateY(6deg);
    opacity: 0.8;
  }
  100% {
    transform: translateX(-20%) scale(0.9) skewX(-4deg) rotateY(8deg);
    opacity: 0.6;
  }
}

@keyframes aurora-wave3 {
  0% {
    transform: translateX(-25%) scale(1.1) skewX(-2deg) rotateY(6deg);
    opacity: 0.8;
  }
  20% {
    transform: translateX(-10%) scale(1.0) skewX(0deg) rotateY(3deg);
    opacity: 0.9;
  }
  40% {
    transform: translateX(0%) scale(1.3) skewX(1deg) rotateY(0deg);
    opacity: 0.85;
  }
  60% {
    transform: translateX(10%) scale(1.1) skewX(2deg) rotateY(-3deg);
    opacity: 0.9;
  }
  80% {
    transform: translateX(20%) scale(1.0) skewX(3deg) rotateY(-6deg);
    opacity: 0.8;
  }
  100% {
    transform: translateX(25%) scale(1.2) skewX(2deg) rotateY(-6deg);
    opacity: 0.8;
  }
}

@keyframes aurora-wave4 {
  0% {
    transform: translateX(30%) scale(0.8) skewX(6deg) rotateY(-10deg);
    opacity: 0.4;
  }
  35% {
    transform: translateX(10%) scale(1.5) skewX(2deg) rotateY(-4deg);
    opacity: 0.7;
  }
  70% {
    transform: translateX(-20%) scale(1.0) skewX(-3deg) rotateY(5deg);
    opacity: 0.6;
  }
  100% {
    transform: translateX(-30%) scale(0.8) skewX(-6deg) rotateY(10deg);
    opacity: 0.4;
  }
}

@keyframes aurora-wave5 {
  0% {
    transform: translateX(-35%) scale(1.3) skewX(-4deg) rotateY(8deg);
    opacity: 0.5;
  }
  25% {
    transform: translateX(-15%) scale(1.0) skewX(-1deg) rotateY(4deg);
    opacity: 0.8;
  }
  50% {
    transform: translateX(5%) scale(1.4) skewX(2deg) rotateY(-2deg);
    opacity: 0.7;
  }
  75% {
    transform: translateX(25%) scale(1.1) skewX(4deg) rotateY(-6deg);
    opacity: 0.8;
  }
  100% {
    transform: translateX(35%) scale(1.3) skewX(4deg) rotateY(-8deg);
    opacity: 0.5;
  }
}

.landscape-container {
  position: relative;
  overflow: hidden;
}

.mountain-far {
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(0, 0, 0, 0.95));
  clip-path: polygon(
    0% 100%,
    0% 85%,
    15% 75%,
    25% 80%,
    35% 70%,
    45% 75%,
    55% 65%,
    65% 70%,
    75% 60%,
    85% 65%,
    95% 55%,
    100% 60%,
    100% 100%
  );
  opacity: 0.6;
}

.mountain-mid {
  background: linear-gradient(to bottom, rgba(30, 41, 59, 0.9), rgba(0, 0, 0, 0.9));
  clip-path: polygon(
    0% 100%,
    0% 90%,
    10% 80%,
    20% 85%,
    30% 75%,
    40% 80%,
    50% 70%,
    60% 75%,
    70% 65%,
    80% 70%,
    90% 60%,
    100% 65%,
    100% 100%
  );
  opacity: 0.8;
}

.mountain-near {
  background: linear-gradient(to bottom, rgba(51, 65, 85, 0.9), rgba(0, 0, 0, 0.95));
  clip-path: polygon(
    0% 100%,
    0% 95%,
    8% 85%,
    18% 90%,
    28% 80%,
    38% 85%,
    48% 75%,
    58% 80%,
    68% 70%,
    78% 75%,
    88% 65%,
    98% 70%,
    100% 100%
  );
  opacity: 0.9;
}

.ground {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.95));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.aurora-particle {
  border-radius: 50%;
  animation: aurora-float ease-in-out infinite;
  will-change: transform;
}

@keyframes aurora-float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
  }
  25% {
    transform: translateY(-15px) translateX(8px) scale(1.1);
  }
  50% {
    transform: translateY(-8px) translateX(-8px) scale(0.9);
  }
  75% {
    transform: translateY(-20px) translateX(3px) scale(1.05);
  }
}

.aurora-text {
  text-shadow:
    0 0 15px rgba(139, 92, 246, 0.8),
    0 0 30px rgba(6, 182, 212, 0.6),
    0 0 45px rgba(16, 185, 129, 0.4);
  letter-spacing: 3px;
  animation: text-glow 4s ease-in-out infinite alternate;
}

@keyframes text-glow {
  0% {
    text-shadow:
      0 0 15px rgba(139, 92, 246, 0.8),
      0 0 30px rgba(6, 182, 212, 0.6),
      0 0 45px rgba(16, 185, 129, 0.4);
  }
  100% {
    text-shadow:
      0 0 20px rgba(139, 92, 246, 1),
      0 0 40px rgba(6, 182, 212, 0.8),
      0 0 60px rgba(16, 185, 129, 0.6);
  }
}

/* パフォーマンス最適化 */
.aurora-wave,
.aurora-particle,
.star-twinkle {
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
