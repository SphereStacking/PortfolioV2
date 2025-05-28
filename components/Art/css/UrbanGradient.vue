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

// 高層ビル
const buildings = ref(Array.from({ length: 10 }, (_, i) => {
  return {
    width: Math.floor(Math.random() * 20) + 20,
    height: Math.floor(Math.random() * 80) + 80,
    left: i * 10,
    color: ['#0f172a', '#1e293b', '#334155', '#475569'][Math.floor(Math.random() * 4)],
    opacity: Math.random() * 0.4 + 0.6,
    zIndex: Math.floor(Math.random() * 3) + 1,
    shadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    windows: Array.from({ length: Math.floor(Math.random() * 20) + 10 }),
  }
}))

// 車
const cars = ref(Array.from({ length: 10 }, (_, i) => {
  return {
    bottom: Math.floor(Math.random() * 3) + 5,
    left: Math.random() * 100,
    color: Math.random() > 0.5 ? '#dc2626' : '#f8fafc',
    opacity: 0.8,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    direction: Math.random() > 0.5 ? 'normal' : 'reverse',
  }
}))
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 urban-background"></div>

    <!-- 都市の構造物 -->
    <div class="absolute inset-0">
      <!-- 建物グリッド -->
      <div class="absolute inset-0 urban-grid"></div>

      <!-- 高層ビル -->
      <div
        v-for="(building, i) in buildings"
        :key="`building-${i}`"
        class="absolute urban-building"
        :style="{
          width: `${building.width}px`,
          height: `${building.height}px`,
          bottom: 0,
          left: `${building.left}%`,
          backgroundColor: building.color,
          opacity: building.opacity,
          zIndex: building.zIndex,
          boxShadow: building.shadow,
        }">
        <!-- ビルの窓 -->
        <div
          v-for="(_, j) in building.windows"
          :key="`window-${i}-${j}`"
          class="absolute urban-window"
          :style="{
            width: '4px',
            height: '4px',
            top: `${10 + Math.floor(j / 4) * 10}%`,
            left: `${10 + (j % 4) * 24}%`,
            backgroundColor: '#f8fafc',
            opacity: Math.random() > 0.3 ? 0.8 : 0,
          }"></div>
      </div>
    </div>

    <!-- 道路と交通 -->
    <div class="absolute inset-x-0 bottom-0 h-1/6 urban-road"></div>

    <!-- 車のライト -->
    <div class="absolute inset-0">
      <div
        v-for="(car, i) in cars"
        :key="`car-${i}`"
        class="absolute urban-car"
        :style="{
          width: '6px',
          height: '3px',
          bottom: `${car.bottom}%`,
          left: `${car.left}%`,
          backgroundColor: car.color,
          boxShadow: `0 0 10px ${car.color}`,
          opacity: car.opacity,
          animation: `car-move ${car.duration}s linear infinite ${car.delay}s`,
          animationDirection: car.direction,
        }"></div>
    </div>

    <!-- アンビエント照明 -->
    <div class="absolute inset-0 urban-ambient-light"></div>

    <!-- 街のノイズレイヤー -->
    <div class="absolute inset-0 urban-noise"></div>

    <!-- 大気汚染/霧 -->
    <div class="absolute inset-0 urban-fog"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold urban-text">
          URBAN
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.urban-background {
  background: linear-gradient(to bottom, #0c4a6e, #0f172a);
}

.urban-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.urban-road {
  background: linear-gradient(to bottom, #1e293b, #0f172a);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes car-move {
  0% { left: -5%; }
  100% { left: 105%; }
}

.urban-ambient-light {
  background:
    radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: ambient-pulse 20s ease-in-out infinite alternate;
}

@keyframes ambient-pulse {
  0% { opacity: 0.6; }
  100% { opacity: 0.8; }
}

.urban-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.2;
}

.urban-fog {
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.2));
  opacity: 0.6;
  animation: fog-move 30s ease-in-out infinite alternate;
}

@keyframes fog-move {
  0% { opacity: 0.5; }
  100% { opacity: 0.7; }
}

.urban-text {
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  border-top: 2px solid rgba(255, 255, 255, 0.7);
  border-bottom: 2px solid rgba(255, 255, 255, 0.7);
  padding: 6px 12px;
}
</style>
