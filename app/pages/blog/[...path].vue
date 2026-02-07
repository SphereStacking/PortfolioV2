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

const DIR = 'blog'
const route = useRoute()

// パスパラメータを取得
const pathParams = computed(() => {
  if (!route.params.path) return []

  return Array.isArray(route.params.path)
    ? route.params.path as string[]
    : [route.params.path as string]
})

// アーカイブページの場合はindex.vueにリダイレクト
const isArchivePage = pathParams.value.every(p => /^\d+$/.test(p)) && pathParams.value.length <= 3

if (isArchivePage) {
  const query: Record<string, string> = {}
  if (pathParams.value[0]) query.year = pathParams.value[0]
  if (pathParams.value[1]) query.month = pathParams.value[1].padStart(2, '0')
  if (pathParams.value[2]) query.day = pathParams.value[2].padStart(2, '0')

  await navigateTo({ path: '/blog', query })
}

// コンテンツを取得
const { data: page } = await useAsyncData(
  `blog-article-${pathParams.value.join('-')}`,
  async () => {
    const path = withLeadingSlash(joinURL(DIR, ...pathParams.value))

    // まず完全なパスで試す
    let content = await queryCollection(DIR).path(path).first()

    // 見つからない場合は、2.blogプレフィックス付きで試す
    if (!content) {
      const contentPath = withLeadingSlash(joinURL('2.blog', ...pathParams.value))
      content = await queryCollection(DIR).path(contentPath).first()
    }

    // それでも見つからない場合は、年/月/日/ファイル名の構造でwhere検索
    if (!content && pathParams.value.length === 4) {
      content = await queryCollection(DIR)
        .where('_path', 'contains', `/${pathParams.value.join('/')}`)
        .first()
    }

    return content
  },
)

// エラーハンドリング
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

// パンくずリスト
const breadcrumbItems = computed(() => {
  const items = [
    { label: 'Blog', icon: 'heroicons:book-open', to: '/blog' },
  ]

  // 年/月/日のパンくずを追加
  if (pathParams.value.length >= 4) {
    const [year, month, day] = pathParams.value

    // 年
    items.push({
      label: year,
      to: `/blog?year=${year}`,
    })

    // 月
    items.push({
      label: `${month}`,
      to: `/blog?year=${year}&month=${month}`,
    })

    // 日
    items.push({
      label: `${day}`,
      to: `/blog?year=${year}&month=${month}&day=${day}`,
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
  const tocLinks = page.value?.body?.toc?.links || []
  return [
    {
      id: 'top',
      text: '冒頭',
      depth: 1,
    },
    ...tocLinks,
  ]
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

defineOgImageComponent('Article', {
  title: page.value?.title,
  tags: page.value?.tags,
})
</script>

<template>
  <ThreeColumnLayout
    class="container mx-auto mb-16"
    :left="{ class: 'hidden' }"
    :main="{ class: 'md:col-span-9 xl:col-span-9 col-span-12' }"
    :right="{ class: 'md:col-span-3 xl:col-span-3 col-span-0' }">
    <template #header>
      <div class="overflow-hidden rounded-md border border-white/10 shadow-md shadow-zinc-950/50 transition-colors duration-200 hover:border-white/20 mt-4">
        <template v-if="page.image">
          <div class="overflow-hidden&quot;">
            <NuxtImg
              width="1536"
              :alt="`${page.title} article image`"
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              :src="page.image"
              :aria-label="`${page.title} article image`" />
          </div>
        </template>
        <template v-else>
          <div
            class="flex flex-col gap-2 grow justify-between py-10 px-10 transition-transform duration-300 hover:scale-110"
            :style="{
              backgroundImage: `
              linear-gradient(-30deg, rgba(16,152,173,0.2) 10%, rgb(16,152,173,0.4) 30%, rgb(64,169,152,0.5) 40%, rgb(111,186,130,0.4) 50%, rgba(16,152,173,0.1) 70%)
            `,
            }">
            <div
              class="text-white/50 text-xl flex items-center justify-center gap-4 m-auto w-full"
              :class="[
                page.icons?.length && page.icons.length < 3 ? 'gap-8' : 'gap-4',
              ]">
              <Icon
                v-for="icon in page.icons"
                :key="icon"
                :name="icon"
                class="text-7xl" />
            </div>
          </div>
        </template>
      </div>
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
      <motion.h1
        id="top"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }" class="text-6xl font-black font-wdxl-lubrifont-jp-n my-10">
        {{ page?.title }}
      </motion.h1>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }" class="flex items-center gap-2">
        <Badge
          v-for="tag in page?.tags"
          :key="tag"
          class="cursor-pointer"
          variant="outline"
          @click="navigateTo(`/blog?tag=${encodeURIComponent(tag)}`)">
          {{ tag }}
        </Badge>
      </motion.div>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.3 }"
        class="mt-1 flex flex-col gap-2 sm:flex-row sm:gap-4 items-center justify-between">
        <p class="flex items-center gap-2">
          {{ page?.created }}
          <template v-if="page?.updated">
            <Icon name="mdi:refresh" class="w-4 h-4" />
            {{ page?.updated }}
          </template>
        </p>
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
      <motion.article
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.4 }"
        class="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <ContentRenderer
          v-if="page"
          class="writing" :value="page" />
      </motion.article>
    </template>
  </ThreeColumnLayout>
</template>
