<script setup lang="ts">
const props = defineProps<{
  ui?: {
    headerColor?: string
  }
}>()
</script>

<template>
  <!-- ヘッダー背景 -->
  <div
    class="py-10 relative overflow-hidden transition-all duration-300"
    :class="props.ui?.headerColor">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl sm:text-5xl font-monomaniac-one text-center text-white tracking-tight">
        <slot name="title"></slot>
      </h1>
      <slot name="description"></slot>
    </div>
  </div>
</template>
