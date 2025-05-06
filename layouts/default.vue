<template>
  <div class="min-h-screen flex flex-col relative">
    <!-- ヘッダー -->
    <MyHeader class="sticky top-0 z-50" />

    <!-- メインコンテンツ -->
    <main class="grow flex flex-col">
      <slot></slot>
    </main>

    <!-- フッター -->
    <MyFooter class="bg-black" />
  </div>
</template>

<script setup>
// メタ情報の設定
useHead({
  htmlAttrs: {
    lang: 'ja',
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'format-detection', content: 'telephone=no' },
  ],
})
</script>
