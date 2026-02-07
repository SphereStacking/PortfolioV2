<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineProps({
  style: {
    type: Object,
    default: () => ({}),
  },
})

// パフォーマンス最適化
const isVisible = ref(true)
const containerRef = ref(null)

const mouseX = ref(0.5)
const mouseY = ref(0.5)

const handleMouseMove = (e) => {
  if (!isVisible.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left) / rect.width
  mouseY.value = (e.clientY - rect.top) / rect.height
}

// 炎の粒子数を大幅削減（30→12）
const emberParticles = computed(() => {
  if (!isVisible.value) return []
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    width: Math.random() * 4 + 2,
    height: Math.random() * 4 + 2,
    left: Math.random() * 100,
    animationDelay: Math.random() * 5,
    animationDuration: 3 + Math.random() * 4,
    wobble: Math.random() * 60 - 30,
    glowSize: Math.random() * 10 + 5,
  }))
})

// 火花の数を削減（25→10）
const sparkParticles = computed(() => {
  if (!isVisible.value) return []
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    width: Math.random() * 3 + 1,
    height: Math.random() * 10 + 5,
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    sparkDistance: Math.random() * 150 + 50,
  }))
})

// Intersection Observer
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
    :class="['relative overflow-hidden rounded-lg fire-container size-full']"
    :style="style"
    @mousemove="handleMouseMove">
    <div class="absolute inset-0 bg-fire-base"></div>

    <!-- Heat Distortion Effect -->
    <div class="absolute inset-0 heat-distortion"></div>

    <!-- Dynamic Fire Layers with Mouse Interaction -->
    <div
      class="absolute inset-0 fire-base"
      :style="{
        transform: `translate3d(${(mouseX - 0.5) * 20}px, 0, 0)`,
      }"></div>

    <div
      class="absolute inset-0 fire-layer1"
      :style="{
        transform: `translate3d(${(mouseX - 0.5) * 30}px, ${(1 - mouseY) * 10}px, 0)`,
      }"></div>

    <div
      class="absolute inset-0 fire-layer2"
      :style="{
        transform: `translate3d(${(mouseX - 0.5) * -25}px, ${(1 - mouseY) * 15}px, 0)`,
      }"></div>

    <div
      class="absolute inset-0 fire-layer3"
      :style="{
        transform: `translate3d(${(mouseX - 0.5) * 40}px, ${(1 - mouseY) * 20}px, 0)`,
      }"></div>

    <!-- Dynamic Ember Particles - 要素数削減 -->
    <div v-if="isVisible" class="absolute inset-0 overflow-hidden">
      <div
        v-for="ember in emberParticles"
        :key="`ember-${ember.id}`"
        class="absolute ember-particle"
        :style="{
          'width': `${ember.width}px`,
          'height': `${ember.height}px`,
          'left': `${ember.left}%`,
          'bottom': '-10px',
          'animationDelay': `${ember.animationDelay}s`,
          'animationDuration': `${ember.animationDuration}s`,
          '--wobble': `${ember.wobble}px`,
          '--glow-size': `${ember.glowSize}px`,
        }"></div>
    </div>

    <!-- Enhanced Sparks - 要素数削減 -->
    <div v-if="isVisible" class="absolute inset-x-0 bottom-0 h-3/4">
      <div
        v-for="spark in sparkParticles"
        :key="`spark-${spark.id}`"
        class="absolute spark"
        :style="{
          'width': `${spark.width}px`,
          'height': `${spark.height}px`,
          'left': `${spark.left}%`,
          'bottom': '10%',
          'animationDelay': `${spark.animationDelay}s`,
          '--spark-distance': `${spark.sparkDistance}px`,
        }"></div>
    </div>

    <!-- Smoke Layers -->
    <div class="absolute inset-x-0 bottom-0 h-full smoke-layer1"></div>
    <div class="absolute inset-x-0 bottom-0 h-full smoke-layer2"></div>

    <!-- Content -->
    <div class="absolute inset-0 flex items-center justify-center z-10 pt-12">
      <slot>
        <h3 class="text-white text-3xl font-bold fire-text">
          <span class="flame-letter">フ</span>
          <span class="flame-letter delay-1">ァ</span>
          <span class="flame-letter delay-2">イ</span>
          <span class="flame-letter delay-3">ヤ</span>
          <span class="flame-letter delay-4">ー</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.fire-container {
  /* GPU加速を有効化 */
  transform: translateZ(0);
  will-change: auto;
}

