<script setup lang="ts">
// テーマごとのグラデーション色（カードと同じ透明度を使用）
const themeGradients = {
  blog: `linear-gradient(180deg,
    rgba(16, 152, 173, 0.5) 0%,
    rgba(64, 169, 152, 0.4) 40%,
    rgba(111, 186, 130, 0.2) 70%,
    transparent 100%)`,
  career: `linear-gradient(180deg,
    rgba(59, 130, 246, 0.5) 0%,
    rgba(6, 182, 212, 0.4) 40%,
    rgba(20, 184, 166, 0.2) 70%,
    transparent 100%)`,
  talk: `linear-gradient(180deg,
    rgba(139, 92, 246, 0.5) 0%,
    rgba(168, 85, 247, 0.4) 40%,
    rgba(236, 72, 153, 0.2) 70%,
    transparent 100%)`,
  project: `linear-gradient(180deg,
    rgba(132, 204, 22, 0.5) 0%,
    rgba(163, 230, 53, 0.4) 40%,
    rgba(101, 163, 13, 0.2) 70%,
    transparent 100%)`,
  art: `linear-gradient(180deg,
    rgba(168, 85, 247, 0.5) 0%,
    rgba(236, 72, 153, 0.4) 40%,
    rgba(251, 146, 60, 0.2) 70%,
    transparent 100%)`,
  stack: `linear-gradient(180deg,
    rgba(79, 70, 229, 0.5) 0%,
    rgba(99, 102, 241, 0.4) 40%,
    rgba(129, 140, 248, 0.2) 70%,
    transparent 100%)`,
} as const

type ThemeName = keyof typeof themeGradients

const props = defineProps<{
  theme?: ThemeName
  ui?: {
    headerColor?: string
  }
}>()

const gradientStyle = computed(() => {
  if (!props.theme) return {}
  return {
    backgroundImage: themeGradients[props.theme],
  }
})
</script>

<template>
  <!-- 従来のヘッダー（後方互換性） -->
  <div
    v-if="!theme"
    class="py-10 relative overflow-hidden transition-all duration-300"
    :class="props.ui?.headerColor">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl sm:text-5xl font-wdxl-lubrifont-jp-n text-center text-white tracking-tight">
        <slot name="title"></slot>
      </h1>
      <slot name="description"></slot>
    </div>
  </div>

  <!-- 新デザイン: 透明度グラデーション -->
  <div
    v-else
    class="relative pt-12 pb-16 overflow-visible">
    <!-- グラデーション背景（下に溶ける） -->
    <div
      class="absolute inset-0 -bottom-10"
      :style="gradientStyle">
    </div>
    <!-- コンテンツ -->
    <div class="container mx-auto px-4 relative z-10">
      <h1 class="text-4xl sm:text-5xl font-wdxl-lubrifont-jp-n text-center text-white tracking-tight">
        <slot name="title"></slot>
      </h1>
      <slot name="description"></slot>
    </div>
  </div>
</template>
