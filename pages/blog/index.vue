<script setup lang="ts">
import { motion } from 'motion-v'
import ArticleCard from '~/components/content/ArticleCard.vue'

const { data } = await useAsyncData(() => queryCollection('blog')
  .where('draft', '=', false)
  .all(),
)
</script>

<template>
  <ThreeColumnLayout
    :left="false"
    :main="{ class: 'col-span-12' }"
    :right="false">
    <div class="container mx-auto">
      <h1 class="text-4xl font-monomaniac-one my-8 text-center">
        Blog
      </h1>
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
  </ThreeColumnLayout>
</template>

<style scoped>

</style>
