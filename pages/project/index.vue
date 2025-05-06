<script setup lang="ts">
import { motion } from 'motion-v'
import ProjectCard from '~/components/project/ProjectCard.vue'

const { data: pinnedProjects } = await useAsyncData(() => queryCollection('project')
  .where('career_unique_code', 'IS NULL')
  .order('period_start', 'DESC')
  .all(),
)
</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-4xl font-monomaniac-one my-8 text-center">
      My Project
    </h1>
    <ul class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <li
        v-for="(project, index) in pinnedProjects"
        :key="project.id">
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
</template>

<style scoped>

</style>
