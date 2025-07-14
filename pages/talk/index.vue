<script setup lang="ts">
import { motion } from 'motion-v'
import { useTalks } from '~/composables/useTalks'

// データ取得
const { data: allTalksData } = await useAsyncData(
  'talks',
  () => queryCollection('talk')
    .where('draft', '=', false)
    .order('event_date', 'DESC')
    .all(),
)

// コンポーザブルから状態とロジックを取得
const {
  // データ
  talkTypes,
  filteredTalks,
  availableYears,
  availableTags,

  // フィルター状態
  searchQuery,
  selectedYear,
  selectedType,
  selectedTag,
  isLoading,

  // カウント
  talkCount,
  totalTalkCount,
  talkCountByYear,
  talkCountByType,
  talkCountByTag,

  // アクション
  setYear,
  setType,
  setTag,
  resetFilters,
} = useTalks(allTalksData)
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-purple-800/70 via-violet-500/70 to-pink-200/70' }">
      <template #title>
        Talk
      </template>
      <template #description>
        <p class="text-center text-white/90 text-lg mb-8 max-w-3xl mx-auto">
          {{ talkCount === totalTalkCount ? `${talkCount}件の発表` : `${talkCount} / ${totalTalkCount}件の発表` }}
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <Input
            v-model="searchQuery"
            placeholder="タイトル、イベント名、タグで検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <Button
              v-if="searchQuery || selectedYear || selectedType || selectedTag"
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

          <!-- タイプフィルター -->
          <Select
            :model-value="selectedType"
            @update:model-value="(value) => setType(value)">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="タイプを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">
                すべてのタイプ
              </SelectItem>
              <SelectItem
                v-for="(typeInfo, typeKey) in talkTypes"
                :key="typeKey"
                :value="typeKey">
                {{ typeInfo.name }}
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

      <!-- トーク一覧 -->
      <AsyncStateView
        :fallback="filteredTalks.length === 0">
        <template #loading>
        </template>
        <template #error>
        </template>
        <template #fallback>
          <div class="text-center py-16 rounded-xl shadow-lg mt-6">
            <Icon name="heroicons:magnifying-glass" class="text-6xl mx-auto mb-6" />
            <h3 class="text-xl font-bold mb-2">
              該当する発表が見つかりませんでした
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
              v-for="(talk, index) in filteredTalks"
              :key="talk.id">
              <motion.ul
                :initial="{ opacity: 0, y: 20 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ duration: 0.5, delay: index * 0.05 }">
                <TalkCard
                  :data="talk" />
              </motion.ul>
            </li>
          </ul>
        </template>
      </AsyncStateView>
    </div>
  </div>
</template>

<style scoped>
</style>
