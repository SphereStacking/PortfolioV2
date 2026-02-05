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
  totalPostCount,

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
          <Input
            v-model="searchQuery"
            placeholder="タイトル、説明、タグで検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <Button
              v-if="searchQuery || selectedYear || selectedMonth || selectedTag"
              variant="outline" size="xs" rounded="full"
              @click="resetFilters">
              <Icon name="heroicons:x-mark" />
            </Button>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="container mx-auto px-4 -mt-8 relative z-10">
      <!-- フィルターエリア -->
      <Card class="p-4 mb-8">
        <div class="flex flex-wrap gap-4">
          <!-- 年フィルター -->
          <Select
            :model-value="selectedYear"
            @update:model-value="(value) => setYear(value)">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="年を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">
                すべての年
              </SelectItem>
              <SelectItem
                v-for="year in availableYears"
                :key="year"
                :value="year">
                {{ year }}年
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- 月フィルター -->
          <Select
            :model-value="selectedMonth"
            :disabled="!selectedYear"
            @update:model-value="(value) => setMonth(value)">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="月を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">
                すべての月
              </SelectItem>
              <SelectItem
                v-for="month in availableMonths"
                :key="month"
                :value="month">
                {{ month }}月
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- タグフィルター -->
          <Select
            :model-value="selectedTag"
            @update:model-value="(value) => setTag(value)">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="タグを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">
                すべてのタグ
              </SelectItem>
              <SelectItem
                v-for="tag in availableTags"
                :key="tag"
                :value="tag">
                {{ tag }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

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
            <Button variant="default" color="primary" @click="resetFilters">
              フィルターをリセット
            </Button>
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

<style scoped>

</style>
