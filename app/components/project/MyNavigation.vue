<script setup lang="ts">
import { useNavigation } from '~/composables/useNavigation'

const {
  aboutComponents,
  contentsComponents,
  worksComponents,
  creativeComponents,
} = useNavigation()

function mapToItems(components: Array<{ title: string, description: string, href: string, icon?: string }>) {
  return components.map(c => ({
    label: c.title,
    description: c.description,
    icon: c.icon,
    to: c.href,
  }))
}

const items = computed(() => [
  {
    label: 'About',
    icon: 'i-heroicons-user',
    children: mapToItems(aboutComponents),
  },
  {
    label: 'Contents',
    icon: 'i-heroicons-document-text',
    children: mapToItems(contentsComponents),
  },
  {
    label: 'Works',
    icon: 'i-heroicons-folder',
    children: mapToItems(worksComponents),
  },
  {
    label: 'Creative',
    icon: 'i-heroicons-beaker',
    children: mapToItems(creativeComponents),
  },
])
</script>

<template>
  <UNavigationMenu :items="items" />
</template>
