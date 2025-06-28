<script setup lang="ts">
import { motion } from 'motion-v'
import { withLeadingSlash, joinURL } from 'ufo'
import ArticleCard from '~/components/content/ArticleCard.vue'
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
  // pathが存在しない場合は空配列（ブログトップページ）
  if (!route.params.path) return []

  return Array.isArray(route.params.path)
    ? route.params.path as string[]
    : [route.params.path as string]
})

// ページタイプの判定
const isIndexPage = computed(() => pathParams.value.length === 0)
const isArchivePage = computed(() =>
  !isIndexPage.value
  && pathParams.value.every(p => /^\d+$/.test(p))
  && pathParams.value.length <= 3, // 年/月/日までの階層
)
const isArticlePage = computed(() => !isIndexPage.value && !isArchivePage.value)

// 共通の変数定義
const year = computed(() => pathParams.value[0])
const month = computed(() => pathParams.value[1])
const day = computed(() => pathParams.value[2])

// === ブログインデックス用の処理 ===

// ブログインデックスページのタイトル
const indexPageTitle = 'Blog'

// 全記事を取得（インデックス用）
const { data: allBlogPosts } = await useAsyncData(
  'blog-index',
  async () => {
    if (!isIndexPage.value) return null

    return await queryCollection('blog')
      .where('draft', '=', false)
      .sort('created', 'desc')
      .all()
  },
)

// === アーカイブページ用の処理 ===

// パンくずリスト（アーカイブ用）
const archiveBreadcrumbItems = computed(() => {
  const items = [
    { label: 'Blog', icon: 'heroicons:book-open', to: '/blog' },
  ]

  if (year.value) {
    items.push({ label: year.value, to: `/blog/${year.value}` })
  }
  if (month.value) {
    items.push({ label: month.value.padStart(2, '0'), to: `/blog/${year.value}/${month.value}` })
  }
  if (day.value) {
    items.push({ label: day.value.padStart(2, '0'), to: `/blog/${year.value}/${month.value}/${day.value}` })
  }

  return items
})

// タイトル（アーカイブ用）
const pageTitle = computed(() => {
  if (!isArchivePage.value) return ''

  if (day.value) {
    return `${year.value}年${month.value}月${day.value}日の記事`
  }
  else if (month.value) {
    return `${year.value}年${month.value}月の記事`
  }
  else {
    return `${year.value}年の記事`
  }
})

// 記事を取得（アーカイブ用）
const { data: archivePosts } = await useAsyncData(
  `blog-archive-${pathParams.value.join('-')}`,
  async () => {
    if (!isArchivePage.value) return null

    // 全記事を取得
    const allPosts = await queryCollection('blog').where('draft', '=', false).all()

    // 日付でフィルタリング
    const filteredPosts = allPosts.filter((post) => {
      // createdフィールドから日付を取得
      const postDate = new Date(post.created)
      const postYear = postDate.getFullYear().toString()
      const postMonth = (postDate.getMonth() + 1).toString().padStart(2, '0')
      const postDay = postDate.getDate().toString().padStart(2, '0')

      if (day.value) {
        // 日別アーカイブ
        return postYear === year.value && postMonth === month.value.padStart(2, '0') && postDay === day.value.padStart(2, '0')
      }
      else if (month.value) {
        // 月別アーカイブ
        return postYear === year.value && postMonth === month.value.padStart(2, '0')
      }
      else if (year.value) {
        // 年別アーカイブ
        return postYear === year.value
      }

      return false
    })

    // 日付順でソート（新しい順）
    return filteredPosts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  },
)

// 月別グループ化（年表示の場合のみ）
const groupedPosts = computed(() => {
  if (!isArchivePage.value || month.value || day.value) return null

  const groups: Record<string, any[]> = {}

  archivePosts.value?.forEach((post) => {
    const date = new Date(post.created)
    const key = `${date.getMonth() + 1}月`

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(post)
  })

  return groups
})

// === 記事詳細ページ用の処理 ===

// コンテンツを取得（記事詳細用）
const { data: page } = await useAsyncData(
  `blog-article-${pathParams.value.join('-')}`,
  async () => {
    if (isArchivePage.value) return null

    const path = withLeadingSlash(joinURL(DIR, ...pathParams.value))

    // まず完全なパスで試す
    let content = await queryCollection(DIR).path(path).first()

    // 見つからない場合は、2.blogプレフィックス付きで試す
    if (!content) {
      const contentPath = withLeadingSlash(joinURL('2.blog', ...pathParams.value))
      content = await queryCollection(DIR).path(contentPath.value).first()
    }

    // それでも見つからない場合は、年/月/日/ファイル名の構造でwhere検索
    if (!content && pathParams.value.length === 4) {
      const fileName = pathParams.value[pathParams.value.length - 1]
      content = await queryCollection(DIR)
        .where('_path', 'contains', `/${pathParams.value.join('/')}`)
        .first()
    }

    return content
  },
)

