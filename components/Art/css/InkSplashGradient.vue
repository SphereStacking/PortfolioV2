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

// インクの色
const inkColors = [
  '#06b6d4', // シアン
  '#6366f1', // インディゴ
  '#8b5cf6', // バイオレット
  '#ec4899', // ピンク
  '#0ea5e9', // スカイ
  '#14b8a6', // ティール
  '#000000', // 黒
]

// インクブロット
const inkBlobs = ref([
  { top: 30, left: 20, size: 120, color: '#06b6d4', opacity: 0.7 },
  { top: 60, left: 50, size: 150, color: '#6366f1', opacity: 0.6 },
  { top: 40, left: 70, size: 100, color: '#8b5cf6', opacity: 0.7 },
  { top: 70, left: 10, size: 80, color: '#ec4899', opacity: 0.6 },
  { top: 20, left: 80, size: 90, color: '#0ea5e9', opacity: 0.5 },
  { top: 50, left: 30, size: 130, color: '#14b8a6', opacity: 0.6 },
  { top: 65, left: 75, size: 110, color: '#000000', opacity: 0.5 },
])
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 bg-white ink-background"></div>

    <!-- 背景の薄い色合い -->
    <div class="absolute inset-0 ink-background-tint"></div>

    <!-- インクブロット -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in inkBlobs"
        :key="`blob-${i}`"
        class="absolute ink-blob"
        :style="{
          top: `${inkBlobs[i].top}%`,
          left: `${inkBlobs[i].left}%`,
          width: `${inkBlobs[i].size}px`,
          height: `${inkBlobs[i].size}px`,
          backgroundColor: inkBlobs[i].color,
          borderRadius: `${Math.random() * 70 + 30}% ${Math.random() * 70 + 30}% ${Math.random() * 70 + 30}% ${Math.random() * 70 + 30}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
          opacity: inkBlobs[i].opacity,
          animation: `blob-pulse ${Math.random() * 10 + 8}s ease-in-out infinite ${Math.random() * 5}s`,
        }"></div>
    </div>

    <!-- インクの飛沫 -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 40"
        :key="`splash-${i}`"
        class="absolute rounded-full ink-splash"
        :style="{
          width: `${Math.random() * 6 + 1}px`,
          height: `${Math.random() * 6 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          backgroundColor: inkColors[Math.floor(Math.random() * inkColors.length)],
          opacity: Math.random() * 0.7 + 0.3,
          transform: `rotate(${Math.random() * 360}deg)`,
          animation: `splash-float ${Math.random() * 15 + 10}s ease-in-out infinite ${Math.random() * 10}s`,
        }"></div>
    </div>

    <!-- 墨流し効果 -->
    <div class="absolute inset-0 ink-flow"></div>

    <!-- インクが広がる効果 -->
    <div class="absolute ink-spread"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold ink-text">
          INK SPLASH
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.ink-background {
  background-color: #f5f5f5;
}

.ink-background-tint {
  background:
    radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 20% 70%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
  mix-blend-mode: multiply;
}

.ink-blob {
  filter: blur(20px);
  mix-blend-mode: multiply;
}

@keyframes blob-pulse {
  0%, 100% { transform: rotate(var(--rotate, 0deg)) scale(1); }
  50% { transform: rotate(calc(var(--rotate, 0deg) + 10deg)) scale(1.15); }
}

.ink-splash {
  mix-blend-mode: multiply;
}

@keyframes splash-float {
  0%, 100% { transform: translate(0, 0) rotate(var(--rotate, 0deg)); }
  25% { transform: translate(10px, -10px) rotate(calc(var(--rotate, 0deg) + 90deg)); }
  50% { transform: translate(20px, 0) rotate(calc(var(--rotate, 0deg) + 180deg)); }
  75% { transform: translate(10px, 10px) rotate(calc(var(--rotate, 0deg) + 270deg)); }
}

.ink-flow {
  background: linear-gradient(135deg, transparent, rgba(0, 0, 0, 0.03));
  filter: blur(20px);
  mix-blend-mode: multiply;
  animation: ink-flow-animation 20s ease-in-out infinite alternate;
}

@keyframes ink-flow-animation {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

.ink-spread {
  position: absolute;
  top: 40%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.5) 0%, transparent 70%);
  mix-blend-mode: multiply;
  opacity: 0.2;
  filter: blur(20px);
  animation: ink-spread-animation 15s ease-in-out infinite;
}

@keyframes ink-spread-animation {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.4; }
}

.ink-text {
  color: white;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.7);
  padding: 6px 12px;
  border-radius: 4px;
  letter-spacing: 2px;
}
</style>
