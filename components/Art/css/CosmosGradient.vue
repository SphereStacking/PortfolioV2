<script setup>
import { ref } from 'vue'

// Mouse interaction
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left) / rect.width - 0.5
  mouseY.value = (e.clientY - rect.top) / rect.height - 0.5
}
</script>

<template>
  <div class="relative h-64 w-full overflow-hidden rounded-lg cosmos-container" @mousemove="handleMouseMove">
    <!-- Deep Space Background -->
    <div class="absolute inset-0 cosmos-background"></div>
    <div class="absolute inset-0 cosmos-shadow"></div>

    <!-- Parallax Star Layers -->
    <!-- Far stars layer -->
    <div
      class="absolute inset-0 star-layer"
      :style="{
        transform: `translate(${mouseX * 10}px, ${mouseY * 10}px)`,
      }">
      <div
        v-for="(_, i) in 80"
        :key="`far-${i}`"
        class="absolute rounded-full bg-white star-far"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 1.5 + 0.5}px`,
          height: `${Math.random() * 1.5 + 0.5}px`,
          opacity: Math.random() * 0.6 + 0.2,
          animationDelay: `${Math.random() * 10}s`,
        }"></div>
    </div>

    <!-- Mid stars layer -->
    <div
      class="absolute inset-0 star-layer"
      :style="{
        transform: `translate(${mouseX * 20}px, ${mouseY * 20}px)`,
      }">
      <div
        v-for="(_, i) in 40"
        :key="`mid-${i}`"
        class="absolute rounded-full bg-white star-mid"
        :style="{
          'top': `${Math.random() * 100}%`,
          'left': `${Math.random() * 100}%`,
          'width': `${Math.random() * 2 + 1}px`,
          'height': `${Math.random() * 2 + 1}px`,
          'opacity': Math.random() * 0.8 + 0.4,
          'animationDelay': `${Math.random() * 8}s`,
          '--glow-color': ['#ffffff', '#ffeaa7', '#74b9ff', '#a29bfe'][Math.floor(Math.random() * 4)],
        }"></div>
    </div>

    <!-- Near stars layer -->
    <div
      class="absolute inset-0 star-layer"
      :style="{
        transform: `translate(${mouseX * 40}px, ${mouseY * 40}px)`,
      }">
      <div
        v-for="(_, i) in 20"
        :key="`near-${i}`"
        class="absolute rounded-full bg-white star-near"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 2}px`,
          height: `${Math.random() * 3 + 2}px`,
          opacity: 1,
          animationDelay: `${Math.random() * 6}s`,
        }"></div>
    </div>

    <!-- Aurora Effect -->
    <div class="absolute inset-0 aurora-container">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>

    <!-- Multiple Shooting Stars -->
    <div
      v-for="i in 5" :key="`shooting-${i}`"
      class="absolute shooting-star"
      :style="{
        'top': `${Math.random() * 50}%`,
        'left': `${Math.random() * 30 - 30}%`,
        'animationDelay': `${i * 2 + Math.random() * 3}s`,
        '--star-length': `${60 + Math.random() * 40}px`,
      }"></div>

    <!-- Enhanced Nebula -->
    <div class="absolute inset-0 nebula-container">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="nebula nebula-3"></div>
    </div>

    <!-- Galaxy Spiral -->
    <div class="absolute inset-0 galaxy-spiral"></div>

    <!-- Content -->
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <h3 class="text-white text-2xl font-bold cosmos-text">
        <span class="cosmos-letter" style="--delay: 0">C</span>
        <span class="cosmos-letter" style="--delay: 1">O</span>
        <span class="cosmos-letter" style="--delay: 2">S</span>
        <span class="cosmos-letter" style="--delay: 3">M</span>
        <span class="cosmos-letter" style="--delay: 4">O</span>
        <span class="cosmos-letter" style="--delay: 5">S</span>
      </h3>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.cosmos-container {
  background: #000814;
  perspective: 1000px;
}

/* Deep Space Background */
.cosmos-background {
  background:
    radial-gradient(ellipse at top, #001d3d 0%, #000814 50%, #000000 100%),
    radial-gradient(circle at 20% 80%, #003566 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, #001d3d 0%, transparent 50%);
  animation: cosmos-pulse 20s ease infinite;
}

@keyframes cosmos-pulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.05) rotate(1deg);
    opacity: 0.9;
  }
}

.cosmos-shadow {
  background:
    radial-gradient(circle at 20% 30%, rgba(106, 17, 203, 0.2) 0%, transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(37, 117, 252, 0.2) 0%, transparent 25%),
    radial-gradient(circle at 40% 70%, rgba(131, 52, 235, 0.2) 0%, transparent 35%),
    radial-gradient(circle at 70% 60%, rgba(72, 52, 212, 0.2) 0%, transparent 20%);
  mix-blend-mode: screen;
}

/* Parallax Star Layers */
.star-layer {
  will-change: transform;
  transition: transform 0.1s ease-out;
}

.star-far {
  animation: twinkle-slow 6s ease-in-out infinite;
  filter: blur(0.5px);
}

