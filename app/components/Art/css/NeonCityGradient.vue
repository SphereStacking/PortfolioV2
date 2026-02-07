<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

// パフォーマンス最適化
const isVisible = ref(true)
const containerRef = ref(null)

// ネオンサインの数を削減（4→2）
const neonSigns = computed(() => {
  if (!isVisible.value) return []
  return [
    {
      width: 80,
      height: 40,
      top: 40,
      left: 20,
      color: '#f472b6',
      borderRadius: '5px',
      opacity: 0.9,
      stretchDuration: 4,
      delay: 0,
    },
    {
      width: 60,
      height: 30,
      top: 50,
      left: 70,
      color: '#60a5fa',
      borderRadius: '5px',
      opacity: 0.9,
      stretchDuration: 5,
      delay: 1,
    },
  ]
})

// ネオン線の数を削減（4→2）
const neonLines = computed(() => {
  if (!isVisible.value) return []
  return [
    {
      length: 150,
      top: 35,
      left: 10,
      color: '#f472b6',
      isVertical: false,
      opacity: 0.7,
      stretchDuration: 4,
      delay: 0,
      thickness: 2,
    },
    {
      length: 80,
      top: 20,
      left: 50,
      color: '#60a5fa',
      isVertical: true,
      opacity: 0.7,
      stretchDuration: 5,
      delay: 1,
      thickness: 3,
    },
  ]
})

// 光の雨の数だけを管理（詳細はCSSで制御）
const rainDropCount = 30

// 初期アニメーションをランダムにするための遅延を生成
const rainDelays = ref(Array.from({ length: rainDropCount }, () => Math.random() * 3))

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
    :class="['relative overflow-hidden rounded-lg neon-container size-full']">
    <div class="absolute inset-0 neon-background"></div>

    <!-- 夜の都市シルエット -->
    <div class="absolute inset-x-0 bottom-0 h-2/5 city-skyline"></div>

    <!-- ネオンの輝き -->
    <div class="absolute inset-0 neon-glow"></div>

    <!-- ネオンサイン（要素数削減） -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="(sign, i) in neonSigns"
        :key="`sign-${i}`"
        class="absolute neon-sign"
        :style="{
          'width': `${sign.width}px`,
          'height': `${sign.height}px`,
          'top': `${sign.top}%`,
          'left': `${sign.left}%`,
          'backgroundColor': 'transparent',
          'borderRadius': sign.borderRadius,
          'border': `2px solid ${sign.color}`,
          'boxShadow': `0 0 10px ${sign.color}, 0 0 20px ${sign.color}`,
          'opacity': sign.opacity,
          '--sign-color': sign.color,
          'animation': `neon-sign-stretch ${sign.stretchDuration}s ease-in-out infinite ${sign.delay}s`,
        }">
      </div>
    </div>

    <!-- ネオン線（要素数削減） -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="(line, i) in neonLines"
        :key="`line-${i}`"
        class="absolute neon-line"
        :class="line.isVertical ? 'vertical' : 'horizontal'"
        :style="{
          'width': line.isVertical ? `${line.thickness}px` : `${line.length}px`,
          'height': line.isVertical ? `${line.length}px` : `${line.thickness}px`,
          'top': `${line.top}%`,
          'left': `${line.left}%`,
          'backgroundColor': line.color,
          'boxShadow': `0 0 10px ${line.color}, 0 0 20px ${line.color}`,
          'opacity': line.opacity,
          '--line-color': line.color,
          'animation': `neon-line-stretch-${line.isVertical ? 'vertical' : 'horizontal'} ${line.stretchDuration}s ease-in-out infinite ${line.delay}s`,
        }">
      </div>
    </div>

    <!-- 霧の効果 -->
    <div class="absolute inset-0 neon-fog"></div>

    <!-- 光の雨（ネオンカラー） -->
    <div v-if="isVisible" class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="(delay, i) in rainDelays"
        :key="`rain-${i}`"
        :class="`neon-rain-drop rain-${i % 4}`"
        :style="`--rain-index: ${i}; --rain-delay: ${delay}s`">
        <!-- 雨滴の軌跡 -->
        <div class="rain-trail"></div>
      </div>
    </div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold neon-text">
          <span
            v-for="(char, index) in 'NEON CITY'.split('')"
            :key="index"
            :style="`--char-index: ${index}`"
            :class="char === ' ' ? 'mx-2' : ''"
            class="neon-char">{{ char }}</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.neon-container {
  /* GPU加速を有効化 */
  transform: translateZ(0);
  will-change: auto;
}

