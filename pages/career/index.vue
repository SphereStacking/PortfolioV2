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
      projects: projects.value?.filter(project => project.career_unique_code === career.unique_code)
        .map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          tags: project.tags,
          icon: project.icon,
          period_start: project.period_start,
          period_end: project.period_end,
          pinned: project.pinned,
          stacks: project.stacks,
          overview: project.overview,
          tasks: project.tasks,
          team: project.team,
          role: project.role,
          links: project.links,
        })) || [],
    }
  })
})
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-green-800/70 via-green-500/70 to-green-200/70' }">
      <template #title>
        Career
      </template>
    </PageHeader>
    <div class="container mx-auto mb-16 mt-8">
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
