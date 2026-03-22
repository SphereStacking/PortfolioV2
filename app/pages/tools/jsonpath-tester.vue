<script setup lang="ts">
definePageMeta({
  layout: 'tools',
})

// 状態管理
const jsonInput = ref('')
const jsonPath = ref('')
const results = ref<unknown[]>([])
const error = ref('')
const syntaxError = ref('')
const prettify = ref(true)
const showLineNumbers = ref(true)

// JSONPath評価エンジン（簡易実装）
function evaluateJsonPath(data: unknown, path: string): unknown[] {
  if (!path || path === '$') {
    return [data]
  }

  const results: unknown[] = []

  try {
    // パスを正規化
    const normalizedPath = path.startsWith('$') ? path.substring(1) : path

    // シンプルなパスの解析
    if (normalizedPath.startsWith('.')) {
      const segments = normalizedPath.substring(1).split('.')
      let current = [data]

      for (const segment of segments) {
        const nextCurrent: unknown[] = []

        for (const item of current) {
          if (item === null || item === undefined) continue

          // 配列のインデックスアクセス
          if (segment.includes('[') && segment.includes(']')) {
            const [prop, ...indices] = segment.split('[')
            let value = prop ? item[prop] : item

            for (const index of indices) {
              const idx = parseInt(index.replace(']', ''))
              if (Array.isArray(value) && !isNaN(idx)) {
                value = value[idx]
              }
              else if (index.replace(']', '') === '*') {
                // ワイルドカード
                if (Array.isArray(value)) {
                  nextCurrent.push(...value)
                  value = null
                  break
                }
              }
            }

            if (value !== null) {
              nextCurrent.push(value)
            }
          }
          // 再帰的降下 (..)
          else if (segment === '' || segment === '*') {
            if (Array.isArray(item)) {
              nextCurrent.push(...item)
            }
            else if (typeof item === 'object') {
              nextCurrent.push(...Object.values(item))
            }
          }
          // 通常のプロパティアクセス
          else {
            if (segment === '*') {
              if (Array.isArray(item)) {
                nextCurrent.push(...item)
              }
              else if (typeof item === 'object') {
                nextCurrent.push(...Object.values(item))
              }
            }
            else if (Object.hasOwn(item, segment)) {
              nextCurrent.push(item[segment])
            }
          }
        }

        current = nextCurrent
      }

      results.push(...current)
    }
    // ブラケット記法
    else if (normalizedPath.startsWith('[')) {
      const match = normalizedPath.match(/\[['"](.+?)['"]\]/)
      if (match && match[1]) {
        if (Object.hasOwn(data, match[1])) {
          results.push(data[match[1]])
        }
      }
    }
  }
  catch (e) {
    console.error('JSONPath evaluation error:', e)
  }

  return results
}

// JSON検証とパース
const parseJson = () => {
  try {
    syntaxError.value = ''
    if (!jsonInput.value.trim()) {
      return null
    }
    return JSON.parse(jsonInput.value)
  }
  catch (e) {
    if (e instanceof Error) {
      syntaxError.value = e.message
      // エラー位置を推定
      const match = e.message.match(/position (\d+)/)
      if (match) {
        const position = parseInt(match[1])
        const lines = jsonInput.value.substring(0, position).split('\n')
        syntaxError.value += ` (行 ${lines.length}付近)`
      }
    }
    return null
  }
}

// JSONPath評価
const evaluatePath = () => {
  error.value = ''
  results.value = []

  if (!jsonInput.value.trim()) {
    error.value = 'JSONを入力してください'
    return
  }

  if (!jsonPath.value.trim()) {
    error.value = 'JSONPathを入力してください'
    return
  }

  const data = parseJson()
  if (!data) {
    error.value = 'JSONの解析に失敗しました'
    return
  }

  try {
    results.value = evaluateJsonPath(data, jsonPath.value)

    if (results.value.length === 0) {
      error.value = '一致する要素が見つかりませんでした'
    }
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'JSONPathの評価に失敗しました'
  }
}

// リアルタイム評価
watch([jsonInput, jsonPath], () => {
  if (jsonInput.value && jsonPath.value) {
    evaluatePath()
  }
})

// よく使うJSONPathパターン
const commonPatterns = [
  { label: 'ルート要素', path: '$' },
  { label: '全ての子要素', path: '$.*' },
  { label: '特定のプロパティ', path: '$.propertyName' },
  { label: '配列の全要素', path: '$.array[*]' },
  { label: '配列の最初の要素', path: '$.array[0]' },
  { label: 'ネストしたプロパティ', path: '$.parent.child' },
  { label: '再帰的検索', path: '$..propertyName' },
  { label: '複数階層の配列', path: '$.array[*].subArray[*]' },
]

// サンプルJSON
const sampleData = [
  {
    name: '書籍データ',
    json: {
      store: {
        book: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            title: 'Sayings of the Century',
            price: 8.95,
          },
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: 12.99,
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: 8.99,
          },
        ],
        bicycle: {
          color: 'red',
          price: 19.95,
        },
      },
    },
  },
  {
    name: 'ユーザーデータ',
    json: {
      users: [
        {
          id: 1,
          name: '田中太郎',
          email: 'tanaka@example.com',
          address: {
            city: '東京',
            zip: '100-0001',
          },
          tags: ['admin', 'user'],
        },
        {
          id: 2,
          name: '佐藤花子',
          email: 'sato@example.com',
          address: {
            city: '大阪',
            zip: '530-0001',
          },
          tags: ['user'],
        },
      ],
    },
  },
  {
    name: 'APIレスポンス',
    json: {
      status: 'success',
      data: {
        total: 100,
        page: 1,
        items: [
          { id: 1, name: 'Item 1', active: true },
          { id: 2, name: 'Item 2', active: false },
          { id: 3, name: 'Item 3', active: true },
        ],
      },
      meta: {
        version: '1.0',
        timestamp: '2024-01-01T00:00:00Z',
      },
    },
  },
]

