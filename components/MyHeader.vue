<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'modal',
  },
  toggleSide: {
    type: String,
    default: 'right',
    validator: value => ['left', 'right'].includes(value),
  },
  toggle: {
    type: Object,
    default: () => ({}),
  },
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
  { label: 'Career', to: '/career' },
  { label: 'MyProject', to: '/project' },
]
</script>

<template>
  <header class="relative border-b border-gray-200 backdrop-blur-xs ">
    <!-- ヘッダー -->
    <div class="container md:mx-auto px-2 h-16 sticky top-0">
      <div class="h-full">
        <div class="flex items-center justify-between gap-3 h-full">
          <!-- 左側 -->
          <div class="lg:flex-1 flex items-center gap-1.5">
            <div v-if="toggleSide === 'left'" class="lg:hidden">
              <button
                class="p-1.5 rounded-md"
                aria-label="Toggle menu"
                @click="isOpen = !isOpen">
                <Icon v-if="isOpen" name="heroicons:x-mark" class="w-5 h-5" />
                <Icon v-else name="heroicons:bars-3" class="w-5 h-5" />
              </button>
            </div>
            <AppMark />
          </div>

          <!-- 中央 -->
          <div class="flex">
          </div>

          <!-- 右側 -->
          <div class="flex items-center justify-end lg:flex-1 gap-1.5">
            <nav :class="['flex', 'flex-row items-center gap-0.5']">
              <NuxtLink
                v-for="(item, index) in items"
                :key="index"
                :href="item.to"
                :target="item.target"
                :class="[
                  'flex items-center gap-2 px-3 py-1.5 text-lg font-monomaniac-one',
                  item.active
                    ? 'text-primary font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                ]">
                <span v-if="item.icon" :class="item.icon"></span>
                {{ item.label }}
              </NuxtLink>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
</style>
