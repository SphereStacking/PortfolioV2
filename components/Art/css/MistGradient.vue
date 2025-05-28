<script setup>
import { ref } from 'vue'

const mousePosition = ref({ x: 0, y: 0 })
const isHovering = ref(false)

const handleMouseMove = (e) => {
  const containerRect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - containerRect.left) / containerRect.width * 100
  const y = (e.clientY - containerRect.top) / containerRect.height * 100
  mousePosition.value = { x, y }
}
</script>

<template>
  <div
    class="relative h-64 w-full overflow-hidden rounded-lg"
    @mousemove="handleMouseMove"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false">
    <div class="absolute inset-0 mist-background"></div>

    <!-- 霧の層 -->
    <div class="absolute inset-0 mist-layer"></div>

    <!-- 上部の霧 -->
    <div class="absolute top-0 left-0 right-0 h-1/3 top-mist"></div>

    <!-- 下部の霧 -->
    <div class="absolute bottom-0 left-0 right-0 h-1/4 bottom-mist"></div>

    <div
      v-if="isHovering"
      class="absolute"
      :style="{
        top: `${mousePosition.y}%`,
        left: `${mousePosition.x}%`,
        transform: 'translate(-50%, -50%)',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(5px)',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
      }"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <h3 class="text-white text-2xl font-bold px-6 py-2 mist-text">
        <span
          v-for="(char, index) in 'MIST'.split('')" :key="index"
          :style="`--char-index: ${index}`"
          class="mist-char">{{ char }}</span>
      </h3>
    </div>
  </div>
</template>

<style scoped>
.mist-background {
  background: linear-gradient(135deg, #7C99AC, #628E90, #D8D8D8);
  filter: contrast(1.1);
  animation: mist-shift 15s ease-in-out infinite;
}

@keyframes mist-shift {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
}

.mist-layer {
  background: radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.3), transparent 60%),
              radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.3), transparent 70%);
  filter: blur(20px);
  animation: mist-move 20s ease-in-out infinite alternate;
}

@keyframes mist-move {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

.top-mist {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5), transparent);
  filter: blur(10px);
  animation: top-mist-float 15s ease-in-out infinite;
}

@keyframes top-mist-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

.bottom-mist {
  background: linear-gradient(to top, rgba(255, 255, 255, 0.3), transparent);
  filter: blur(10px);
  animation: bottom-mist-float 10s ease-in-out infinite;
}

@keyframes bottom-mist-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.mist-text {
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.mist-char {
  display: inline-block;
  animation: mist-fade 4s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.3s);
  will-change: transform, opacity;
}

@keyframes mist-fade {
  0%, 100% {
    opacity: 0.3;
    transform: translateY(5px) scale(0.9);
    filter: blur(2px);
  }
  25% {
    opacity: 0.7;
    transform: translateY(2px) scale(0.95);
    filter: blur(1px);
  }
  50% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  75% {
    opacity: 0.7;
    transform: translateY(-2px) scale(0.95);
    filter: blur(1px);
  }
}
</style>
