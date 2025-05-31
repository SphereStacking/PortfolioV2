<script setup>
import { ref } from 'vue'

defineProps({
  style: {
    type: Object,
    default: () => ({}),
  },
})

// 砂丘の形状（SVG）
const duneMasks = {
  dune1: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0,100 C20,80 40,90 60,70 C80,50 100,60 100,100 Z" fill="%23000000"/%3E%3C/svg%3E',
  dune2: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0,100 C30,70 50,80 70,60 C90,40 100,50 100,100 Z" fill="%23000000"/%3E%3C/svg%3E',
  dune3: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M0,100 C40,60 60,70 80,50 C100,30 100,40 100,100 Z" fill="%23000000"/%3E%3C/svg%3E',
}

// ヤシの木のマスク（SVG）
const palmTreeMask = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"%3E%3Cpath d="M50,0 C60,20 70,20 80,0 C70,40 80,60 70,80 C60,100 40,100 30,80 C20,60 30,40 20,0 C30,20 40,20 50,0 Z M50,80 L50,200" stroke="%23000000" stroke-width="5" fill="none"/%3E%3C/svg%3E'

// 砂丘の形状
const dunes = ref([
  {
    mask: duneMasks.dune1,
    width: 200,
    height: 100,
    left: 0,
    gradient: 'linear-gradient(to bottom, #fbbf24, #d97706, #92400e)',
    opacity: 0.9,
    duration: 20,
    delay: 0,
  },
  {
    mask: duneMasks.dune2,
    width: 180,
    height: 80,
    left: 30,
    gradient: 'linear-gradient(to bottom, #fcd34d, #f59e0b, #b45309)',
    opacity: 0.85,
    duration: 25,
    delay: 5,
  },
  {
    mask: duneMasks.dune3,
    width: 220,
    height: 90,
    left: 60,
    gradient: 'linear-gradient(to bottom, #fef3c7, #fbbf24, #d97706)',
    opacity: 0.8,
    duration: 30,
    delay: 10,
  },
])

// 砂の粒子
const sandParticles = ref(Array.from({ length: 50 }, () => {
  return {
    size: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    opacity: Math.random() * 0.3 + 0.1,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }
}))

// オアシス
const oasis = ref({
  width: 60,
  height: 40,
  left: 70,
  top: 60,
  gradient: 'linear-gradient(to bottom, #22d3ee, #06b6d4, #0891b2)',
  opacity: 0.8,
})

// ヤシの木
const palmTree = ref({
  mask: palmTreeMask,
  width: 40,
  height: 120,
  left: 75,
  top: 40,
  gradient: 'linear-gradient(to bottom, #166534, #15803d, #16a34a)',
  opacity: 0.9,
  duration: 15,
  delay: 0,
})
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg size-full']"
    :style="style">
    <div class="absolute inset-0 desert-background"></div>

    <!-- 砂嵐のエフェクト -->
    <div class="absolute inset-0 desert-sandstorm"></div>

    <!-- 砂丘 -->
    <div class="absolute inset-0">
      <div
        v-for="(dune, i) in dunes"
        :key="`dune-${i}`"
        class="absolute desert-dune"
        :style="{
          width: `${dune.width}px`,
          height: `${dune.height}px`,
          bottom: 0,
          left: `${dune.left}%`,
          background: dune.gradient,
          mask: `url(${dune.mask})`,
          WebkitMask: `url(${dune.mask})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'bottom',
          WebkitMaskPosition: 'bottom',
          opacity: dune.opacity,
          animation: `dune-shift ${dune.duration}s ease-in-out infinite ${dune.delay}s`,
        }"></div>
    </div>

    <!-- 砂の粒子 -->
    <div class="absolute inset-0">
      <div
        v-for="(particle, i) in sandParticles"
        :key="`particle-${i}`"
        class="absolute rounded-full desert-particle"
        :style="{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          top: `${particle.top}%`,
          left: `${particle.left}%`,
          backgroundColor: '#fef3c7',
          opacity: particle.opacity,
          animation: `sand-drift ${particle.duration}s ease-in-out infinite ${particle.delay}s`,
        }"></div>
    </div>

    <!-- オアシス -->
    <div
      class="absolute desert-oasis"
      :style="{
        width: `${oasis.width}px`,
        height: `${oasis.height}px`,
        top: `${oasis.top}%`,
        left: `${oasis.left}%`,
        background: oasis.gradient,
        opacity: oasis.opacity,
        borderRadius: '50%',
        filter: 'blur(5px)',
      }"></div>

    <!-- ヤシの木 -->
    <div
      class="absolute desert-palm"
      :style="{
        width: `${palmTree.width}px`,
        height: `${palmTree.height}px`,
        top: `${palmTree.top}%`,
        left: `${palmTree.left}%`,
        background: palmTree.gradient,
        mask: `url(${palmTree.mask})`,
        WebkitMask: `url(${palmTree.mask})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        opacity: palmTree.opacity,
        animation: `palm-sway ${palmTree.duration}s ease-in-out infinite ${palmTree.delay}s`,
      }"></div>

    <!-- 太陽の光 -->
    <div class="absolute inset-0 desert-sunlight"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold desert-text">
          DESERT
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.desert-background {
  background: linear-gradient(to bottom, #fef3c7, #fbbf24, #d97706);
}

.desert-sandstorm {
  background-image:
    linear-gradient(45deg, rgba(254, 243, 199, 0.1) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(254, 243, 199, 0.1) 25%, transparent 25%);
  background-size: 60px 60px;
  animation: sandstorm-move 20s linear infinite;
}

@keyframes sandstorm-move {
  0% { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}

@keyframes dune-shift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

@keyframes sand-drift {
  0% { transform: translate(0, 0); }
  25% { transform: translate(10px, -5px); }
  50% { transform: translate(20px, 0); }
  75% { transform: translate(10px, 5px); }
  100% { transform: translate(0, 0); }
}

@keyframes palm-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

.desert-sunlight {
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  mix-blend-mode: overlay;
  animation: sunlight-pulse 10s ease-in-out infinite alternate;
}

@keyframes sunlight-pulse {
  0% { opacity: 0.5; }
  100% { opacity: 0.8; }
}

.desert-text {
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.3);
  background: rgba(217, 119, 6, 0.3);
  backdrop-filter: blur(4px);
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
