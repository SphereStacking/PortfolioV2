<script setup lang="ts">
import { motion } from 'motion-v'
import ArticleCard from '~/components/content/ArticleCard.vue'
import { useBlogs } from '~/composables/useBlogs'

// データ取得
const { data: allBlogData } = await useAsyncData(
  'blogs',
  () => queryCollection('blog')
    .where('draft', '=', false)
    .order('created', 'DESC')
    .all(),
)

// コンポーザブルから状態とロジックを取得
const {
  // データ
  filteredPosts,
  availableYears,
  availableMonths,
  availableTags,

  // フィルター状態
  searchQuery,
  selectedYear,
  selectedMonth,
  selectedTag,
  isLoading,

  // カウント
  postCount,
  totalPostCount: _totalPostCount,

  // アクション
  setYear,
  setMonth,
  setTag,
  resetFilters,
} = useBlogs(allBlogData)
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader theme="blog">
      <template #title>
        Blog
      </template>
      <template #description>
        <p class="text-center text-white/50 text-xs tracking-[0.3em] uppercase mb-8">
          {{ postCount }} Articles
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <UInput
            v-model="searchQuery"
            placeholder="タイトル、説明、タグで検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <UButton
              v-if="searchQuery || selectedYear || selectedMonth || selectedTag"
              variant="outline" size="xs" class="rounded-full"
              @click="resetFilters">
              <Icon name="heroicons:x-mark" />
            </UButton>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="container mx-auto px-4 -mt-8 relative z-10">
      <!-- フィルターエリア -->
      <UCard class="p-4 mb-8">
        <div class="flex flex-wrap gap-4">
          <!-- 年フィルター -->
          <USelect
            :model-value="selectedYear"
            :items="[{ label: 'すべての年', value: null }, ...availableYears.map(y => ({ label: `${y}年`, value: y }))]"
            placeholder="年を選択"
            class="w-[180px]"
            @update:model-value="(value) => setYear(value)" />

          <!-- 月フィルター -->
          <USelect
            :model-value="selectedMonth"
            :items="[{ label: 'すべての月', value: null }, ...availableMonths.map(m => ({ label: `${m}月`, value: m }))]"
            :disabled="!selectedYear"
            placeholder="月を選択"
            class="w-[180px]"
            @update:model-value="(value) => setMonth(value)" />

          <!-- タグフィルター -->
          <USelect
            :model-value="selectedTag"
            :items="[{ label: 'すべてのタグ', value: null }, ...availableTags.map(t => ({ label: t, value: t }))]"
            placeholder="タグを選択"
            class="w-[180px]"
            @update:model-value="(value) => setTag(value)" />
        </div>
      </UCard>

      <!-- 記事一覧 -->
      <AsyncStateView
        :fallback="filteredPosts?.length === 0">
        <template #loading>
        </template>
        <template #error>
        </template>
        <template #fallback>
          <div class="text-center py-16 rounded-xl shadow-lg mt-6">
            <Icon name="heroicons:magnifying-glass" class="text-6xl mx-auto mb-6" />
            <h3 class="text-xl font-bold mb-2">
              該当する記事が見つかりませんでした
            </h3>
            <p class="mb-8 max-w-md mx-auto">
              検索条件を変更してみてください。
            </p>
            <UButton variant="solid" color="primary" @click="resetFilters">
              フィルターをリセット
            </UButton>
          </div>
        </template>
        <template #default>
          <ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="(post, index) in filteredPosts"
              :key="post._id">
              <motion.div
                :initial="{ opacity: 0, y: 20 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ duration: 0.5, delay: index * 0.05 }">
                <ArticleCard
                  :data="post" />
              </motion.div>
            </li>
          </ul>
        </template>
      </AsyncStateView>
    </div>
  </div>
</template>
