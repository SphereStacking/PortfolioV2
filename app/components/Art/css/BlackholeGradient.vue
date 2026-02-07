<script setup>
import { computed, ref } from 'vue'

defineProps({
  height: {
    type: String,
    default: 'h-64',
  },
  width: {
    type: String,
    default: 'w-full',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
})

const containerRef = ref(null)

// 事象の地平線周りの粒子
const particles = computed(() => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    radius: 80 + Math.random() * 60,
    size: 1 + Math.random() * 4,
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 10,
    orbitDuration: 15 + Math.random() * 15,
  }))
})

// 吸い込まれる光
const lightStreams = computed(() => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: i * 30,
    length: 100 + Math.random() * 50,
    width: 2 + Math.random() * 3,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 3,
  }))
})
</script>

<template>
  <div
    ref="containerRef"
    :class="['relative overflow-hidden rounded-lg blackhole-container size-full']"
    :style="style">
    <!-- 深宇宙の背景 -->
    <div class="absolute inset-0 deep-space"></div>

    <!-- 歪曲グリッド -->
    <div class="absolute inset-0 distortion-grid"></div>

    <!-- 光の渦 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="light-vortex">
        <div
          v-for="stream in lightStreams"
          :key="`stream-${stream.id}`"
          class="light-stream"
          :style="{
            transform: `rotate(${stream.angle}deg)`,
            width: `${stream.width}px`,
            height: `${stream.length}px`,
            animationDuration: `${stream.duration}s`,
            animationDelay: `${stream.delay}s`,
          }"></div>
      </div>
    </div>

    <!-- 降着円盤 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="accretion-disk-outer"></div>
      <div class="accretion-disk-inner"></div>
    </div>

    <!-- 事象の地平線 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="event-horizon">
        <div class="horizon-inner"></div>
      </div>
    </div>

    <!-- 周回する粒子 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        v-for="particle in particles"
        :key="`particle-${particle.id}`"
        class="particle-container"
        :style="{
          animationDuration: `${particle.orbitDuration}s`,
          animationDelay: `${particle.delay}s`,
        }">
        <div
          class="orbiting-particle"
          :style="{
            transform: `rotate(${particle.angle}deg) translateX(${particle.radius}px)`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
          }"></div>
      </div>
    </div>

    <!-- 重力レンズ効果 -->
    <div class="absolute inset-0 gravity-lens"></div>

    <!-- ホーキング放射 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="hawking-radiation"></div>
    </div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold blackhole-text">
          BLACK HOLE
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.blackhole-container {
  background: #000;
}

/* 深宇宙の背景 */
.deep-space {
  background:
    radial-gradient(circle at 50% 50%, #000 0%, #000033 50%, #000066 100%),
    url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
}

/* 歪曲グリッド */
.distortion-grid {
  background-image:
    repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.03) 21px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.03) 21px);
  animation: grid-warp 10s ease-in-out infinite;
  transform-origin: center;
}

@keyframes grid-warp {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(0.95) rotate(1deg);
  }
}

/* 光の渦 */
.light-vortex {
  position: relative;
  width: 400px;
  height: 400px;
  animation: vortex-spin 20s linear infinite;
}

.light-stream {
  position: absolute;
  left: 50%;
  top: 0;
  transform-origin: center bottom;
  background: linear-gradient(to bottom,
    rgba(255,255,255,0.8) 0%,
    rgba(255,200,100,0.6) 30%,
    rgba(255,100,0,0.4) 60%,
    transparent 100%);
  filter: blur(1px);
  animation: stream-pull ease-in infinite;
}

@keyframes vortex-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes stream-pull {
  0% {
    opacity: 0;
    transform: translateX(-50%) scaleY(0.5);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scaleY(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scaleY(0.1) translateY(100px);
  }
}

/* 降着円盤 */
.accretion-disk-outer {
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #ff0000 0deg,
    #ff4500 30deg,
    #ffa500 60deg,
    #ffff00 90deg,
    #ffffff 120deg,
    #ffff00 150deg,
    #ffa500 180deg,
    #ff4500 210deg,
    #ff0000 240deg,
    #ff4500 270deg,
    #ffa500 300deg,
    #ffff00 330deg,
    #ff0000 360deg
  );
  animation: disk-spin 8s linear infinite;
  filter: blur(3px);
  opacity: 0.8;
}

.accretion-disk-inner {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #ffffff 0deg,
    #ffff00 90deg,
    #ffffff 180deg,
    #ffff00 270deg,
    #ffffff 360deg
  );
  animation: disk-spin 4s linear infinite reverse;
  filter: blur(5px);
  opacity: 0.6;
}

@keyframes disk-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 事象の地平線 */
.event-horizon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #000;
  position: relative;
  box-shadow:
    0 0 50px rgba(0,0,0,1),
    0 0 100px rgba(0,0,0,0.8),
    0 0 150px rgba(0,0,0,0.6),
    inset 0 0 50px rgba(0,0,0,1);
}

.horizon-inner {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
  animation: horizon-pulse 5s ease-in-out infinite;
}

@keyframes horizon-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 周回する粒子 */
.particle-container {
  position: absolute;
  width: 300px;
  height: 300px;
  animation: orbit-spin linear infinite;
}

.orbiting-particle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  background: radial-gradient(circle, #ffffff 0%, #ffff00 50%, #ff0000 100%);
  border-radius: 50%;
  filter: blur(0.5px);
  animation: particle-glow ease-in-out infinite;
  margin-left: -50%;
  margin-top: -50%;
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes particle-glow {
  0%, 100% {
    opacity: 0.4;
    box-shadow: 0 0 5px #ffff00;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 10px #ffffff;
  }
}

/* 重力レンズ効果 */
.gravity-lens {
  background: radial-gradient(circle at center,
    transparent 0%,
    transparent 10%,
    rgba(255,255,255,0.02) 15%,
    transparent 20%,
    rgba(255,255,255,0.03) 30%,
    transparent 35%,
    rgba(255,255,255,0.02) 45%,
    transparent 50%
  );
  animation: lens-distort 15s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes lens-distort {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* ホーキング放射 */
.hawking-radiation {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle,
    transparent 0%,
    transparent 40%,
    rgba(100,149,237,0.2) 45%,
    rgba(138,43,226,0.1) 50%,
    transparent 55%
  );
  animation: radiation-emit 6s ease-in-out infinite;
}

@keyframes radiation-emit {
  0%, 100% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    transform: scale(2);
    opacity: 1;
  }
}

/* テキスト */
.blackhole-text {
  text-shadow:
    0 0 10px #ffffff,
    0 0 20px #ffff00,
    0 0 30px #ffa500,
    0 0 40px #ff4500,
    0 0 50px #ff0000,
    0 0 60px #800080;
  animation: text-warp 4s ease-in-out infinite;
  letter-spacing: 3px;
}

@keyframes text-warp {
  0%, 100% {
    text-shadow:
      0 0 10px #ffffff,
      0 0 20px #ffff00,
      0 0 30px #ffa500,
      0 0 40px #ff4500,
      0 0 50px #ff0000,
      0 0 60px #800080;
    transform: scale(1);
  }
  50% {
    text-shadow:
      0 0 20px #ffffff,
      0 0 30px #ffff00,
      0 0 40px #ffa500,
      0 0 50px #ff4500,
      0 0 60px #ff0000,
      0 0 70px #800080;
    transform: scale(0.95);
  }
}
</style>
