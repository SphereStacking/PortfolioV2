<script setup lang="ts">
import { toolCategories } from '~/types/tool'
import type { Tool } from '~/types/tool'

const { tools, getToolsByCategory } = useTools()

// カテゴリー別にツールをグループ化
const toolsByCategory = Object.keys(toolCategories).reduce((acc, category) => {
  acc[category as Tool['category']] = getToolsByCategory(category as Tool['category'])
  return acc
}, {} as Record<Tool['category'], Tool[]>)

// SEO設定
useSeoMeta({
  title: 'Web開発ツール',
  description: 'Web開発に役立つ便利なツール集。カラーパレット、CSS生成、画像圧縮、JSON整形など。',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <PageHeader>
      <template #title>
        <h1 class="text-4xl font-bold">Web開発ツール</h1>
      </template>
      <template #description>
        <p class="text-lg text-muted-foreground">
          Web開発に役立つ便利なツール集です。すべて無料でお使いいただけます。
        </p>
      </template>
    </PageHeader>

    <div class="mt-12 space-y-12">
      <!-- カテゴリー別ツール一覧 -->
      <div
        v-for="(category, key) in toolCategories"
        :key="key"
        class="space-y-6">
        <!-- カテゴリーヘッダー -->
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary/10">
            <Icon
              :name="category.icon"
              class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 class="text-2xl font-semibold">{{ category.name }}</h2>
            <p class="text-sm text-muted-foreground">{{ category.description }}</p>
          </div>
        </div>

        <!-- ツールカード -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="tool in toolsByCategory[key as Tool['category']]"
            :key="tool.id"
            :to="tool.route"
            class="group">
            <Card class="h-full transition-all hover:shadow-lg hover:border-primary/50">
              <CardHeader>
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon
                        :name="tool.icon"
                        class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle class="text-lg group-hover:text-primary transition-colors">
                        {{ tool.name }}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge
                    v-if="tool.badge"
                    variant="secondary"
                    class="ml-2">
                    {{ tool.badge }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {{ tool.description }}
                </CardDescription>
              </CardContent>
            </Card>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>