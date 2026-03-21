<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})
// 状態管理
const inputJson = ref('')
const formattedJson = ref('')
const indentSize = ref(2)
const sortKeys = ref(false)
const error = ref('')
const isValidJson = ref(false)

// JSONサンプルプリセット
const jsonPresets = [
  {
    label: 'User Object',
    value: JSON.stringify({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      isActive: true,
    }, null, 2),
  },
  {
    label: 'API Response',
    value: JSON.stringify({
      status: 'success',
      data: {
        items: [
          { id: 1, title: 'Item 1', price: 100 },
          { id: 2, title: 'Item 2', price: 200 },
        ],
        total: 2,
      },
      timestamp: '2024-01-01T00:00:00Z',
    }, null, 2),
  },
  {
    label: 'Package.json',
    value: JSON.stringify({
      name: 'my-app',
      version: '1.0.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
      },
      dependencies: {
        vue: '^3.0.0',
      },
    }, null, 2),
  },
  {
    label: 'Config',
    value: JSON.stringify({
      database: {
        host: 'localhost',
        port: 5432,
        name: 'mydb',
      },
      cache: {
        enabled: true,
        ttl: 3600,
      },
    }, null, 2),
  },
]

const selectPreset = (json: string) => {
  inputJson.value = json
}

// JSON統計情報
const jsonStats = computed(() => {
  if (!isValidJson.value) return null

  try {
    const parsed = JSON.parse(inputJson.value)

    const countElements = (obj: unknown): { objects: number, arrays: number, strings: number, numbers: number, booleans: number, nulls: number } => {
      const stats = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 }

      const traverse = (item: unknown) => {
        if (item === null) {
          stats.nulls++
        }
        else if (typeof item === 'boolean') {
          stats.booleans++
        }
        else if (typeof item === 'number') {
          stats.numbers++
        }
        else if (typeof item === 'string') {
          stats.strings++
        }
        else if (Array.isArray(item)) {
          stats.arrays++
          item.forEach(traverse)
        }
        else if (typeof item === 'object') {
          stats.objects++
          Object.values(item).forEach(traverse)
        }
      }

      traverse(obj)
      return stats
    }

    const stats = countElements(parsed)
    const depth = JSON.stringify(parsed).split('').reduce((max, char, i, arr) => {
      let level = 0
      for (let j = 0; j <= i; j++) {
        if (arr[j] === '{' || arr[j] === '[') level++
        if (arr[j] === '}' || arr[j] === ']') level--
      }
      return Math.max(max, level)
    }, 0)

    return {
      ...stats,
      depth,
      size: new Blob([inputJson.value]).size,
    }
  }
  catch {
    return null
  }
})

// ソートキー関数
const sortObjectKeys = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }
  else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeys(obj[key])
        return result
      }, {} as Record<string, unknown>)
  }
  return obj
}

// JSON整形
const formatJson = () => {
  error.value = ''

  if (!inputJson.value.trim()) {
    formattedJson.value = ''
    isValidJson.value = false
    return
  }

  try {
    let parsed = JSON.parse(inputJson.value)

    if (sortKeys.value) {
      parsed = sortObjectKeys(parsed)
    }

    formattedJson.value = JSON.stringify(parsed, null, indentSize.value)
    isValidJson.value = true
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid JSON'
    formattedJson.value = ''
    isValidJson.value = false
  }
}

// JSON圧縮
const minifyJson = () => {
  error.value = ''

  if (!inputJson.value.trim()) {
    formattedJson.value = ''
    isValidJson.value = false
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)
    formattedJson.value = JSON.stringify(parsed)
    isValidJson.value = true
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid JSON'
    formattedJson.value = ''
    isValidJson.value = false
  }
}

// エスケープ/アンエスケープ
const escapeJson = () => {
  formattedJson.value = JSON.stringify(inputJson.value)
}

const unescapeJson = () => {
  try {
    formattedJson.value = JSON.parse(inputJson.value)
  }
  catch {
    error.value = 'Invalid escaped JSON string'
  }
}

// クリップボード操作
const { copy } = useClipboard()
const toast = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast.add({
      title: 'コピーしました',
      description: 'JSONをクリップボードにコピーしました',
    })
  }
  catch (err) {
    console.error('Failed to copy:', err)
    toast.add({
      title: 'エラー',
      description: 'クリップボードへのコピーに失敗しました',
      color: 'error',
    })
  }
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputJson.value = text
    formatJson()
  }
  catch (err) {
    console.error('Failed to paste:', err)
  }
}

// ファイル操作
const loadFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    inputJson.value = e.target?.result as string
    formatJson()
  }
  reader.readAsText(file)
}

