<script setup>
</script>

<template>
  <div class="relative h-64 w-full overflow-hidden rounded-lg">
    <div class="absolute inset-0 bg-gray-900"></div>

    <!-- モアレパターン1 -->
    <div class="absolute inset-0 moire-pattern1"></div>

    <!-- モアレパターン2 -->
    <div class="absolute inset-0 moire-pattern2"></div>

    <!-- モアレパターン3 -->
    <div class="absolute inset-0 moire-pattern3"></div>

    <!-- グラデーションオーバーレイ -->
    <div class="absolute inset-0 moire-overlay"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <h3 class="text-white text-2xl font-bold px-6 py-2 rounded-lg moire-text">
        <span
          v-for="(char, index) in 'MOIRÉ'.split('')" :key="index"
          :style="`--char-index: ${index}`"
          :data-char="char"
          class="moire-char">{{ char }}</span>
      </h3>
    </div>
  </div>
</template>

<style scoped>
.moire-pattern1 {
  background: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px);
  animation: moire1 20s linear infinite;
}

@keyframes moire1 {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.moire-pattern2 {
  background: repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);
  animation: moire2 25s linear infinite;
}

@keyframes moire2 {
  0% { transform: scale(1.2) rotate(0deg); }
  50% { transform: scale(1) rotate(-180deg); }
  100% { transform: scale(1.2) rotate(-360deg); }
}

.moire-pattern3 {
  background: repeating-radial-gradient(circle at center, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px);
  animation: moire3 30s linear infinite;
}

@keyframes moire3 {
  0% { transform: scale(1) translate(0, 0); }
  25% { transform: scale(1.1) translate(10px, 10px); }
  50% { transform: scale(1) translate(20px, 0); }
  75% { transform: scale(0.9) translate(10px, -10px); }
  100% { transform: scale(1) translate(0, 0); }
}

.moire-overlay {
  background: linear-gradient(45deg, rgba(47, 72, 88, 0.6), rgba(103, 58, 183, 0.6));
  mix-blend-mode: color;
  animation: color-shift 10s linear infinite alternate;
}

@keyframes color-shift {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(90deg); }
}

.moire-text {
  background: rgba(0,0,0,0.3);
  text-shadow: 0 0 5px rgba(255,255,255,0.5);
}

.moire-char {
  display: inline-block;
  animation: moire-shift 3s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.2s);
  will-change: transform;
  position: relative;
}

@keyframes moire-shift {
  0%, 100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  25% {
    transform: translateX(2px) translateY(-2px) rotate(1deg);
  }
  50% {
    transform: translateX(-2px) translateY(2px) rotate(-1deg);
  }
  75% {
    transform: translateX(1px) translateY(-1px) rotate(0.5deg);
  }
}

.moire-char::before {
  content: attr(data-char);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.3;
  animation: moire-pattern 2s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.2s + 0.5s);
  mix-blend-mode: multiply;
}

@keyframes moire-pattern {
  0%, 100% {
    transform: translateX(0) translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateX(3px) translateY(-3px);
    opacity: 0.6;
  }
}
</style>
