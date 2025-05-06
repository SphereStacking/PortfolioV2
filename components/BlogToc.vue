<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

defineProps<{
  title?: string
  links?: TocLink[]
}>()
</script>

<template>
  <div v-if="links?.length">
    <nav class="text-xs">
      <ul class="space-y-1">
        <li v-for="link in links" :key="link.id" :class="`toc-level-${link.depth}`">
          <a :href="`#${link.id}`" class="hover:text-primary transition-colors">
            {{ link.text }}
          </a>
          <ul v-if="link.children?.length" class="mt-1 space-y-1">
            <li v-for="child in link.children" :key="child.id" :class="`toc-level-${child.depth}`">
              <a :href="`#${child.id}`" class="hover:text-primary transition-colors">
                {{ child.text }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.toc-level-3 {
  margin-left: 1rem;
}

.toc-level-4 {
  margin-left: 2rem;
}

.toc-level-5 {
  margin-left: 3rem;
}

.toc-level-6 {
  margin-left: 4rem;
}
</style>
