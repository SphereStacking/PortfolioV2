<script setup>
import { ref, onMounted } from 'vue'

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

const mouseX = ref(0.5)
const mouseY = ref(0.5)

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left) / rect.width
  mouseY.value = (e.clientY - rect.top) / rect.height
}
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style"
    @mousemove="handleMouseMove">
    <div class="absolute inset-0 bg-fire-base"></div>

    <!-- Heat Distortion Effect -->
    <div class="absolute inset-0 heat-distortion"></div>

    <!-- Dynamic Fire Layers with Mouse Interaction -->
    <div
      class="absolute inset-0 fire-base"
      :style="{
        transform: `translateX(${(mouseX - 0.5) * 20}px)`,
      }"></div>

    <div
      class="absolute inset-0 fire-layer1"
      :style="{
        transform: `translateX(${(mouseX - 0.5) * 30}px) translateY(${(1 - mouseY) * 10}px)`,
      }"></div>

    <div
      class="absolute inset-0 fire-layer2"
      :style="{
        transform: `translateX(${(mouseX - 0.5) * -25}px) translateY(${(1 - mouseY) * 15}px)`,
      }"></div>

    <div
      class="absolute inset-0 fire-layer3"
      :style="{
        transform: `translateX(${(mouseX - 0.5) * 40}px) translateY(${(1 - mouseY) * 20}px)`,
      }"></div>

    <!-- Dynamic Ember Particles -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="(_, i) in 30"
        :key="`ember-${i}`"
        class="absolute ember-particle"
        :style="{
          'width': `${Math.random() * 4 + 2}px`,
          'height': `${Math.random() * 4 + 2}px`,
          'left': `${Math.random() * 100}%`,
          'bottom': '-10px',
          'animationDelay': `${Math.random() * 5}s`,
          'animationDuration': `${3 + Math.random() * 4}s`,
          '--wobble': `${Math.random() * 60 - 30}px`,
          '--glow-size': `${Math.random() * 10 + 5}px`,
        }"></div>
    </div>

    <!-- Enhanced Sparks -->
    <div class="absolute inset-x-0 bottom-0 h-3/4">
      <div
        v-for="(_, i) in 25"
        :key="`spark-${i}`"
        class="absolute spark"
        :style="{
          'width': `${Math.random() * 3 + 1}px`,
          'height': `${Math.random() * 10 + 5}px`,
          'left': `${Math.random() * 100}%`,
          'bottom': '10%',
          'animationDelay': `${Math.random() * 3}s`,
          '--spark-distance': `${Math.random() * 150 + 50}px`,
        }"></div>
    </div>

    <!-- Smoke Layers -->
    <div class="absolute inset-x-0 bottom-0 h-full smoke-layer1"></div>
    <div class="absolute inset-x-0 bottom-0 h-full smoke-layer2"></div>

    <!-- Content -->
    <div class="absolute inset-0 flex items-center justify-center z-10 pt-12">
      <slot>
        <h3 class="text-white text-3xl font-bold fire-text">
          <span class="flame-letter">フ</span><span class="flame-letter delay-1">ァ</span><span class="flame-letter delay-2">イ</span><span class="flame-letter delay-3">ヤ</span><span class="flame-letter delay-4">ー</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Base Background */
