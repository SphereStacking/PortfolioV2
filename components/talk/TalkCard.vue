<script setup lang="ts">
import type { Slide } from '~/types/slide'
import { formatDateJa } from '~/utils/date'

interface Props {
  data: Slide
}

defineProps<Props>()
</script>

<template>
  <NuxtLink
    :to="`/talk/${data.slug}`"
    :aria-label="data.title"
    class="flex cursor-pointer flex-col gap-2">
    <div class="relative overflow-hidden rounded-md border border-white/10 shadow-md shadow-zinc-950/50 transition-colors duration-200 hover:border-white/20">
      <div
        class="aspect-video flex flex-col gap-2 justify-center items-center py-10 px-10 transition-transform duration-300 hover:scale-110"
        :style="{
          backgroundImage: `
            linear-gradient(-30deg, rgba(139,92,246,0.3) 10%, rgba(139,92,246,0.5) 30%, rgba(168,85,247,0.6) 40%, rgba(236,72,153,0.5) 50%, rgba(139,92,246,0.2) 70%)
          `,
        }">
        <Icon
          :name="data.icon || 'heroicons:presentation-chart-bar'"
          class="text-7xl text-white/60" />
      </div>
    </div>
    <div class="flex flex-col">
      <h3 class="text-lg font-m-plus-rounded-1c line-clamp-2">
        {{ data.title }}
      </h3>
      <p class="text-sm text-muted-foreground line-clamp-2">
        {{ data.description }}
      </p>
      <p class="text-xs text-muted mt-1">
        {{ formatDateJa(data.date) }}
      </p>
    </div>
  </NuxtLink>
</template>
