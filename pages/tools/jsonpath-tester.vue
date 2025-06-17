<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const jsonInput = ref('')
const jsonPath = ref('')
const results = ref<any[]>([])
const error = ref('')
const syntaxError = ref('')
const prettify = ref(true)
const showLineNumbers = ref(true)

// JSONPath評価エンジン（簡易実装）
function evaluateJsonPath(data: any, path: string): any[] {
  if (!path || path === '$') {
    return [data]
  }

  const results: any[] = []

  try {
    // パスを正規化
    const normalizedPath = path.startsWith('$') ? path.substring(1) : path

    // シンプルなパスの解析
    if (normalizedPath.startsWith('.')) {
      const segments = normalizedPath.substring(1).split('.')
      let current = [data]

      for (const segment of segments) {
        const nextCurrent: any[] = []

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
            else if (item.hasOwnProperty(segment)) {
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
        if (data.hasOwnProperty(match[1])) {
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
const formatResult = (result: any): string => {
  if (prettify.value) {
    return JSON.stringify(result, null, 2)
  }
  return JSON.stringify(result)
}

// 結果のエクスポート
const exportResults = () => {
  if (results.value.length === 0) {
    toast({
      title: 'エラー',
      description: 'エクスポートする結果がありません',
      variant: 'destructive',
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
const jsonWithLineNumbers = computed(() => {
  if (!showLineNumbers.value) return jsonInput.value

  const lines = jsonInput.value.split('\n')
  const maxLineNum = lines.length.toString().length

  return lines
    .map((line, i) => `${(i + 1).toString().padStart(maxLineNum, ' ')} | ${line}`)
    .join('\n')
})

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast({
      description: 'クリップボードにコピーしました',
    })
  }
  catch (err) {
    console.error('Failed to copy:', err)
    toast({
      description: 'コピーに失敗しました',
      variant: 'destructive',
    })
  }
}

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
    <Card>
      <CardHeader>
        <CardTitle>サンプルデータ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleData"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- JSONPathパターン -->
    <Card>
      <CardHeader>
        <CardTitle>よく使うパターン</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button
            v-for="pattern in commonPatterns"
            :key="pattern.path"
            variant="outline"
            size="sm"
            class="justify-start"
            @click="jsonPath = pattern.path">
            <span class="font-mono text-xs mr-2">{{ pattern.path }}</span>
            <span class="text-muted-foreground">{{ pattern.label }}</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- JSON入力 -->
      <Card>
        <CardHeader>
          <CardTitle>JSON入力</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <textarea
              v-model="jsonInput"
              placeholder="{&quot;key&quot;: &quot;value&quot;}"
              class="w-full h-96 p-3 font-mono text-sm border rounded-md bg-background resize-none"
              :class="{ 'border-destructive': syntaxError }"
              spellcheck="false"></textarea>

            <Alert v-if="syntaxError" variant="destructive">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
              <AlertDescription>
                {{ syntaxError }}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <!-- 結果 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>抽出結果</CardTitle>
            <div class="flex gap-2">
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="prettify"
                  type="checkbox"
                  class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
                整形
              </label>
              <Button
                v-if="results.length > 0"
                size="sm"
                variant="outline"
                @click="exportResults">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      @click="copyToClipboard(formatResult(result))">
                      <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                    </Button>
                  </div>
                  <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm">{{ formatResult(result) }}</pre>
                </div>
              </div>
            </div>

            <div v-else class="text-muted-foreground text-sm">
              JSONとJSONPathを入力してください
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- JSONPath入力 -->
    <Card>
      <CardHeader>
        <CardTitle>JSONPath式</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Input
            v-model="jsonPath"
            placeholder="$.store.book[*].title"
            class="font-mono"
            @keyup.enter="evaluatePath" />

          <Button class="w-full" @click="evaluatePath">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4 mr-2" />
            評価実行
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- リファレンス -->
    <Card>
      <CardHeader>
        <CardTitle>JSONPath構文リファレンス</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              基本構文
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>式</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>例</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell class="font-mono">
                    $
                  </TableCell>
                  <TableCell>ルート要素</TableCell>
                  <TableCell class="font-mono text-xs">
                    $
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-mono">
                    .
                  </TableCell>
                  <TableCell>子要素</TableCell>
                  <TableCell class="font-mono text-xs">
                    $.store
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-mono">
                    ..
                  </TableCell>
                  <TableCell>再帰的降下</TableCell>
                  <TableCell class="font-mono text-xs">
                    $..author
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-mono">
                    *
                  </TableCell>
                  <TableCell>ワイルドカード</TableCell>
                  <TableCell class="font-mono text-xs">
                    $.store.*
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-mono">
                    []
                  </TableCell>
                  <TableCell>配列アクセス</TableCell>
                  <TableCell class="font-mono text-xs">
                    $.book[0]
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-mono">
                    [*]
                  </TableCell>
                  <TableCell>全配列要素</TableCell>
                  <TableCell class="font-mono text-xs">
                    $.book[*]
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              このツールは基本的なJSONPath機能のみサポートしています。
              フィルター式（[?(@.price < 10)]）などの高度な機能は実装されていません。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
