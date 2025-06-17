<script setup>
import { ref, computed } from 'vue'

defineProps({
  style: {
    type: Object,
    default: () => ({}),
  },
})

const containerRef = ref(null)

// 青い炎の粒子
const blueParticles = computed(() => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: 3 + Math.random() * 8,
    x: Math.random() * 100,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    swayAmount: (Math.random() - 0.5) * 100,
  }))
})

// プラズマコア
const plasmaCores = computed(() => {
  return Array.from({ length: 3 }, (_, i) => ({
    id: i,
    x: 30 + i * 20,
    y: 70 + Math.random() * 20,
    size: 60 + Math.random() * 40,
    duration: 3 + Math.random() * 2,
    delay: i * 0.8,
  }))
})
</script>

<template>
  <div
    ref="containerRef"
    :class="['relative overflow-hidden rounded-lg size-full bluefire-container']"
    :style="style">
    <!-- 黒いベース -->
    <div class="absolute inset-0 black-base"></div>

    <!-- 青い炎のコア -->
    <div
      v-for="core in plasmaCores"
      :key="`core-${core.id}`"
      class="absolute plasma-core"
      :style="{
        width: `${core.size}px`,
        height: `${core.size}px`,
        left: `${core.x}%`,
        bottom: `${core.y}%`,
        animationDuration: `${core.duration}s`,
        animationDelay: `${core.delay}s`,
      }"></div>

    <!-- 青い炎のメインボディ -->
    <div class="absolute inset-x-0 bottom-0 h-4/5">
      <div class="blue-flame-main"></div>
      <div class="blue-flame-secondary"></div>
      <div class="blue-flame-tertiary"></div>
    </div>

    <!-- 青い粒子 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="particle in blueParticles"
        :key="`particle-${particle.id}`"
        class="blue-particle"
        :style="{
          'width': `${particle.size}px`,
          'height': `${particle.size}px`,
          'left': `${particle.x}%`,
          '--sway': `${particle.swayAmount}px`,
          'animationDuration': `${particle.duration}s`,
          'animationDelay': `${particle.delay}s`,
        }"></div>
    </div>

    <!-- グローエフェクト -->
    <div class="absolute inset-0 blue-glow"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold bluefire-text">
          BLUE FIRE
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.bluefire-container {
  background: #000;
}

/* 黒いベース */
.black-base {
  background: radial-gradient(ellipse at 50% 100%, #000033 0%, #000 70%);
}

/* プラズマコア */
.plasma-core {
  background: radial-gradient(circle, #ffffff 0%, #00ffff 20%, #0099ff 40%, #0066ff 60%, transparent 80%);
  border-radius: 50%;
  filter: blur(15px);
  animation: core-pulse ease-in-out infinite;
  transform: translate(-50%, 50%);
}

@keyframes core-pulse {
  0%, 100% {
    transform: translate(-50%, 50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, 50%) scale(1.3);
    opacity: 1;
  }
}

/* 青い炎のメインボディ */
.blue-flame-main {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 100%, #ffffff 0%, #00ffff 10%, #0099ff 30%, #0066ff 50%, transparent 70%),
    radial-gradient(ellipse at 30% 100%, #00ffff 0%, #0099ff 20%, transparent 50%),
    radial-gradient(ellipse at 70% 100%, #00ffff 0%, #0099ff 20%, transparent 50%);
  filter: blur(2px);
  animation: flame-dance 3s ease-in-out infinite;
  mix-blend-mode: screen;
}

.blue-flame-secondary {
  position: absolute;
  inset: 10% 20% 0;
  background:
    radial-gradient(ellipse at 50% 100%, #ffffff 0%, #00ccff 20%, transparent 60%);
  filter: blur(5px);
  animation: flame-dance 4s ease-in-out infinite reverse;
  mix-blend-mode: screen;
  opacity: 0.8;
}

.blue-flame-tertiary {
  position: absolute;
  inset: 20% 30% 0;
  background:
    radial-gradient(ellipse at 50% 100%, #ffffff 0%, transparent 50%);
  filter: blur(10px);
  animation: flame-dance 2.5s ease-in-out infinite;
  mix-blend-mode: screen;
  opacity: 0.6;
}

@keyframes flame-dance {
  0%, 100% {
    transform: scaleY(1) scaleX(1) translateY(0);
  }
  33% {
    transform: scaleY(1.2) scaleX(0.9) translateY(-10px);
  }
  66% {
    transform: scaleY(0.9) scaleX(1.1) translateY(5px);
  }
}

/* 青い粒子 */
.blue-particle {
  position: absolute;
  bottom: 0;
  background: radial-gradient(circle, #ffffff 0%, #00ffff 30%, #0099ff 60%, transparent 100%);
  border-radius: 50%;
  animation: particle-rise ease-out infinite;
  filter: blur(0.5px);
}

@keyframes particle-rise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-100px) translateX(var(--sway)) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-200px) translateX(calc(var(--sway) * 1.5)) scale(0.3);
    opacity: 0;
  }
}

/* グローエフェクト */
.blue-glow {
  background:
    radial-gradient(ellipse at 50% 80%, rgba(0, 153, 255, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(0, 255, 255, 0.3) 0%, transparent 60%);
  filter: blur(40px);
  animation: glow-pulse 4s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* テキスト */
.bluefire-text {
  text-shadow:
    0 0 10px #ffffff,
    0 0 20px #00ffff,
    0 0 30px #00ccff,
    0 0 40px #0099ff,
    0 0 50px #0066ff,
    0 0 60px #0033ff;
  animation: text-blue-fire 2s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes text-blue-fire {
  0%, 100% {
    text-shadow:
      0 0 10px #ffffff,
      0 0 20px #00ffff,
      0 0 30px #00ccff,
      0 0 40px #0099ff,
      0 0 50px #0066ff,
      0 0 60px #0033ff;
  }
  50% {
    text-shadow:
      0 0 20px #ffffff,
      0 0 30px #00ffff,
      0 0 40px #00ccff,
      0 0 50px #0099ff,
      0 0 60px #0066ff,
      0 0 70px #0033ff;
  }
}
</style>
