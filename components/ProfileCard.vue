<script setup lang="ts">
import HoverTilt from './HoverTilt.vue'
import { useMyProfile } from '~/composables/useMyProfile'

const props = defineProps<{
  size?: 'default' | 'large'
}>()

const cardRef = ref<InstanceType<typeof HoverTilt> | null>(null)
const { encounterMessage } = useEncounterRecord()
const myProfile = useMyProfile()

// フリップ状態
const isFlipped = ref(false)

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
}

const mousePosition = computed(() => {
  return {
    x: cardRef.value?.mousePosition.x,
    y: cardRef.value?.mousePosition.y,
  }
})

// サイズに応じたクラス
const sizeClasses = computed(() => {
  if (props.size === 'large') {
    return 'w-[90vw] md:w-[85vw] lg:w-[75vw] max-w-5xl'
  }
  return 'w-90 md:w-140 scale-80 md:scale-100'
})
</script>

<template>
  <HoverTilt
    ref="cardRef"
    :class="[
      'flex flex-col',
      sizeClasses,
      'p-2 border-2 rounded-xl border-gray-800/90',
      'aspect-[1/1.65] md:aspect-[1.65/1]',
      'transition-all duration-200 ease-out',
      'hover:shadow-[0_0_20px_rgba(16,152,173,0.3)]',
      'hover:border-teal-500/50',
      'backdrop-blur',
    ]"
    :style="{
      backgroundImage: `
        radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16,152,173,0.3) 0%, transparent 20%),
        linear-gradient(-30deg, transparent 20%, rgb(16,152,173,40%) 30%, rgb(64,169,152,50%) 40%, rgb(111,186,130,40%) 50%, transparent 70%)
      `,
    }">
    <div class="flex flex-col md:flex-row grow">
      <!-- フリップカード -->
      <div
        class="md:w-5/12 md:mt-10 mx-2 h-3/5 md:h-auto cursor-pointer perspective-1000"
        @click="toggleFlip">
        <div
          class="relative w-full h-full transition-transform duration-700 transform-style-3d"
          :class="isFlipped ? 'rotate-y-180' : ''">
          <!-- 表面: キャラクター -->
          <div class="absolute inset-0 backface-hidden rounded-md overflow-hidden flex items-center justify-center">
            <img src="/favicon.svg" alt="character" class="w-4/5 h-4/5 object-contain drop-shadow-lg">
          </div>
          <!-- 裏面: アバター -->
          <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-md overflow-hidden">
            <img :src="myProfile.profileImagePath" alt="avatar" class="object-cover w-full h-full">
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2 md:w-7/12 md:my-auto h-2/5 md:h-auto">
        <h1 class="text-5xl font-medium text-white mx-auto font-wdxl-lubrifont-jp-n text-nowrap">
          {{ myProfile.name }}
        </h1>
        <p class="text-white text-md mx-auto">
          <template v-for="(part, index) in myProfile.description" :key="index">
            <span :class="part.class">{{ part.text }}</span>
          </template>
        </p>
        <div class="flex flex-col row-span-2 gap-2 items-left mx-auto">
          <template v-if="myProfile?.links">
            <NuxtLink
              v-for="link in Object.values(myProfile.links)"
              :key="link.name"
              :to="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 group">
              <span
                class="flex items-center justify-center transition-all duration-300 rounded-full bg-teal-700/50 size-8 group-hover:bg-teal-700/70 group-hover:scale-110 group-active:scale-95">
                <Icon :name="link.icon" />
              </span>
              <span
                class="text-xs transition-all duration-300 text-gray-400 font-bold group-hover:scale-105 origin-top-left">
                {{ link.url }}
              </span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
    <div class="text-xs text-gray-400 md:ml-5 md:text-left text-center">
      <ClientOnly fallback-tag="span" fallback="Loading comments...">
        <span v-if="encounterMessage">
          {{ encounterMessage }}
        </span>
      </ClientOnly>
    </div>
  </HoverTilt>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
