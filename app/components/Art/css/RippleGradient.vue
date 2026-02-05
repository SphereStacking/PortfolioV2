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
  startColor: {
    type: String,
    default: 'blue-500',
  },
  endColor: {
    type: String,
    default: 'violet-600',
  },
})

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
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style"
    @mousemove="handleMouseMove"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false">
    <div
      class="absolute inset-0"
      :class="`bg-gradient-to-br from-${startColor} to-${endColor}`"
      style="animation: wave-shift 15s ease-in-out infinite"></div>
    <div
      class="absolute inset-0" style="
        background-image: radial-gradient(
          circle at 50% 50%,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0) 60%
        ),
        radial-gradient(
          circle at 70% 40%,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0) 50%
        ),
        radial-gradient(
          circle at 30% 60%,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0) 50%
        );
        animation: ripple-wave 20s linear infinite;
      "></div>
    <template v-if="isHovering">
      <div
        class="absolute rounded-full"
        :style="{
          top: `${mousePosition.y}%`,
          left: `${mousePosition.x}%`,
          transform: 'translate(-50%, -50%)',
          width: '10px',
          height: '10px',
          background: 'rgba(255,255,255,0.5)',
          boxShadow: '0 0 20px rgba(255,255,255,0.5)',
          animation: 'ripple-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          animationDelay: '0s',
          pointerEvents: 'none',
        }"></div>
      <div
        class="absolute rounded-full"
        :style="{
          top: `${mousePosition.y}%`,
          left: `${mousePosition.x}%`,
          transform: 'translate(-50%, -50%)',
          width: '10px',
          height: '10px',
          background: 'rgba(255,255,255,0.3)',
          boxShadow: '0 0 20px rgba(255,255,255,0.3)',
          animation: 'ripple-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          animationDelay: '0.5s',
          pointerEvents: 'none',
        }"></div>
      <div
        class="absolute rounded-full"
        :style="{
          top: `${mousePosition.y}%`,
          left: `${mousePosition.x}%`,
          transform: 'translate(-50%, -50%)',
          width: '10px',
          height: '10px',
          background: 'rgba(255,255,255,0.1)',
          boxShadow: '0 0 20px rgba(255,255,255,0.1)',
          animation: 'ripple-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          animationDelay: '1s',
          pointerEvents: 'none',
        }"></div>
    </template>
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3
          class="ripple-title text-white text-3xl font-bold px-6 py-3 rounded-lg" style="
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          ">
          <span
            v-for="(char, index) in '波紋グラデーション'.split('')" :key="index"
            :style="`--char-index: ${index}`"
            :data-char="char"
            class="ripple-char">{{ char }}</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
@keyframes wave-shift {
  0% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg); }
  100% { filter: hue-rotate(360deg); }
}

@keyframes ripple-wave {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes ripple-ping {
  75%, 100% {
    transform: translate(-50%, -50%) scale(6);
    opacity: 0;
  }
}

.ripple-char {
  display: inline-block;
  animation: char-ripple 3s ease-out infinite;
  animation-delay: calc(var(--char-index) * 0.15s);
  will-change: transform, opacity;
  position: relative;
}

@keyframes char-ripple {
  0%, 100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) translateY(-5px);
    opacity: 0.8;
  }
}

.ripple-char::after {
  content: attr(data-char);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  animation: char-ripple-echo 3s ease-out infinite;
  animation-delay: calc(var(--char-index) * 0.15s + 0.3s);
}

@keyframes char-ripple-echo {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  20% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
