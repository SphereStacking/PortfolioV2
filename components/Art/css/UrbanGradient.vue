<script setup>
import { ref, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

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

// パフォーマンス最適化：要素の可視性を追跡
const target = ref(null)
const isVisible = ref(false)

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting
  },
  { threshold: 0.1 },
)

onUnmounted(() => {
  stop()
})

// 高層ビル（最適化: 10→6要素、窓を削減）
const buildings = ref(Array.from({ length: 6 }, (_, i) => {
  const windowCount = 8 + (i % 3) * 2
  return {
    width: 30 + (i % 3) * 10,
    height: 100 + (i % 4) * 40,
    left: i * 16.6,
    color: ['#0f172a', '#1e293b', '#334155', '#475569'][i % 4],
    opacity: 0.7 + (i % 2) * 0.2,
    zIndex: (i % 3) + 1,
    shadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    windows: Array.from({ length: windowCount }, _ => ({
      // 各窓にランダムな点滅パターンを設定
      blinkDuration: 3 + Math.random() * 4, // 3-7秒
      blinkDelay: Math.random() * 5, // 0-5秒の遅延
      shouldBlink: Math.random() > 0.6, // 40%の窓が点滅
    })),
  }
}))

// 車（最適化: 10→5要素）
const cars = ref(Array.from({ length: 5 }, (_, i) => {
  return {
    bottom: 5 + (i % 2) * 2,
    left: i * 20,
    color: i % 2 === 0 ? '#dc2626' : '#f8fafc',
    opacity: 0.8,
    duration: 15 + (i % 3) * 5,
    delay: i * 1,
    direction: i % 2 === 0 ? 'normal' : 'reverse',
  }
}))
</script>

<template>
  <div
    ref="target"
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 urban-background"></div>

    <!-- 都市の構造物 -->
    <div class="absolute inset-0">
      <!-- 建物グリッド -->
      <div class="absolute inset-0 urban-grid"></div>

      <!-- 高層ビル -->
      <template v-if="isVisible">
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
            transform: 'translateZ(0)',
            willChange: 'transform',
          }">
          <!-- ビルの窓 -->
          <div
            v-for="(window, j) in building.windows"
            :key="`window-${i}-${j}`"
            class="absolute urban-window"
            :class="{ 'window-blink': window.shouldBlink }"
            :style="{
              'width': '4px',
              'height': '4px',
              'top': `${10 + Math.floor(j / 4) * 10}%`,
              'left': `${10 + (j % 4) * 24}%`,
              'backgroundColor': '#fbbf24',
              'opacity': 0.8,
              'boxShadow': window.shouldBlink ? '0 0 8px #fbbf24' : 'none',
              '--blink-duration': `${window.blinkDuration}s`,
              '--blink-delay': `${window.blinkDelay}s`,
            }"></div>
        </div>
      </template>
    </div>

    <!-- 道路と交通 -->
    <div class="absolute inset-x-0 bottom-0 h-1/6 urban-road"></div>

    <!-- 車のライト -->
    <div v-if="isVisible" class="absolute inset-0">
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
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
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
  0% { left: -5%; transform: translateZ(0); }
  100% { left: 105%; transform: translateZ(0); }
}

.urban-ambient-light {
  background:
    radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: ambient-pulse 20s ease-in-out infinite alternate;
  transform: translateZ(0);
  will-change: opacity;
  backface-visibility: hidden;
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
  transform: translateZ(0);
  will-change: opacity;
  backface-visibility: hidden;
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

/* 窓の点滅アニメーション */
.window-blink {
  animation: window-flicker var(--blink-duration) ease-in-out infinite;
  animation-delay: var(--blink-delay);
  will-change: opacity, filter;
  transform: translateZ(0);
}

@keyframes window-flicker {
  0%, 100% {
    opacity: 0.8;
    filter: brightness(1);
  }
  10% {
    opacity: 0.2;
    filter: brightness(0.5);
  }
  15% {
    opacity: 0.9;
    filter: brightness(1.2);
  }
  50% {
    opacity: 0.3;
    filter: brightness(0.6);
  }
  55% {
    opacity: 1;
    filter: brightness(1.3);
  }
  90% {
    opacity: 0.6;
    filter: brightness(0.8);
  }
}

/* 窓の基本スタイル */
.urban-window {
  transition: all 0.3s ease;
  backface-visibility: hidden;
}
</style>
