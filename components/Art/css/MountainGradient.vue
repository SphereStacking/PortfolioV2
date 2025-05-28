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

// 山の形状（SVG）
const mountainMasks = {
  mountain1: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0,100 L20,60 L40,80 L60,40 L80,70 L100,30 L100,100 Z" fill="%23000000"/%3E%3C/svg%3E',
  mountain2: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0,100 L30,50 L50,70 L70,30 L100,60 L100,100 Z" fill="%23000000"/%3E%3C/svg%3E',
  mountain3: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0,100 L40,40 L60,60 L80,20 L100,50 L100,100 Z" fill="%23000000"/%3E%3C/svg%3E',
}

// 雲の形状（SVG）
const cloudMask = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"%3E%3Cpath d="M10,30 C10,20 20,15 30,20 C35,10 45,10 50,20 C55,10 65,10 70,20 C80,15 90,20 90,30 C95,30 95,35 90,35 L10,35 C5,35 5,30 10,30 Z" fill="%23000000"/%3E%3C/svg%3E'

// 山の形状
const mountains = ref([
  {
    mask: mountainMasks.mountain1,
    width: 300,
    height: 200,
    left: -50,
    gradient: 'linear-gradient(to bottom, #1e293b, #334155, #475569)',
    opacity: 0.9,
    duration: 30,
    delay: 0,
  },
  {
    mask: mountainMasks.mountain2,
    width: 280,
    height: 180,
    left: 20,
    gradient: 'linear-gradient(to bottom, #334155, #475569, #64748b)',
    opacity: 0.85,
    duration: 35,
    delay: 5,
  },
  {
    mask: mountainMasks.mountain3,
    width: 320,
    height: 220,
    left: 50,
    gradient: 'linear-gradient(to bottom, #1e293b, #334155, #475569)',
    opacity: 0.8,
    duration: 40,
    delay: 10,
  },
])

// 雲
const clouds = ref([
  {
    mask: cloudMask,
    width: 120,
    height: 60,
    top: 10,
    left: 10,
    opacity: 0.9,
    duration: 60,
    delay: 0,
  },
  {
    mask: cloudMask,
    width: 100,
    height: 50,
    top: 20,
    left: 40,
    opacity: 0.85,
    duration: 70,
    delay: 20,
  },
  {
    mask: cloudMask,
    width: 140,
    height: 70,
    top: 5,
    left: 70,
    opacity: 0.8,
    duration: 80,
    delay: 40,
  },
])

// 雪の粒子
const snowParticles = ref(Array.from({ length: 50 }, () => {
  return {
    size: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    opacity: Math.random() * 0.5 + 0.3,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }
}))

// 滝
const waterfall = ref({
  width: 40,
  height: 100,
  left: 60,
  top: 30,
  gradient: 'linear-gradient(to bottom, #e0f2fe, #bae6fd, #7dd3fc)',
  opacity: 0.7,
  duration: 2,
})
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 mountain-background"></div>

    <!-- 雲 -->
    <div class="absolute inset-0">
      <div
        v-for="(cloud, i) in clouds"
        :key="`cloud-${i}`"
        class="absolute mountain-cloud"
        :style="{
          width: `${cloud.width}px`,
          height: `${cloud.height}px`,
          top: `${cloud.top}%`,
          left: `${cloud.left}%`,
          background: 'rgba(255, 255, 255, 0.9)',
          mask: `url(${cloud.mask})`,
          WebkitMask: `url(${cloud.mask})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          opacity: cloud.opacity,
          animation: `cloud-drift ${cloud.duration}s linear infinite ${cloud.delay}s`,
        }"></div>
    </div>

    <!-- 山 -->
    <div class="absolute inset-0">
      <div
        v-for="(mountain, i) in mountains"
        :key="`mountain-${i}`"
        class="absolute mountain-shape"
        :style="{
          width: `${mountain.width}px`,
          height: `${mountain.height}px`,
          bottom: 0,
          left: `${mountain.left}%`,
          background: mountain.gradient,
          mask: `url(${mountain.mask})`,
          WebkitMask: `url(${mountain.mask})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'bottom',
          WebkitMaskPosition: 'bottom',
          opacity: mountain.opacity,
          animation: `mountain-shift ${mountain.duration}s ease-in-out infinite ${mountain.delay}s`,
        }"></div>
    </div>

    <!-- 雪の粒子 -->
    <div class="absolute inset-0">
      <div
        v-for="(particle, i) in snowParticles"
        :key="`particle-${i}`"
        class="absolute rounded-full mountain-snow"
        :style="{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          top: `${particle.top}%`,
          left: `${particle.left}%`,
          backgroundColor: '#ffffff',
          opacity: particle.opacity,
          animation: `snow-fall ${particle.duration}s linear infinite ${particle.delay}s`,
        }"></div>
    </div>

    <!-- 滝 -->
    <div
      class="absolute mountain-waterfall"
      :style="{
        width: `${waterfall.width}px`,
        height: `${waterfall.height}px`,
        top: `${waterfall.top}%`,
        left: `${waterfall.left}%`,
        background: waterfall.gradient,
        opacity: waterfall.opacity,
        animation: `waterfall-flow ${waterfall.duration}s linear infinite`,
      }"></div>

    <!-- 霧のエフェクト -->
    <div class="absolute inset-0 mountain-fog"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold mountain-text">
          MOUNTAIN
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.mountain-background {
  background: linear-gradient(to bottom, #e0f2fe, #bae6fd, #7dd3fc);
}

@keyframes cloud-drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(100px); }
}

@keyframes mountain-shift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

@keyframes snow-fall {
  0% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(50px) translateX(10px); }
  100% { transform: translateY(100px) translateX(0); }
}

@keyframes waterfall-flow {
  0% { background-position: 0 0; }
  100% { background-position: 0 100px; }
}

.mountain-fog {
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2));
  animation: fog-move 20s ease-in-out infinite alternate;
}

@keyframes fog-move {
  0% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

.mountain-text {
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.3);
  background: rgba(30, 41, 59, 0.3);
  backdrop-filter: blur(4px);
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
