<script setup lang="ts">
import { motion } from 'motion-v'
import type { Slide } from '~~/types/slide'
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
  totalSlideCount: _totalSlideCount,

  // アクション
  setYear,
  resetFilters,
} = useSlides(allSlidesData)
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader theme="talk">
      <template #title>
        Talk
      </template>
      <template #description>
        <p class="text-center text-white/50 text-xs tracking-[0.3em] uppercase mb-8">
          {{ slideCount }} Slides
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <UInput
            v-model="searchQuery"
            placeholder="タイトル、説明で検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <UButton
              v-if="searchQuery || selectedYear"
              variant="outline" size="xs" rounded="full"
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
        </div>
      </UCard>

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
          <UButton variant="default" color="primary" @click="resetFilters">
            フィルターをリセット
          </UButton>
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
