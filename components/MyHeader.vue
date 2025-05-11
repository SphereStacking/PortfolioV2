<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(props.modelValue)

// モデル値の変更を監視
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

// 内部状態が変更されたときにイベントを発生
watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
})

const items = [
  { label: 'Blog', to: '/blog' },

  {
    label: 'Me',
    children: [
      { label: 'Career', to: '/career' },
      { label: 'Stack', to: '/stack' },
    ],
  },
  { label: 'Project', to: '/project' },
]
</script>

<template>
  <header class="relative border-b border-gray-200 backdrop-blur-xs ">
    <!-- ヘッダー -->
    <div class="container md:mx-auto px-2 h-16  sticky top-0">
      <div class="h-full">
        <div class="flex items-center justify-between gap-3 h-full">
          <!-- 左側 -->
          <div class="lg:flex-1 flex items-center gap-1.5">
            <AppMark />
          </div>

          <!-- 中央 -->
          <div class="flex">
          </div>

          <!-- 右側 -->
          <div class="flex items-center justify-end lg:flex-1 gap-1.5">
            <UNavigationMenu :items="items" class="font-monomaniac-one text-lg" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
</style>
