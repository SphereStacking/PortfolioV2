<script setup>
</script>

<template>
  <div :class="['relative overflow-hidden rounded-lg perspective-1000 size-full']">
    <!-- 3D Background Layer -->
    <div class="absolute inset-0 preserve-3d cyberpunk-3d">
      <div
        class="absolute inset-0 bg-black cyberpunk-animation"
        style="animation: cyberpunk-gradient 8s ease infinite, cyber-rotate 20s linear infinite"></div>
    </div>

    <!-- Grid Pattern -->
    <div
      class="absolute inset-0 cyber-grid" :style="{
        backgroundImage: 'url(\'data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 5v1H0z\'/%3E%3Cpath d=\'M6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E\')',
        backgroundSize: '4px',
        animation: 'grid-move 10s linear infinite',
      }"></div>

    <!-- Chromatic Aberration Layers -->
    <div class="absolute inset-0 z-10 mix-blend-screen">
      <div
        class="h-full w-1 bg-red-500 opacity-50 transform -skew-x-12 glitch-line-red"
        style="
            filter: blur(1px);
            animation: glitch-line-red 4s ease-in-out infinite;
            left: 29%;
          "></div>
      <div
        class="h-full w-1 bg-cyan-500 opacity-70 transform -skew-x-12 glitch-line"
        style="
            box-shadow: 0 0 20px 5px rgba(6, 182, 212, 0.7);
            animation: glitch-line 4s ease-in-out infinite;
            left: 30%;
          "></div>
      <div
        class="h-full w-1 bg-blue-500 opacity-50 transform -skew-x-12 glitch-line-blue"
        style="
            filter: blur(1px);
            animation: glitch-line-blue 4s ease-in-out infinite;
            left: 31%;
          "></div>
    </div>

    <!-- Floating Particles -->
    <div class="absolute inset-0 z-15">
      <div
        v-for="i in 15" :key="i"
        class="cyber-particle"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`,
        }"></div>
    </div>

    <!-- Scanlines -->
    <div class="absolute inset-0 z-20 pointer-events-none scanlines"></div>

    <!-- Main Content -->
    <div class="absolute inset-0 flex items-center justify-center z-30">
      <slot>
        <h3
          class="text-white text-3xl font-bold text-glitch preserve-3d" style="
            text-shadow:
              2px 0 0 rgba(255, 0, 0, 0.7),
              -2px 0 0 rgba(0, 255, 255, 0.7),
              0 0 10px rgba(6, 182, 212, 0.7),
              0 0 20px rgba(6, 182, 212, 0.5),
              0 0 30px rgba(6, 182, 212, 0.3);
            font-family: monospace;
            letter-spacing: 2px;
            animation: text-glitch 2s linear infinite, text-3d 10s ease-in-out infinite;
            transform: translateZ(50px);
          ">
          サイバーパンク<span class="text-cyan-300 blink">_</span>
        </h3>
      </slot>
    </div>

    <!-- Data Stream Background -->
    <div class="absolute inset-0 z-5 opacity-30">
      <div
        v-for="i in 5" :key="`stream-${i}`"
        class="data-stream"
        :style="{
          left: `${i * 20 + Math.random() * 10}%`,
          animationDelay: `${Math.random() * 3}s`,
        }"></div>
    </div>
  </div>
</template>

<style scoped>
/* 3D Perspective */
.perspective-1000 {
  perspective: 1000px;
}

.preserve-3d {
  transform-style: preserve-3d;
}

.cyberpunk-3d {
  transform: rotateX(15deg) rotateY(-10deg);
  animation: cyber-3d-float 10s ease-in-out infinite;
}

/* Enhanced Gradient Animation */
@keyframes cyberpunk-gradient {
  0%, 100% {
    background:
      linear-gradient(45deg, #1a0033 0%, #00b7ff 25%, #ff00ea 50%, #1a0033 75%),
      radial-gradient(circle at 20% 50%, transparent 30%, rgba(0, 255, 208, 0.3) 70%);
    background-size: 400% 400%;
    background-position: 0% 50%;
  }
  50% {
    background:
      linear-gradient(45deg, #ff00ea 0%, #1a0033 25%, #00b7ff 50%, #ff00ea 75%),
      radial-gradient(circle at 80% 50%, transparent 30%, rgba(255, 0, 234, 0.3) 70%);
    background-size: 400% 400%;
    background-position: 100% 50%;
  }
}

@keyframes cyber-rotate {
  from { transform: rotateZ(0deg); }
  to { transform: rotateZ(360deg); }
}

@keyframes cyber-3d-float {
  0%, 100% { transform: rotateX(15deg) rotateY(-10deg) translateZ(0); }
  50% { transform: rotateX(20deg) rotateY(10deg) translateZ(20px); }
}

/* Grid Animation */
@keyframes grid-move {
  from { background-position: 0 0; }
  to { background-position: 4px 4px; }
}

/* Enhanced Glitch Lines */
@keyframes glitch-line {
  0%, 100% {
    transform: translateX(0) skewX(-12deg) scaleY(1);
    opacity: 0.7;
  }
  20% {
    transform: translateX(30px) skewX(-15deg) scaleY(1.2);
    opacity: 0.9;
  }
  40% {
    transform: translateX(-10px) skewX(-10deg) scaleY(0.8);
    opacity: 1;
  }
  80% {
    transform: translateX(-30px) skewX(-8deg) scaleY(1.1);
    opacity: 0.5;
  }
}

@keyframes glitch-line-red {
  0%, 100% {
    transform: translateX(-2px) skewX(-12deg);
    opacity: 0.5;
  }
  50% {
    transform: translateX(25px) skewX(-15deg);
    opacity: 0.7;
  }
}

@keyframes glitch-line-blue {
  0%, 100% {
    transform: translateX(2px) skewX(-12deg);
    opacity: 0.5;
  }
  50% {
    transform: translateX(-25px) skewX(-15deg);
    opacity: 0.7;
  }
}

/* Text Glitch Effect */
@keyframes text-glitch {
  0%, 100% {
    text-shadow:
      2px 0 0 rgba(255, 0, 0, 0.7),
      -2px 0 0 rgba(0, 255, 255, 0.7),
      0 0 10px rgba(6, 182, 212, 0.7),
      0 0 20px rgba(6, 182, 212, 0.5);
  }
  20% {
    text-shadow:
      4px 0 0 rgba(255, 0, 0, 0.7),
      -4px 0 0 rgba(0, 255, 255, 0.7),
      0 0 15px rgba(6, 182, 212, 0.9),
      0 0 25px rgba(6, 182, 212, 0.7);
  }
  40% {
    text-shadow:
      -2px 0 0 rgba(255, 0, 0, 0.7),
      2px 0 0 rgba(0, 255, 255, 0.7),
      0 0 10px rgba(255, 0, 234, 0.7),
      0 0 20px rgba(255, 0, 234, 0.5);
  }
}

@keyframes text-3d {
  0%, 100% { transform: translateZ(50px) rotateX(0) rotateY(0); }
  50% { transform: translateZ(100px) rotateX(5deg) rotateY(-5deg); }
}

/* Blinking Cursor */
.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Cyber Particles */
.cyber-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #00ffff;
  box-shadow: 0 0 4px #00ffff;
  animation: particle-float 10s linear infinite;
}

@keyframes particle-float {
  from {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  to {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

/* Scanlines */
.scanlines {
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.03) 50%
  );
  background-size: 100% 4px;
  animation: scanlines 8s linear infinite;
}

@keyframes scanlines {
  from { background-position: 0 0; }
  to { background-position: 0 10px; }
}

/* Data Streams */
.data-stream {
  position: absolute;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    #00ff00 10%,
    #00ff00 40%,
    transparent
  );
  animation: data-flow 3s linear infinite;
}

@keyframes data-flow {
  from { transform: translateY(-100%); }
  to { transform: translateY(100%); }
}

/* Mix Blend Modes */
.mix-blend-screen {
  mix-blend-mode: screen;
}

/* Performance Optimization */
.cyberpunk-animation,
.glitch-line,
.glitch-line-red,
.glitch-line-blue,
.cyber-particle,
.data-stream {
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
