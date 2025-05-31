<script setup>
import { ref, computed } from 'vue'

const containerRef = ref(null)

// 溶岩のバブル
const lavaBubbles = computed(() => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: 10 + Math.random() * 30,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
  }))
})

// 炎の粒子
const fireParticles = computed(() => {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 6,
    startX: Math.random() * 100,
    endX: (Math.random() - 0.5) * 200,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5,
  }))
})
</script>

<template>
  <div
    ref="containerRef"
    :class="['relative overflow-hidden rounded-lg size-full magma-container']">
    <!-- ベースグラデーション -->
    <div class="absolute inset-0 magma-base"></div>
    
    <!-- 溶岩流 -->
    <div class="absolute inset-0 lava-flow lava-flow-1"></div>
    <div class="absolute inset-0 lava-flow lava-flow-2"></div>
    <div class="absolute inset-0 lava-flow lava-flow-3"></div>
    
    <!-- 溶岩のバブル -->
    <div class="absolute inset-0">
      <div
        v-for="bubble in lavaBubbles"
        :key="`bubble-${bubble.id}`"
        class="lava-bubble"
        :style="{
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          left: `${bubble.x}%`,
          top: `${bubble.y}%`,
          animationDuration: `${bubble.duration}s`,
          animationDelay: `${bubble.delay}s`,
        }"></div>
    </div>
    
    <!-- 火の粒子 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="particle in fireParticles"
        :key="`particle-${particle.id}`"
        class="fire-particle"
        :style="{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          left: `${particle.startX}%`,
          '--end-x': `${particle.endX}%`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
        }"></div>
    </div>
    
    <!-- グロー効果 -->
    <div class="absolute inset-0 magma-glow"></div>
    
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold magma-text">
          MAGMA
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.magma-container {
  background: #000;
}

/* ベースグラデーション */
.magma-base {
  background: 
    radial-gradient(ellipse at 50% 100%, #ff0000 0%, #ff4500 20%, #ff6347 40%, #000 80%),
    radial-gradient(ellipse at 20% 80%, #ff6347 0%, #ff4500 30%, transparent 60%),
    radial-gradient(ellipse at 80% 90%, #ffa500 0%, #ff8c00 30%, transparent 60%);
  mix-blend-mode: screen;
}

/* 溶岩流 */
.lava-flow {
  position: absolute;
  inset: 0;
  mix-blend-mode: lighter;
}

.lava-flow-1 {
  background: 
    radial-gradient(ellipse at 50% 120%, #ff0000 0%, transparent 50%),
    radial-gradient(ellipse at 30% 100%, #ff4500 0%, transparent 40%),
    radial-gradient(ellipse at 70% 110%, #ff6347 0%, transparent 45%);
  animation: flow-1 8s ease-in-out infinite;
}

.lava-flow-2 {
  background: 
    radial-gradient(ellipse at 40% 150%, #ffa500 0%, transparent 50%),
    radial-gradient(ellipse at 60% 130%, #ff8c00 0%, transparent 40%);
  animation: flow-2 10s ease-in-out infinite;
}

.lava-flow-3 {
  background: 
    radial-gradient(ellipse at 50% 100%, #ffff00 0%, #ffd700 20%, transparent 40%);
  animation: flow-3 6s ease-in-out infinite;
  opacity: 0.5;
}

@keyframes flow-1 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

@keyframes flow-2 {
  0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
  50% { transform: translateY(-30px) scale(1.15) rotate(5deg); }
}

@keyframes flow-3 {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-15px) scale(1.2); opacity: 0.7; }
}

/* 溶岩のバブル */
.lava-bubble {
  position: absolute;
  background: radial-gradient(circle, #ffff00 0%, #ffd700 20%, #ff8c00 50%, #ff0000 100%);
  border-radius: 50%;
  filter: blur(0.5px);
  animation: bubble-rise ease-in-out infinite;
  box-shadow: 
    0 0 10px #ff0000,
    0 0 20px #ff4500,
    0 0 30px #ff6347;
}

@keyframes bubble-rise {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  20% {
    transform: translateY(-20px) scale(1);
    opacity: 1;
  }
  80% {
    transform: translateY(-80px) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) scale(0.5);
    opacity: 0;
  }
}

/* 火の粒子 */
.fire-particle {
  position: absolute;
  bottom: 0;
  background: radial-gradient(circle, #fff 0%, #ffff00 30%, #ff8c00 60%, #ff0000 100%);
  border-radius: 50%;
  filter: blur(0.5px);
  animation: particle-fly ease-out infinite;
}

@keyframes particle-fly {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-200px) translateX(var(--end-x));
    opacity: 0;
  }
}

/* グロー効果 */
.magma-glow {
  background: radial-gradient(ellipse at 50% 100%, rgba(255, 0, 0, 0.3) 0%, transparent 60%);
  filter: blur(30px);
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* テキスト */
.magma-text {
  text-shadow: 
    0 0 10px #fff,
    0 0 20px #ffff00,
    0 0 30px #ff8c00,
    0 0 40px #ff0000,
    0 0 50px #ff0000;
  animation: text-fire 2s ease-in-out infinite;
}

@keyframes text-fire {
  0%, 100% {
    text-shadow: 
      0 0 10px #fff,
      0 0 20px #ffff00,
      0 0 30px #ff8c00,
      0 0 40px #ff0000,
      0 0 50px #ff0000;
  }
  50% {
    text-shadow: 
      0 0 20px #fff,
      0 0 30px #ffff00,
      0 0 40px #ff8c00,
      0 0 50px #ff0000,
      0 0 60px #ff0000;
  }
}
</style>
