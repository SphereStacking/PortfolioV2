<script setup>
defineOgImageComponent('MyProfile', {})
</script>

<template>
  <div class="relative w-screen h-screen">
    <ProfileCard class="absolute -translate-x-1/2 -translate-y-1/2 z-1 top-1/2 left-1/2" />
    <!-- <ArtNebula class="absolute z-0" /> -->
    <div class="absolute w-full h-full bg-black"></div>
  </div>
</template>

<style scoped>

</style>