.bg-fire-base {
  background: linear-gradient(to bottom, #2a0800, #000000);
}

/* Heat Distortion */
.heat-distortion {
  background: linear-gradient(45deg, transparent 30%, rgba(255, 87, 34, 0.1) 50%, transparent 70%);
  filter: blur(3px);
  animation: heat-wave 2s ease-in-out infinite;
}

@keyframes heat-wave {
  0%, 100% { transform: translateY(0) skewY(0); }
  50% { transform: translateY(-5px) skewY(2deg); }
}

/* Enhanced Fire Layers */
.fire-base {
  background:
    radial-gradient(ellipse at center bottom, #ff6b1a 0%, #ff9800 30%, transparent 70%),
    radial-gradient(ellipse at 30% bottom, #ff5722 0%, transparent 50%),
    radial-gradient(ellipse at 70% bottom, #ff7043 0%, transparent 50%);
  animation: fire-base 4s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes fire-base {
  0%, 100% {
    opacity: 0.8;
    transform: scaleY(1) translateY(0);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.1) translateY(-5px);
  }
}

.fire-layer1 {
  background:
    radial-gradient(ellipse at 40% 90%, #ffa726 0%, transparent 55%),
    radial-gradient(ellipse at 60% 85%, #ff9800 0%, transparent 45%);
  filter: blur(8px);
  animation: fire-layer1 3s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes fire-layer1 {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.9;
  }
  33% {
    transform: translateY(-15px) scale(1.05) rotate(-2deg);
    opacity: 1;
  }
  66% {
    transform: translateY(-10px) scale(1.02) rotate(2deg);
    opacity: 0.95;
  }
}

.fire-layer2 {
  background:
    radial-gradient(ellipse at 60% 90%, #ff7043 0%, transparent 60%),
    radial-gradient(ellipse at 40% 85%, #ff5722 0%, transparent 50%);
  filter: blur(6px) contrast(1.2);
  animation: fire-layer2 3.5s ease-in-out infinite 0.5s;
  mix-blend-mode: screen;
}

@keyframes fire-layer2 {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.85;
  }
  50% {
    transform: translateY(-20px) scale(1.1) rotate(3deg);
    opacity: 1;
  }
}

.fire-layer3 {
  background:
    radial-gradient(ellipse at 50% 80%, #ffeb3b 0%, #ffc107 30%, transparent 50%);
  filter: blur(10px) brightness(1.2);
  animation: fire-layer3 4s ease-in-out infinite 1s;
  mix-blend-mode: screen;
}

@keyframes fire-layer3 {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-25px) scale(1.15);
    opacity: 0.9;
  }
}

/* Ember Particles */
.ember-particle {
  background: radial-gradient(circle, #ffeb3b, #ff6b1a);
  border-radius: 50%;
  box-shadow: 0 0 var(--glow-size) #ff6b1a;
  animation: ember-rise 4s ease-out infinite;
  filter: blur(0.5px);
}

@keyframes ember-rise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-200px) translateX(var(--wobble)) scale(0.3);
    opacity: 0;
  }
}

/* Enhanced Sparks */
.spark {
  background: linear-gradient(to top, #ffeb3b, #ff6b1a);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow: 0 0 4px #ffeb3b;
  animation: spark-fly 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

@keyframes spark-fly {
  0% {
    transform: translateY(0) translateX(0) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(calc(-1 * var(--spark-distance))) translateX(calc(var(--spark-distance) * 0.3)) scale(0) rotate(180deg);
    opacity: 0;
  }
}

@keyframes tongue-flicker {
  0%, 100% {
    transform: scaleY(1) skewX(0deg);
    opacity: 0.8;
  }
  25% {
    transform: scaleY(1.2) skewX(-5deg);
    opacity: 0.9;
  }
  50% {
    transform: scaleY(0.9) skewX(5deg);
    opacity: 1;
  }
  75% {
    transform: scaleY(1.1) skewX(-3deg);
    opacity: 0.85;
  }
}

/* Smoke Layers */
.smoke-layer1 {
  background: linear-gradient(to top, transparent 60%, rgba(50, 50, 50, 0.2));
  filter: blur(20px);
  animation: smoke-rise1 8s ease-in-out infinite;
  opacity: 0.3;
}

.smoke-layer2 {
  background: linear-gradient(to top, transparent 70%, rgba(30, 30, 30, 0.15));
  filter: blur(30px);
  animation: smoke-rise2 10s ease-in-out infinite 2s;
  opacity: 0.2;
}

@keyframes smoke-rise1 {
  0%, 100% {
    transform: translateY(0) scaleX(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scaleX(1.1);
    opacity: 0.2;
  }
}

@keyframes smoke-rise2 {
  0%, 100% {
    transform: translateY(0) scaleX(1) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) scaleX(1.2) rotate(5deg);
  }
}

/* Text Effects */
.fire-text {
  text-shadow:
    0 0 10px #ff5722,
    0 0 20px #ff9800,
    0 0 30px #ff6b1a,
    0 -2px 10px rgba(255, 235, 59, 0.5);
  animation: text-heat 2s ease-in-out infinite;
}

.flame-letter {
  display: inline-block;
  animation: letter-dance 1.5s ease-in-out infinite;
}

.flame-letter.delay-1 { animation-delay: 0.1s; }
.flame-letter.delay-2 { animation-delay: 0.2s; }
.flame-letter.delay-3 { animation-delay: 0.3s; }
.flame-letter.delay-4 { animation-delay: 0.4s; }
.flame-letter.delay-5 { animation-delay: 0.5s; }
.flame-letter.delay-6 { animation-delay: 0.6s; }

@keyframes text-heat {
  0%, 100% {
    filter: brightness(1) contrast(1);
    transform: translateY(0);
  }
  50% {
    filter: brightness(1.2) contrast(1.1);
    transform: translateY(-2px);
  }
}

@keyframes letter-dance {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-3px) rotate(-5deg) scale(1.1);
  }
  75% {
    transform: translateY(-1px) rotate(3deg) scale(1.05);
  }
}

/* Performance Optimization */
.heat-distortion,
.fire-base,
.fire-layer1,
.fire-layer2,
.fire-layer3,
.ember-particle,
.spark,
.flame-tongue {
  will-change: transform, opacity;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
