<script setup lang="ts">
import { motion } from 'motion-v'
import { withLeadingSlash, joinURL } from 'ufo'

import type { BreadcrumbItem } from '@nuxt/ui'

const DIR = 'blog'

const route = useRoute()

const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug as string[] : [route.params.slug as string])
const path = computed(() => withLeadingSlash(joinURL(DIR, ...slug.value)))
console.log(path.value)

const { data: page } = await useAsyncData(path.value, async () =>
  await queryCollection(DIR).path(path.value).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

defineOgImageComponent('Article', {
  title: page.value?.title,
  tags: page.value?.tags,
})

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
  },
  {
    label: 'Blog',
    icon: 'i-lucide-box',
    to: '/blog',
  },
])

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
</script>

<template>
  <ThreeColumnLayout
    class="container mx-auto mb-16"
    :left="{ class: 'hidden' }"
    :main="{ class: 'md:col-span-9 xl:col-span-9 col-span-12' }"
    :right="{ class: 'md:col-span-3 xl:col-span-3 col-span-0' }">
    <template #header>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0 }" class="mt-2">
        <Breadcrumb :items="items" />
      </motion.div>
      <motion.h1
        id="top"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }" class="text-6xl font-monomaniac-one my-10">
        {{ page?.title }}
      </motion.h1>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }" class="flex items-center gap-2">
        <Badge v-for="tag in page?.tags" :key="tag" :label="tag" />
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
        class="sticky top-30 hidden md:block bg-neutral-800 rounded-lg p-4">
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
