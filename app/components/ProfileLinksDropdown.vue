<script setup lang="ts">
const profile = useMyProfile()
const links = Object.values(profile.links)

const items = computed(() => links.map(link => ({
  label: link.name,
  icon: link.icon,
  to: link.url,
  target: '_blank',
})))
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton
      variant="ghost" icon="i-lucide-more-horizontal" size="md"
      square />
  </UDropdownMenu>
</template>