// サンプル読み込み
const loadSample = (sample: typeof sampleData[0]) => {
  jsonInput.value = JSON.stringify(sample.json, null, 2)
  jsonPath.value = '$'
  evaluatePath()
}

// 結果のフォーマット
const formatResult = (result: unknown): string => {
  if (prettify.value) {
    return JSON.stringify(result, null, 2)
  }
  return JSON.stringify(result)
}

// 結果のエクスポート
const exportResults = () => {
  if (results.value.length === 0) {
    toast.add({
      title: 'エラー',
      description: 'エクスポートする結果がありません',
      color: 'error',
    })
    return
  }

  const data = results.value.length === 1 ? results.value[0] : results.value
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'jsonpath-results.json'
  link.click()

  URL.revokeObjectURL(url)
}

// 行番号付きテキストエリア
const _jsonWithLineNumbers = computed(() => {
  if (!showLineNumbers.value) return jsonInput.value

  const lines = jsonInput.value.split('\n')
  const maxLineNum = lines.length.toString().length

  return lines
    .map((line, i) => `${(i + 1).toString().padStart(maxLineNum, ' ')} | ${line}`)
    .join('\n')
})

// クリップボード操作
const toast = useToast()
const { copyToClipboard } = useCopyToClipboard()

// SEO設定
useSeoMeta({
  title: 'JSONPathテスター | Web開発ツール',
  description: 'JSONデータの抽出・フィルタリング。JSONPath式をリアルタイム評価。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        JSONPathテスター
      </h1>
      <p class="text-muted-foreground">
        JSONPath式を使用してJSONデータから特定の要素を抽出します。
      </p>
    </div>

    <!-- サンプルデータ -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          サンプルデータ
        </h3>
      </template>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="sample in sampleData"
          :key="sample.name"
          variant="outline"
          size="sm"
          @click="loadSample(sample)">
          {{ sample.name }}
        </UButton>
      </div>
    </UCard>

    <!-- JSONPathパターン -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          よく使うパターン
        </h3>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <UButton
          v-for="pattern in commonPatterns"
          :key="pattern.path"
          variant="outline"
          size="sm"
          class="justify-start"
          @click="jsonPath = pattern.path">
          <span class="font-mono text-xs mr-2">{{ pattern.path }}</span>
          <span class="text-muted-foreground">{{ pattern.label }}</span>
        </UButton>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- JSON入力 -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            JSON入力
          </h3>
        </template>
        <div class="space-y-2">
          <textarea
            v-model="jsonInput"
            placeholder="{&quot;key&quot;: &quot;value&quot;}"
            class="w-full h-96 p-3 font-mono text-sm border rounded-md bg-background resize-none"
            :class="{ 'border-destructive': syntaxError }"
            spellcheck="false"></textarea>

          <UAlert
            v-if="syntaxError" color="error" icon="heroicons:exclamation-circle"
            :description="syntaxError" />
        </div>
      </UCard>

      <!-- 結果 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              抽出結果
            </h3>
            <div class="flex gap-2">
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="prettify"
                  type="checkbox"
                  class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
                整形
              </label>
              <UButton
                v-if="results.length > 0"
                size="sm"
                variant="outline"
                @click="exportResults">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
        </template>
        <div class="space-y-2">
          <div v-if="error" class="text-destructive text-sm">
            {{ error }}
          </div>

          <div v-else-if="results.length > 0" class="space-y-2">
            <p class="text-sm text-muted-foreground">
              {{ results.length }}件の結果
            </p>

            <div class="max-h-96 overflow-y-auto space-y-2">
              <div
                v-for="(result, index) in results"
                :key="index"
                class="relative">
                <div class="absolute top-2 right-2">
                  <UButton
                    size="sm"
                    variant="ghost"
                    @click="copyToClipboard(formatResult(result))">
                    <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                  </UButton>
                </div>
                <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm">{{ formatResult(result) }}</pre>
              </div>
            </div>
          </div>

          <div v-else class="text-muted-foreground text-sm">
            JSONとJSONPathを入力してください
          </div>
        </div>
      </UCard>
    </div>

    <!-- JSONPath入力 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          JSONPath式
        </h3>
      </template>
      <div class="space-y-4">
        <UInput
          v-model="jsonPath"
          placeholder="$.store.book[*].title"
          class="font-mono"
          @keyup.enter="evaluatePath" />

        <UButton class="w-full" @click="evaluatePath">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 mr-2" />
          評価実行
        </UButton>
      </div>
    </UCard>

    <!-- リファレンス -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          JSONPath構文リファレンス
        </h3>
      </template>
      <div class="space-y-4 text-muted-foreground">
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            基本構文
          </h3>
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b">
              <tr class="border-b border-border transition-colors hover:bg-muted/50">
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                  式
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                  説明
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                  例
                </th>
              </tr>
            </thead>
            <tbody class="[&_tr:last-child]:border-0">
              <tr class="border-b border-border transition-colors hover:bg-muted/50">
                <td class="p-2 align-middle font-mono">
                  $
                </td>
                <td class="p-2 align-middle">
                  ルート要素
                </td>
                <td class="p-2 align-middle font-mono text-xs">
                  $
                </td>
              </tr>
              <tr class="border-b border-border transition-colors hover:bg-muted/50">
                <td class="p-2 align-middle font-mono">
                  .
                </td>
                <td class="p-2 align-middle">
                  子要素
                </td>
                <td class="p-2 align-middle font-mono text-xs">
                  $.store
                </td>
              </tr>
              <tr class="border-b border-border transition-colors hover:bg-muted/50">
                <td class="p-2 align-middle font-mono">
                  ..
                </td>
                <td class="p-2 align-middle">
                  再帰的降下
                </td>
                <td class="p-2 align-middle font-mono text-xs">
                  $..author
                </td>
              </tr>
              <tr class="border-b border-border transition-colors hover:bg-muted/50">
                <td class="p-2 align-middle font-mono">
                  *
                </td>
                <td class="p-2 align-middle">
                  ワイルドカード
                </td>
                <td class="p-2 align-middle font-mono text-xs">
                  $.store.*
                </td>
              </tr>
              <tr class="border-b border-border transition-colors hover:bg-muted/50">
                <td class="p-2 align-middle font-mono">
                  []
                </td>
                <td class="p-2 align-middle">
                  配列アクセス
                </td>
                <td class="p-2 align-middle font-mono text-xs">
                  $.book[0]
                </td>
              </tr>
              <tr class="border-b border-border transition-colors hover:bg-muted/50">
                <td class="p-2 align-middle font-mono">
                  [*]
                </td>
                <td class="p-2 align-middle">
                  全配列要素
                </td>
                <td class="p-2 align-middle font-mono text-xs">
                  $.book[*]
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <UAlert icon="heroicons:information-circle" description="このツールは基本的なJSONPath機能のみサポートしています。 フィルター式（[?(@.price &lt; 10)]）などの高度な機能は実装されていません。" />
      </div>
    </UCard>
  </div>
</template>
