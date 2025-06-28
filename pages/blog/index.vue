<script setup lang="ts">
import { motion } from 'motion-v'
import ArticleCard from '~/components/content/ArticleCard.vue'

const { data } = await useAsyncData(() => queryCollection('blog')
  .where('draft', '=', false)
  .order('created', 'DESC')
  .all(),
)
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-emerald-800/70 via-teal-500/70 to-green-200/70' }">
      <template #title>
        Blog
      </template>
    </PageHeader>
    <div class="container mx-auto mb-16 mt-8">
      <ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(post, index) in data"
          :key="post.id">
          <motion.ul
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: index * 0.1 }">
            <ArticleCard
              :data="post" />
          </motion.ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

</style>
