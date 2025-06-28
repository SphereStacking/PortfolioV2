<script setup lang="ts">
import { motion } from 'motion-v'
import ArticleCard from '~/components/content/ArticleCard.vue'

// URLのクエリパラメータからタグを取得
const route = useRoute()
const selectedTag = computed(() => route.query.tag as string | undefined)

// タグフィルターを適用してデータを取得
const { data } = await useAsyncData(
  () => {
    const query = queryCollection('blog')
      .where('draft', '=', false)
      .order('created', 'DESC')

    return query.all()
  },
  {
    // クエリパラメータが変更されたときに再取得
    watch: [selectedTag],
  },
)

// フィルタリングされたデータ
const filteredPosts = computed(() => {
  if (!selectedTag.value || !data.value) return data.value

  return data.value.filter(post =>
    post.tags?.includes(selectedTag.value!),
  )
})

// タグをクリアする関数
const clearTag = () => {
  navigateTo('/blog')
}
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-emerald-800/70 via-teal-500/70 to-green-200/70' }">
      <template #title>
        Blog
      </template>
    </PageHeader>

    <!-- フィルター表示エリア -->
    <div v-if="selectedTag" class="container mx-auto mt-4 mb-4">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-muted-foreground">タグでフィルター中:</span>
        <Badge class="flex items-center gap-1">
          {{ selectedTag }}
          <Icon
            name="heroicons:x-mark"
            class="w-3 h-3 cursor-pointer hover:opacity-70"
            @click="clearTag" />
        </Badge>
      </div>
    </div>
    <div class="container mx-auto mb-16 mt-8">
      <ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(post, index) in filteredPosts"
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
