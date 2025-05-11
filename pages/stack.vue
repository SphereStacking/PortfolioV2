<script setup lang="ts">
import { motion } from 'motion-v'
import { useMyStack } from '~/composables/useMyStack'

// コンポーザブルからすべての状態とロジックを取得
const {
  // データ
  techTypes,
  getTag,
  getTechType,

  // フィルター状態
  searchQuery,
  debouncedSearch,
  selectedType,
  isLoading,

  // 計算されたデータ
  filteredTechnologies,
  techCount,
  totalTechCount,
  techCountByType,

  // アクション
  setTechType,
  resetFilters,
} = useMyStack()
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-teal-800 via-teal-500 to-teal-200' }">
      <template #title>
        My Tech Stack
      </template>
      <template #description>
        <p class="text-center text-white/90 text-lg mb-8 max-w-3xl mx-auto">
          {{ techCount === totalTechCount ? `${techCount}件の技術スタック` : `${techCount} / ${totalTechCount}件の技術スタック` }}
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <UInput
            v-model="searchQuery"
            placeholder="技術名やタグで検索..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
            class="w-full shadow-lg rounded-full border-0 transition-all">
            <template #trailing>
              <div class="flex items-center">
                <Icon v-if="isLoading" name="i-heroicons-arrow-path" class="animate-spin mr-2 text-gray-400" />
                <UButton
                  v-if="searchQuery || selectedType"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  @click="resetFilters" />
              </div>
            </template>
          </UInput>
        </div>
      </template>
    </PageHeader>
    <div class="container mx-auto px-4 -mt-8 relative z-10">
      <!-- 技術タイプとソートオプション -->
      <div class="rounded-xl shadow-lg p-4 mb-8 bg-zinc-900">
        <!-- タイプフィルター -->
        <div class="flex flex-wrap gap-2">
          <!-- すべて表示ボタン -->
          <UButton
            :color="techCount === totalTechCount ? 'primary' : 'neutral'"
            :variant="techCount === totalTechCount ? 'solid' : 'ghost'"
            class="rounded-full whitespace-nowrap"
            @click="resetFilters">
            <UIcon name="i-heroicons-eye" class="mr-1" />
            すべて
            <UBadge
              :color="techCount === totalTechCount ? 'primary' : 'neutral'"
              :variant="techCount === totalTechCount ? 'solid' : 'soft'"
              class="ml-2">
              {{ totalTechCount }}
            </UBadge>
          </UButton>
          <UButton
            v-for="type in techTypes"
            :key="type.id"
            :color="selectedType === type.id ? 'primary' : 'neutral'"
            :variant="selectedType === type.id ? 'solid' : 'ghost'"
            class="rounded-full whitespace-nowrap"
            @click="setTechType(type.id)">
            <UIcon :name="type.icon" class="mr-1" />
            {{ type.name }}
            <UBadge
              :color="selectedType === type.id ? 'primary' : 'neutral'"
              :variant="selectedType === type.id ? 'solid' : 'soft'"
              class="ml-2">
              {{ techCountByType[type.id] || 0 }}
            </UBadge>
          </UButton>
        </div>
      </div>

      <!-- 技術スタック一覧 -->
      <AsyncStateView
        :fallback="filteredTechnologies.length === 0">
        <template #loading>
        </template>
        <template #error>
        </template>
        <template #fallback>
          <div class="text-center py-16 rounded-xl shadow-lg mt-6">
            <UIcon name="i-heroicons-magnifying-glass" class="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              該当する技術が見つかりませんでした
            </h3>
            <p class="text-gray-500 mb-8 max-w-md mx-auto">
              「{{ debouncedSearch }}」に一致する技術やタグは見つかりませんでした。検索条件を変更してみてください。
            </p>
            <UButton
              variant="solid" color="primary"
              @click="resetFilters">
              フィルターをリセット
            </UButton>
          </div>
        </template>
        <template #default>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              v-for="(tech, index) in filteredTechnologies" :key="tech.id"
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.5, delay: index * 0.05 }"
              class="size-full">
              <UCard

                class="group size-full hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-zinc-900">
                <NuxtLink
                  :to="tech.link ?? '#'"
                  target="_blank"
                  class="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity duration-300">
                  <div
                    class="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden">
                    <SkillIcon :stack="tech.id" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold flex items-center group-hover:text-primary-500 transition-colors">
                      {{ tech.name }}
                    </h3>
                    <div class="text-xs text-gray-500 mt-1 flex items-center">
                      <UIcon :name="techTypes.find(t => t.id === getTechType(tech))?.icon || 'i-heroicons-code-bracket'" class="mr-1" />
                      {{ techTypes.find(t => t.id === getTechType(tech))?.name || '技術' }}
                    </div>
                  </div>
                </NuxtLink>

                <!-- タグ一覧 -->
                <div v-if="tech.tags && tech.tags.length > 0" class="mt-4">
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="tagId in tech.tags"
                      :key="tagId"
                      :color="getTag(tagId)?.color || 'neutral'"
                      variant="soft"
                      size="sm">
                      {{ getTag(tagId)?.name }}
                    </UBadge>
                  </div>
                </div>
              </UCard>
            </motion.div>
          </div>
        </template>
      </AsyncStateView>
    </div>
  </div>
</template>

<style scoped>
</style>
