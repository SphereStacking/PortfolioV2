<script setup>
import { ref, onUnmounted, computed } from 'vue'
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

// 量子粒子（25個）
const quantumParticles = computed(() => {
  if (!isVisible.value) return []
  return Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: 3 + Math.random() * 7,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 5 + Math.random() * 5,
    delay: Math.random() * 5,
    color: ['#00ffff', '#ff00ff', '#00ff00', '#ffff00'][i % 4],
  }))
})

// 電子軌道（4つ）
const electronOrbits = ref([
  { id: 1, radius: 100, duration: 10, delay: 0 },
  { id: 2, radius: 150, duration: 15, delay: 2 },
  { id: 3, radius: 200, duration: 20, delay: 4 },
  { id: 4, radius: 250, duration: 25, delay: 6 },
])

// エネルギー波（5つ）
const energyWaves = ref(Array.from({ length: 5 }, (_, i) => ({
  id: i,
  delay: i * 2,
  duration: 8,
})))
</script>

<template>
  <div
    ref="target"
    :class="['relative overflow-hidden rounded-lg quantum-container size-full']"
    :style="style">
    <!-- 量子場の背景 -->
    <div class="absolute inset-0 quantum-field"></div>
    
    <!-- 電子軌道 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        v-for="orbit in electronOrbits"
        :key="`orbit-${orbit.id}`"
        class="electron-orbit"
        :style="{
          width: `${orbit.radius * 2}px`,
          height: `${orbit.radius * 2}px`,
          animationDuration: `${orbit.duration}s`,
          animationDelay: `${orbit.delay}s`,
        }">
        <div class="electron"></div>
      </div>
    </div>
    
    <!-- 量子粒子 -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="particle in quantumParticles"
        :key="`particle-${particle.id}`"
        class="quantum-particle"
        :style="{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          backgroundColor: particle.color,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
          '--particle-color': particle.color,
        }"></div>
    </div>
    
    <!-- エネルギー波 -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="wave in energyWaves"
        :key="`wave-${wave.id}`"
        class="energy-wave"
        :style="{
          animationDelay: `${wave.delay}s`,
          animationDuration: `${wave.duration}s`,
        }"></div>
    </div>
    
    <!-- 波動関数の可視化 -->
    <div class="absolute inset-0 wave-function">
      <div class="wave-function-line wave-1"></div>
      <div class="wave-function-line wave-2"></div>
      <div class="wave-function-line wave-3"></div>
    </div>
    
    <!-- 量子もつれ効果 -->
    <div class="absolute inset-0 entanglement-effect"></div>
    
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-cyan-400 text-3xl font-bold quantum-text">
          QUANTUM
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.quantum-container {
  transform: translateZ(0);
  will-change: auto;
  background: #000;
}

.quantum-field {
  background: 
    radial-gradient(circle at 25% 25%, #0a0033 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, #001a33 0%, transparent 50%),
    linear-gradient(180deg, #000011 0%, #000033 50%, #000011 100%);
}

.electron-orbit {
  position: absolute;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: orbit-rotate linear infinite;
  will-change: transform;
}

@keyframes orbit-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.electron {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #00ffff;
  border-radius: 50%;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 
    0 0 10px #00ffff,
    0 0 20px #00ffff;
  animation: electron-glow 2s ease-in-out infinite;
}

@keyframes electron-glow {
  0%, 100% {
    filter: brightness(1);
    transform: translateX(-50%) scale(1);
  }
  50% {
    filter: brightness(1.5);
    transform: translateX(-50%) scale(1.2);
  }
}

.quantum-particle {
  position: absolute;
  border-radius: 50%;
  animation: quantum-teleport ease-in-out infinite;
  will-change: transform, opacity;
  box-shadow: 
    0 0 10px var(--particle-color),
    0 0 20px var(--particle-color);
}

@keyframes quantum-teleport {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  40% {
    opacity: 1;
    transform: scale(1) translate(20px, -20px);
  }
  60% {
    opacity: 0;
    transform: scale(0) translate(40px, -40px);
  }
  80% {
    opacity: 1;
    transform: scale(1) translate(-30px, 30px);
  }
}

.energy-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 50%;
  animation: wave-expand ease-out infinite;
  will-change: transform, opacity;
}

@keyframes wave-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

.wave-function {
  opacity: 0.3;
  mix-blend-mode: screen;
}

.wave-function-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    #00ff00 25%,
    #ff00ff 50%,
    #00ffff 75%,
    transparent 100%
  );
  filter: blur(2px);
}

.wave-1 {
  top: 30%;
  animation: wave-oscillate 4s ease-in-out infinite;
}

.wave-2 {
  top: 50%;
  animation: wave-oscillate 4s ease-in-out infinite;
  animation-delay: -1.3s;
}

.wave-3 {
  top: 70%;
  animation: wave-oscillate 4s ease-in-out infinite;
  animation-delay: -2.6s;
}

@keyframes wave-oscillate {
  0%, 100% {
    transform: translateX(-100px) scaleY(1);
  }
  25% {
    transform: translateX(0) scaleY(2);
  }
  50% {
    transform: translateX(100px) scaleY(1);
  }
  75% {
    transform: translateX(0) scaleY(0.5);
  }
}

.entanglement-effect {
  background: repeating-conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    rgba(0, 255, 255, 0.1) 10deg,
    transparent 20deg
  );
  animation: entangle-rotate 30s linear infinite;
  opacity: 0.5;
}

@keyframes entangle-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.quantum-text {
  text-shadow: 
    0 0 20px rgba(0, 255, 255, 0.8),
    0 0 40px rgba(255, 0, 255, 0.6),
    0 0 60px rgba(0, 255, 0, 0.4);
  letter-spacing: 8px;
  font-family: monospace;
  animation: text-glitch 0.5s infinite;
}

@keyframes text-glitch {
  0%, 100% {
    text-shadow: 
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(255, 0, 255, 0.6),
      0 0 60px rgba(0, 255, 0, 0.4);
  }
  95% {
    text-shadow: 
      2px 0 20px rgba(0, 255, 255, 0.8),
      -2px 0 40px rgba(255, 0, 255, 0.6),
      0 0 60px rgba(0, 255, 0, 0.4);
  }
}
</style>