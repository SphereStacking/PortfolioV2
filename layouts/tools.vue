<script setup lang="ts">
import {
  SidebarProvider,
  SidebarInset,
} from '~/components/ui/sidebar'
import {
  TooltipProvider,
} from '~/components/ui/tooltip'
import ToolsSidebar from '~/components/tools/ToolsSidebar.vue'

const route = useRoute()
const { tools } = useTools()

// 現在のツールを取得
const currentTool = computed(() => {
  return tools.find(tool => tool.route === route.path)
})
</script>

<template>
  <div class="min-h-screen flex flex-col relative bg-background">
    <SidebarProvider>
      <TooltipProvider :delay-duration="0">
        <div class="flex w-full">
          <!-- サイドバー -->
          <ToolsSidebar />

          <!-- メインコンテンツ -->
          <SidebarInset class="flex-1">
            <!-- ヘッダー -->
            <MyHeader class="sticky top-0" />
            <main class="p-6">
              <Alert variant="destructive" class="mb-10">
                <AlertCircle class="w-4 h-4" />
                <AlertTitle>注意</AlertTitle>
                <AlertDescription>
                  これらのツールは「vibe coding」で開発されています。<br>
                  予期しない動作や不具合が発生する可能性があります十分ご注意ください。
                </AlertDescription>
              </Alert>
              <slot></slot>
            </main>
          </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  </div>
</template>
