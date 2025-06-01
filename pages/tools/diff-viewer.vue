<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

const leftText = ref('')
const rightText = ref('')
const viewMode = ref<'unified' | 'split'>('split')
const ignoreCase = ref(false)
const ignoreWhitespace = ref(false)

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber: {
    left?: number
    right?: number
  }
}

// サンプルテキスト
const sampleTexts = [
  {
    name: 'JavaScript関数',
    left: `function greet(name) {
  console.log("Hello, " + name);
  return "Hello, " + name;
}`,
    right: `function greet(name, greeting = "Hello") {
  const message = \`\${greeting}, \${name}!\`;
  console.log(message);
  return message;
}`,
  },
  {
    name: 'JSONデータ',
    left: `{
  "name": "John Doe",
  "age": 30,
  "city": "Tokyo"
}`,
    right: `{
  "name": "John Doe",
  "age": 31,
  "city": "Tokyo",
  "email": "john@example.com"
}`,
  },
  {
    name: 'CSSスタイル',
    left: `.button {
  background: blue;
  color: white;
  padding: 10px;
}`,
    right: `.button {
  background-color: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  transition: all 0.2s;
}`,
  },
]

const loadSample = (sample: typeof sampleTexts[0]) => {
  leftText.value = sample.left
  rightText.value = sample.right
}

// 簡易的な差分計算（実際のプロジェクトではdiff-match-patchなどのライブラリを使用推奨）
const calculateDiff = (): DiffLine[] => {
  const leftLines = leftText.value.split('\n')
  const rightLines = rightText.value.split('\n')
  const result: DiffLine[] = []

  // LCS（最長共通部分列）アルゴリズムの簡易版
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
    const leftLine = leftLines[leftIndex] || ''
    const rightLine = rightLines[rightIndex] || ''

    // 処理オプションの適用
    const processLine = (line: string) => {
      let processed = line
      if (ignoreWhitespace.value) {
        processed = processed.trim()
      }
      if (ignoreCase.value) {
        processed = processed.toLowerCase()
      }
      return processed
    }

    const processedLeft = processLine(leftLine)
    const processedRight = processLine(rightLine)

    if (leftIndex >= leftLines.length) {
      // 右側に追加された行
      result.push({
        type: 'added',
        content: rightLine,
        lineNumber: { right: rightIndex + 1 },
      })
      rightIndex++
    }
    else if (rightIndex >= rightLines.length) {
      // 左側から削除された行
      result.push({
        type: 'removed',
        content: leftLine,
        lineNumber: { left: leftIndex + 1 },
      })
      leftIndex++
    }
    else if (processedLeft === processedRight) {
      // 変更なし
      result.push({
        type: 'unchanged',
        content: leftLine,
        lineNumber: { left: leftIndex + 1, right: rightIndex + 1 },
      })
      leftIndex++
      rightIndex++
    }
    else {
      // 簡易的な差分検出
      // 次の行を先読みして、どちらが追加/削除かを判断
      let foundMatch = false

      // 右側の後続行に左側の現在行と一致するものがあるか
      for (let i = rightIndex + 1; i < Math.min(rightIndex + 5, rightLines.length); i++) {
        if (processLine(rightLines[i]) === processedLeft) {
          // 左側の行は残っている = 右側に行が追加された
          for (let j = rightIndex; j < i; j++) {
            result.push({
              type: 'added',
              content: rightLines[j],
              lineNumber: { right: j + 1 },
            })
          }
          rightIndex = i
          foundMatch = true
          break
        }
      }

      if (!foundMatch) {
        // 左側の後続行に右側の現在行と一致するものがあるか
        for (let i = leftIndex + 1; i < Math.min(leftIndex + 5, leftLines.length); i++) {
          if (processLine(leftLines[i]) === processedRight) {
            // 右側の行は残っている = 左側から行が削除された
            for (let j = leftIndex; j < i; j++) {
              result.push({
                type: 'removed',
                content: leftLines[j],
                lineNumber: { left: j + 1 },
              })
            }
            leftIndex = i
            foundMatch = true
            break
          }
        }
      }

      if (!foundMatch) {
        // 行が変更された（削除して追加）
        result.push({
          type: 'removed',
          content: leftLine,
          lineNumber: { left: leftIndex + 1 },
        })
        result.push({
          type: 'added',
          content: rightLine,
          lineNumber: { right: rightIndex + 1 },
        })
        leftIndex++
        rightIndex++
      }
    }
  }

  return result
}

