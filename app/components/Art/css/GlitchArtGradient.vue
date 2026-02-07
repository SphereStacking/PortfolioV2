<script setup>
</script>

<template>
  <div
    :class="['relative overflow-hidden rounded-lg size-full']">
    <div class="absolute inset-0 glitch-background"></div>

    <!-- グリッチベース画像 -->
    <div class="absolute inset-0 glitch-base"></div>

    <!-- グリッチレイヤー1 - RGB分離 -->
    <div class="absolute inset-0 glitch-rgb-split"></div>

    <!-- グリッチレイヤー2 - 横線ノイズ -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 12"
        :key="`hline-${i}`"
        class="absolute glitch-hline"
        :style="{
          height: `${Math.random() * 2 + 1}px`,
          left: 0,
          right: 0,
          top: `${Math.random() * 100}%`,
          backgroundColor: ['rgba(255, 0, 0, 0.2)', 'rgba(0, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.5)', 'rgba(0, 0, 0, 0.5)'][Math.floor(Math.random() * 4)],
          opacity: Math.random() * 0.7 + 0.3,
          animation: `glitch-hline-animation ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 5}s`,
        }"></div>
    </div>

    <!-- グリッチレイヤー3 - ブロックノイズ -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 20"
        :key="`block-${i}`"
        class="absolute glitch-block"
        :style="{
          width: `${Math.random() * 60 + 10}px`,
          height: `${Math.random() * 15 + 5}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          backgroundColor: ['rgba(255, 0, 0, 0.3)', 'rgba(0, 255, 255, 0.3)', 'rgba(0, 0, 0, 0.5)', 'rgba(255, 255, 255, 0.4)', 'transparent'][Math.floor(Math.random() * 5)],
          animation: `glitch-block-animation ${Math.random() * 8 + 2}s steps(1) infinite ${Math.random() * 5}s`,
        }"></div>
    </div>

    <!-- グリッチレイヤー4 - シフトエフェクト -->
    <div class="absolute inset-0 glitch-shift"></div>

    <!-- スキャンライン -->
    <div class="absolute inset-0 scanlines"></div>

    <!-- ビネットエフェクト -->
    <div class="absolute inset-0 vignette"></div>

    <div class="absolute inset-0 flex items-center justify-center z-20">
      <slot>
        <h3 class="text-white text-3xl font-bold glitch-text">
          <span class="glitch-text-r">GLITCH</span>
          <span class="glitch-text-g">GLITCH</span>
          <span class="glitch-text-b">GLITCH</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.glitch-background {
  background: linear-gradient(135deg, #1a1a1a, #000000);
}

.glitch-base {
  background: linear-gradient(135deg, #3b82f6, #ec4899);
  background-size: 400% 400%;
  animation: glitch-base-shift 15s ease infinite alternate;
  opacity: 0.7;
}

@keyframes glitch-base-shift {
  0% { background-position: 0% 0%; }
  25% { background-position: 50% 0%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 100%; }
  100% { background-position: 0% 100%; }
}

.glitch-rgb-split {
  background: linear-gradient(135deg, #3b82f6, #ec4899);
  background-size: 400% 400%;
  mix-blend-mode: screen;
  opacity: 0.5;
  animation: rgb-shift 0.5s steps(1) infinite;
}

@keyframes rgb-shift {
  0%, 100% {
    transform: translate(0);
    background-position: 0% 0%;
    filter: hue-rotate(0deg);
  }
  25% {
    transform: translate(-5px, 0);
    background-position: 30% 10%;
    filter: hue-rotate(90deg);
  }
  50% {
    transform: translate(5px, 0);
    background-position: 60% 30%;
    filter: hue-rotate(180deg);
  }
  75% {
    transform: translate(0, -3px);
    background-position: 100% 60%;
    filter: hue-rotate(270deg);
  }
}

@keyframes glitch-hline-animation {
  0%, 5%, 100% { transform: scaleX(1); opacity: var(--opacity, 0.5); left: 0; }
  1% { transform: scaleX(var(--scale, 0.8)); opacity: var(--opacity-high, 0.8); left: var(--left, 20px); }
  2% { transform: scaleX(var(--scale-alt, 1.2)); opacity: var(--opacity-low, 0.3); left: var(--left-alt, -10px); }
}

@keyframes glitch-block-animation {
  0%, 100% { transform: translateX(0); opacity: var(--opacity, 0.5); }
  10% { transform: translateX(30px); opacity: var(--opacity-high, 0.8); }
  20% { transform: translateX(-20px); opacity: var(--opacity-low, 0.3); }
  30% { transform: translateX(0); opacity: var(--opacity, 0.5); }
}

.glitch-shift {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3b82f6, #ec4899);
  background-size: 400% 400%;
  mix-blend-mode: overlay;
  opacity: 0.3;
  filter: hue-rotate(90deg);
  animation: glitch-shift-animation 0.3s steps(1) infinite;
  clip-path: polygon(0% 0%, 100% 0%, 100% 5%, 0% 5%, 0% 10%, 100% 10%, 100% 15%, 0% 15%);
}

@keyframes glitch-shift-animation {
  0%, 100% { transform: translateX(0); clip-path: polygon(0% 0%, 100% 0%, 100% 5%, 0% 5%, 0% 10%, 100% 10%, 100% 15%, 0% 15%); }
  25% { transform: translateX(-10px); clip-path: polygon(0% 20%, 100% 20%, 100% 25%, 0% 25%, 0% 30%, 100% 30%, 100% 35%, 0% 35%); }
  50% { transform: translateX(10px); clip-path: polygon(0% 40%, 100% 40%, 100% 45%, 0% 45%, 0% 50%, 100% 50%, 100% 55%, 0% 55%); }
  75% { transform: translateX(-5px); clip-path: polygon(0% 60%, 100% 60%, 100% 65%, 0% 65%, 0% 70%, 100% 70%, 100% 75%, 0% 75%); }
}

.scanlines {
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.5) 50%
  );
  background-size: 100% 4px;
  opacity: 0.2;
  animation: scanline-animation 10s linear infinite;
}

@keyframes scanline-animation {
  0% { background-position: 0 0; }
  100% { background-position: 0 1000px; }
}

.vignette {
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.8);
  animation: vignette-pulse 5s ease-in-out infinite;
}

@keyframes vignette-pulse {
  0%, 100% { box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.8); }
  50% { box-shadow: inset 0 0 150px rgba(0, 0, 0, 0.9); }
}

.glitch-text {
  position: relative;
  font-family: monospace;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 4px;
}

.glitch-text span {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
}

.glitch-text-r {
  color: rgba(255, 0, 0, 0.8);
  animation: glitch-text-animation-r 0.3s steps(1) infinite;
}

.glitch-text-g {
  color: rgba(0, 255, 0, 0.8);
  animation: glitch-text-animation-g 0.3s steps(1) infinite;
}

.glitch-text-b {
  color: rgba(0, 0, 255, 0.8);
  animation: glitch-text-animation-b 0.3s steps(1) infinite;
}

@keyframes glitch-text-animation-r {
  0%, 100% { transform: translate(0); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, -1px); }
  75% { transform: translate(-1px, 0); }
}

@keyframes glitch-text-animation-g {
  0%, 100% { transform: translate(0); }
  25% { transform: translate(1px, 0); }
  50% { transform: translate(0, 1px); }
  75% { transform: translate(-1px, -1px); }
}

@keyframes glitch-text-animation-b {
  0%, 100% { transform: translate(0); }
  25% { transform: translate(1px, -1px); }
  50% { transform: translate(-1px, 1px); }
  75% { transform: translate(1px, 0); }
}
</style>
