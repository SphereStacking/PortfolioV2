<script setup>
</script>

<template>
  <div class="relative h-64 w-full overflow-hidden rounded-lg">
    <div class="absolute inset-0 retrowave-background"></div>

    <!-- レトログリッド -->
    <div class="absolute inset-0 retrowave-grid"></div>

    <!-- 太陽 -->
    <div class="absolute retrowave-sun"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10 pt-16">
      <h3 class="text-white text-2xl font-bold retrowave-text">
        <span
          v-for="(char, index) in 'RETROWAVE'.split('')" :key="index"
          :style="`--char-index: ${index}`"
          class="retro-char">{{ char }}</span>
      </h3>
    </div>
  </div>
</template>

<style scoped>
.retrowave-background {
  background: linear-gradient(to bottom, #33065d, #870160, #ff0055);
  animation: retrowave-shift 15s ease infinite;
}

@keyframes retrowave-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

.retrowave-grid {
  background-image: linear-gradient(0deg, rgba(255,66,161,0.5) 0%, rgba(255,66,161,0) 100%),
                    linear-gradient(90deg, rgba(255,66,161,0.5) 0%, rgba(255,66,161,0) 100%);
  background-size: 40px 40px;
  perspective-origin: center bottom;
  perspective: 500px;
  transform-style: preserve-3d;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: rotateX(60deg) translateY(0); }
  100% { transform: rotateX(60deg) translateY(40px); }
}

.retrowave-sun {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(to top, #ff0055, #ff9800);
  bottom: 40%;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 40px rgba(255,0,85,0.6);
  animation: sun-pulse 5s ease-in-out infinite;
}

@keyframes sun-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}

.retrowave-text {
  text-shadow: 5px 5px 0px #ff00aa;
  font-family: monospace;
  letter-spacing: 4px;
}

.retro-char {
  display: inline-block;
  animation: neon-flicker 2s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
  will-change: transform, opacity, filter;
}

@keyframes neon-flicker {
  0%, 100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: brightness(1) contrast(1);
    text-shadow:
      0 0 5px #ff00aa,
      0 0 10px #ff00aa,
      0 0 20px #ff00aa,
      0 0 40px #ff00aa;
  }
  50% {
    opacity: 0.95;
    transform: translateY(-2px) scale(1.05);
    filter: brightness(1.2) contrast(1.2);
    text-shadow:
      0 0 10px #ff00aa,
      0 0 20px #ff00aa,
      0 0 30px #ff00aa,
      0 0 50px #ff00aa;
  }
  25%, 75% {
    opacity: 0.9;
    transform: translateY(0) scale(1);
    filter: brightness(0.9) contrast(0.9);
    text-shadow:
      0 0 3px #ff00aa,
      0 0 7px #ff00aa,
      0 0 15px #ff00aa,
      0 0 30px #ff00aa;
  }
}
</style>
