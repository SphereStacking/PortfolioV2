<script setup lang="ts">
import ToolsSidebar from '~/components/tools/ToolsSidebar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col relative bg-background">
    <div class="flex w-full">
      <!-- サイドバー -->
      <ToolsSidebar />

      <!-- メインコンテンツ -->
      <div class="flex-1 min-w-0">
        <!-- ヘッダー -->
        <MyHeader class="sticky top-0" />
        <main class="p-6">
          <UAlert
            color="error"
            class="mb-10"
            icon="i-heroicons-exclamation-circle"
            title="注意"
            description="これらのツールは「vibe coding」で開発されています。予期しない動作や不具合が発生する可能性があります十分ご注意ください。" />
          <slot></slot>
        </main>
      </div>
    </div>
  </div>
</template>
