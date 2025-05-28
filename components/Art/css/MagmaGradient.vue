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
    <div class="absolute inset-0 magma-base"></div>

    <!-- 溶岩の流れ -->
    <div class="absolute inset-0 magma-flow"></div>

    <!-- マグマの泡 -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 20"
        :key="`bubble-${i}`"
        class="absolute rounded-full magma-bubble"
        :style="{
          width: `${Math.random() * 20 + 10}px`,
          height: `${Math.random() * 20 + 10}px`,
          bottom: `${Math.random() * 40}%`,
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#f97316', '#dc2626', '#ea580c', '#f59e0b'][Math.floor(Math.random() * 4)],
          opacity: Math.random() * 0.5 + 0.2,
          boxShadow: `0 0 15px ${['#f97316', '#dc2626', '#ea580c', '#f59e0b'][Math.floor(Math.random() * 4)]}`,
          filter: 'blur(2px)',
          animation: `magma-bubble ${Math.random() * 10 + 5}s ease-in-out infinite ${Math.random() * 5}s`,
        }"></div>
    </div>

    <!-- マグマのしぶき -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 15"
        :key="`splash-${i}`"
        class="absolute magma-splash"
        :style="{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 6 + 3}px`,
          bottom: '20%',
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#fbbf24', '#f59e0b', '#d97706'][Math.floor(Math.random() * 3)],
          opacity: Math.random() * 0.8 + 0.2,
          borderRadius: '50% 50% 0 0',
          animation: `magma-splash ${Math.random() * 2 + 1}s ease-out infinite ${Math.random() * 2}s`,
        }"></div>
    </div>

    <!-- 煙と熱の歪み -->
    <div class="absolute inset-0 heat-distortion"></div>

    <!-- 岩石層 -->
    <div class="absolute inset-x-0 top-0 rock-layer"></div>

    <!-- 溶岩光源 -->
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
.magma-base {
  background: linear-gradient(to bottom, #7f1d1d, #b91c1c, #dc2626);
  animation: magma-pulse 8s ease-in-out infinite;
}

@keyframes magma-pulse {
  0%, 100% { filter: brightness(1) hue-rotate(0deg); }
  50% { filter: brightness(1.2) hue-rotate(5deg); }
}

.magma-flow {
  background:
    repeating-radial-gradient(
      circle at 30% 80%,
      rgba(251, 113, 133, 0.2) 0%,
      rgba(225, 29, 72, 0.3) 10%,
      rgba(190, 18, 60, 0.4) 20%,
      rgba(159, 18, 57, 0.5) 30%,
      rgba(153, 27, 27, 0.4) 40%,
      rgba(220, 38, 38, 0.3) 60%,
      rgba(248, 113, 113, 0.2) 70%,
      rgba(254, 202, 202, 0.1) 80%,
      transparent 90%
    ),
    repeating-radial-gradient(
      circle at 70% 90%,
      rgba(251, 113, 133, 0.2) 0%,
      rgba(225, 29, 72, 0.3) 10%,
      rgba(190, 18, 60, 0.4) 20%,
      rgba(159, 18, 57, 0.5) 30%,
      rgba(153, 27, 27, 0.4) 40%,
      rgba(220, 38, 38, 0.3) 60%,
      rgba(248, 113, 113, 0.2) 70%,
      rgba(254, 202, 202, 0.1) 80%,
      transparent 90%
    );
  animation: magma-flow 20s ease-in-out infinite alternate;
  opacity: 0.7;
}

@keyframes magma-flow {
  0% { background-size: 150% 150%; background-position: 0% 0%; }
  100% { background-size: 200% 200%; background-position: 100% 100%; }
}

@keyframes magma-bubble {
  0%, 100% { transform: scale(1) translateY(0); opacity: var(--opacity, 0.4); }
  50% { transform: scale(1.2) translateY(-20px); opacity: var(--opacity-mid, 0.6); }
}

@keyframes magma-splash {
  0% { height: 0; transform: translateY(0); opacity: var(--opacity, 0.5); }
  50% { height: var(--height, 5px); transform: translateY(-25px); opacity: var(--opacity-mid, 0.7); }
  100% { height: 0; transform: translateY(-40px); opacity: 0; }
}

.heat-distortion {
  background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(255, 177, 100, 0.1));
  animation: heat-wave 3s ease-in-out infinite;
  filter: blur(5px);
  mix-blend-mode: overlay;
}

@keyframes heat-wave {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.02); }
}

.rock-layer {
  height: 20%;
  background:
    linear-gradient(to bottom, rgba(41, 37, 36, 0.8), rgba(41, 37, 36, 0.3)),
    url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.magma-glow {
  background: radial-gradient(
    circle at 50% 90%,
    rgba(252, 211, 77, 0.4) 0%,
    rgba(251, 191, 36, 0.3) 20%,
    rgba(245, 158, 11, 0.2) 40%,
    transparent 70%
  );
  filter: blur(15px);
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.magma-text {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(252, 165, 165, 0.8);
  letter-spacing: 2px;
  animation: text-heat 3s ease-in-out infinite;
}

@keyframes text-heat {
  0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(252, 165, 165, 0.8); }
  50% { text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(254, 202, 202, 1); }
}
</style>
