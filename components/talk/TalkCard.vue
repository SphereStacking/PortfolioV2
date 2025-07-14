<script setup lang="ts">
interface Props {
  data: {
    title: string
    description: string
    event_name: string
    event_date: string
    location: string
    type: 'conference' | 'meetup' | 'webinar' | 'workshop'
    path: string
    tags?: string[]
    icons?: string[]
    slides_url?: string
    video_url?: string
  }
}

defineProps<Props>()

// イベントタイプの色とアイコン設定
const typeConfig = {
  conference: {
    color: 'bg-purple-500/20',
    icon: 'heroicons:academic-cap',
    label: 'カンファレンス',
  },
  meetup: {
    color: 'bg-blue-500/20',
    icon: 'heroicons:user-group',
    label: 'ミートアップ',
  },
  webinar: {
    color: 'bg-green-500/20',
    icon: 'heroicons:video-camera',
    label: 'ウェビナー',
  },
  workshop: {
    color: 'bg-orange-500/20',
    icon: 'heroicons:wrench',
    label: 'ワークショップ',
  },
}

// 日付フォーマット関数
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <NuxtLink
    :to="data.path"
    :aria-label="data.title"
    class="flex cursor-pointer flex-col gap-2">
    <div class="relative overflow-hidden rounded-md border border-white/10 shadow-md shadow-zinc-950/50 transition-colors duration-200 hover:border-white/20">
      <div
        class="aspect-video flex flex-col gap-4 justify-center items-center p-8 transition-transform duration-300 hover:scale-105"
        :class="typeConfig[data.type].color">
        <!-- イベントタイプアイコン -->
        <Icon
          :name="typeConfig[data.type].icon"
          class="text-6xl text-white/30" />

        <!-- イベント名 -->
        <div class="text-center">
          <h3 class="text-xl font-bold text-white/80 line-clamp-2">
            {{ data.event_name }}
          </h3>
          <p class="text-sm text-white/60 mt-1">
            {{ formatDate(data.event_date) }}
          </p>
        </div>

        <!-- スライド/ビデオインジケーター -->
        <div v-if="data.slides_url || data.video_url" class="absolute bottom-2 right-2 flex gap-2">
          <Icon
            v-if="data.slides_url"
            name="heroicons:presentation-chart-bar"
            class="text-white/50 w-5 h-5" />
          <Icon
            v-if="data.video_url"
            name="heroicons:video-camera"
            class="text-white/50 w-5 h-5" />
        </div>
      </div>

      <!-- タグ -->
      <div v-if="data.tags && data.tags.length > 0" class="absolute top-2 flex flex-wrap gap-1 px-2">
        <Badge
          v-for="tag in data.tags"
          :key="tag"
          class="cursor-pointer text-xs"
          variant="outline"
          @click.stop.prevent="navigateTo(`/talk?tag=${encodeURIComponent(tag)}`)">
          {{ tag }}
        </Badge>
      </div>
    </div>

    <!-- カード下部の情報 -->
    <div class="flex flex-col gap-1">
      <h3 class="text-lg font-m-plus-rounded-1c line-clamp-2">
        {{ data.title }}
      </h3>
      <p class="text-sm text-muted-foreground line-clamp-2">
        {{ data.description }}
      </p>
      <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <Icon name="heroicons:map-pin" class="w-3 h-3" />
        {{ data.location }}
      </div>
    </div>
  </NuxtLink>
</template>
