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
    <div class="absolute inset-0 pastel-background"></div>

    <!-- ふわふわした雲のような形 -->
    <div class="absolute inset-0 pastel-cloud"></div>

    <!-- 漂う泡 -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 15"
        :key="`bubble-${i}`"
        class="absolute rounded-full pastel-bubble"
        :style="{
          width: `${Math.random() * 30 + 10}px`,
          height: `${Math.random() * 30 + 10}px`,
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(2px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `pastel-bubble ${Math.random() * 15 + 10}s linear infinite`,
        }"></div>
    </div>

    <!-- キラキラ効果 -->
    <div class="absolute inset-0">
      <div
        v-for="(_, i) in 20"
        :key="`twinkle-${i}`"
        class="absolute pastel-twinkle"
        :style="{
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 4 + 2}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          background: 'white',
          boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
          borderRadius: `${Math.random() > 0.5 ? '50%' : '0'}`,
          opacity: Math.random() * 0.5 + 0.2,
          animation: `pastel-twinkle ${Math.random() * 5 + 2}s ease-in-out infinite ${Math.random() * 5}s`,
        }"></div>
    </div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-2xl font-bold px-6 py-2 rounded-lg pastel-text">
          <span
            v-for="(char, index) in 'パステルドリーム'.split('')" :key="index"
            :style="`--char-index: ${index}`"
            class="pastel-char">{{ char }}</span>
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.pastel-background {
  background: linear-gradient(135deg, #F9D1D1, #FAE8E8, #D1E8F9, #F9D1F9);
  background-size: 400% 400%;
  animation: pastel-shift 15s ease infinite;
}

@keyframes pastel-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.pastel-cloud {
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 40%),
              radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.4), transparent 40%);
  filter: blur(30px);
  animation: pastel-cloud 20s ease-in-out infinite alternate;
}

@keyframes pastel-cloud {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(10px, 10px); }
}

@keyframes pastel-bubble {
  0% { transform: translateY(0) translateX(0); opacity: var(--opacity, 0.3); }
  50% { transform: translateY(-40px) translateX(10px); opacity: var(--opacity-mid, 0.6); }
  100% { transform: translateY(-80px) translateX(20px); opacity: 0; }
}

@keyframes pastel-twinkle {
  0%, 100% { transform: scale(1); opacity: var(--opacity, 0.3); }
  50% { transform: scale(1.5); opacity: var(--opacity-mid, 0.5); }
}

.pastel-text {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pastel-char {
  display: inline-block;
  animation: pastel-float 5s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.2s);
  will-change: transform;
}

@keyframes pastel-float {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) translateX(5px) rotate(5deg);
  }
  50% {
    transform: translateY(-5px) translateX(-5px) rotate(-3deg);
  }
  75% {
    transform: translateY(-8px) translateX(3px) rotate(2deg);
  }
}

.pastel-char::before {
  content: '✨';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  font-size: 12px;
  animation: pastel-sparkle 5s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.2s + 1s);
}

@keyframes pastel-sparkle {
  0%, 100% {
    opacity: 0;
    transform: translateX(-50%) translateY(0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) translateY(-10px) scale(1);
  }
}
</style>
