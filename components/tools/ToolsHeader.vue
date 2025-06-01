<script setup lang="ts">
import {
  SidebarTrigger,
  SidebarSeparator,
} from '~/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '~/components/ui/breadcrumb'

interface Props {
  currentTool?: {
    name: string
    route: string
  } | null
}

defineProps<Props>()
</script>

<template>
  <header class="sticky top-16 z-40 flex h-10 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="flex items-center gap-2 px-4 justify-center">
      <SidebarTrigger class="-ml-1" />
      <SidebarSeparator orientation="vertical" class="h-4" />
      <!-- パンくずリスト -->
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Icon name="heroicons:home" class="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/tools">
              ツール
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="currentTool" />
          <BreadcrumbItem v-if="currentTool">
            <BreadcrumbPage>
              {{ currentTool.name }}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
</template>