const diffLines = computed(() => calculateDiff())

// 統計情報
const stats = computed(() => {
  const added = diffLines.value.filter(line => line.type === 'added').length
  const removed = diffLines.value.filter(line => line.type === 'removed').length
  const unchanged = diffLines.value.filter(line => line.type === 'unchanged').length

  return { added, removed, unchanged }
})

// 差分をコピー
const copyDiff = async () => {
  const diffText = diffLines.value
    .map((line) => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
      return `${prefix} ${line.content}`
    })
    .join('\n')

  await copy(diffText)
  toast({
    title: 'コピーしました',
    description: '差分をクリップボードにコピーしました',
  })
}

// テキストを入れ替え
const swapTexts = () => {
  const temp = leftText.value
  leftText.value = rightText.value
  rightText.value = temp
}

// SEO設定
useSeoMeta({
  title: 'Diff Viewer | Web開発ツール',
  description: 'テキストの差分を視覚的に比較・表示。統一形式と分割表示に対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        Diff Viewer
      </h1>
      <p class="text-muted-foreground">
        テキストの差分を視覚的に比較・表示。コードレビューやドキュメントの変更確認に便利。
      </p>
    </div>

    <!-- サンプルプリセット -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>サンプルテキスト</CardTitle>
        <CardDescription>
          よく使われるテキストパターンを選択できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleTexts"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card class="col-span-full grid grid-cols-2 gap-6">
      <!-- コントロール -->
      <CardHeader class="col-span-full flex flex-row justify-between">
        <CardTitle>テキストの比較</CardTitle>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input
                v-model="ignoreCase"
                type="checkbox"
                class="rounded">
              <span class="text-sm">大文字小文字を無視</span>
            </label>

            <label class="flex items-center gap-2">
              <input
                v-model="ignoreWhitespace"
                type="checkbox"
                class="rounded">
              <span class="text-sm">空白を無視</span>
            </label>
          </div>

          <Button
            variant="outline"
            size="sm"
            @click="swapTexts">
            <Icon name="heroicons:arrows-right-left" class="w-4 h-4 mr-1" />
            左右を入れ替え
          </Button>
        </div>
      </CardHeader>

      <div>
        <CardHeader>
          <CardTitle>元のテキスト</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="leftText"
            class="w-full h-64 p-3 rounded-md border bg-background font-mono text-sm resize-y"
            placeholder="比較元のテキストを入力..."></textarea>
        </CardContent>
      </div>

      <div>
        <CardHeader>
          <CardTitle>新しいテキスト</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="rightText"
            class="w-full h-64 p-3 rounded-md border bg-background font-mono text-sm resize-y"
            placeholder="比較先のテキストを入力..."></textarea>
        </CardContent>
      </div>
    </Card>

    <!-- 差分表示 -->
    <Card class="col-span-full">
      <CardHeader class="flex flex-row justify-between ">
        <CardTitle>差分</CardTitle>
        <div class="flex gap-2">
          <Button
            :variant="viewMode === 'split' ? 'default' : 'outline'"
            size="sm"
            @click="viewMode = 'split'">
            <Icon name="heroicons:view-columns" class="w-4 h-4 mr-1" />
            分割表示
          </Button>
          <Button
            :variant="viewMode === 'unified' ? 'default' : 'outline'"
            size="sm"
            @click="viewMode = 'unified'">
            <Icon name="heroicons:bars-3" class="w-4 h-4 mr-1" />
            統一表示
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="copyDiff">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-1" />
            差分をコピー
          </Button>
        </div>
      </CardHeader>
      <CardContent class="pt-6">
        <div class="flex items-center justify-around text-center">
          <div>
            <div class="text-2xl font-bold text-green-600">
              +{{ stats.added }}
            </div>
            <div class="text-sm text-muted-foreground">
              追加
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600">
              -{{ stats.removed }}
            </div>
            <div class="text-sm text-muted-foreground">
              削除
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold text-muted-foreground">
              {{ stats.unchanged }}
            </div>
            <div class="text-sm text-muted-foreground">
              変更なし
            </div>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <div v-if="!leftText && !rightText" class="text-center py-12 text-muted-foreground">
          比較するテキストを入力してください
        </div>

        <!-- 分割表示 -->
        <div v-else-if="viewMode === 'split'" class="overflow-x-auto">
          <table class="w-full border-collapse font-mono text-sm">
            <thead>
              <tr class="border-b">
                <th class="w-12 text-center p-2 text-muted-foreground">
                  行
                </th>
                <th class="w-1/2 text-left p-2">
                  元のテキスト
                </th>
                <th class="w-12 text-center p-2 text-muted-foreground">
                  行
                </th>
                <th class="w-1/2 text-left p-2">
                  新しいテキスト
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(line, index) in diffLines" :key="index">
                <tr v-if="line.type === 'unchanged'" class="border-b">
                  <td class="text-center p-2 text-muted-foreground">
                    {{ line.lineNumber.left }}
                  </td>
                  <td class="p-2 whitespace-pre-wrap">
                    {{ line.content }}
                  </td>
                  <td class="text-center p-2 text-muted-foreground">
                    {{ line.lineNumber.right }}
                  </td>
                  <td class="p-2 whitespace-pre-wrap">
                    {{ line.content }}
                  </td>
                </tr>
                <tr v-else-if="line.type === 'removed'" class="border-b">
                  <td class="text-center p-2 text-muted-foreground bg-red-50 dark:bg-red-950">
                    {{ line.lineNumber.left }}
                  </td>
                  <td class="p-2 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 whitespace-pre-wrap">
                    {{ line.content }}
                  </td>
                  <td class="text-center p-2 text-muted-foreground"></td>
                  <td class="p-2"></td>
                </tr>
                <tr v-else-if="line.type === 'added'" class="border-b">
                  <td class="text-center p-2 text-muted-foreground"></td>
                  <td class="p-2"></td>
                  <td class="text-center p-2 text-muted-foreground bg-green-50 dark:bg-green-950">
                    {{ line.lineNumber.right }}
                  </td>
                  <td class="p-2 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 whitespace-pre-wrap">
                    {{ line.content }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- 統一表示 -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse font-mono text-sm">
            <tbody>
              <tr v-for="(line, index) in diffLines" :key="index" class="border-b">
                <td
                  class="w-12 text-center p-2 text-muted-foreground"
                  :class="{
                    'bg-red-50 dark:bg-red-950': line.type === 'removed',
                    'bg-green-50 dark:bg-green-950': line.type === 'added',
                  }">
                  {{ line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' ' }}
                </td>
                <td
                  class="w-12 text-center p-2 text-muted-foreground"
                  :class="{
                    'bg-red-50 dark:bg-red-950': line.type === 'removed',
                    'bg-green-50 dark:bg-green-950': line.type === 'added',
                  }">
                  {{ line.lineNumber.left || line.lineNumber.right || '' }}
                </td>
                <td
                  class="p-2 whitespace-pre-wrap"
                  :class="{
                    'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100': line.type === 'removed',
                    'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100': line.type === 'added',
                  }">
                  {{ line.content }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