.neon-background {
  background: linear-gradient(to bottom, #0f172a, #1e293b);
}

.city-skyline {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200' viewBox='0 0 800 200'%3E%3Cpath d='M0,200 L0,150 L20,150 L20,130 L40,130 L40,100 L60,100 L60,120 L80,120 L80,80 L100,80 L100,100 L120,100 L120,70 L140,70 L140,110 L160,110 L160,90 L180,90 L180,60 L200,60 L200,100 L220,100 L220,80 L240,80 L240,50 L260,50 L260,90 L280,90 L280,70 L300,70 L300,40 L320,40 L320,80 L340,80 L340,90 L360,90 L360,50 L380,50 L380,100 L400,100 L400,30 L420,30 L420,70 L440,70 L440,120 L460,120 L460,60 L480,60 L480,90 L500,90 L500,70 L520,70 L520,100 L540,100 L540,50 L560,50 L560,80 L580,80 L580,110 L600,110 L600,90 L620,90 L620,70 L640,70 L640,120 L660,120 L660,100 L680,100 L680,80 L700,80 L700,140 L720,140 L720,100 L740,100 L740,120 L760,120 L760,130 L780,130 L780,150 L800,150 L800,200 Z' fill='%23000000'/%3E%3C/svg%3E");
  background-size: 100% 100%;
  opacity: 0.8;
}

.neon-glow {
  background:
    radial-gradient(circle at 30% 50%, rgba(244, 114, 182, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 70% 40%, rgba(96, 165, 250, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 50% 60%, rgba(167, 139, 250, 0.3) 0%, transparent 40%);
  filter: blur(20px);
  animation: neon-glow-pulse 8s ease-in-out infinite;
}

@keyframes neon-glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* ネオンサインの最適化されたアニメーション */
.neon-sign {
  position: relative;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
  transform-origin: center;
}

@keyframes neon-sign-stretch {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    filter: brightness(1);
  }
  50% {
    transform: translate3d(0, 0, 0) scale(1.2);
    filter: brightness(1.3);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    filter: brightness(1);
  }
}

/* ネオン線の最適化されたアニメーション */
.neon-line {
  position: relative;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
  border-radius: 1px;
}

.neon-line.horizontal {
  transform-origin: left center;
}

.neon-line.vertical {
  transform-origin: center top;
}

@keyframes neon-line-stretch-horizontal {
  0% {
    transform: translate3d(0, 0, 0) scaleX(1);
    filter: brightness(1);
  }
  50% {
    transform: translate3d(0, 0, 0) scaleX(1.5);
    filter: brightness(1.4);
  }
  100% {
    transform: translate3d(0, 0, 0) scaleX(1);
    filter: brightness(1);
  }
}

@keyframes neon-line-stretch-vertical {
  0% {
    transform: translate3d(0, 0, 0) scaleY(1);
    filter: brightness(1);
  }
  50% {
    transform: translate3d(0, 0, 0) scaleY(1.5);
    filter: brightness(1.4);
  }
  100% {
    transform: translate3d(0, 0, 0) scaleY(1);
    filter: brightness(1);
  }
}

.neon-fog {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent 50%);
  animation: fog-move 20s ease-in-out infinite alternate;
}

@keyframes fog-move {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 0%; }
}

@keyframes neon-rain-fall {
  0% {
    transform: translateY(-50px); /* グロー要素を完全に隠す */
  }
  100% {
    transform: translateY(calc(100vh + 250px)); /* 下部でも完全に隠れるように調整 */
  }
}

/* ネオンテキスト */
.neon-char {
  display: inline-block;
  animation: neon-char-glow 3s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.8),
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 15px rgba(244, 114, 182, 0.8),
    0 0 20px rgba(244, 114, 182, 0.8);
  will-change: transform;
  transform: translateZ(0);
}

@keyframes neon-char-glow {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    filter: brightness(1);
  }
  50% {
    transform: translate3d(0, -2px, 0) scale(1.05);
    filter: brightness(1.3);
  }
}

/* 光の雨のスタイル */
.neon-rain-drop {
  position: absolute;
  width: 2px;
  height: 30px;
  top: -15%; /* グロー要素が隠れるように調整 */
  left: calc(var(--rain-index) * 3.3%);
  will-change: transform;
  transform: translateZ(0);
  animation: neon-rain-fall 3s linear infinite;
  animation-delay: var(--rain-delay, 0s);
}

/* 各色の雨滴 */
.rain-0 {
  background: linear-gradient(to bottom, transparent, #f472b6 20%, #f472b6 80%, transparent);
  box-shadow: 0 0 10px #f472b6, 0 0 20px #f472b6;
  height: 25px;
}

.rain-1 {
  background: linear-gradient(to bottom, transparent, #60a5fa 20%, #60a5fa 80%, transparent);
  box-shadow: 0 0 10px #60a5fa, 0 0 20px #60a5fa;
  height: 30px;
  animation-duration: 2.5s;
}

.rain-2 {
  background: linear-gradient(to bottom, transparent, #a78bfa 20%, #a78bfa 80%, transparent);
  box-shadow: 0 0 10px #a78bfa, 0 0 20px #a78bfa;
  height: 35px;
  animation-duration: 3.5s;
  filter: blur(1px);
}

.rain-3 {
  background: linear-gradient(to bottom, transparent, #fbbf24 20%, #fbbf24 80%, transparent);
  box-shadow: 0 0 10px #fbbf24, 0 0 20px #fbbf24;
  height: 28px;
  animation-duration: 2.8s;
}

/* 雨滴の軌跡 */
.rain-trail {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  width: 100%;
  height: 60px;
  background: linear-gradient(to bottom, currentColor, transparent);
  opacity: 0.3;
  filter: blur(3px);
}

/* 各雨滴のカラー設定 */
.rain-0 .rain-trail { color: #f472b6; }
.rain-1 .rain-trail { color: #60a5fa; }
.rain-2 .rain-trail { color: #a78bfa; }
.rain-3 .rain-trail { color: #fbbf24; }

/* パフォーマンス最適化 */
.neon-sign,
.neon-line,
.neon-char,
.neon-rain {
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
