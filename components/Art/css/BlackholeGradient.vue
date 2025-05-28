<script setup>
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
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg', height, width, className]"
    :style="style">
    <div class="absolute inset-0 bg-black"></div>

    <!-- 背景の星空 -->
    <div class="absolute inset-0 star-background"></div>

    <!-- 小さな星たち -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 100"
        :key="`star-${i}`"
        class="absolute rounded-full bg-white"
        :style="{
          width: `${Math.random() * 2 + 0.5}px`,
          height: `${Math.random() * 2 + 0.5}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.9 + 0.1,
          animation: `twinkle-blackhole ${Math.random() * 4 + 2}s ease-in-out infinite ${Math.random() * 3}s`,
        }"></div>
    </div>

    <!-- ブラックホールの影響領域 - 歪曲効果 -->
    <div class="absolute inset-0 distortion-field"></div>

    <!-- ブラックホール中心部 -->
    <div class="absolute blackhole-center">
      <div class="blackhole-core"></div>
      <div class="blackhole-accretion-disk"></div>
    </div>

    <!-- 光の歪み効果 -->
    <div class="absolute light-warp"></div>

    <!-- 放射ジェット -->
    <div class="absolute blackhole-jet"></div>

    <div class="absolute inset-0 flex items-center justify-center z-20 pt-32">
      <slot>
        <h3 class="text-white text-2xl font-bold blackhole-text">
          ブラックホール
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.star-background {
  background: radial-gradient(ellipse at center, rgba(20, 20, 40, 1) 0%, rgba(0, 0, 0, 1) 70%);
  animation: pulse-space 15s ease-in-out infinite;
}

@keyframes pulse-space {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes twinkle-blackhole {
  0%, 100% { opacity: var(--opacity, 0.5); filter: blur(0px); }
  50% { opacity: var(--opacity-mid, 0.2); filter: blur(1px); }
}

.distortion-field {
  background: radial-gradient(ellipse at center, transparent 0%, transparent 20%, rgba(50, 30, 100, 0.1) 30%, transparent 60%);
  animation: rotate-slow 120s linear infinite;
  opacity: 0.8;
}

@keyframes rotate-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.blackhole-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  animation: pulse-hole 8s ease-in-out infinite;
}

@keyframes pulse-hole {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.blackhole-core {
  position: absolute;
  width: 40px;
  height: 40px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #000;
  border-radius: 50%;
  box-shadow: 0 0 30px 5px rgba(0, 0, 0, 1);
}

.blackhole-accretion-disk {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(255, 100, 50, 0.8) 0%,
    rgba(255, 200, 50, 0.8) 10%,
    rgba(255, 255, 200, 0.8) 20%,
    rgba(100, 200, 255, 0.7) 30%,
    rgba(50, 100, 255, 0.7) 40%,
    rgba(100, 50, 200, 0.7) 50%,
    rgba(50, 0, 100, 0.7) 60%,
    rgba(20, 0, 50, 0.6) 70%,
    rgba(10, 0, 20, 0.5) 80%,
    rgba(0, 0, 0, 0) 90%
  );
  filter: blur(5px);
  opacity: 0.9;
  z-index: 1;
  animation: disk-rotate 20s linear infinite;
}

@keyframes disk-rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.light-warp {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.5) 30%,
    transparent 70%
  );
  filter: blur(5px);
  z-index: 10;
}

.blackhole-jet {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 200px;
  transform: translate(-50%, -50%) rotate(45deg);
  background: linear-gradient(to top, rgba(100, 100, 255, 0), rgba(100, 100, 255, 0.5));
  filter: blur(4px);
  animation: jet-pulse 5s ease-in-out infinite;
}

@keyframes jet-pulse {
  0%, 100% { opacity: 0.3; height: 200px; }
  50% { opacity: 0.5; height: 220px; }
}

.blackhole-text {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  letter-spacing: 3px;
  animation: text-glow 3s ease-in-out infinite;
}

@keyframes text-glow {
  0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
  50% { text-shadow: 0 0 20px rgba(255, 255, 255, 1), 0 0 30px rgba(100, 100, 255, 0.8); }
}
</style>
