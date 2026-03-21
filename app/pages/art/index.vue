<script setup>
const artCategories = [
  {
    title: '3D Art',
    description: 'Three.js powered 3D graphics and animations',
    path: '/art/3d',
    gradient: 'from-teal-800/70 via-teal-500/70 to-teal-200/70',
    icon: '🎨',
  },
  {
    title: 'CSS Art',
    description: 'Pure CSS animations and visual effects',
    path: '/art/css',
    gradient: 'from-purple-800/70 via-purple-500/70 to-purple-200/70',
    icon: '✨',
  },
  {
    title: 'Graphics Programming',
    description: 'WebGL and WebGPU graphics demonstrations',
    path: '/art/graphics',
    gradient: 'from-indigo-800/70 via-blue-600/70 to-cyan-500/70',
    icon: '🚀',
  },
]
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-purple-800/70 via-pink-500/70 to-orange-400/70' }">
      <template #title>
        Art & Graphics
      </template>
    </PageHeader>

    <div class="container mx-auto mb-16 mt-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="category in artCategories"
          :key="category.path"
          :to="category.path"
          class="group">
          <UCard class="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <template #header>
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ category.icon }}</span>
                <h3 class="font-semibold">{{ category.title }}</h3>
              </div>
            </template>

            <p class="text-sm text-(--ui-text-muted)">{{ category.description }}</p>

            <template #footer>
              <div
                :class="[
                  'w-full h-2 rounded-full bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity',
                  category.gradient,
                ]"></div>
            </template>
          </UCard>
        </NuxtLink>
      </div>

      <div class="mt-12">
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              About This Section
            </h3>
          </template>
          <div class="prose prose-zinc dark:prose-invert max-w-none">
            <p>
              Welcome to my creative playground where I explore various forms of digital art and graphics programming.
              Each section showcases different technologies and techniques for creating visual experiences on the web.
            </p>
            <ul>
              <li><strong>3D Art</strong> - Interactive 3D scenes using Three.js and WebGL</li>
              <li><strong>CSS Art</strong> - Pure CSS animations and gradients pushing the boundaries of styling</li>
              <li><strong>Graphics Programming</strong> - Low-level graphics APIs comparison between WebGL and WebGPU</li>
            </ul>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
