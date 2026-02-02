<script setup lang="ts">
import { motion } from 'motion-v'
import type { Slide } from '~/types/slide'
import { useSlides } from '~/composables/useSlides'

// 外部APIからデータ取得
const { data: allSlidesData, pending, error } = await useFetch<Slide[]>(
  'https://slides.spherestacking.com/api/slides',
)

// コンポーザブルから状態とロジックを取得
const {
  // データ
  filteredSlides,
  availableYears,

  // フィルター状態
  searchQuery,
  selectedYear,
  isLoading,

  // カウント
  slideCount,
  totalSlideCount,

  // アクション
  setYear,
  resetFilters,
} = useSlides(allSlidesData)
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-purple-800/70 via-violet-500/70 to-pink-200/70' }">
      <template #title>
        Talk
      </template>
      <template #description>
        <p class="text-center text-white/90 text-lg mb-8 max-w-3xl mx-auto">
          {{ slideCount === totalSlideCount ? `${slideCount}件のスライド` : `${slideCount} / ${totalSlideCount}件のスライド` }}
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <Input
            v-model="searchQuery"
            placeholder="タイトル、説明で検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <Button
              v-if="searchQuery || selectedYear"
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
        </div>
      </Card>

      <!-- ローディング状態 -->
      <div v-if="pending" class="text-center py-16">
        <Icon name="heroicons:arrow-path" class="text-4xl animate-spin mx-auto mb-4" />
        <p class="text-muted-foreground">
          スライドを読み込み中...
        </p>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="error" class="text-center py-16 rounded-xl shadow-lg bg-card">
        <Icon name="heroicons:exclamation-triangle" class="text-6xl mx-auto mb-6 text-destructive" />
        <h3 class="text-xl font-bold mb-2">
          データの取得に失敗しました
        </h3>
        <p class="mb-8 max-w-md mx-auto text-muted-foreground">
          しばらくしてからもう一度お試しください。
        </p>
      </div>

      <!-- スライド一覧 -->
      <template v-else>
        <div v-if="filteredSlides.length === 0" class="text-center py-16 rounded-xl shadow-lg mt-6">
          <Icon name="heroicons:magnifying-glass" class="text-6xl mx-auto mb-6" />
          <h3 class="text-xl font-bold mb-2">
            該当するスライドが見つかりませんでした
          </h3>
          <p class="mb-8 max-w-md mx-auto">
            検索条件を変更してみてください。
          </p>
          <Button variant="default" color="primary" @click="resetFilters">
            フィルターをリセット
          </Button>
        </div>

        <ul v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="(slide, index) in filteredSlides"
            :key="slide.slug">
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.5, delay: index * 0.05 }">
              <TalkCard :data="slide" />
            </motion.div>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>
