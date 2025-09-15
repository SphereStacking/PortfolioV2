<script setup lang="ts">
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
} from '~/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'

const route = useRoute()
const { getToolsByCategory } = useTools()

// カテゴリー別にツールをグループ化
const toolsByCategory = Object.keys(toolCategories).reduce((acc, category) => {
  acc[category] = getToolsByCategory(category as Tool['category'])
  return acc
}, {} as Record<string, ReturnType<typeof getToolsByCategory>>)

// カテゴリーが表示可能かどうかを判定
const isCategoryVisible = (key: string) => {
  return toolsByCategory[key]?.length > 0
}

// カテゴリーの総数を取得
const categoryCount = (key: string) => {
  return toolsByCategory[key]?.length || 0
}

// ツールがアクティブかどうかを判定
const isToolActive = (toolRoute: string) => {
  return route.path === toolRoute
}

// カテゴリーのツール一覧を取得
const getToolsForCategory = (key: string) => {
  return toolsByCategory[key] || []
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <SidebarTrigger />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- カテゴリー別ツール -->
      <template
        v-for="(category, key) in toolCategories"
        :key="key">
        <Collapsible
          v-show="isCategoryVisible(key)"
          :default-open="true"
          class="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel as-child class="group-data-[collapsible=icon]:hidden">
              <CollapsibleTrigger class="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors">
                <span class="flex items-center gap-2">
                  {{ category.name }}
                </span>
                <span class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">
                    {{ categoryCount(key) }}
                  </span>
                  <Icon
                    name="heroicons:chevron-down"
                    class="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </span>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem
                    v-for="tool in getToolsForCategory(key)"
                    :key="tool.id">
                    <SidebarMenuButton
                      as-child
                      :is-active="isToolActive(tool.route)"
                      :tooltip="tool.name">
                      <NuxtLink :to="tool.route" class="flex items-center gap-2 w-full">
                        <Icon
                          :name="tool.icon"
                          class="h-4 w-4 shrink-0" />
                        <span>{{ tool.name }}</span>
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
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </template>
    </SidebarContent>
  </Sidebar>
</template>
