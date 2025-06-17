<script setup lang="ts">
import MyNavigation from './project/MyNavigation.vue'
import ColorModeDropdown from './modules/colorMode/ColorModeDropdown.vue'
import ProfileLinksDropdown from './ProfileLinksDropdown.vue'
</script>

<template>
  <header class="relative  backdrop-blur-xs ">
    <!-- ヘッダー -->
    <div class="h-16  sticky top-0 border-b border-gray-200">
      <div class="container h-full md:mx-auto px-2">
        <div class="flex items-center justify-between gap-3 h-full">
          <!-- 左側 -->
          <div class="lg:flex-1 flex items-center gap-1.5">
            <AppMark />
          </div>

          <!-- 中央 -->
          <MyNavigation />

          <!-- 右側 -->
          <div class="flex items-center justify-end lg:flex-1 gap-1.5">
            <ColorModeDropdown />
            <ProfileLinksDropdown />
          </div>
        </div>
      </div>
    </div>
    <slot name="tools-footer"></slot>
  </header>
</template>

<style scoped>
</style>
