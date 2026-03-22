<script setup lang="ts">
const isOpen = ref(false)
const { navigationCategories } = useNavigation()
</script>

<template>
  <header class="relative backdrop-blur-xs z-50">
    <!-- ヘッダー -->
    <div class="h-16 sticky top-0 border-b border-border">
      <div class="container h-full md:mx-auto px-2">
        <div class="flex items-center justify-between gap-3 h-full">
          <!-- 左側 -->
          <div class="flex-1 flex items-center gap-1.5">
            <AppMark />
          </div>

          <!-- デスクトップナビゲーション（sm以上で表示） -->
          <div class="hidden sm:flex items-center gap-3">
            <MyNavigation />
            <ColorModeDropdown />
            <ProfileLinksDropdown />
          </div>

          <!-- モバイルメニュー（sm未満で表示） -->
          <div class="sm:hidden">
            <USlideover v-model:open="isOpen" side="top" title="メニュー">
              <UButton
                variant="ghost" icon="i-heroicons-bars-3" size="md"
                square />

              <template #header>
                <div class="flex items-center gap-2">
                  <AppMark />
                </div>
              </template>

              <template #body>
                <!-- モバイルナビゲーション -->
                <nav class="px-2">
                  <div v-for="category in navigationCategories" :key="category.name">
                    <h3 class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Icon :name="category.icon" class="w-3 h-3" />
                      {{ category.name }}
                    </h3>
                    <ul>
                      <li v-for="item in category.items" :key="item.href">
                        <NuxtLink
                          :href="item.href"
                          class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                          @click="isOpen = false">
                          <Icon :name="item.icon" class="w-5 h-5 text-muted-foreground" />
                          <span class="font-medium">{{ item.title }}</span>
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </nav>

                <!-- モバイル用フッター -->
                <div class="mt-2 pt-6 border-t space-y-2">
                  <!-- カラーモード切り替え -->
                  <div class="flex items-center justify-between px-4">
                    <span class="text-sm font-medium">カラーモード</span>
                    <ColorModeDropdown />
                  </div>

                  <!-- プロフィールリンク -->
                  <div class="flex items-center justify-between px-4">
                    <span class="text-sm font-medium">ソーシャルリンク</span>
                    <ProfileLinksDropdown />
                  </div>
                </div>
              </template>
            </USlideover>
          </div>
        </div>
      </div>
    </div>
    <slot name="tools-footer"></slot>
  </header>
</template>
