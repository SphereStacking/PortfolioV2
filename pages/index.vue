<script setup>
import ArtHelloThree from '~/components/Art/3d/ArtHelloThree.vue'

useHead({
  bodyAttrs: {
    class: 'overflow-hidden',
  },
})

defineOgImageComponent('MyProfile', {})
</script>

<template>
  <div class="relative h-[calc(100vh-4rem)] bg-background overflow-hidden">
    <ProfileCard class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1" />
    <ArtHelloThree class="absolute inset-0 z-0 opacity-50" />
  </div>
</template>
