<script setup lang="ts">
import type { Slide } from '~/types/slide'
import { formatDateJa } from '~/utils/date'

const route = useRoute()
const slug = route.params.slug as string

// 外部APIからデータ取得
const { data: slides, pending, error } = await useFetch<Slide[]>(
  'https://slides.spherestacking.com/api/slides',
)

// slugに一致するスライドを取得
const slide = computed(() => {
  if (!slides.value) return null
  return slides.value.find(s => s.slug === slug)
})

// 404の場合はエラー（SSR/CSR両対応）
watchEffect(() => {
  if (!pending.value && !slide.value && !error.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Slide Not Found',
    })
  }
})

// SEO
useSeoMeta({
  title: () => slide.value?.title ?? 'Talk',
  description: () => slide.value?.description ?? '',
})
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- ローディング状態 -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <Icon name="heroicons:arrow-path" class="text-4xl animate-spin" />
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <Icon name="heroicons:exclamation-triangle" class="text-6xl mx-auto mb-6 text-destructive" />
        <h3 class="text-xl font-bold mb-2">
          データの取得に失敗しました
        </h3>
        <NuxtLink to="/talk" class="text-primary underline">
          一覧に戻る
        </NuxtLink>
      </div>
    </div>

    <!-- スライド詳細 -->
    <template v-else-if="slide">
      <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-purple-800/70 via-violet-500/70 to-pink-200/70' }">
        <template #title>
          {{ slide.title }}
        </template>
        <template #description>
          <p class="text-center text-white/90 text-lg mb-4 max-w-3xl mx-auto">
            {{ slide.description }}
          </p>
          <p class="text-center text-white/70 text-sm">
            {{ formatDateJa(slide.date) }}
          </p>
        </template>
      </PageHeader>

      <div class="container mx-auto px-4 -mt-8 relative z-10">
        <Card class="overflow-hidden">
          <!-- スライド埋め込み -->
          <div class="aspect-video">
            <iframe
              :src="slide.link"
              :title="slide.title"
              class="w-full h-full border-0"
              allowfullscreen></iframe>
          </div>

          <!-- アクション -->
          <div class="p-4 flex justify-between items-center border-t border-border">
            <NuxtLink to="/talk" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="heroicons:arrow-left" />
              一覧に戻る
            </NuxtLink>
            <a
              :href="slide.link"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-primary hover:underline">
              別タブで開く
              <Icon name="heroicons:arrow-top-right-on-square" />
            </a>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>
