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
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-teal-800/70 via-teal-500/70 to-teal-200/80' }">
      <template #title>
        My Tech Stack
      </template>
      <template #description>
        <p class="text-center text-white/90 text-lg mb-8 max-w-3xl mx-auto">
          {{ techCount === totalTechCount ? `${techCount}件の技術スタック` : `${techCount} / ${totalTechCount}件の技術スタック` }}
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <Input
            v-model="searchQuery"
            placeholder="技術名やタグで検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <Button
              v-if="searchQuery || selectedType"
              variant="outline" size="xs" rounded="full"
              @click="resetFilters">
              <Icon name="heroicons:x-mark" />
            </Button>
          </div>
        </div>
      </template>
    </PageHeader>
    <div class="container mx-auto px-4 -mt-8 relative z-10">
      <Card class="p-4 mb-8 flex flex-wrap gap-2">
        <!-- タイプフィルター -->
        <div class="flex flex-wrap gap-2">
          <!-- すべて表示ボタン -->
          <Button variant="outline" @click="resetFilters">
            <Icon name="heroicons:eye" />
            すべて
            <Badge>{{ totalTechCount }}</Badge>
          </Button>
          <Button
            v-for="type in techTypes"
            :key="type.id"
            variant="outline"
            @click="setTechType(type.id)">
            <Icon :name="type.icon" />
            {{ type.name }}
            <Badge>{{ techCountByType[type.id] || 0 }}</Badge>
          </Button>
        </div>
      </Card>

      <!-- 技術スタック一覧 -->
      <AsyncStateView
        :fallback="filteredTechnologies.length === 0">
        <template #loading>
        </template>
        <template #error>
        </template>
        <template #fallback>
          <div class="text-center py-16 rounded-xl shadow-lg mt-6">
            <Icon name="heroicons:magnifying-glass" class="text-6xl mx-auto mb-6" />
            <h3 class="text-xl font-bold mb-2">
              該当する技術が見つかりませんでした
            </h3>
            <p class="mb-8 max-w-md mx-auto">
              「{{ debouncedSearch }}」に一致する技術やタグは見つかりませんでした。検索条件を変更してみてください。
            </p>
            <Button variant="default" color="primary" @click="resetFilters">
              フィルターをリセット
            </Button>
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
              <Card class="group size-full gap-2 p-4">
                <NuxtLink
                  :to="tech.link ?? '#'"
                  target="_blank"
                  class="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity duration-300">
                  <div
                    class="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden">
                    <SkillIcon :stack="tech.id" />
                  </div>
                  <div class="space-y-2">
                    <CardTitle>
                      {{ tech.name }}
                    </CardTitle>
                    <CardDescription>
                      <Icon :name="techTypes.find(t => t.id === getTechType(tech))?.icon || 'heroicons:code-bracket'" class="mr-1" />
                      {{ techTypes.find(t => t.id === getTechType(tech))?.name || '技術' }}
                    </CardDescription>
                  </div>
                </NuxtLink>
                <!-- タグ一覧 -->
                <div v-if="tech.tags && tech.tags.length > 0" class="mt-4">
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="tagId in tech.tags"
                      :key="tagId"
                      :color="getTag(tagId)?.color || 'neutral'"
                      variant="outline"
                      size="sm">
                      {{ getTag(tagId)?.name }}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </template>
      </AsyncStateView>
    </div>
  </div>
</template>

<style scoped>
</style>
