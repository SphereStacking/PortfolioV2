<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const props = defineProps({
  // Intersection Observerのオプション
  threshold: {
    type: [Number, Array],
    default: 0.1,
  },
  rootMargin: {
    type: String,
    default: '0px',
  },
  // 一度表示されたら監視を停止するかどうか
  once: {
    type: Boolean,
    default: false,
  },
  // 初期状態で表示するかどうか
  initiallyVisible: {
    type: Boolean,
    default: false,
  },
  // コンテナのタグ
  tag: {
    type: String,
    default: 'div',
  },
  // コンテナのクラス
  containerClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['visible', 'hidden'])

// 要素の参照
const target = ref(null)

// 可視性の状態
const isVisible = ref(props.initiallyVisible)

// 一度表示されたかどうかのフラグ
const hasBeenVisible = ref(props.initiallyVisible)

// Intersection Observer
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    const wasVisible = isVisible.value
    isVisible.value = isIntersecting

    if (isIntersecting && !wasVisible) {
      hasBeenVisible.value = true
      emit('visible')

      // 一度だけ表示する場合は監視を停止
      if (props.once) {
        stop()
      }
    }
    else if (!isIntersecting && wasVisible) {
      emit('hidden')
    }
  },
  {
    threshold: props.threshold,
    rootMargin: props.rootMargin,
  },
)

// スロットに渡すプロパティ
const slotProps = {
  isVisible,
  hasBeenVisible,
  target,
}
</script>

<template>
  <component
    :is="tag"
    ref="target"
    :class="containerClass">
    <!-- デフォルトスロット: 可視性の状態を渡す -->
    <slot v-bind="slotProps">
      <!-- フォールバックコンテンツ -->
      <div class="text-gray-500 text-center p-4">
        {{ isVisible ? '表示中' : '非表示' }}
      </div>
    </slot>

    <!-- 名前付きスロット: ローディング表示用 -->
    <slot
      v-if="!hasBeenVisible && !isVisible"
      name="loading"
      v-bind="slotProps">
      <!-- ローディングのフォールバック -->
      <div class="text-gray-400 text-center p-4 animate-pulse">
        読み込み中...
      </div>
    </slot>

    <!-- 名前付きスロット: プレースホルダー表示用 -->
    <slot
      v-if="!isVisible && hasBeenVisible"
      name="placeholder"
      v-bind="slotProps">
      <!-- プレースホルダーのフォールバック -->
      <div class="text-gray-300 text-center p-4 opacity-50">
        画面外
      </div>
    </slot>
  </component>
</template>

<style scoped>
/* 基本スタイル */
.intersection-observer {
  min-height: 1px; /* 要素が存在することを保証 */
}
</style>
