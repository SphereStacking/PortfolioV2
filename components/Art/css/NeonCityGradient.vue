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

// ネオンサイン（伸縮アニメーション付き）
const neonSigns = computed(() => [
  {
    width: 80,
    height: 40,
    top: 40,
    left: 20,
    color: '#f472b6', // ピンク
    borderRadius: '5px',
    opacity: 0.9,
    stretchDuration: 4,
    delay: 0,
    stretchX: 1.4, // 横方向の伸縮率
    stretchY: 0.7, // 縦方向の伸縮率
  },
  {
    width: 60,
    height: 30,
    top: 30,
    left: 70,
    color: '#60a5fa', // 青
    borderRadius: '5px',
    opacity: 0.9,
    stretchDuration: 5,
    delay: 1,
    stretchX: 0.6,
    stretchY: 1.6,
  },
  {
    width: 40,
    height: 60,
    top: 50,
    left: 40,
    color: '#a78bfa', // 紫
    borderRadius: '5px',
    opacity: 0.9,
    stretchDuration: 6,
    delay: 2,
    stretchX: 1.8,
    stretchY: 0.8,
  },
  {
    width: 100,
    height: 20,
    top: 60,
    left: 60,
    color: '#34d399', // 緑
    borderRadius: '3px',
    opacity: 0.9,
    stretchDuration: 7,
    delay: 3,
    stretchX: 0.5,
    stretchY: 2.0,
  },
])

// ネオン線（伸縮アニメーション付き）
const neonLines = computed(() => [
  {
    length: 150,
    top: 35,
    left: 10,
    color: '#f472b6', // ピンク
    isVertical: false,
    opacity: 0.7,
    stretchDuration: 4,
    delay: 0,
    stretchAmount: 1.8, // 伸縮の最大倍率
    thickness: 2,
  },
  {
    length: 80,
    top: 20,
    left: 50,
    color: '#60a5fa', // 青
    isVertical: true,
    opacity: 0.7,
    stretchDuration: 5,
    delay: 1,
    stretchAmount: 2.2,
    thickness: 3,
  },
  {
    length: 100,
    top: 70,
    left: 30,
    color: '#a78bfa', // 紫
    isVertical: false,
    opacity: 0.7,
    stretchDuration: 6,
    delay: 2,
    stretchAmount: 1.5,
    thickness: 2,
  },
  {
    length: 120,
    top: 40,
    left: 80,
    color: '#34d399', // 緑
    isVertical: true,
    opacity: 0.7,
    stretchDuration: 7,
    delay: 3,
    stretchAmount: 1.9,
    thickness: 2,
  },
])

// 雨滴を事前計算
const rainDrops = computed(() => {
  return Array.from({ length: 80 }, (_, i) => ({
    id: i,
    height: Math.random() * 15 + 10,
    top: Math.random() * 100,
    left: Math.random() * 100,
    opacity: Math.random() * 0.3 + 0.1,
    duration: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 1,
  }))
})
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 neon-background"></div>

    <!-- 夜の都市シルエット -->
    <div class="absolute inset-x-0 bottom-0 h-2/5 city-skyline"></div>

    <!-- ネオンの輝き -->
    <div class="absolute inset-0 neon-glow"></div>

    <!-- ネオンサイン（伸縮アニメーション付き） -->
    <div class="absolute inset-0">
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
          'boxShadow': `0 0 10px ${sign.color}, 0 0 20px ${sign.color}, inset 0 0 8px ${sign.color}`,
          'opacity': sign.opacity,
          '--sign-color': sign.color,
          '--stretch-x': sign.stretchX,
          '--stretch-y': sign.stretchY,
          'animation': `neon-sign-stretch ${sign.stretchDuration}s ease-in-out infinite ${sign.delay}s`,
        }">
      </div>
    </div>

    <!-- ネオン線（伸縮アニメーション付き） -->
    <div class="absolute inset-0">
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
          '--stretch-amount': line.stretchAmount,
          'animation': `neon-line-stretch-${line.isVertical ? 'vertical' : 'horizontal'} ${line.stretchDuration}s ease-in-out infinite ${line.delay}s`,
        }">
      </div>
    </div>

    <!-- 霧の効果 -->
    <div class="absolute inset-0 neon-fog"></div>

    <!-- 雨の効果 -->
    <div class="absolute inset-0">
      <div
        v-for="drop in rainDrops"
        :key="`rain-${drop.id}`"
        class="absolute neon-rain"
        :style="{
          width: '1px',
          height: `${drop.height}px`,
          top: `${drop.top}%`,
          left: `${drop.left}%`,
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5))',
          opacity: drop.opacity,
          animation: `neon-rain-fall ${drop.duration}s linear infinite ${drop.delay}s`,
        }"></div>
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

/* ネオンサインの伸縮アニメーション */
.neon-sign {
  position: relative;
  overflow: hidden;
  will-change: transform, filter, box-shadow;
  transform-origin: center;
  /* デバッグ用：基本的なアニメーションが動作するかテスト */
  animation-fill-mode: both;
}

/* デバッグ用：シンプルなテストアニメーション */
@keyframes test-stretch {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
}

@keyframes neon-sign-stretch {
  0% {
    transform: scaleX(1) scaleY(1);
    filter: brightness(1);
  }
  25% {
    transform: scaleX(1.5) scaleY(1);
    filter: brightness(1.2);
  }
  50% {
    transform: scaleX(1.5) scaleY(0.7);
    filter: brightness(1.4);
  }
  75% {
    transform: scaleX(1) scaleY(0.7);
    filter: brightness(1.1);
  }
  100% {
    transform: scaleX(1) scaleY(1);
    filter: brightness(1);
  }
}

/* ネオンサインの内部光 */
.neon-sign-inner {
  position: absolute;
  inset: 20%;
  background: radial-gradient(circle, var(--sign-color, #f472b6) 0%, transparent 70%);
  opacity: 0.3;
  animation: inner-glow 2s ease-in-out infinite;
}

@keyframes inner-glow {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* ネオン線の伸縮アニメーション */
.neon-line {
  position: relative;
  overflow: hidden;
  will-change: transform, filter, box-shadow;
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
    transform: scaleX(1);
    filter: brightness(1);
  }
  50% {
    transform: scaleX(2);
    filter: brightness(1.6);
  }
  100% {
    transform: scaleX(1);
    filter: brightness(1);
  }
}

@keyframes neon-line-stretch-vertical {
  0% {
    transform: scaleY(1);
    filter: brightness(1);
  }
  50% {
    transform: scaleY(2);
    filter: brightness(1.6);
  }
  100% {
    transform: scaleY(1);
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
  0% { transform: translateY(-100px); }
  100% { transform: translateY(100px); }
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
    0 0 20px rgba(244, 114, 182, 0.8),
    0 0 25px rgba(244, 114, 182, 0.8);
}

@keyframes neon-char-glow {
  0%, 100% {
    transform: translateY(0) scale(1);
    filter: brightness(1);
  }
  25% {
    transform: translateY(-2px) scale(1.05);
    filter: brightness(1.3);
  }
  50% {
    transform: translateY(0) scale(1);
    filter: brightness(1.5);
  }
  75% {
    transform: translateY(1px) scale(0.98);
    filter: brightness(1.2);
  }
}

/* パフォーマンス最適化 */
.neon-sign,
.neon-line,
.neon-char {
  will-change: transform, opacity, filter;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
