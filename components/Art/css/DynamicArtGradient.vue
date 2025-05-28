<script setup>
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
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 bg-black"></div>

    <!-- 背景色 -->
    <div class="absolute inset-0 dynamic-background"></div>

    <!-- 動的なブラシストローク -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 10"
        :key="`brush-${i}`"
        class="absolute dynamic-brush"
        :style="{
          width: `${Math.random() * 60 + 40}%`,
          height: `${Math.random() * 15 + 5}%`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          background: [
            'rgba(255, 79, 79, 0.7)',
            'rgba(252, 163, 17, 0.7)',
            'rgba(20, 223, 166, 0.7)',
            'rgba(41, 121, 255, 0.7)',
            'rgba(161, 88, 255, 0.7)',
          ][i % 5],
          filter: 'blur(10px)',
          borderRadius: '50%',
          transform: `rotate(${Math.random() * 360}deg) translateX(0%) scale(1)`,
          transformOrigin: 'center',
          animation: `brush-stroke ${Math.random() * 10 + 15}s ease-in-out infinite alternate`,
        }"></div>
    </div>

    <!-- 抽象的な形態 -->
    <div class="absolute inset-0 dynamic-overlay"></div>

    <!-- 動的な点線 -->
    <div class="absolute inset-0 dynamic-lines"></div>

    <!-- スプラッシュエフェクト -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 30"
        :key="`splash-${i}`"
        class="absolute rounded-full dynamic-splash"
        :style="{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          background: 'white',
          opacity: Math.random() * 0.5 + 0.2,
          boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
          animation: `splash ${Math.random() * 20 + 10}s ease-in-out infinite`,
        }"></div>
    </div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-2xl font-bold px-6 py-2 rounded dynamic-text">
          <span
            v-for="(char, index) in 'ダイナミックアート'.split('')" :key="index"
            :style="`--char-index: ${index}`"
            :data-char="char"
            class="dynamic-char">{{ char }}</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.dynamic-background {
  background: linear-gradient(135deg, #000000, #1B1464);
  filter: contrast(1.2) brightness(1.1);
}

@keyframes brush-stroke {
  0% { transform: rotate(var(--rotation, 180deg)) translateX(0%) scale(1); }
  33% { transform: rotate(calc(var(--rotation, 180deg) + 20deg)) translateX(10%) scale(1.1); }
  66% { transform: rotate(calc(var(--rotation, 180deg) - 20deg)) translateX(-10%) scale(0.9); }
  100% { transform: rotate(var(--rotation, 180deg)) translateX(0%) scale(1); }
}

.dynamic-overlay {
  background: radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.1), transparent 30%),
              radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1), transparent 30%);
  mix-blend-mode: overlay;
}

.dynamic-lines {
  background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px);
  animation: dynamic-lines 30s linear infinite;
}

@keyframes dynamic-lines {
  0% { transform: scale(1) rotate(0deg); background-position: 0 0; }
  50% { transform: scale(1.5) rotate(180deg); background-position: 100px 100px; }
  100% { transform: scale(1) rotate(360deg); background-position: 0 0; }
}

@keyframes splash {
  0% { transform: scale(1); opacity: var(--opacity, 0.3); }
  50% { transform: scale(var(--scale, 1.5)); opacity: var(--opacity-mid, 0.5); }
  100% { transform: scale(1); opacity: var(--opacity, 0.3); }
}

.dynamic-text {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  mix-blend-mode: difference;
}

.dynamic-char {
  display: inline-block;
  animation: dynamic-morph 6s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
  will-change: transform;
  transform-origin: center;
}

@keyframes dynamic-morph {
  0%, 100% {
    transform: scale(1) rotate(0deg) translateY(0);
    filter: hue-rotate(0deg);
  }
  20% {
    transform: scale(1.2) rotate(5deg) translateY(-5px);
    filter: hue-rotate(60deg);
  }
  40% {
    transform: scale(0.8) rotate(-10deg) translateY(5px);
    filter: hue-rotate(120deg);
  }
  60% {
    transform: scale(1.1) rotate(3deg) translateY(-3px);
    filter: hue-rotate(240deg);
  }
  80% {
    transform: scale(0.9) rotate(-5deg) translateY(2px);
    filter: hue-rotate(300deg);
  }
}

.dynamic-char::before {
  content: attr(data-char);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  filter: blur(2px);
  animation: dynamic-echo 6s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s + 0.3s);
}

@keyframes dynamic-echo {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.5);
  }
}
</style>
