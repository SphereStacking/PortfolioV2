<script setup lang="ts">
import { toolCategories, type Tool } from '~~/types/tool'

const route = useRoute()
const { getToolsByCategory } = useTools()
const { openMobile, isMobile, state, toggleSidebar, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } = useSidebar()

// カテゴリー別にツールをグループ化
const toolsByCategory = Object.keys(toolCategories).reduce((acc, category) => {
  acc[category] = getToolsByCategory(category as Tool['category'])
  return acc
}, {} as Record<string, ReturnType<typeof getToolsByCategory>>)

const isCategoryVisible = (key: string) => toolsByCategory[key]?.length > 0
const categoryCount = (key: string) => toolsByCategory[key]?.length || 0
const isToolActive = (toolRoute: string) => route.path === toolRoute
const getToolsForCategory = (key: string) => toolsByCategory[key] || []
</script>

<template>
  <!-- モバイル: Slideover -->
  <USlideover
    v-if="isMobile"
    v-model:open="openMobile"
    side="left"
    title="ツール">
    <UButton
      variant="ghost" icon="i-heroicons-bars-3" size="md"
      square />

    <template #body>
      <nav>
        <template v-for="(category, key) in toolCategories" :key="key">
          <div v-if="isCategoryVisible(key)" class="mb-4">
            <h3 class="px-2 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {{ category.name }}
              <span class="text-xs opacity-60 ml-1">{{ categoryCount(key) }}</span>
            </h3>
            <ul class="space-y-0.5">
              <li v-for="tool in getToolsForCategory(key)" :key="tool.id">
                <NuxtLink
                  :to="tool.route"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors"
                  :class="isToolActive(tool.route) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'"
                  @click="openMobile = false">
                  <Icon :name="tool.icon" class="h-4 w-4 shrink-0" />
                  <span>{{ tool.name }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
      </nav>
    </template>
  </USlideover>

  <!-- デスクトップ: 固定サイドバー -->
  <aside
    v-else
    class="h-screen sticky top-0 border-r border-border bg-background overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-in-out shrink-0"
    :style="{ width: state === 'expanded' ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }"
    :data-state="state">
    <!-- トグルボタン -->
    <div class="flex items-center p-2" :class="state === 'expanded' ? 'justify-end' : 'justify-center'">
      <UButton
        variant="ghost"
        size="sm"
        square
        :icon="state === 'expanded' ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
        @click="toggleSidebar" />
    </div>

    <!-- ナビゲーション -->
    <nav class="px-2 pb-4">
      <template v-for="(category, key) in toolCategories" :key="key">
        <div v-if="isCategoryVisible(key)" class="mb-4">
          <!-- カテゴリーラベル (展開時のみ) -->
          <h3
            v-if="state === 'expanded'"
            class="px-2 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ category.name }}
            <span class="text-xs opacity-60 ml-1">{{ categoryCount(key) }}</span>
          </h3>

          <ul class="space-y-0.5">
            <li v-for="tool in getToolsForCategory(key)" :key="tool.id">
              <UTooltip :text="tool.name" :disabled="state === 'expanded'" side="right">
                <NuxtLink
                  :to="tool.route"
                  class="flex items-center gap-2 rounded-md text-sm transition-colors"
                  :class="[
                    isToolActive(tool.route) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground',
                    state === 'expanded' ? 'px-2 py-1.5' : 'p-2 justify-center',
                  ]">
                  <Icon :name="tool.icon" class="h-4 w-4 shrink-0" />
                  <span v-if="state === 'expanded'">{{ tool.name }}</span>
                </NuxtLink>
              </UTooltip>
            </li>
          </ul>
        </div>
      </template>
    </nav>
  </aside>
</template>
