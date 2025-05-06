<script setup>
const { credit, links } = useMyProfile()

const pages = {
  Links: Object.values(links).map(link => ({
    component: 'NuxtLink',
    url: link.url,
    label: link.name,
    target: '_blank',
  })),
  Legal: [
    { component: 'NuxtLink', url: '/legal/privacy-policy', label: 'プライバシーポリシー', target: '_self' },
  ],
}
</script>

<template>
  <footer class="space-y-4 bg-base-300 p-4 text-center">
    <div class="mx-auto grid max-w-4xl  grid-cols-2 gap-2 md:grid-cols-6 md:gap-12">
      <AppMark class="col-span-3 row-span-full h-14 md:col-span-1" />
      <div v-for="(items, section) in pages" :key="section" class="text-left">
        <p class="text-lg font-bold">
          {{ section }}
        </p>
        <ul class="list-none">
          <li v-for="link in items" :key="link.url">
            <component
              :is="link.component" :to="link.url" class="text-sm hover:underline"
              :target="link.target">
              {{ link.label }}
            </component>
          </li>
        </ul>
      </div>
    </div>
    <p>{{ credit }}</p>
  </footer>
</template>

<style scoped>
</style>