/* Base Background */
.bg-fire-base {
  background: linear-gradient(to bottom, #2a0800, #000000);
}

/* Heat Distortion */
.heat-distortion {
  background: linear-gradient(45deg, transparent 30%, rgba(255, 87, 34, 0.1) 50%, transparent 70%);
  filter: blur(3px);
  animation: heat-wave 2s ease-in-out infinite;
}

@keyframes heat-wave {
  0%, 100% {
    transform: translate3d(0, 0, 0) skewY(0);
  }
  50% {
    transform: translate3d(0, -5px, 0) skewY(2deg);
  }
}

/* Enhanced Fire Layers */
.fire-base {
  background:
    radial-gradient(ellipse at center bottom, #ff6b1a 0%, #ff9800 30%, transparent 70%),
    radial-gradient(ellipse at 30% bottom, #ff5722 0%, transparent 50%),
    radial-gradient(ellipse at 70% bottom, #ff7043 0%, transparent 50%);
  animation: fire-base 4s ease-in-out infinite;
  mix-blend-mode: screen;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes fire-base {
  0%, 100% {
    opacity: 0.8;
    transform: translate3d(0, 0, 0) scaleY(1);
  }
  50% {
    opacity: 1;
    transform: translate3d(0, -5px, 0) scaleY(1.1);
  }
}

.fire-layer1 {
  background:
    radial-gradient(ellipse at 40% 90%, #ffa726 0%, transparent 55%),
    radial-gradient(ellipse at 60% 85%, #ff9800 0%, transparent 45%);
  filter: blur(8px);
  animation: fire-layer1 3s ease-in-out infinite;
  mix-blend-mode: screen;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes fire-layer1 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.9;
  }
  33% {
    transform: translate3d(0, -15px, 0) scale(1.05);
    opacity: 1;
  }
  66% {
    transform: translate3d(0, -10px, 0) scale(1.02);
    opacity: 0.95;
  }
}

.fire-layer2 {
  background:
    radial-gradient(ellipse at 60% 90%, #ff7043 0%, transparent 60%),
    radial-gradient(ellipse at 40% 85%, #ff5722 0%, transparent 50%);
  filter: blur(6px) contrast(1.2);
  animation: fire-layer2 3.5s ease-in-out infinite 0.5s;
  mix-blend-mode: screen;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes fire-layer2 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.85;
  }
  50% {
    transform: translate3d(0, -20px, 0) scale(1.1);
    opacity: 1;
  }
}

.fire-layer3 {
  background:
    radial-gradient(ellipse at 50% 95%, #ff8a65 0%, transparent 65%),
    radial-gradient(ellipse at 30% 90%, #ff6f00 0%, transparent 55%);
  filter: blur(4px);
  animation: fire-layer3 4s ease-in-out infinite 1s;
  mix-blend-mode: screen;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes fire-layer3 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate3d(0, -25px, 0) scale(1.15);
    opacity: 1;
  }
}

/* Ember Particles */
.ember-particle {
  background: radial-gradient(circle, #ff6b1a, #ff3d00);
  border-radius: 50%;
  animation: ember-rise 4s ease-out infinite;
  box-shadow: 0 0 var(--glow-size, 8px) #ff6b1a;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes ember-rise {
  0% {
    transform: translate3d(0, 0, 0) scale(0.5);
    opacity: 1;
  }
  50% {
    transform: translate3d(var(--wobble, 0px), -200px, 0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate3d(calc(var(--wobble, 0px) * 2), -400px, 0) scale(0.2);
    opacity: 0;
  }
}

/* Sparks */
.spark {
  background: linear-gradient(to top, #ff6b1a, #ffeb3b);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: spark-fly 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes spark-fly {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
  70% {
    transform: translate3d(calc(var(--spark-distance, 100px) * 0.3), calc(var(--spark-distance, 100px) * -0.8), 0) scale(0.5);
    opacity: 0.6;
  }
  100% {
    transform: translate3d(var(--spark-distance, 100px), calc(var(--spark-distance, 100px) * -1), 0) scale(0.1);
    opacity: 0;
  }
}

/* Smoke Layers */
.smoke-layer1 {
  background: linear-gradient(to top,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(50, 50, 50, 0.3) 30%,
    rgba(100, 100, 100, 0.2) 60%,
    transparent 100%);
  animation: smoke-rise1 8s ease-in-out infinite;
  will-change: transform;
  transform: translateZ(0);
}

.smoke-layer2 {
  background: linear-gradient(to top,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(80, 80, 80, 0.2) 40%,
    rgba(120, 120, 120, 0.15) 70%,
    transparent 100%);
  animation: smoke-rise2 10s ease-in-out infinite 2s;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes smoke-rise1 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate3d(-20px, -30px, 0) scale(1.1);
    opacity: 0.8;
  }
}

@keyframes smoke-rise2 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate3d(20px, -40px, 0) scale(1.2);
    opacity: 0.6;
  }
}

/* Fire Text */
.fire-text {
  text-shadow:
    0 0 10px #ff6b1a,
    0 0 20px #ff3d00,
    0 0 30px #ff1744,
    0 0 40px #d50000;
  animation: text-heat 2s ease-in-out infinite;
}

.flame-letter {
  display: inline-block;
  animation: letter-dance 1.5s ease-in-out infinite;
  will-change: transform;
  transform: translateZ(0);
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }

@keyframes text-heat {
  0%, 100% {
    text-shadow:
      0 0 10px #ff6b1a,
      0 0 20px #ff3d00,
      0 0 30px #ff1744,
      0 0 40px #d50000;
  }
  50% {
    text-shadow:
      0 0 15px #ff6b1a,
      0 0 25px #ff3d00,
      0 0 35px #ff1744,
      0 0 45px #d50000;
  }
}

@keyframes letter-dance {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  25% {
    transform: translate3d(0, -3px, 0) scale(1.05);
  }
  50% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  75% {
    transform: translate3d(0, 2px, 0) scale(0.98);
  }
}

/* パフォーマンス最適化 */
.fire-base,
.fire-layer1,
.fire-layer2,
.fire-layer3,
.ember-particle,
.spark,
.smoke-layer1,
.smoke-layer2,
.flame-letter {
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
