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
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-green-800 via-green-500 to-green-200' }">
      <template #title>
        Career
      </template>
    </PageHeader>
    <div class="container md:mx-auto px-2 mb-16 mt-8">
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
  </div>
</template>
