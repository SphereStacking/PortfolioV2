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
    <div class="absolute inset-0 bluefire-base"></div>

    <!-- 青い炎の基本層 -->
    <div class="absolute inset-0 bluefire-layer"></div>

    <!-- 炎の形状1 -->
    <div class="absolute inset-x-0 bottom-0 h-3/4 bluefire-shape1"></div>

    <!-- 炎の形状2 -->
    <div class="absolute inset-x-0 bottom-0 h-2/3 bluefire-shape2"></div>

    <!-- 炎の形状3 - 中心が最も熱い部分 -->
    <div class="absolute inset-x-0 bottom-0 h-1/2 bluefire-shape3"></div>

    <!-- 火花 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="(_, i) in 30"
        :key="`spark-${i}`"
        class="absolute rounded-full bluefire-spark"
        :style="{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          bottom: `${Math.random() * 30}%`,
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#60a5fa', '#93c5fd', '#3b82f6', '#2563eb'][Math.floor(Math.random() * 4)],
          opacity: Math.random() * 0.7 + 0.3,
          filter: `blur(${Math.random() * 1}px)`,
          animation: `bluefire-spark ${Math.random() * 2 + 1}s ease-out infinite ${Math.random() * 2}s`,
        }"></div>
    </div>

    <!-- 燃料 - 木や石などのシルエット -->
    <div class="absolute inset-x-0 bottom-0 h-1/6 fuel-silhouette"></div>

    <!-- 熱の歪み効果 -->
    <div class="absolute inset-0 heat-distortion-blue"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10 pt-10">
      <slot>
        <h3 class="text-white text-3xl font-bold bluefire-text">
          BLUE FIRE
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.bluefire-base {
  background: linear-gradient(to bottom, #0c0a24, #172554);
}

.bluefire-layer {
  background: radial-gradient(ellipse at center bottom, rgba(59, 130, 246, 0.5) 0%, rgba(30, 58, 138, 0.3) 50%, transparent 90%);
  animation: bluefire-base-pulse 4s ease-in-out infinite;
}

@keyframes bluefire-base-pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.bluefire-shape1 {
  background:
    radial-gradient(
      ellipse at 20% 100%,
      rgba(59, 130, 246, 0.7) 0%,
      rgba(37, 99, 235, 0.6) 20%,
      rgba(29, 78, 216, 0.4) 40%,
      transparent 80%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(59, 130, 246, 0.7) 0%,
      rgba(37, 99, 235, 0.6) 20%,
      rgba(29, 78, 216, 0.4) 40%,
      transparent 80%
    );
  animation: bluefire-shape1 5s ease-in-out infinite alternate;
}

@keyframes bluefire-shape1 {
  0% { transform: scaleX(1); filter: brightness(1); }
  100% { transform: scaleX(1.1); filter: brightness(1.2); }
}

.bluefire-shape2 {
  background:
    radial-gradient(
      ellipse at 50% 100%,
      rgba(96, 165, 250, 0.7) 0%,
      rgba(59, 130, 246, 0.6) 20%,
      rgba(37, 99, 235, 0.4) 40%,
      transparent 80%
    );
  animation: bluefire-shape2 6s ease-in-out infinite;
}

@keyframes bluefire-shape2 {
  0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.7; }
  50% { transform: translateY(-10px) scaleX(0.9); opacity: 0.9; }
}

.bluefire-shape3 {
  background:
    radial-gradient(
      ellipse at 50% 90%,
      rgba(147, 197, 253, 0.9) 0%,
      rgba(96, 165, 250, 0.8) 10%,
      rgba(59, 130, 246, 0.7) 20%,
      rgba(37, 99, 235, 0.5) 40%,
      transparent 80%
    );
  animation: bluefire-shape3 4s ease-in-out infinite alternate;
  filter: blur(5px);
}

@keyframes bluefire-shape3 {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-20px) scale(1.1); }
}

@keyframes bluefire-spark {
  0% { transform: translate(0, 0); opacity: var(--opacity, 0.5); }
  100% { transform: translate(var(--translateX, 10px), -100px); opacity: 0; }
}

.fuel-silhouette {
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8)),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath d='M0,0 L10,0 L15,10 L30,5 L40,10 L50,5 L60,10 L70,0 L80,10 L90,5 L100,10 L100,20 L0,20 Z' fill='%23000000'/%3E%3C/svg%3E");
  background-size: 200px 100%;
  background-repeat: repeat-x;
  opacity: 0.8;
}

.heat-distortion-blue {
  background: linear-gradient(to top, transparent, rgba(96, 165, 250, 0.1));
  animation: heat-distortion-blue 3s ease-in-out infinite;
  filter: blur(5px);
  opacity: 0.5;
}

@keyframes heat-distortion-blue {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-5px); opacity: 0.7; }
}

.bluefire-text {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(37, 99, 235, 0.6);
  letter-spacing: 2px;
  animation: bluefire-text-glow 3s ease-in-out infinite;
}

@keyframes bluefire-text-glow {
  0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(37, 99, 235, 0.6); }
  50% { text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 25px rgba(59, 130, 246, 1), 0 0 40px rgba(37, 99, 235, 0.8); }
}
</style>
