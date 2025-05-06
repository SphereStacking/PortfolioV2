<script setup lang="ts">
interface Props {
  data: {
    title: string
    created: string
    updated: string
    image?: string
    path: string
    tags: string[]
    icons?: string[]
  }
}

defineProps<Props>()
</script>

<template>
  <NuxtLink
    :to="data.path"
    :aria-label="data.title"
    class="flex cursor-pointer flex-col gap-2">
    <div class="overflow-hidden rounded-md border border-white/10 shadow-md shadow-zinc-950/50 transition-colors duration-200 hover:border-white/20">
      <template v-if="data.image">
        <div class="aspect-video overflow-hidden">
          <NuxtImg
            width="1536"
            :alt="`${data.title} article image`"
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            :src="data.image"
            :aria-label="`${data.title} article image`" />
        </div>
      </template>
      <template v-else>
        <div
          class="aspect-video flex flex-col gap-2 grow justify-between py-10 px-10 transition-transform duration-300 hover:scale-110"
          :style="{
            backgroundImage: `
              linear-gradient(-30deg, rgba(16,152,173,0.2) 10%, rgb(16,152,173,0.4) 30%, rgb(64,169,152,0.5) 40%, rgb(111,186,130,0.4) 50%, rgba(16,152,173,0.1) 70%)
            `,
          }">
          <div
            class="text-white/50 text-xl flex items-center justify-center gap-4 m-auto w-full"
            :class="[
              data.icons?.length && data.icons.length < 3 ? 'gap-8' : 'gap-4',
            ]">
            <Icon
              v-for="icon in data.icons"
              :key="icon"
              :name="icon"
              class="text-7xl" />
          </div>
        </div>
      </template>
    </div>
    <div class="flex flex-col">
      <h3 class="text-lg font-m-plus-rounded-1c line-clamp-2">
        {{ data.title }}
      </h3>
      <p class="flex gap-1 text-xs text-muted items-center">
        {{ data.created }}
        <template v-if="data.updated">
          <Icon name="mdi:refresh" class="w-4 h-4" />
          {{ data.updated }}
        </template>
      </p>
    </div>
  </NuxtLink>
</template>
