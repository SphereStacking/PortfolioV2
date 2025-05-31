<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

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

// テクノロジー関連の文字
const techWords = [
  'AI', 'ML', 'API', 'CLI', 'IoT', 'SaaS', 'PaaS', 'IaaS',
  'HTTP', 'REST', 'GraphQL', 'WebGL', 'Node.js', 'React',
  'Vue', 'Docker', 'K8s', 'AWS', 'Cloud', 'DevOps',
  '01011', '10110', '11001', '00111', '10101',
  '<code>', '</>', 'func()', 'class', 'import', 'export',
  '{...}', '[ ]', '( )', '=>', ':::', '!==',
]

// ランダムな文字を生成
const glitchChars = ref(Array.from({ length: 50 }, (_, i) => ({
  id: i,
  text: techWords[Math.floor(Math.random() * techWords.length)],
  top: Math.random() * 100,
  left: Math.random() * 100,
  fontSize: Math.random() * 10 + 8,
  opacity: Math.random() * 0.8 + 0.2,
  duration: Math.random() * 3 + 1,
  delay: Math.random() * 5,
  color: ['#0ea5e9', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
})))

// 定期的に文字を更新
let intervalId = null

const updateGlitchChars = () => {
  glitchChars.value = glitchChars.value.map(char => ({
    ...char,
    text: Math.random() > 0.7 ? techWords[Math.floor(Math.random() * techWords.length)] : char.text,
    opacity: Math.random() * 0.8 + 0.2,
  }))
}

onMounted(() => {
  intervalId = setInterval(updateGlitchChars, 2000)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

// データストリーム（最適化: 固定配置）
const dataStreams = ref([
  {
    id: 1,
    top: 20,
    width: 150,
    direction: 'horizontal',
    delay: 0,
  },
  {
    id: 2,
    left: 30,
    height: 100,
    direction: 'vertical',
    delay: 1,
  },
  {
    id: 3,
    top: 60,
    width: 120,
    direction: 'horizontal',
    delay: 2,
  },
  {
    id: 4,
    left: 70,
    height: 80,
    direction: 'vertical',
    delay: 3,
  },
])
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <!-- ベース背景 -->
    <div class="absolute inset-0 tech-background"></div>

    <!-- 回路パターン -->
    <div class="absolute inset-0 tech-circuit"></div>

    <!-- グリッチテキスト -->
    <div class="absolute inset-0">
      <div
        v-for="char in glitchChars"
        :key="`char-${char.id}`"
        class="glitch-char"
        :style="{
          top: `${char.top}%`,
          left: `${char.left}%`,
          fontSize: `${char.fontSize}px`,
          color: char.color,
          opacity: char.opacity,
          animationDuration: `${char.duration}s`,
          animationDelay: `${char.delay}s`,
        }">
        {{ char.text }}
      </div>
    </div>

    <!-- データストリーム -->
    <div class="absolute inset-0">
      <div
        v-for="stream in dataStreams"
        :key="`stream-${stream.id}`"
        :class="stream.direction === 'horizontal' ? 'data-stream-h' : 'data-stream-v'"
        :style="{
          ...(stream.top && { top: `${stream.top}%` }),
          ...(stream.left && { left: `${stream.left}%` }),
          ...(stream.width && { width: `${stream.width}px` }),
          ...(stream.height && { height: `${stream.height}px` }),
          animationDelay: `${stream.delay}s`,
        }"></div>
    </div>

    <!-- スキャンライン -->
    <div class="absolute inset-0 scanlines"></div>

    <!-- ノイズ効果 -->
    <div class="absolute inset-0 noise"></div>

    <!-- メインテキスト -->
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="tech-main-text">
          <span
            v-for="(letter, i) in 'TECHNOLOGY'.split('')" :key="i"
            class="tech-letter"
            :style="{ animationDelay: `${i * 0.1}s` }">
            {{ letter }}
          </span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* 背景 */
.tech-background {
  background:
    linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%),
    radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
}

/* 回路パターン */
.tech-circuit {
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(14, 165, 233, 0.1) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(59, 130, 246, 0.1) 20px);
  animation: circuit-move 20s linear infinite;
}

