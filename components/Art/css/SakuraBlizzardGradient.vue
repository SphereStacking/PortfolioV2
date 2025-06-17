<script setup>
import { ref, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

defineProps({
  style: {
    type: Object,
    default: () => ({}),
  },
})

// パフォーマンス最適化：要素の可視性を追跡
const target = ref(null)
const isVisible = ref(false)

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting
  },
  { threshold: 0.1 },
)

onUnmounted(() => {
  stop()
})

// 桜の花びら（30枚）
const petals = ref(Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: 8 + Math.random() * 12,
  left: Math.random() * 100,
  delay: Math.random() * 10,
  duration: 10 + Math.random() * 10,
  swayDuration: 3 + Math.random() * 2,
  opacity: 0.7 + Math.random() * 0.3,
})))
</script>

<template>
  <div
    ref="target"
    :class="['relative overflow-hidden rounded-lg sakura-container size-full']"
    :style="style">
    <!-- 春の空グラデーション -->
    <div class="absolute inset-0 sakura-sky"></div>

    <!-- 遠くの桜の木のシルエット -->
    <div class="absolute inset-x-0 bottom-0 h-2/5 sakura-trees"></div>

    <!-- 桜の花びら -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="petal in petals"
        :key="`petal-${petal.id}`"
        class="sakura-petal"
        :style="{
          'width': `${petal.size}px`,
          'height': `${petal.size}px`,
          'left': `${petal.left}%`,
          'animationDelay': `${petal.delay}s`,
          'animationDuration': `${petal.duration}s`,
          '--sway-duration': `${petal.swayDuration}s`,
          'opacity': petal.opacity,
        }"></div>
    </div>

    <!-- 舞い散る小さな花びら -->
    <div class="absolute inset-0 sakura-particle-container"></div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold sakura-text">
          桜吹雪
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.sakura-container {
  transform: translateZ(0);
  will-change: auto;
}

.sakura-sky {
  background: linear-gradient(180deg,
    #fce4ec 0%,
    #f8bbd0 30%,
    #f48fb1 60%,
    #f06292 100%
  );
}

.sakura-trees {
  background: linear-gradient(to top,
    rgba(136, 14, 79, 0.3) 0%,
    rgba(136, 14, 79, 0.2) 50%,
    transparent 100%
  );
  mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,400 C100,350 150,300 200,320 C250,340 300,280 400,300 C500,320 600,250 700,280 C800,310 900,260 1000,290 C1100,320 1150,300 1200,350 L1200,400 Z' fill='black'/%3E%3C/svg%3E");
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
}

.sakura-petal {
  position: absolute;
  background: radial-gradient(circle at 30% 30%,
    #ffc0cb 0%,
    #ffb6c1 50%,
    #ff69b4 100%
  );
  border-radius: 0 100% 0 100%;
  transform-origin: center;
  top: -20vh;
  animation: petal-fall linear infinite;
  will-change: transform;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes petal-fall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  25% {
    transform: translateY(32.5vh) translateX(30px) rotate(90deg);
  }
  50% {
    transform: translateY(65vh) translateX(-20px) rotate(180deg);
  }
  75% {
    transform: translateY(97.5vh) translateX(40px) rotate(270deg);
  }
  100% {
    transform: translateY(130vh) translateX(0) rotate(360deg);
  }
}

.sakura-particle-container {
  background-image: radial-gradient(circle,
    rgba(255, 192, 203, 0.8) 1px,
    transparent 1px
  );
  background-size: 50px 50px;
  animation: particle-drift 20s linear infinite;
  opacity: 0.3;
}

@keyframes particle-drift {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50px, 50px);
  }
}

.sakura-text {
  color: #fff;
  text-shadow:
    0 2px 10px rgba(136, 14, 79, 0.5),
    0 0 20px rgba(255, 192, 203, 0.5);
  letter-spacing: 4px;
}
</style>
