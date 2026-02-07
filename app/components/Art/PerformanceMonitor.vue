<script setup>
import { ref, computed } from 'vue'
import { useRafFn, useMemory, useToggle } from '@vueuse/core'

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
  position: {
    type: String,
    default: 'top-left', // top-left, top-right, bottom-left, bottom-right
  },
})

// VueUse composables
const [isVisible, toggleVisibility] = useToggle(false)
const memory = useMemory()

// FPS計算用
const fps = ref(0)
const frameCount = ref(0)
const lastTime = ref(performance.now())

// レンダリング時間計算用
const renderTime = ref(0)
const frameStart = ref(0)

// FPS更新ロジック
const updateFPS = () => {
  frameCount.value++
  const now = performance.now()
  const elapsed = now - lastTime.value

  if (elapsed >= 1000) {
    fps.value = Math.round(frameCount.value * 1000 / elapsed)
    frameCount.value = 0
    lastTime.value = now
  }

  // レンダリング時間計算
  if (frameStart.value) {
    renderTime.value = Math.round((now - frameStart.value) * 100) / 100
  }
  frameStart.value = now
}

// requestAnimationFrameを使用したFPS監視
const { pause, resume } = useRafFn(updateFPS, { immediate: props.enabled })

// メモリ使用量（MB）
const memoryUsage = computed(() => {
  return memory.value?.usedJSHeapSize
    ? Math.round(memory.value.usedJSHeapSize / 1024 / 1024)
    : 0
})

// パフォーマンス状態の計算
const performanceStatus = computed(() => {
  if (fps.value >= 50 && renderTime.value < 16.67) return '良好'
  if (fps.value >= 30 && renderTime.value < 33.33) return '普通'
  return '重い'
})

// 位置クラス
const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
}

// パネルの展開方向を決定
const isBottomPosition = computed(() =>
  props.position.includes('bottom'),
)

// パネルのクラスを動的に決定
const panelClasses = computed(() => {
  const baseClasses = 'bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono min-w-[160px] backdrop-blur-sm border border-gray-700'

  if (isBottomPosition.value) {
    return `${baseClasses} mb-2` // bottom位置の場合は上に展開
  }
  else {
    return `${baseClasses} mt-2` // top位置の場合は下に展開
  }
})

// コンテナのflexクラスを動的に決定
const containerClasses = computed(() => {
  const baseClasses = 'fixed z-50 performance-monitor flex'
  const flexDirection = isBottomPosition.value ? 'flex-col-reverse' : 'flex-col'
  return `${baseClasses} ${flexDirection} ${positionClasses[props.position]}`
})

// FPSの色分け
const fpsColor = computed(() => {
  if (fps.value >= 50) return 'text-green-400'
  if (fps.value >= 30) return 'text-yellow-400'
  return 'text-red-400'
})

// メモリの色分け
const memoryColor = computed(() => {
  if (memoryUsage.value < 50) return 'text-green-400'
  if (memoryUsage.value < 100) return 'text-yellow-400'
  return 'text-red-400'
})

// レンダリング時間の色分け
const renderColor = computed(() => {
  if (renderTime.value < 16.67) return 'text-green-400'
  if (renderTime.value < 33.33) return 'text-yellow-400'
  return 'text-red-400'
})

// ステータスの色分け
const statusColor = computed(() => {
  if (performanceStatus.value === '良好') return 'text-green-400'
  if (performanceStatus.value === '普通') return 'text-yellow-400'
  return 'text-red-400'
})

// 有効/無効の切り替え
const toggleEnabled = () => {
  if (props.enabled) {
    if (isVisible.value) {
      pause()
    }
    else {
      resume()
    }
  }
  toggleVisibility()
}
</script>

<template>
  <div
    v-if="enabled"
    :class="containerClasses">
    <!-- トグルボタン -->
    <button
      class="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-mono hover:bg-opacity-90 transition-all hover:scale-105"
      @click="toggleEnabled">
      📊 {{ isVisible ? '隠す' : '表示' }}
    </button>

    <!-- 統計情報パネル -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2">
      <div
        v-if="isVisible"
        :class="panelClasses">
        <div class="space-y-1">
          <!-- FPS -->
          <div class="flex justify-between items-center">
            <span>FPS:</span>
            <span :class="fpsColor">{{ fps }}</span>
          </div>

          <!-- メモリ使用量 -->
          <div v-if="memoryUsage > 0" class="flex justify-between items-center">
            <span>Memory:</span>
            <span :class="memoryColor">{{ memoryUsage }}MB</span>
          </div>

          <!-- レンダリング時間 -->
          <div class="flex justify-between items-center">
            <span>Render:</span>
            <span :class="renderColor">{{ renderTime }}ms</span>
          </div>

          <!-- パフォーマンス評価 -->
          <div class="border-t border-gray-600 pt-1 mt-2">
            <div class="flex justify-between items-center">
              <span>Status:</span>
              <span :class="statusColor">{{ performanceStatus }}</span>
            </div>
          </div>

          <!-- 詳細情報（メモリが利用可能な場合） -->
          <div v-if="memory?.totalJSHeapSize" class="border-t border-gray-600 pt-1 mt-2 text-[10px] text-gray-400">
            <div class="flex justify-between">
              <span>Total:</span>
              <span>{{ Math.round(memory.totalJSHeapSize / 1024 / 1024) }}MB</span>
            </div>
            <div class="flex justify-between">
              <span>Limit:</span>
              <span>{{ Math.round(memory.jsHeapSizeLimit / 1024 / 1024) }}MB</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.performance-monitor {
  user-select: none;
  pointer-events: auto;
}
</style>
