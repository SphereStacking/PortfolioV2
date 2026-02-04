<script setup>
import ArtHelloThree from '~/components/Art/3d/ArtHelloThree.vue'

defineOgImageComponent('MyProfile', {})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full grow">
    <ProfileCard class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1" />
    <ArtHelloThree class="absolute top-0 left-0 w-full h-full z-0" />
  </div>
</template>
