<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 状態管理
const inputJson = ref('')
const formattedJson = ref('')
const indentSize = ref(2)
const sortKeys = ref(false)
const error = ref('')
const isValidJson = ref(false)

// JSON統計情報
const jsonStats = computed(() => {
  if (!isValidJson.value) return null

  try {
    const parsed = JSON.parse(inputJson.value)
    
    const countElements = (obj: any): { objects: number; arrays: number; strings: number; numbers: number; booleans: number; nulls: number } => {
      let stats = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 }
      
      const traverse = (item: any) => {
        if (item === null) {
          stats.nulls++
        } else if (typeof item === 'boolean') {
          stats.booleans++
        } else if (typeof item === 'number') {
          stats.numbers++
        } else if (typeof item === 'string') {
          stats.strings++
        } else if (Array.isArray(item)) {
          stats.arrays++
          item.forEach(traverse)
        } else if (typeof item === 'object') {
          stats.objects++
          Object.values(item).forEach(traverse)
        }
      }
      
      traverse(parsed)
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
  } catch {
    return null
  }
})

// ソートキー関数
const sortObjectKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeys(obj[key])
        return result
      }, {} as any)
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    error.value = 'Invalid escaped JSON string'
  }
}

// クリップボード操作
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: トースト通知を表示
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputJson.value = text
    formatJson()
  } catch (err) {
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
  "name": "サンプルプロジェクト",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.0.0",
    "nuxt": "^3.0.0"
  },
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build"
  },
  "array": [1, 2, 3, { "nested": true }],
  "boolean": true,
  "null": null
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
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div class="mb-8">
      <NuxtLink
        to="/tools"
        class="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <Icon name="ChevronLeft" class="w-4 h-4 mr-1" />
        ツール一覧に戻る
      </NuxtLink>
      
      <h1 class="text-3xl font-bold mb-2">JSON整形・検証ツール</h1>
      <p class="text-muted-foreground">
        JSONの整形、検証、圧縮、エスケープ処理を行います。
      </p>
    </div>

    <!-- ツールバー -->
    <div class="mb-6 flex flex-wrap gap-2">
      <Button @click="formatJson" variant="default">
        <Icon name="FileCode" class="w-4 h-4 mr-2" />
        整形
      </Button>
      <Button @click="minifyJson" variant="outline">
        <Icon name="Minimize2" class="w-4 h-4 mr-2" />
        圧縮
      </Button>
      <Button @click="escapeJson" variant="outline">
        <Icon name="Quote" class="w-4 h-4 mr-2" />
        エスケープ
      </Button>
      <Button @click="unescapeJson" variant="outline">
        <Icon name="Code" class="w-4 h-4 mr-2" />
        アンエスケープ
      </Button>
      <Button @click="pasteFromClipboard" variant="outline">
        <Icon name="Clipboard" class="w-4 h-4 mr-2" />
        貼り付け
      </Button>
      <Button @click="loadSample" variant="outline">
        <Icon name="FileText" class="w-4 h-4 mr-2" />
        サンプル
      </Button>
      <div class="flex-1"></div>
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          v-model="sortKeys"
          @change="formatJson"
          class="rounded">
        キーをソート
      </label>
      <select
        v-model.number="indentSize"
        @change="formatJson"
        class="h-10 px-3 rounded-md border border-input bg-background text-sm">
        <option :value="2">2スペース</option>
        <option :value="4">4スペース</option>
        <option :value="0">タブ</option>
      </select>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- 入力エリア -->
      <div class="space-y-4">
        <Card class="h-full">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>入力</CardTitle>
              <div class="flex gap-2">
                <label>
                  <input
                    type="file"
                    accept=".json"
                    @change="loadFile"
                    class="hidden">
                  <Button size="sm" variant="ghost" as="span">
                    <Icon name="Upload" class="w-4 h-4" />
                  </Button>
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="inputJson = ''">
                  <Icon name="X" class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              v-model="inputJson"
              placeholder="JSONを入力またはペーストしてください..."
              class="w-full h-[400px] p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              spellcheck="false">
            </textarea>
          </CardContent>
        </Card>
      </div>

      <!-- 出力エリア -->
      <div class="space-y-4">
        <Card class="h-full">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>
                出力
                <Badge
                  v-if="isValidJson"
                  variant="default"
                  class="ml-2">
                  Valid
                </Badge>
                <Badge
                  v-else-if="error"
                  variant="destructive"
                  class="ml-2">
                  Invalid
                </Badge>
              </CardTitle>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(formattedJson || inputJson)"
                  :disabled="!formattedJson && !inputJson">
                  <Icon name="Copy" class="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="downloadJson"
                  :disabled="!formattedJson && !inputJson">
                  <Icon name="Download" class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="error" class="mb-4">
              <Alert variant="destructive">
                <Icon name="AlertCircle" class="h-4 w-4" />
                <AlertDescription>
                  {{ error }}
                </AlertDescription>
              </Alert>
            </div>
            <pre
              v-if="formattedJson"
              class="w-full h-[400px] p-3 font-mono text-sm border rounded-md bg-muted overflow-auto">{{ formattedJson }}</pre>
            <div
              v-else
              class="w-full h-[400px] p-3 border rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              整形されたJSONがここに表示されます
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- JSON統計情報 -->
    <Card v-if="jsonStats" class="mt-6">
      <CardHeader>
        <CardTitle>JSON統計情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ jsonStats.objects }}</div>
            <div class="text-sm text-muted-foreground">オブジェクト</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ jsonStats.arrays }}</div>
            <div class="text-sm text-muted-foreground">配列</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ jsonStats.strings }}</div>
            <div class="text-sm text-muted-foreground">文字列</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ jsonStats.numbers }}</div>
            <div class="text-sm text-muted-foreground">数値</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ jsonStats.booleans }}</div>
            <div class="text-sm text-muted-foreground">真偽値</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ jsonStats.nulls }}</div>
            <div class="text-sm text-muted-foreground">null</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ jsonStats.depth }}</div>
            <div class="text-sm text-muted-foreground">最大深度</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ (jsonStats.size / 1024).toFixed(1) }}KB</div>
            <div class="text-sm text-muted-foreground">サイズ</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>