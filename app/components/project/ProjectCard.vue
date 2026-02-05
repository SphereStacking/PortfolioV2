<script setup lang="ts">
const props = defineProps<{
  data: {
    id: string
    title: string
    description: string
    status: string
    tags: string[]
    icon: string
    period_start: string
    period_end?: string
    pinned: boolean
    stacks: string[]
    overview: string[]
    tasks: string[]
    team: string
    role: string
    career?: {
      title: string
      description: string
      tags: string[]
    }
    links?: {
      label: string
      url: string
    }[]
  }
}>()

const dateSpan = computed(() => {
  if (props.data.status === 'in_progress') {
    return `${props.data.period_start} ~ 現在`
  }
  return `${props.data.period_start} ~ ${props.data.period_end}`
})

const isImageUrl = computed(() => {
  const icon = props.data.icon
  return icon.startsWith('http://')
    || icon.startsWith('https://')
    || icon.startsWith('/')
    || /\.(png|jpg|jpeg|svg|webp)$/i.test(icon)
})

// 概要テキストを結合
const overviewText = computed(() => {
  return props.data.overview.join(' ')
})
</script>

<template>
  <div
    :id="data.title"
    class="group flex flex-col md:flex-row overflow-hidden rounded-md border border-white/10 shadow-md shadow-zinc-950/50 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10">
    <!-- 左側: グラデーション背景 + アイコン + 日付 -->
    <div
      class="relative flex shrink-0 flex-col items-center justify-center gap-2 p-4 md:w-32 overflow-hidden"
      :style="{
        backgroundImage: `
          linear-gradient(-30deg, rgba(59,130,246,0.3) 10%, rgba(59,130,246,0.5) 30%, rgba(6,182,212,0.6) 40%, rgba(20,184,166,0.5) 50%, rgba(59,130,246,0.2) 70%)
        `,
      }">
      <!-- アイコン -->
      <div class="flex size-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <img
          v-if="isImageUrl"
          :src="data.icon"
          :alt="data.title"
          class="size-9 object-contain">
        <Icon
          v-else
          :name="data.icon"
          class="text-3xl text-white/80" />
      </div>

      <!-- 日付 -->
      <span class="text-xs text-white/70 text-center whitespace-nowrap">
        {{ dateSpan }}
      </span>
    </div>

    <!-- 右側: コンテンツ -->
    <div class="flex flex-1 flex-col gap-2 p-4">
      <!-- タイトル -->
      <h3 class="text-base font-m-plus-rounded-1c font-semibold line-clamp-2">
        {{ data.title }}
      </h3>

      <!-- タグ -->
      <div v-if="data.tags.length" class="flex flex-wrap items-center gap-1.5">
        <Badge
          v-for="tag in data.tags"
          :key="tag"
          variant="secondary"
          class="text-xs">
          {{ tag }}
        </Badge>
      </div>

      <!-- 概要 -->
      <p class="text-sm text-muted-foreground line-clamp-2">
        {{ overviewText }}
      </p>

      <!-- 技術スタック + 詳細情報 -->
      <div class="flex items-end justify-between gap-4">
        <!-- 技術スタック（左） -->
        <div v-if="data.stacks.length" class="flex flex-wrap items-center gap-1.5">
          <SkillIcon
            v-for="stack in data.stacks"
            :key="stack"
            :stack="stack"
            class="size-6" />
        </div>

        <!-- 詳細情報（右・縦並び） -->
        <div class="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
          <span v-if="data.role" class="flex items-center gap-1">
            <Icon name="heroicons:user" class="size-4" />
            {{ data.role }}
          </span>
          <span v-if="data.team" class="flex items-center gap-1">
            <Icon name="heroicons:user-group" class="size-4" />
            {{ data.team }}
          </span>
          <template v-if="data.links?.length">
            <NuxtLink
              v-for="link in data.links"
              :key="link.label"
              :to="link.url"
              target="_blank"
              class="flex items-center gap-1 transition-colors hover:text-blue-400">
              <Icon name="heroicons:arrow-top-right-on-square" class="size-3" />
              {{ link.label }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
