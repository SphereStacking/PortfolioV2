<script setup>
import { computed } from 'vue'

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

// 雲の粒子を事前に計算
const cloudParticles = computed(() => {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 80 + 40,
    x: Math.random() * 120 - 10,
    y: Math.random() * 60 + 10,
    opacity: Math.random() * 0.6 + 0.3,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    blur: Math.random() * 20 + 10,
  }))
})

// 光の粒子を事前に計算
const lightParticles = computed(() => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    opacity: Math.random() * 0.8 + 0.2,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 5,
  }))
})
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <!-- 動的な空の背景 -->
    <div class="absolute inset-0 sky-background"></div>

    <!-- 雲の基盤レイヤー -->
    <div class="absolute inset-0 cloud-base-layer"></div>

    <!-- 動的雲粒子 -->
    <div class="absolute inset-0">
      <div
        v-for="particle in cloudParticles"
        :key="`cloud-particle-${particle.id}`"
        class="absolute cloud-particle"
        :style="{
          width: `${particle.size}px`,
          height: `${particle.size * 0.6}px`,
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          opacity: particle.opacity,
          filter: `blur(${particle.blur}px)`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
        }"></div>
    </div>

    <!-- 光の粒子 -->
    <div class="absolute inset-0">
      <div
        v-for="light in lightParticles"
        :key="`light-${light.id}`"
        class="absolute light-particle"
        :style="{
          width: `${light.size}px`,
          height: `${light.size}px`,
          left: `${light.x}%`,
          top: `${light.y}%`,
          opacity: light.opacity,
          animationDuration: `${light.duration}s`,
          animationDelay: `${light.delay}s`,
        }"></div>
    </div>

    <!-- 太陽光の効果 -->
    <div class="absolute inset-0 sunlight-effect"></div>

    <!-- 雲の影 -->
    <div class="absolute inset-0 cloud-shadows"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold cloud-text">
          CLOUDY SKY
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.sky-background {
  background: linear-gradient(
    180deg,
    #87ceeb 0%,
    #b0e0e6 30%,
    #e0f6ff 60%,
    #f0f8ff 100%
  );
  animation: sky-breathing 25s ease-in-out infinite alternate;
}

@keyframes sky-breathing {
  0% {
    background: linear-gradient(
      180deg,
      #87ceeb 0%,
      #b0e0e6 30%,
      #e0f6ff 60%,
      #f0f8ff 100%
    );
  }
  50% {
    background: linear-gradient(
      180deg,
      #4682b4 0%,
      #87ceeb 30%,
      #b0e0e6 60%,
      #e0f6ff 100%
    );
  }
  100% {
    background: linear-gradient(
      180deg,
      #87ceeb 0%,
      #b0e0e6 30%,
      #e0f6ff 60%,
      #f0f8ff 100%
    );
  }
}

.cloud-base-layer {
  background:
    radial-gradient(ellipse 600px 300px at 20% 40%, rgba(255, 255, 255, 0.8) 0%, transparent 70%),
    radial-gradient(ellipse 500px 250px at 80% 60%, rgba(255, 255, 255, 0.7) 0%, transparent 70%),
    radial-gradient(ellipse 400px 200px at 50% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
  animation: cloud-base-drift 40s ease-in-out infinite;
}

@keyframes cloud-base-drift {
  0%, 100% {
    transform: translateX(0) scale(1);
    opacity: 0.8;
  }
  25% {
    transform: translateX(-20px) scale(1.05);
    opacity: 0.9;
  }
  50% {
    transform: translateX(20px) scale(1.1);
    opacity: 0.7;
  }
  75% {
    transform: translateX(-10px) scale(1.05);
    opacity: 0.9;
  }
}

.cloud-particle {
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 40%,
    rgba(240, 248, 255, 0.5) 70%,
    transparent 100%
  );
  border-radius: 50% 60% 40% 50% / 60% 40% 60% 40%;
  animation: cloud-float ease-in-out infinite;
  will-change: transform;
}

@keyframes cloud-float {
  0%, 100% {
    transform: translateX(0) translateY(0) scale(1) rotate(0deg);
  }
  25% {
    transform: translateX(20px) translateY(-10px) scale(1.1) rotate(2deg);
  }
  50% {
    transform: translateX(40px) translateY(5px) scale(1.05) rotate(0deg);
  }
  75% {
    transform: translateX(30px) translateY(-5px) scale(1.08) rotate(-1deg);
  }
}

.light-particle {
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  border-radius: 50%;
  animation: light-twinkle ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes light-twinkle {
  0%, 100% {
    transform: scale(1);
    opacity: var(--opacity, 0.5);
  }
  50% {
    transform: scale(1.5);
    opacity: calc(var(--opacity, 0.5) * 1.5);
  }
}

.sunlight-effect {
  background:
    radial-gradient(
      ellipse 800px 400px at 70% 20%,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 40%,
      transparent 70%
    ),
    linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 30%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 70%,
      transparent 100%
    );
  mix-blend-mode: overlay;
  animation: sunlight-movement 30s ease-in-out infinite;
}

@keyframes sunlight-movement {
  0%, 100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: rotate(2deg) scale(1.1);
    opacity: 0.8;
  }
  50% {
    transform: rotate(0deg) scale(1.2);
    opacity: 0.9;
  }
  75% {
    transform: rotate(-2deg) scale(1.1);
    opacity: 0.7;
  }
}

.cloud-shadows {
  background:
    radial-gradient(ellipse 400px 200px at 30% 70%, rgba(0, 0, 0, 0.1) 0%, transparent 60%),
    radial-gradient(ellipse 300px 150px at 70% 80%, rgba(0, 0, 0, 0.08) 0%, transparent 60%);
  animation: shadow-movement 35s ease-in-out infinite reverse;
}

@keyframes shadow-movement {
  0%, 100% {
    transform: translateX(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateX(30px) scale(1.1);
    opacity: 0.5;
  }
}

.cloud-text {
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 255, 255, 0.8),
    0 0 40px rgba(135, 206, 235, 0.6);
  letter-spacing: 3px;
  animation: text-cloud-glow 6s ease-in-out infinite alternate;
}

@keyframes text-cloud-glow {
  0% {
    text-shadow:
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(255, 255, 255, 0.8),
      0 0 40px rgba(135, 206, 235, 0.6);
    transform: scale(1);
  }
  100% {
    text-shadow:
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(255, 255, 255, 1),
      0 0 60px rgba(135, 206, 235, 0.8),
      0 0 80px rgba(176, 224, 230, 0.6);
    transform: scale(1.02);
  }
}

/* パフォーマンス最適化 */
.cloud-particle,
.light-particle,
.cloud-base-layer,
.sunlight-effect,
.cloud-shadows {
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
