<script setup lang="ts">
import type { Career, CareerProject } from '~/composables/useCareers'
import { useCareers } from '~/composables/useCareers'

// データ取得
const { data: careersRaw } = await useAsyncData('careers', () => queryCollection('career').all())
const { data: projectsRaw } = await useAsyncData('projects', () => queryCollection('project').all())

// Career + Project を結合
const careersWithProjects = computed<Career[] | null>(() => {
  if (!careersRaw.value) return null

  return careersRaw.value.map((career) => {
    const careerProjects: CareerProject[] = projectsRaw.value
      ?.filter(project => project.career_unique_code === career.unique_code)
      .map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        tags: project.tags,
        icon: project.icon,
        period_start: project.period_start,
        period_end: project.period_end,
        pinned: project.pinned,
        stacks: project.stacks,
        overview: project.overview,
        tasks: project.tasks,
        team: project.team,
        role: project.role,
        links: project.links,
      })) || []

    return {
      id: career.id,
      unique_code: career.unique_code,
      title: career.title,
      description: career.description,
      date_start: career.date_start,
      date_end: career.date_end || undefined,
      tags: career.tags,
      projects: careerProjects,
    }
  })
})

// コンポーザブルから状態とロジックを取得
const {
  // データ
  filteredCareers,
  availableYears,
  availableSkills,

  // フィルター状態
  searchQuery,
  selectedYear,
  selectedSkill,
  isLoading,
  hasActiveFilters,

  // カウント
  careerCount,
  totalCareerCount: _totalCareerCount,
  projectCount,
  totalProjectCount: _totalProjectCount,

  // アクション
  setYear,
  setSkill,
  resetFilters,
} = useCareers(careersWithProjects)
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader theme="career">
      <template #title>
        Career
      </template>
      <template #description>
        <p class="text-center text-white/50 text-xs tracking-[0.3em] uppercase mb-8">
          {{ careerCount }} Companies · {{ projectCount }} Projects
        </p>

        <div class="relative z-10 mx-auto max-w-2xl">
          <UInput
            v-model="searchQuery"
            placeholder="会社名、プロジェクト名で検索..."
            variant="outline"
            size="lg" />
          <div class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="mr-2 animate-spin" />
            <UButton
              v-if="hasActiveFilters"
              variant="outline"
              size="xs"
              rounded="full"
              @click="resetFilters">
              <Icon name="heroicons:x-mark" />
            </UButton>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="container relative z-10 mx-auto -mt-8 px-4">
      <!-- フィルターエリア -->
      <UCard class="mb-8 p-4">
        <div class="flex flex-wrap gap-4">
          <!-- 年フィルター -->
          <USelect
            :model-value="selectedYear"
            :items="[{ label: 'すべての年', value: null }, ...availableYears.map(y => ({ label: `${y}年`, value: y }))]"
            placeholder="開始年を選択"
            class="w-[180px]"
            @update:model-value="(value) => setYear(value)" />

          <!-- スキルフィルター -->
          <USelect
            :model-value="selectedSkill"
            :items="[{ label: 'すべてのスキル', value: null }, ...availableSkills.map(s => ({ label: s, value: s }))]"
            placeholder="スキルを選択"
            class="w-[180px]"
            @update:model-value="(value) => setSkill(value)" />
        </div>
      </UCard>

      <!-- キャリアガントタイムライン -->
      <template v-if="filteredCareers.length > 0">
        <CareerGanttTimeline :careers="filteredCareers" />
      </template>

      <!-- 該当なし -->
      <div v-else class="mt-6 rounded-xl py-16 text-center shadow-lg">
        <Icon name="heroicons:magnifying-glass" class="mx-auto mb-6 text-6xl" />
        <h3 class="mb-2 text-xl font-bold">
          該当するキャリアが見つかりませんでした
        </h3>
        <p class="mx-auto mb-8 max-w-md">
          検索条件を変更してみてください。
        </p>
        <UButton variant="default" color="primary" @click="resetFilters">
          フィルターをリセット
        </UButton>
      </div>
    </div>
  </div>
</template>