const downloadJson = () => {
  const blob = new Blob([formattedJson.value || inputJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'formatted.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 入力の変更を監視
watch(inputJson, () => {
  if (inputJson.value) {
    formatJson()
  }
})

// サンプルJSON
const sampleJson = {
  name: 'サンプルプロジェクト',
  version: '1.0.0',
  dependencies: {
    vue: '^3.0.0',
    nuxt: '^3.0.0',
  },
  scripts: {
    dev: 'nuxt dev',
    build: 'nuxt build',
  },
  array: [1, 2, 3, { nested: true }],
  boolean: true,
  null: null,
}

const loadSample = () => {
  inputJson.value = JSON.stringify(sampleJson, null, 2)
  formatJson()
}

// SEO設定
useSeoMeta({
  title: 'JSON整形・検証ツール | Web開発ツール',
  description: 'JSONの整形、検証、圧縮、エスケープ処理。JSONの構造を視覚的に確認できます。',
})
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        JSON整形・検証ツール
      </h1>
      <p class="text-muted-foreground">
        JSONの整形、検証、圧縮、エスケープ処理を行います。
      </p>
    </div>

    <!-- プリセットセクション -->
    <UCard class="col-span-full">
      <template #header>
        <h3 class="font-semibold">
          サンプルJSON
        </h3>
      </template>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="preset in jsonPresets"
          :key="preset.label"
          variant="outline"
          size="sm"
          @click="selectPreset(preset.value)">
          {{ preset.label }}
        </UButton>
      </div>
    </UCard>
    <!-- 左側：操作パネル -->
    <div class="space-y-6 col-span-1">
      <!-- コントロールパネル -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            コントロールパネル
          </h3>
        </template>
        <div class="space-y-3">
          <UButton class="w-full" @click="formatJson">
            <Icon name="heroicons:code-bracket" class="w-4 h-4 mr-2" />
            整形
          </UButton>
          <UButton variant="outline" class="w-full" @click="minifyJson">
            <Icon name="heroicons:arrows-pointing-in" class="w-4 h-4 mr-2" />
            圧縮
          </UButton>
          <div class="grid grid-cols-2 gap-2">
            <UButton variant="outline" @click="escapeJson">
              <Icon name="heroicons:chat-bubble-bottom-center-text" class="w-4 h-4 mr-2" />
              エスケープ
            </UButton>
            <UButton variant="outline" @click="unescapeJson">
              <Icon name="heroicons:code-bracket" class="w-4 h-4 mr-2" />
              アンエスケープ
            </UButton>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <UButton variant="outline" @click="pasteFromClipboard">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
              貼り付け
            </UButton>
            <UButton variant="outline" @click="loadSample">
              <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
              サンプル
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- 設定 -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            設定
          </h3>
        </template>
        <div class="space-y-3">
          <label class="flex items-center gap-2">
            <input
              v-model="sortKeys"
              type="checkbox"
              class="rounded"
              @change="formatJson">
            <span class="text-sm">キーをソート</span>
          </label>
          <div>
            <label class="text-sm font-medium mb-2 block">インデント</label>
            <select
              v-model.number="indentSize"
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              @change="formatJson">
              <option :value="2">
                2スペース
              </option>
              <option :value="4">
                4スペース
              </option>
              <option :value="0">
                タブ
              </option>
            </select>
          </div>
        </div>
      </UCard>

      <!-- JSON統計情報 -->
      <UCard v-if="jsonStats">
        <template #header>
          <h3 class="font-semibold">
            統計情報
          </h3>
        </template>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">オブジェクト</span>
            <span class="font-medium">{{ jsonStats.objects }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">配列</span>
            <span class="font-medium">{{ jsonStats.arrays }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">文字列</span>
            <span class="font-medium">{{ jsonStats.strings }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">数値</span>
            <span class="font-medium">{{ jsonStats.numbers }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">真偽値</span>
            <span class="font-medium">{{ jsonStats.booleans }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">null</span>
            <span class="font-medium">{{ jsonStats.nulls }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">最大深度</span>
            <span class="font-medium">{{ jsonStats.depth }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">サイズ</span>
            <span class="font-medium">{{ (jsonStats.size / 1024).toFixed(1) }}KB</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 右側：入出力エリア -->
    <div class="space-y-4 col-span-2">
      <!-- 入力エリア -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              入力
            </h3>
            <div class="flex gap-2">
              <label>
                <input
                  type="file"
                  accept=".json"
                  class="hidden"
                  @change="loadFile">
                <UButton size="sm" variant="ghost" as="span">
                  <Icon name="heroicons:arrow-up-tray" class="w-4 h-4" />
                </UButton>
              </label>
              <UButton
                size="sm"
                variant="ghost"
                @click="inputJson = ''">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
        </template>
        <textarea
          v-model="inputJson"
          placeholder="JSONを入力またはペーストしてください..."
          class="w-full h-[300px] p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          spellcheck="false"></textarea>
      </UCard>

      <!-- 出力エリア -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              出力
              <UBadge
                v-if="isValidJson"
                class="ml-2">
                Valid
              </UBadge>
              <UBadge
                v-else-if="error"
                color="error"
                class="ml-2">
                Invalid
              </UBadge>
            </h3>
            <div class="flex gap-2">
              <UButton
                size="sm"
                variant="ghost"
                :disabled="!formattedJson && !inputJson"
                @click="copyToClipboard(formattedJson || inputJson)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </UButton>
              <UButton
                size="sm"
                variant="ghost"
                :disabled="!formattedJson && !inputJson"
                @click="downloadJson">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
        </template>
        <div v-if="error" class="mb-4">
          <UAlert color="error" :description="error" icon="i-heroicons-exclamation-circle" />
        </div>
        <pre
          v-if="formattedJson"
          class="w-full h-[300px] p-3 font-mono text-sm border rounded-md bg-muted overflow-auto">{{ formattedJson }}</pre>
        <div
          v-else
          class="w-full h-[300px] p-3 border rounded-md bg-muted flex items-center justify-center text-muted-foreground">
          整形されたJSONがここに表示されます
        </div>
      </UCard>
    </div>
  </div>
</template>
