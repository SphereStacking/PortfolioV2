<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  data: {
    title: string
    description: string
    date_start: string
    date_end: string
    tags: string[]
    unique_code: string
    projects: {
      title: string
      description: string
      tags: string[]
      icon: string
    }[]
  }
}>()
// const img = useImage()

const open = ref(false)

const date_span = computed(() => {
  if (props.data.date_end) {
    return `${props.data.date_start} ~ ${props.data.date_end}`
  }

  return props.data.date_start + ' ~ current'
})
</script>

<template>
  <div class="flex flex-col border border-white/10 shadow-2xl shadow-zinc-950/50 backdrop-blur-sm rounded-lg group">
    <div class="flex items-center justify-center sticky top-16 z-10" @click="open = !open">
      <div
        :class="[
          'border-x border-b border-white/10 border-t-transparent px-4 shadow-md bg-neutral-700',
          'transition-all duration-500',
          open ? 'w-2/3' : 'w-full',
          open ? 'rounded-b-lg' : 'rounded-lg',
        ]">
        <div class="flex items-center justify-between gap-2 py-1">
          <div class="flex md:items-center md:gap-2 md:flex-row flex-col items-start">
            <span class="whitespace-nowrap text-xs w-25">
              {{ date_span }}
            </span>
            <span class="md:text-lg text-sm font-semibold text-white/90 ">
              {{ data.title }}
            </span>
          </div>
          <div
            class="flex items-center justify-center rounded-full border border-transparent p-0.5 shadow-md backdrop-blur-md transition-all duration-500 group-hover:border-white/10"
            :class="[
              'transition-all duration-500',
              open ? '-rotate-135' : 'rotate-0',
              open ? 'group-hover:bg-error-500' : 'group-hover:bg-primary-500',
            ]">
            <UIcon
              name="mdi:plus"
              size="sm" />
          </div>
        </div>
      </div>
    </div>
    <div
      :class="[
        'transition-all duration-500',
        'overflow-hidden',
        open ? 'max-h-[5000px]' : 'max-h-0',
      ]">
      <ul class="grid grid-cols-1 gap-4 xl:grid-cols-2 p-4">
        <li
          v-for="(project, index) in data.projects"
          :key="index">
          <motion.ul
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: index * 0.1 }"
            class="h-full">
            <ProjectCard :data="project" class="h-full" />
          </motion.ul>
        </li>
      </ul>
    </div>
  </div>
</template>
