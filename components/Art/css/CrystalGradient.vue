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
  { threshold: 0.1 }
)

onUnmounted(() => {
  stop()
})

// 結晶の面を定義（最適化: 固定配置で再計算を防ぐ）
const crystalFaces = ref([
  {
    width: 120,
    height: 150,
    top: 20,
    left: 45,
    rotate: -10,
    gradient: 'linear-gradient(135deg, rgba(191, 219, 254, 0.9), rgba(147, 197, 253, 0.7), rgba(59, 130, 246, 0.5))',
    opacity: 0.8,
    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
    boxShadow: '0 0 20px rgba(96, 165, 250, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.5)',
    duration: 10,
    delay: 0,
  },
  {
    width: 100,
    height: 120,
    top: 30,
    left: 55,
    rotate: 20,
    gradient: 'linear-gradient(135deg, rgba(196, 181, 253, 0.9), rgba(167, 139, 250, 0.7), rgba(139, 92, 246, 0.5))',
    opacity: 0.7,
    borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.5)',
    duration: 12,
    delay: 1,
  },
  {
    width: 80,
    height: 100,
    top: 40,
    left: 35,
    rotate: -15,
    gradient: 'linear-gradient(135deg, rgba(226, 232, 240, 0.9), rgba(203, 213, 225, 0.7), rgba(148, 163, 184, 0.5))',
    opacity: 0.6,
    borderRadius: '30% 70% 70% 30% / 50% 30% 70% 50%',
    boxShadow: '0 0 15px rgba(148, 163, 184, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.5)',
    duration: 15,
    delay: 2,
  },
  {
    width: 150,
    height: 80,
    top: 60,
    left: 45,
    rotate: 5,
    gradient: 'linear-gradient(135deg, rgba(224, 242, 254, 0.9), rgba(186, 230, 253, 0.7), rgba(125, 211, 252, 0.5))',
    opacity: 0.8,
    borderRadius: '70% 30% 50% 50% / 30% 40% 60% 70%',
    boxShadow: '0 0 25px rgba(125, 211, 252, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.5)',
    duration: 8,
    delay: 3,
  },
])

// 氷の亀裂を定義（最適化: 3→2要素に削減）
const iceCracks = ref([
  {
    width: 2,
    height: 100,
    top: 30,
    left: 40,
    rotate: 45,
    gradient: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3))',
    opacity: 0.6,
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
  },
  {
    width: 2,
    height: 80,
    top: 40,
    left: 60,
    rotate: -30,
    gradient: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3))',
    opacity: 0.5,
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
  },
])
</script>

<template>
  <div
    ref="target"
    :class="['relative overflow-hidden rounded-lg size-full']"
    :style="style">
    <div class="absolute inset-0 crystal-background"></div>

    <!-- 氷の結晶構造 -->
    <div class="absolute inset-0 crystal-structure"></div>

    <!-- 結晶の面 -->
    <div
      v-for="(face, i) in crystalFaces"
      v-if="isVisible"
      :key="`face-${i}`"
      class="absolute crystal-face"
      :style="{
        width: `${face.width}px`,
        height: `${face.height}px`,
        top: `${face.top}%`,
        left: `${face.left}%`,
        transform: `rotate(${face.rotate}deg)`,
        background: face.gradient,
        opacity: face.opacity,
        borderRadius: face.borderRadius,
        boxShadow: face.boxShadow,
        animation: `crystal-face-animation ${face.duration}s ease-in-out infinite ${face.delay}s`,
      }"></div>

    <!-- 光の反射 -->
    <div class="absolute inset-0 crystal-light-reflection"></div>

    <!-- キラキラエフェクト（最適化: 30→12要素）-->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="(_, i) in 12"
        :key="`sparkle-${i}`"
        class="absolute rounded-full crystal-sparkle"
        :style="{
          width: `${2 + (i % 2)}px`,
          height: `${2 + (i % 2)}px`,
          top: `${(i * 8.3) % 100}%`,
          left: `${(i * 8.3 + 10) % 100}%`,
          backgroundColor: 'white',
          opacity: 0.5 + (i % 3) * 0.2,
          boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
          animation: `crystal-sparkle-animation ${3 + (i % 3)}s ease-in-out infinite ${i * 0.4}s`,
          transform: 'translateZ(0)',
          willChange: 'transform',
        }"></div>
    </div>

    <!-- 氷の亀裂 -->
    <div v-if="isVisible" class="absolute inset-0">
      <div
        v-for="(crack, i) in iceCracks"
        :key="`crack-${i}`"
        class="absolute crystal-crack"
        :style="{
          width: `${crack.width}px`,
          height: `${crack.height}px`,
          top: `${crack.top}%`,
          left: `${crack.left}%`,
          transform: `rotate(${crack.rotate}deg)`,
          background: crack.gradient,
          opacity: crack.opacity,
          boxShadow: crack.boxShadow,
        }"></div>
    </div>

    <div class="absolute inset-0 flex items-center justify-center z-10">
      <slot>
        <h3 class="text-white text-3xl font-bold crystal-text">
          CRYSTAL
        </h3>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.crystal-background {
  background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
}

.crystal-structure {
  background:
    radial-gradient(circle at 40% 40%, rgba(203, 213, 225, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 60% 60%, rgba(186, 230, 253, 0.1) 0%, transparent 50%);
  filter: blur(10px);
}

.crystal-face {
  will-change: transform, opacity;
  backface-visibility: hidden;
}

@keyframes crystal-face-animation {
  0%, 100% { 
    transform: rotate(0deg) scale(1) translateZ(0); 
    opacity: 0.7;
  }
  50% { 
    transform: rotate(5deg) scale(1.05) translateZ(0); 
    opacity: 0.8;
  }
}

.crystal-light-reflection {
  background: linear-gradient(45deg, transparent, transparent, rgba(255, 255, 255, 0.1), transparent, transparent);
  background-size: 200% 200%;
  animation: light-sweep 8s ease-in-out infinite;
  transform: translateZ(0);
  will-change: background-position;
  backface-visibility: hidden;
}

@keyframes light-sweep {
  0% { background-position: -100% -100%; }
  50% { background-position: 200% 200%; }
  100% { background-position: -100% -100%; }
}

.crystal-sparkle {
  will-change: transform, opacity;
  backface-visibility: hidden;
}

@keyframes crystal-sparkle-animation {
  0%, 100% { 
    transform: scale(1) translateZ(0); 
    opacity: 0.5;
  }
  50% { 
    transform: scale(1.5) translateZ(0); 
    opacity: 0.8;
  }
}

.crystal-text {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(186, 230, 253, 0.8);
  letter-spacing: 3px;
  animation: crystal-text-shimmer 5s ease-in-out infinite;
}

@keyframes crystal-text-shimmer {
  0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(186, 230, 253, 0.8); }
  50% { text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(186, 230, 253, 1), 0 0 40px rgba(125, 211, 252, 0.8); }
}
</style>
