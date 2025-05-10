<script setup lang="ts">
import { motion } from 'motion-v'
import CareerCard from '~/components/career/CareerCard.vue'

const { data: careers } = useAsyncData(() => queryCollection('career')
  .all(),
)
const { data: projects } = useAsyncData(() => queryCollection('project')
  .all(),
)

const careersWithProjects = computed(() => {
  return careers.value?.map((career) => {
    return {
      ...career,
      projects: projects.value?.filter(project => project.career_unique_code === career.unique_code),
    }
  })
})
</script>

<template>
  <div class="container md:mx-auto px-2 mb-16">
    <h1 class="text-4xl font-monomaniac-one my-8 text-center">
      Career
    </h1>
    <ul class="grid grid-cols-1 gap-8">
      <li
        v-for="(career, index) in careersWithProjects"
        :key="career.id">
        <motion.ul
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: index * 0.1 }">
          <CareerCard :data="career" />
        </motion.ul>
      </li>
    </ul>
  </div>
</template>
