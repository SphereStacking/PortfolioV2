<script setup>
</script>

<template>
  <div class="relative h-64 w-full overflow-hidden rounded-lg">
    <div class="absolute inset-0 glass-gradient"></div>

    <!-- ガラス板1 -->
    <div class="absolute left-1/4 top-1/4 w-1/2 h-1/2 rounded-lg glass-panel1"></div>

    <!-- ガラス板2 -->
    <div class="absolute left-1/3 top-1/3 w-1/3 h-1/3 rounded-lg glass-panel2"></div>

    <!-- 光沢効果 -->
    <div class="absolute inset-0 overflow-hidden glass-shine"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <div class="px-6 py-3 rounded-lg glass-title-panel">
        <h3 class="text-white text-2xl font-bold glass-title">
          <span
            v-for="(char, index) in 'FROST GLASS'.split('')" :key="index"
            :style="`--char-index: ${index}`"
            :data-char="char"
            class="frost-char">{{ char }}</span>
        </h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-gradient {
  background: linear-gradient(135deg, #c6ffdd, #fbd786, #f7797d);
  background-size: 400% 400%;
  animation: glassgradient 15s ease infinite;
}

@keyframes glassgradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.glass-panel1 {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform: rotate(-5deg);
  animation: glass-move1 10s ease-in-out infinite alternate;
}

@keyframes glass-move1 {
  0% { transform: rotate(-5deg) translateY(0); }
  100% { transform: rotate(-2deg) translateY(-10px); }
}

.glass-panel2 {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform: rotate(5deg);
  animation: glass-move2 8s ease-in-out infinite alternate;
}

@keyframes glass-move2 {
  0% { transform: rotate(5deg) translateY(0); }
  100% { transform: rotate(8deg) translateY(5px); }
}

.glass-shine {
  background: linear-gradient(45deg, transparent, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%, transparent);
  background-size: 200% 200%;
  animation: shine 5s ease-in-out infinite;
}

@keyframes shine {
  0% { background-position: -100% -100%; }
  100% { background-position: 200% 200%; }
}

.glass-title-panel {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.glass-title {
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.frost-char {
  display: inline-block;
  animation: frost-refract 4s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.15s);
  will-change: transform, opacity;
  position: relative;
}

@keyframes frost-refract {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
  25% {
    transform: translateY(-2px) translateX(1px) scale(1.02);
    opacity: 0.9;
    filter: blur(0.5px);
  }
  50% {
    transform: translateY(1px) translateX(-1px) scale(0.98);
    opacity: 1;
    filter: blur(0.2px);
  }
  75% {
    transform: translateY(-1px) translateX(0.5px) scale(1.01);
    opacity: 0.95;
    filter: blur(0.3px);
  }
}

.frost-char::before,
.frost-char::after {
  content: attr(data-char);
  position: absolute;
  top: 0;
  left: 0;
}

.frost-char::before {
  opacity: 0.2;
  transform: translateX(1px) translateY(-1px);
  filter: blur(1px);
  mix-blend-mode: soft-light;
}

.frost-char::after {
  opacity: 0.1;
  transform: translateX(-1px) translateY(1px);
  filter: blur(2px);
  mix-blend-mode: overlay;
}
</style>