@keyframes circuit-move {
  from { background-position: 0 0; }
  to { background-position: 20px 20px; }
}

/* グリッチ文字 */
.glitch-char {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  animation: glitch-flicker 2s linear infinite;
  text-shadow: 0 0 2px currentColor;
  pointer-events: none;
  transform: translate(-50%, -50%) translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

@keyframes glitch-flicker {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1) translateZ(0);
  }
  10% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.1) skew(5deg) translateZ(0);
  }
  20% {
    opacity: 0.6;
    transform: translate(-48%, -50%) scale(1) translateZ(0);
  }
  30% {
    opacity: 0.1;
    transform: translate(-50%, -48%) scale(0.9) translateZ(0);
  }
  40% {
    opacity: 0.6;
    transform: translate(-52%, -50%) scale(1) translateZ(0);
  }
  50% {
    opacity: 0;
  }
  60% {
    opacity: 0.6;
    transform: translate(-50%, -52%) scale(1.05) translateZ(0);
  }
  90% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1) skew(-5deg) translateZ(0);
  }
}

/* データストリーム */
.data-stream-h, .data-stream-v {
  position: absolute;
  background: linear-gradient(to right, transparent, #0ea5e9, transparent);
  animation: stream-flow 3s linear infinite;
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.data-stream-v {
  background: linear-gradient(to bottom, transparent, #3b82f6, transparent);
  width: 1px;
}

.data-stream-h {
  height: 1px;
}

@keyframes stream-flow {
  from { 
    opacity: 0; 
    transform: scale(0, 1) translateZ(0); 
  }
  50% { 
    opacity: 0.8; 
  }
  to { 
    opacity: 0; 
    transform: scale(1, 1) translateZ(0); 
  }
}

/* スキャンライン */
.scanlines {
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(14, 165, 233, 0.03) 2px,
      rgba(14, 165, 233, 0.03) 4px
    );
  animation: scan 8s linear infinite;
  pointer-events: none;
  transform: translateZ(0);
  will-change: background-position;
  backface-visibility: hidden;
}

@keyframes scan {
  from { background-position: 0 0; }
  to { background-position: 0 10px; }
}

/* ノイズ効果 */
.noise {
  opacity: 0.02;
  background-image:
    repeating-radial-gradient(circle at 0 0, transparent 0, #ffffff 1px, transparent 2px, transparent 3px);
  animation: noise-anim 0.2s steps(10) infinite;
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

@keyframes noise-anim {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1%, -1%); }
  20% { transform: translate(1%, 0); }
  30% { transform: translate(0, 1%); }
  40% { transform: translate(-1%, 1%); }
  50% { transform: translate(1%, -1%); }
  60% { transform: translate(0, -1%); }
  70% { transform: translate(-1%, 0); }
  80% { transform: translate(1%, 1%); }
  90% { transform: translate(0, 0); }
}

/* メインテキスト */
.tech-main-text {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  color: #f8fafc;
  text-shadow:
    0 0 10px rgba(14, 165, 233, 0.8),
    0 0 20px rgba(59, 130, 246, 0.6),
    0 0 30px rgba(139, 92, 246, 0.4);
}

/* 各文字のアニメーション */
.tech-letter {
  display: inline-block;
  animation: letter-glitch 4s infinite;
}

@keyframes letter-glitch {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
  5% {
    transform: translateY(-2px) scale(1.05);
    opacity: 0;
  }
  10% {
    transform: translateY(2px) scale(0.95);
    opacity: 1;
    filter: blur(1px);
  }
  15% {
    transform: translateY(0) scale(1) skewX(10deg);
    opacity: 0.8;
  }
  20% {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
  80% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  85% {
    transform: translateY(0) scale(1) skewX(-5deg);
    opacity: 0.9;
    filter: blur(0.5px);
  }
  90% {
    transform: translateY(1px) scale(1);
    opacity: 0;
  }
  95% {
    transform: translateY(-1px) scale(1);
    opacity: 1;
  }
}

/* パフォーマンス最適化 */
.glitch-char,
.data-stream-h,
.data-stream-v,
.tech-letter {
  will-change: transform, opacity;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
