<template>
  <div class="min-h-screen pb-16">
    <PageHeader theme="art">
      <template #title>
        Shader Gallery
      </template>
      <template #description>
        <p class="text-center text-white/90 text-lg mb-8 max-w-3xl mx-auto">
          {{ shaderCount === totalShaderCount ? `${shaderCount}個のシェーダー` : `${shaderCount} / ${totalShaderCount}個のシェーダー` }}
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <Input
            v-model="searchQuery"
            placeholder="タイトル、説明、タグで検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <Button
              v-if="searchQuery"
              variant="outline" size="sm" rounded="full"
              @click="resetFilters">
              <Icon name="heroicons:x-mark" />
            </Button>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="container mx-auto px-4 -mt-8 relative z-10">
      <!-- Shader grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          v-for="(shader, index) in filteredShaders"
          :key="shader.id"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: index * 0.1 }">
          <ClientOnly>
            <ShaderThumbnail
              :shader="shader"
              @click="openShaderDetails(shader)" />
            <template #fallback>
              <div class="aspect-video rounded-lg border bg-zinc-900 animate-pulse"></div>
            </template>
          </ClientOnly>
        </motion.div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredShaders.length === 0" class="text-center py-16 rounded-xl shadow-lg mt-6">
        <Icon name="heroicons:magnifying-glass" class="text-6xl mx-auto mb-6" />
        <h3 class="text-xl font-bold mb-2">
          該当するシェーダーが見つかりませんでした
        </h3>
        <p class="mb-8 max-w-md mx-auto">
          検索条件を変更してみてください。
        </p>
        <Button variant="default" color="primary" @click="resetFilters">
          フィルターをリセット
        </Button>
      </div>

      <!-- Shader detail dialog/modal -->
      <Dialog v-model:open="isDialogOpen">
        <DialogContent class="!w-[90vw] !max-w-5xl overflow-y-auto">
          <div v-if="selectedShader" class="flex flex-col gap-4 mt-4">
            <!-- Player section -->
            <div class="w-full aspect-video">
              <ClientOnly>
                <ShaderViewer
                  :shader="selectedShader"
                  :autoplay="true"
                  :show-fps="true" />
                <template #fallback>
                  <div class="flex h-full items-center justify-center bg-zinc-900 rounded">
                    <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </template>
              </ClientOnly>
            </div>

            <!-- Title and description below player -->
            <div class="px-2">
              <h2 class="text-2xl font-bold mb-2">
                {{ selectedShader?.title }}
              </h2>
              <p class="text-muted-foreground mb-2">
                {{ selectedShader?.description }}
              </p>

              <!-- Tags and metadata -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in selectedShader?.tags" :key="tag"
                  class="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Code tabs -->
            <!-- <Tabs default-value="vertex" class="flex-1">
              <div class="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="vertex">
                    Vertex Shader
                  </TabsTrigger>
                  <TabsTrigger value="fragment">
                    Fragment Shader
                  </TabsTrigger>
                </TabsList>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyShaderCode(codeTab)">
                  <Icon name="lucide:copy" class="h-4 w-4" />
                  コピー
                </Button>
              </div>

              <TabsContent value="vertex" class="mt-2 grow">
                <ClientOnly>
                  <MonacoEditor
                    :model-value="getShaderCode('vertex')"
                    language="csharp"
                    :read-only="true"
                    class="h-80"
                    :options="{
                      minimap: {
                        enabled: false
                      },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      fontSize: 14,
                    }"
                  />
                </ClientOnly>
              </TabsContent>
              <TabsContent value="fragment" class="mt-2 grow">
                <ClientOnly>
                  <MonacoEditor
                    :model-value="getShaderCode('fragment')"
                    language="csharp"
                    :read-only="true"
                    class="h-80"
                    :options="{
                      minimap: {
                        enabled: false
                      },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      fontSize: 14,
                    }"
                  />
                </ClientOnly>
              </TabsContent>
            </Tabs> -->
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import type { ShaderMetadata } from '~/composables/useShaderSources'
import { shaders } from '~/composables/useShaderSources'
import ShaderThumbnail from '~/components/content/ShaderThumbnail.vue'
import ShaderViewer from '~/components/content/ShaderViewer.vue'
import {
  Dialog,
  DialogContent,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

// SEO
useSeoMeta({
  title: 'Shader Gallery - Interactive WebGL Demos',
  description: 'Explore interactive WebGL shader demonstrations showcasing various graphics programming techniques',
  ogTitle: 'Shader Gallery - Interactive WebGL Demos',
  ogDescription: 'Explore interactive WebGL shader demonstrations',
})

// State
const isDialogOpen = ref(false)
const selectedShader = ref<ShaderMetadata | null>(null)
const searchQuery = ref('')
const isLoading = ref(false)
// const codeTab = ref<'vertex' | 'fragment'>('vertex')

// Filtered shaders
const filteredShaders = computed(() => {
  if (!shaders || !Array.isArray(shaders)) {
    console.error('Shaders data not loaded correctly')
    return []
  }
  return shaders.filter((shader) => {
    if (!shader || !shader.metadata) return false

    // Search query filter
    return !searchQuery.value
      || shader.metadata.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      || shader.metadata.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      || shader.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
  })
})

// Count
const shaderCount = computed(() => filteredShaders.value.length)
const totalShaderCount = computed(() => shaders?.length || 0)

// Reset filters
function resetFilters() {
  searchQuery.value = ''
}

// Methods
function openShaderDetails(shader: typeof shaders[number]) {
  selectedShader.value = shader.metadata
  // codeTab.value = 'vertex' // Reset to vertex tab
  isDialogOpen.value = true
}
</script>
