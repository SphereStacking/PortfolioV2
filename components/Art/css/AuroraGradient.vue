<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

// パフォーマンス最適化: 要素数を大幅削減
const isVisible = ref(true)
const containerRef = ref(null)

// 星の数を80→30に削減
const stars = computed(() => {
  if (!isVisible.value) return []
  return Array.from({ length: 30 }, (_, i) => ({
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

// 粒子の数を40→15に削減
const particles = computed(() => {
  if (!isVisible.value) return []
  const colors = ['#84cc16', '#10b981', '#06b6d4', '#6366f1', '#8b5cf6']
  return Array.from({ length: 15 }, (_, i) => ({
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

// Intersection Observer for performance
let observer = null

onMounted(() => {
  if (containerRef.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.value = entry.isIntersecting
        })
      },
      { threshold: 0.1 },
    )
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :class="['relative overflow-hidden rounded-lg aurora-container size-full']">
    <div class="absolute inset-0 aurora-sky"></div>

    <!-- 星空の背景 - 要素数削減 -->
    <div v-if="isVisible" class="absolute inset-0">
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

    <!-- オーロラのカーテン -->
    <div class="absolute inset-x-0 top-0 h-3/4 aurora-curtain-container">
      <!-- 複数の縦のカーテン -->
      <div class="aurora-curtain aurora-curtain-1"></div>
      <div class="aurora-curtain aurora-curtain-2"></div>
      <div class="aurora-curtain aurora-curtain-3"></div>
      <div class="aurora-curtain aurora-curtain-4"></div>
      <div class="aurora-curtain aurora-curtain-5"></div>
    </div>

    <!-- 地平線と山の影 - 簡素化 -->
    <div class="absolute inset-x-0 bottom-0 h-2/5 landscape-container">
      <div class="absolute inset-x-0 bottom-0 h-full mountain-far"></div>
      <div class="absolute inset-x-0 bottom-0 h-4/5 mountain-mid"></div>
      <div class="absolute inset-x-0 bottom-0 h-1/6 ground"></div>
    </div>

    <!-- オーロラの光の粒子 - 要素数削減 -->
    <div v-if="isVisible" class="absolute inset-0 overflow-hidden">
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
.aurora-container {
  /* GPU加速を有効化 */
  transform: translateZ(0);
  will-change: auto;
}

.aurora-sky {
  background: linear-gradient(to bottom, #0f172a 0%, #1e293b 70%, #334155 100%);
}

.star-twinkle {
  opacity: var(--star-opacity, 0.5);
  animation: twinkle-aurora ease-in-out infinite;
  /* GPU加速 */
  will-change: transform, opacity;
  transform: translateZ(0);
}

@keyframes twinkle-aurora {
  0%, 100% {
    opacity: var(--star-opacity, 0.5);
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    opacity: calc(var(--star-opacity, 0.5) * 0.2);
    transform: translate3d(0, 0, 0) scale(0.8);
  }
}

.aurora-curtain-container {
  position: relative;
  overflow: hidden;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.aurora-curtain {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30%;
  opacity: 0.8;
  will-change: transform;
  transform: translateZ(0);
  transform-origin: top center;
}

.aurora-curtain-1 {
  left: 5%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(16, 185, 129, 0.1) 10%,
    rgba(6, 182, 212, 0.4) 20%,
    rgba(16, 185, 129, 0.6) 35%,
    rgba(6, 182, 212, 0.3) 50%,
    rgba(16, 185, 129, 0.1) 70%,
    transparent 90%
  );
  filter: blur(8px);
  animation: aurora-wave 12s ease-in-out infinite;
}

.aurora-curtain-2 {
  left: 25%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(6, 182, 212, 0.1) 5%,
    rgba(8, 145, 178, 0.5) 25%,
    rgba(6, 182, 212, 0.4) 40%,
    rgba(8, 145, 178, 0.2) 60%,
    transparent 85%
  );
  filter: blur(10px);
  animation: aurora-wave 15s ease-in-out infinite;
  animation-delay: -2s;
}

.aurora-curtain-3 {
  left: 45%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(139, 92, 246, 0.1) 8%,
    rgba(16, 185, 129, 0.3) 20%,
    rgba(139, 92, 246, 0.5) 30%,
    rgba(124, 58, 237, 0.4) 45%,
    rgba(139, 92, 246, 0.2) 65%,
    transparent 88%
  );
  filter: blur(12px);
  animation: aurora-wave 18s ease-in-out infinite;
  animation-delay: -5s;
}

.aurora-curtain-4 {
  left: 65%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(8, 145, 178, 0.1) 12%,
    rgba(6, 182, 212, 0.6) 28%,
    rgba(8, 145, 178, 0.3) 42%,
    rgba(6, 182, 212, 0.1) 65%,
    transparent 90%
  );
  filter: blur(9px);
  animation: aurora-wave 14s ease-in-out infinite;
  animation-delay: -8s;
}

.aurora-curtain-5 {
  left: 80%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(124, 58, 237, 0.1) 15%,
    rgba(139, 92, 246, 0.4) 30%,
    rgba(124, 58, 237, 0.3) 50%,
    rgba(139, 92, 246, 0.1) 75%,
    transparent 92%
  );
  filter: blur(11px);
  animation: aurora-wave 16s ease-in-out infinite;
  animation-delay: -10s;
}

/* オーロラのカーテンの揺らめき */
@keyframes aurora-wave {
  0% {
    transform: translateZ(-100px) rotateX(0deg) skewY(0deg) scaleY(1);
    opacity: 0.6;
  }
  20% {
    transform: translateZ(0px) rotateX(-5deg) skewY(-2deg) scaleY(1.1);
    opacity: 0.8;
  }
  40% {
    transform: translateZ(-50px) rotateX(3deg) skewY(1deg) scaleY(0.95);
    opacity: 0.9;
  }
  60% {
    transform: translateZ(50px) rotateX(-2deg) skewY(3deg) scaleY(1.05);
    opacity: 0.7;
  }
  80% {
    transform: translateZ(-20px) rotateX(4deg) skewY(-1deg) scaleY(0.98);
    opacity: 0.85;
  }
  100% {
    transform: translateZ(-100px) rotateX(0deg) skewY(0deg) scaleY(1);
    opacity: 0.6;
  }
}

/* オーロラ全体の輝き */
.aurora-curtain-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center top,
    rgba(16, 185, 129, 0.2) 0%,
    rgba(6, 182, 212, 0.1) 30%,
    transparent 70%
  );
  animation: aurora-glow 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes aurora-glow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
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

.ground {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.95));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.aurora-particle {
  border-radius: 50%;
  animation: aurora-float ease-in-out infinite;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes aurora-float {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  25% {
    transform: translate3d(8px, -15px, 0) scale(1.1);
  }
  50% {
    transform: translate3d(-8px, -8px, 0) scale(0.9);
  }
  75% {
    transform: translate3d(3px, -20px, 0) scale(1.05);
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
.aurora-curtain,
.aurora-particle,
.star-twinkle {
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