// パンくずリスト（記事詳細用）
const articleBreadcrumbItems = computed(() => {
  if (!page.value) return []

  const items = [
    { label: 'Blog', icon: 'heroicons:book-open', to: '/blog' },
  ]

  // 年/月/日のパンくずを追加
  if (pathParams.value.length >= 4) {
    const [year, month, day] = pathParams.value

    // 年
    items.push({
      label: year,
      to: `/blog/${year}`,
    })

    // 月
    items.push({
      label: `${month}`,
      to: `/blog/${year}/${month}`,
    })

    // 日
    items.push({
      label: `${day}`,
      to: `/blog/${year}/${month}/${day}`,
    })

    // 記事タイトル（最後の要素なのでリンクなし）
    items.push({
      label: page.value.title,
    })
  }

  return items
})

// 目次リンク（記事詳細用）
const links = computed(() => {
  if (!page.value) return []

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

// エラーハンドリング
if (isArchivePage.value && (!archivePosts.value || archivePosts.value.length === 0)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'No articles found for this period',
  })
}

if (isArticlePage.value && !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

// OGP設定
if (isIndexPage.value) {
  defineOgImageComponent('Default', {
    title: indexPageTitle,
  })
}
else if (isArchivePage.value) {
  defineOgImageComponent('Default', {
    title: pageTitle.value,
  })
}
else if (isArticlePage.value) {
  defineOgImageComponent('Article', {
    title: page.value?.title,
    tags: page.value?.tags,
  })
}
</script>

<template>
  <!-- ブログインデックスページ -->
  <div v-if="isIndexPage" class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-emerald-800/70 via-teal-500/70 to-green-200/70' }">
      <template #title>
        {{ indexPageTitle }}
      </template>
    </PageHeader>
    <div class="container mx-auto mb-16 mt-8">
      <ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(post, index) in allBlogPosts"
          :key="post._id">
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: index * 0.1 }">
            <ArticleCard
              :data="post" />
          </motion.div>
        </li>
      </ul>
    </div>
  </div>

  <!-- アーカイブページ -->
  <div v-else-if="isArchivePage" class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-emerald-800/70 via-teal-500/70 to-green-200/70' }">
      <template #title>
        {{ pageTitle }}
      </template>
    </PageHeader>

    <div class="container mx-auto mb-16 mt-8">
      <motion.div
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.5 }"
        class="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <template v-for="(item, index) in archiveBreadcrumbItems" :key="item.label">
              <BreadcrumbItem>
                <BreadcrumbLink v-if="item.to" :href="item.to">
                  <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />
                  <span v-else>{{ item.label }}</span>
                </BreadcrumbLink>
                <BreadcrumbPage v-else>
                  {{ item.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="index < archiveBreadcrumbItems.length - 1" />
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      <!-- 年表示で月別グループがある場合 -->
      <template v-if="groupedPosts">
        <div v-for="(monthPosts, monthName) in groupedPosts" :key="monthName" class="mb-12">
          <motion.h2
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.5 }"
            class="text-2xl font-bold mb-6 text-muted-foreground">
            {{ monthName }}
          </motion.h2>

          <ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="(post, index) in monthPosts"
              :key="post._id">
              <motion.div
                :initial="{ opacity: 0, y: 20 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ duration: 0.5, delay: index * 0.05 }">
                <ArticleCard :data="post" />
              </motion.div>
            </li>
          </ul>
        </div>
      </template>

      <!-- 月・日表示の場合 -->
      <template v-else>
        <ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="(post, index) in archivePosts"
            :key="post._id">
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.5, delay: index * 0.1 }">
              <ArticleCard :data="post" />
            </motion.div>
          </li>
        </ul>
      </template>
    </div>
  </div>

  <!-- 記事詳細ページ -->
  <ThreeColumnLayout
    v-else
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
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0 }" class="mt-2">
        <Breadcrumb>
          <BreadcrumbList>
            <template v-for="(item, index) in articleBreadcrumbItems" :key="item.label">
              <BreadcrumbItem>
                <BreadcrumbLink v-if="item.to" :href="item.to">
                  <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />
                  <span v-else>{{ item.label }}</span>
                </BreadcrumbLink>
                <BreadcrumbPage v-else>
                  {{ item.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="index < articleBreadcrumbItems.length - 1" />
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
        <Badge v-for="tag in page?.tags" :key="tag">
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
