<script setup lang="ts">
import { motion } from 'motion-v'
import { withLeadingSlash, joinURL } from 'ufo'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '~/components/ui/breadcrumb'

const DIR = 'talk'
const route = useRoute()

// パスパラメータを取得
const pathParams = computed(() => {
  if (!route.params.path) return []

  return Array.isArray(route.params.path)
    ? route.params.path as string[]
    : [route.params.path as string]
})

// コンテンツを取得
const { data: page } = await useAsyncData(
  `talk-${pathParams.value.join('-')}`,
  async () => {
    const path = withLeadingSlash(joinURL(DIR, ...pathParams.value))
    return await queryCollection(DIR).path(path).first()
  },
)

// エラーハンドリング
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Talk not found' })
}

// パンくずリスト
const breadcrumbItems = computed(() => {
  if (!page.value) return []

  const items = [
    { label: 'Talk', icon: 'heroicons:microphone', to: '/talk' },
  ]

  // 年/月/日のパンくずを追加
  if (pathParams.value.length >= 4) {
    const [year] = pathParams.value

    // 年
    items.push({
      label: year,
      to: `/talk?year=${year}`,
    })

    // 記事タイトル（最後の要素なのでリンクなし）
    items.push({
      label: page.value.title,
    })
  }

  return items
})

// 目次リンク
const links = computed(() => {
  if (!page.value) return []

  const tocLinks = page.value?.body?.toc?.links || []
  return [
    {
      id: 'top',
      text: '概要',
      depth: 1,
    },
    ...tocLinks,
  ]
})

// スライドのURLがHTTPSか確認
const isSlideUrlSecure = computed(() => {
  if (!page.value?.slides_url) return false
  return page.value.slides_url.startsWith('https://')
})

// イベントタイプの表示名
const eventTypeLabel = computed(() => {
  const typeLabels = {
    conference: 'カンファレンス',
    meetup: 'ミートアップ',
    webinar: 'ウェビナー',
    workshop: 'ワークショップ',
  }
  return typeLabels[page.value?.type] || page.value?.type
})

// SEOメタタグとOGP設定
useSeoMeta({
  title: page.value?.title,
  description: page.value?.description,
  ogTitle: page.value?.title,
  ogDescription: page.value?.description,
  twitterTitle: page.value?.title,
  twitterDescription: page.value?.description,
  twitterCard: 'summary_large_image',
})

defineOgImageComponent('Talk', {
  title: page.value?.title,
  event: page.value?.event_name,
  date: page.value?.event_date,
})
</script>

<template>
  <ThreeColumnLayout
    class="container mx-auto mb-16"
    :left="{ class: 'hidden' }"
    :main="{ class: 'md:col-span-9 xl:col-span-9 col-span-12' }"
    :right="{ class: 'md:col-span-3 xl:col-span-3 col-span-0' }">
    <template #header>
      <!-- イベント情報ヘッダー -->
      <div class="overflow-hidden rounded-md border border-white/10 shadow-md shadow-zinc-950/50 transition-colors duration-200 hover:border-white/20 mt-4 p-8 bg-gradient-to-r from-purple-800/20 via-violet-500/20 to-pink-200/20">
        <motion.div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <Badge :variant="'default'" class="text-sm">
                {{ eventTypeLabel }}
              </Badge>
              <span class="text-muted-foreground">{{ page?.event_date }}</span>
            </div>
            <h2 class="text-2xl font-bold text-muted-foreground">
              {{ page?.event_name }}
            </h2>
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="heroicons:map-pin" class="w-4 h-4" />
              {{ page?.location }}
            </div>
          </div>
        </motion.div>
      </div>

      <!-- パンくずリスト -->
      <motion.div
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.5 }"
        class="mt-2">
        <Breadcrumb>
          <BreadcrumbList>
            <template v-for="(item, index) in breadcrumbItems" :key="item.label">
              <BreadcrumbItem>
                <BreadcrumbLink v-if="item.to" :href="item.to" as="NuxtLink">
                  <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />
                  <span v-else>{{ item.label }}</span>
                </BreadcrumbLink>
                <BreadcrumbPage v-else>
                  {{ item.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1" />
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      <!-- タイトル -->
      <motion.h1
        id="top"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
        class="text-6xl font-black font-wdxl-lubrifont-jp-n my-10">
        {{ page?.title }}
      </motion.h1>

      <!-- タグ -->
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
        class="flex items-center gap-2">
        <Badge
          v-for="tag in page?.tags"
          :key="tag"
          class="cursor-pointer"
          variant="outline"
          @click="navigateTo(`/talk?tag=${encodeURIComponent(tag)}`)">
          {{ tag }}
        </Badge>
      </motion.div>

      <!-- アイコン -->
      <motion.div
        v-if="page?.icons?.length"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.3 }"
        class="mt-4 flex items-center gap-4">
        <Icon
          v-for="icon in page.icons"
          :key="icon"
          :name="icon"
          class="text-2xl text-muted-foreground" />
      </motion.div>
    </template>

    <template #left>
    </template>

    <template #right>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.4 }"
        class="sticky top-30 hidden md:block rounded-lg p-4">
        <BlogToc :links="links" />
      </motion.div>
    </template>

    <template #default>
      <!-- スライド埋め込み -->
      <motion.div
        v-if="page?.slides_url && isSlideUrlSecure"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.4 }"
        class="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>スライド</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="relative w-full" style="padding-bottom: 56.25%;">
              <iframe
                :src="page.slides_url"
                class="absolute top-0 left-0 w-full h-full rounded-md"
                frameborder="0"
                allowfullscreen></iframe>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <!-- 外部リンク -->
      <motion.div
        v-if="page?.slides_url || page?.video_url"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.45 }"
        class="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>リンク</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-2">
              <a
                v-if="page?.slides_url"
                :href="page.slides_url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-primary hover:underline">
                <Icon name="heroicons:presentation-chart-bar" class="w-5 h-5" />
                スライドを見る
              </a>
              <a
                v-if="page?.video_url"
                :href="page.video_url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-primary hover:underline">
                <Icon name="heroicons:video-camera" class="w-5 h-5" />
                録画を見る
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <!-- コンテンツ本文 -->
      <motion.article
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.5 }"
        class="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <ContentRenderer
          v-if="page"
          class="writing"
          :value="page" />
      </motion.article>
    </template>
  </ThreeColumnLayout>
</template>
