<script setup lang="ts">
import { ref } from 'vue'
import { toolCategories, type Tool } from '~/types/tool'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarHeader,
  SidebarInput,
  SidebarSeparator,
} from '~/components/ui/sidebar'

const route = useRoute()
const { getToolsByCategory } = useTools()

// 検索クエリ
const searchQuery = ref('')

// カテゴリー別にツールをグループ化
const toolsByCategory = Object.keys(toolCategories).reduce((acc, category) => {
  acc[category] = getToolsByCategory(category as Tool['category'])
  return acc
}, {} as Record<string, ReturnType<typeof getToolsByCategory>>)

// フィルタリングされたツール
const filteredToolsByCategory = computed(() => {
  if (!searchQuery.value) return toolsByCategory

  const query = searchQuery.value.toLowerCase()
  const filtered: Record<string, ReturnType<typeof getToolsByCategory>> = {}

  Object.entries(toolsByCategory).forEach(([category, categoryTools]) => {
    const filteredTools = categoryTools.filter(tool =>
      tool.name.toLowerCase().includes(query)
      || tool.description.toLowerCase().includes(query),
    )
    if (filteredTools.length > 0) {
      filtered[category] = filteredTools
    }
  })

  return filtered
})

// 検索クリックハンドラー
const handleSearchClick = () => {
  // すべてのボタンから探す
  const buttons = document.querySelectorAll('button')
  let trigger: HTMLElement | null = null

  // data-sidebar="trigger"を持つボタンを探す
  buttons.forEach((btn) => {
    if (btn.getAttribute('data-sidebar') === 'trigger') {
      trigger = btn
    }
  })

  if (trigger) {
    (trigger as HTMLElement).click()
    setTimeout(() => {
      const input = document.querySelector('[data-sidebar-input]') as HTMLInputElement
      input?.focus()
    }, 300)
  }
}
</script>

<template>
  <Sidebar collapsible="icon" class="top-16 overflow-x-hidden">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child tooltip="開発ツール">
            <NuxtLink to="/tools" class="flex items-center gap-2 px-2 py-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 min-w-0">
              <Icon name="heroicons:squares-2x2" class="h-5 w-5 shrink-0" />
              <span class="font-semibold text-base truncate group-data-[collapsible=icon]:hidden min-w-0">開発ツール</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent class="overflow-x-hidden">
      <!-- 検索ボックス -->
      <SidebarGroup>
        <SidebarGroupContent class="group-data-[collapsible=icon]:hidden">
          <!-- フルサイズの検索ボックス -->
          <div class="relative group-data-[collapsible=icon]:hidden">
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <SidebarInput
              v-model="searchQuery"
              placeholder="ツールを検索..."
              class="pl-8"
              data-sidebar-input />
          </div>
        </SidebarGroupContent>
        <!-- 折りたたみ時の検索アイコン -->
        <SidebarMenu class="hidden group-data-[collapsible=icon]:block">
          <SidebarMenuItem class>
            <SidebarMenuButton
              tooltip="ツールを検索"
              @click="handleSearchClick">
              <div class="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center min-w-0">
                <Icon
                  name="heroicons:magnifying-glass"
                  class="h-4 w-4" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarSeparator />

      <!-- カテゴリー別ツール -->
      <template
        v-for="(category, key, index) in toolCategories"
        :key="key">
        <SidebarGroup
          v-show="filteredToolsByCategory[key]?.length > 0">
          <SidebarGroupLabel
            class="group-data-[collapsible=icon]:hidden">
            <Icon
              :name="category.icon"
              class="h-4 w-4" />
            {{ category.name }}
            <span class="ml-auto text-xs">
              {{ filteredToolsByCategory[key]?.length || 0 }}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem
                v-for="tool in filteredToolsByCategory[key]"
                :key="tool.id">
                <SidebarMenuButton
                  as-child
                  :is-active="route.path === tool.route"
                  :tooltip="tool.name">
                  <NuxtLink :to="tool.route" class="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center min-w-0">
                    <Icon
                      :name="tool.icon"
                      class="h-4 w-4 shrink-0" />
                    <span class="truncate group-data-[collapsible=icon]:hidden min-w-0">{{ tool.name }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
                <SidebarMenuBadge
                  v-if="tool.badge"
                  class="group-data-[collapsible=icon]:hidden">
                  {{ tool.badge }}
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <!-- カテゴリー間のセパレーター（折りたたみ時のみ表示） -->
        <SidebarSeparator
          v-if="index < Object.keys(toolCategories).length - 1 && filteredToolsByCategory[key]?.length > 0"
          class="hidden group-data-[collapsible=icon]:block my-1" />
      </template>

      <!-- 検索結果なし -->
      <div
        v-if="searchQuery && Object.keys(filteredToolsByCategory).length === 0"
        class="px-3 py-8 text-center text-sm text-muted-foreground">
        「{{ searchQuery }}」に一致するツールが見つかりません
      </div>
    </SidebarContent>
  </Sidebar>
</template>