.star-mid {
  animation: twinkle 4s ease-in-out infinite;
  box-shadow: 0 0 2px var(--glow-color, #ffffff);
}

.star-near {
  animation: twinkle-fast 2s ease-in-out infinite;
  box-shadow: 0 0 4px #ffffff, 0 0 8px rgba(255, 255, 255, 0.5);
}

@keyframes twinkle {
  0%, 100% { opacity: var(--opacity, 1); transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

@keyframes twinkle-slow {
  0%, 100% { opacity: var(--opacity, 0.5); }
  50% { opacity: 0.1; }
}

@keyframes twinkle-fast {
  0%, 100% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.6; transform: scale(1.2); }
  50% { opacity: 1; transform: scale(0.9); }
  75% { opacity: 0.8; transform: scale(1.1); }
}

/* Aurora Effect */
.aurora-container {
  filter: blur(40px);
  opacity: 0.6;
  mix-blend-mode: screen;
}

.aurora {
  position: absolute;
  width: 200%;
  height: 60%;
  top: -30%;
  left: -50%;
}

.aurora-1 {
  background: linear-gradient(45deg, transparent, #00ff88, #00ffff, transparent);
  animation: aurora-wave 15s ease-in-out infinite;
}

.aurora-2 {
  background: linear-gradient(-45deg, transparent, #ff006e, #8338ec, transparent);
  animation: aurora-wave 20s ease-in-out infinite reverse;
  animation-delay: 5s;
}

.aurora-3 {
  background: linear-gradient(60deg, transparent, #3a86ff, #7209b7, transparent);
  animation: aurora-wave 25s ease-in-out infinite;
  animation-delay: 10s;
}

@keyframes aurora-wave {
  0%, 100% {
    transform: translateX(-50%) translateY(0) scaleY(1) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  50% {
    transform: translateX(50%) translateY(-20px) scaleY(1.5) rotate(5deg);
    opacity: 0.8;
  }
  80% {
    opacity: 0.6;
  }
}

/* Enhanced Shooting Stars */
.shooting-star {
  width: var(--star-length, 80px);
  height: 2px;
  background: linear-gradient(to right, transparent, #ffffff 30%, #ffffff 70%, transparent);
  transform: rotate(45deg);
  opacity: 0;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.8);
  animation: shooting-star-fly 4s ease-out infinite;
  filter: blur(0.5px);
}

.shooting-star::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, #74b9ff, transparent);
  transform: scaleY(2);
  filter: blur(4px);
}

@keyframes shooting-star-fly {
  0% {
    transform: translateX(0) translateY(0) rotate(45deg) scale(0);
    opacity: 0;
  }
  5% {
    transform: translateX(0) translateY(0) rotate(45deg) scale(1);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateX(400px) translateY(400px) rotate(45deg) scale(1);
    opacity: 0;
  }
}

/* Enhanced Nebula */
.nebula-container {
  mix-blend-mode: screen;
}

.nebula {
  position: absolute;
  filter: blur(60px);
  opacity: 0.4;
}

.nebula-1 {
  inset: -20%;
  background: radial-gradient(ellipse at 30% 40%, #6a11cb, transparent 40%);
  animation: nebula-drift 30s ease-in-out infinite;
}

.nebula-2 {
  inset: -30%;
  background: radial-gradient(ellipse at 70% 60%, #2575fc, transparent 45%);
  animation: nebula-drift 40s ease-in-out infinite reverse;
}

.nebula-3 {
  inset: -25%;
  background: radial-gradient(ellipse at 50% 30%, #b721ff, transparent 50%);
  animation: nebula-drift 35s ease-in-out infinite;
  animation-delay: 10s;
}

@keyframes nebula-drift {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1) rotate(60deg);
  }
  66% {
    transform: translate(-30px, 20px) scale(0.9) rotate(-30deg);
  }
}

/* Galaxy Spiral */
.galaxy-spiral {
  background:
    conic-gradient(from 0deg at 50% 50%,
      transparent 0deg,
      rgba(138, 43, 226, 0.1) 60deg,
      transparent 120deg,
      rgba(30, 144, 255, 0.1) 180deg,
      transparent 240deg,
      rgba(147, 51, 234, 0.1) 300deg,
      transparent 360deg);
  animation: galaxy-rotate 60s linear infinite;
  opacity: 0.5;
  mix-blend-mode: screen;
}

@keyframes galaxy-rotate {
  from { transform: rotate(0deg) scale(1); }
  to { transform: rotate(360deg) scale(1); }
}

/* Text Effects */
.cosmos-text {
  text-shadow:
    0 0 20px rgba(255, 255, 255, 0.8),
    0 0 40px rgba(138, 43, 226, 0.6),
    0 0 60px rgba(30, 144, 255, 0.4);
  letter-spacing: 8px;
  font-family: monospace;
}

.cosmos-letter {
  display: inline-block;
  animation: letter-float 4s ease-in-out infinite;
  animation-delay: calc(var(--delay) * 0.2s);
}

@keyframes letter-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(-5deg);
  }
  75% {
    transform: translateY(3px) rotate(3deg);
  }
}

/* Performance optimization */
.star-far,
.star-mid,
.star-near,
.shooting-star,
.aurora,
.nebula,
.galaxy-spiral {
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
