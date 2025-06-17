<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputText = ref('')
const outputText = ref('')
const processing = ref(false)
const error = ref('')

// 置換ルール
const replaceRules = ref<ReplaceRule[]>([
  { id: '1', find: '', replace: '', enabled: true, regex: false, caseSensitive: false, global: true },
])

interface ReplaceRule {
  id: string
  find: string
  replace: string
  enabled: boolean
  regex: boolean
  caseSensitive: boolean
  global: boolean
}

// プリセット
const presets = [
  {
    name: '全角→半角変換',
    rules: [
      { find: '０', replace: '0' },
      { find: '１', replace: '1' },
      { find: '２', replace: '2' },
      { find: '３', replace: '3' },
      { find: '４', replace: '4' },
      { find: '５', replace: '5' },
      { find: '６', replace: '6' },
      { find: '７', replace: '7' },
      { find: '８', replace: '8' },
      { find: '９', replace: '9' },
      { find: 'Ａ', replace: 'A' },
      { find: 'Ｂ', replace: 'B' },
      { find: 'Ｃ', replace: 'C' },
      { find: 'Ｄ', replace: 'D' },
      { find: 'Ｅ', replace: 'E' },
      { find: 'Ｆ', replace: 'F' },
      { find: 'Ｇ', replace: 'G' },
      { find: 'Ｈ', replace: 'H' },
      { find: 'Ｉ', replace: 'I' },
      { find: 'Ｊ', replace: 'J' },
      { find: 'Ｋ', replace: 'K' },
      { find: 'Ｌ', replace: 'L' },
      { find: 'Ｍ', replace: 'M' },
      { find: 'Ｎ', replace: 'N' },
      { find: 'Ｏ', replace: 'O' },
      { find: 'Ｐ', replace: 'P' },
      { find: 'Ｑ', replace: 'Q' },
      { find: 'Ｒ', replace: 'R' },
      { find: 'Ｓ', replace: 'S' },
      { find: 'Ｔ', replace: 'T' },
      { find: 'Ｕ', replace: 'U' },
      { find: 'Ｖ', replace: 'V' },
      { find: 'Ｗ', replace: 'W' },
      { find: 'Ｘ', replace: 'X' },
      { find: 'Ｙ', replace: 'Y' },
      { find: 'Ｚ', replace: 'Z' },
      { find: '　', replace: ' ' },
    ],
  },
  {
    name: '改行コード統一',
    rules: [
      { find: '\\r\\n', replace: '\\n', regex: true },
      { find: '\\r', replace: '\\n', regex: true },
    ],
  },
  {
    name: 'HTMLエスケープ',
    rules: [
      { find: '&', replace: '&amp;' },
      { find: '<', replace: '&lt;' },
      { find: '>', replace: '&gt;' },
      { find: '"', replace: '&quot;' },
      { find: '\'', replace: '&#39;' },
    ],
  },
  {
    name: 'Markdownリンク → HTML',
    rules: [
      { find: '\\[([^\\]]+)\\]\\(([^)]+)\\)', replace: '<a href="$2">$1</a>', regex: true },
    ],
  },
  {
    name: '空白行削除',
    rules: [
      { find: '^\\s*$\\n', replace: '', regex: true },
      { find: '\\n\\n+', replace: '\\n', regex: true },
    ],
  },
  {
    name: 'トリミング',
    rules: [
      { find: '^\\s+', replace: '', regex: true },
      { find: '\\s+$', replace: '', regex: true },
      { find: '\\s+', replace: ' ', regex: true },
    ],
  },
]

// ルール追加
const addRule = () => {
  const newId = Date.now().toString()
  replaceRules.value.push({
    id: newId,
    find: '',
    replace: '',
    enabled: true,
    regex: false,
    caseSensitive: false,
    global: true,
  })
}

// ルール削除
const removeRule = (id: string) => {
  if (replaceRules.value.length > 1) {
    replaceRules.value = replaceRules.value.filter(rule => rule.id !== id)
  }
}

// プリセット適用
const applyPreset = (preset: typeof presets[0]) => {
  replaceRules.value = preset.rules.map((rule, index) => ({
    id: Date.now().toString() + index,
    find: rule.find,
    replace: rule.replace,
    enabled: true,
    regex: rule.regex || false,
    caseSensitive: false,
    global: true,
  }))

  toast({
    title: 'プリセット適用',
    description: `「${preset.name}」のルールを適用しました`,
  })
}

// 置換実行
const executeReplace = () => {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  processing.value = true
  error.value = ''

  try {
    let result = inputText.value
    let totalReplacements = 0

    // 有効なルールのみ処理
    const activeRules = replaceRules.value.filter(rule => rule.enabled && rule.find)

    activeRules.forEach((rule) => {
      try {
        if (rule.regex) {
          // 正規表現モード
          const flags = []
          if (rule.global) flags.push('g')
          if (!rule.caseSensitive) flags.push('i')
          flags.push('m') // マルチラインモード

          const regex = new RegExp(rule.find, flags.join(''))
          const matches = result.match(regex)
          if (matches) {
            totalReplacements += matches.length
          }
          result = result.replace(regex, rule.replace)
        }
        else {
          // 通常文字列モード
          if (rule.global) {
            // グローバル置換
            const escapedFind = rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const flags = rule.caseSensitive ? 'g' : 'gi'
            const regex = new RegExp(escapedFind, flags)
            const matches = result.match(regex)
            if (matches) {
              totalReplacements += matches.length
            }
            result = result.replace(regex, rule.replace)
          }
          else {
            // 最初の1つだけ置換
            const index = rule.caseSensitive
              ? result.indexOf(rule.find)
              : result.toLowerCase().indexOf(rule.find.toLowerCase())

            if (index !== -1) {
              totalReplacements += 1
              result = result.substring(0, index)
                + rule.replace
                + result.substring(index + rule.find.length)
            }
          }
        }
      }
      catch (_err) {
        console.error(`Rule error: ${rule.find}`, err)
        error.value = `ルールエラー: "${rule.find}" - 正規表現が無効です`
      }
    })

    outputText.value = result

    toast({
      title: '置換完了',
      description: `${totalReplacements}箇所を置換しました`,
    })
  }
  catch (err) {
    error.value = '置換処理中にエラーが発生しました'
    console.error('Replace error:', err)
    toast({
      title: 'エラー',
      description: error.value,
      variant: 'destructive',
    })
  }
  finally {
    processing.value = false
  }
}

// プレビュー生成（差分表示）
const previewDiff = computed(() => {
  if (!inputText.value || !outputText.value || inputText.value === outputText.value) {
    return null
  }

  // 簡易的な差分表示（最初の10個の変更のみ）
  const changes: Array<{ before: string, after: string, position: number }> = []
  const maxChanges = 10

  replaceRules.value
    .filter(rule => rule.enabled && rule.find)
    .forEach((rule) => {
      if (changes.length >= maxChanges) return

      try {
        if (rule.regex) {
          const flags = []
          if (rule.global) flags.push('g')
          if (!rule.caseSensitive) flags.push('i')
          const regex = new RegExp(rule.find, flags.join(''))

          let match
          while ((match = regex.exec(inputText.value)) !== null && changes.length < maxChanges) {
            changes.push({
              before: match[0],
              after: match[0].replace(new RegExp(rule.find, flags.join('')), rule.replace),
              position: match.index,
            })
          }
        }
        else {
          const escapedFind = rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const flags = rule.caseSensitive ? 'g' : 'gi'
          const regex = new RegExp(escapedFind, flags)

          let match
          while ((match = regex.exec(inputText.value)) !== null && changes.length < maxChanges) {
            changes.push({
              before: match[0],
              after: rule.replace,
              position: match.index,
            })
            if (!rule.global) break
          }
        }
      }
      catch (_err) {
        // エラーは無視
      }
    })

  return changes.sort((a, b) => a.position - b.position)
})

// 統計情報
const statistics = computed(() => {
  return {
    inputLength: inputText.value.length,
    outputLength: outputText.value.length,
    difference: outputText.value.length - inputText.value.length,
    activeRules: replaceRules.value.filter(rule => rule.enabled && rule.find).length,
  }
})

// ルール変更時に自動実行（デバウンス付き）
const executeTimeoutId = ref<NodeJS.Timeout>()
watch([inputText, replaceRules], () => {
  if (executeTimeoutId.value) {
    clearTimeout(executeTimeoutId.value)
  }
  executeTimeoutId.value = setTimeout(() => {
    if (inputText.value) {
      executeReplace()
    }
  }, 500)
}, { deep: true })

// ルールのインポート/エクスポート
const exportRules = () => {
  const data = JSON.stringify(replaceRules.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'replace-rules.json'
  link.click()

  URL.revokeObjectURL(url)
}

const importRules = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const rules = JSON.parse(e.target?.result as string)
      if (Array.isArray(rules)) {
        replaceRules.value = rules.map((rule, index) => ({
          ...rule,
          id: Date.now().toString() + index,
        }))
        toast({
          title: 'インポート完了',
          description: `${rules.length}個のルールをインポートしました`,
        })
      }
    }
    catch (_err) {
      toast({
        title: 'エラー',
        description: 'ファイルの読み込みに失敗しました',
        variant: 'destructive',
      })
    }
  }
  reader.readAsText(file)
}

// サンプルテキスト
const sampleTexts = [
  {
    name: '全角英数字',
    text: 'ＡＢＣ１２３　全角の英数字とスペースを含むテキストです。ＸＹＺ４５６　変換してみましょう。',
  },
  {
    name: 'HTMLテキスト',
    text: '<div class="container">\n  <h1>タイトル & サブタイトル</h1>\n  <p>これは"サンプル"テキストです。</p>\n</div>',
  },
  {
    name: 'Markdownリンク',
    text: 'これは[Google](https://google.com)へのリンクです。\n[GitHub](https://github.com)も便利です。',
  },
]

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async () => {
  try {
    await copy(outputText.value)
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

// リセット
const reset = () => {
  inputText.value = ''
  outputText.value = ''
  error.value = ''
  replaceRules.value = [
    { id: '1', find: '', replace: '', enabled: true, regex: false, caseSensitive: false, global: true },
  ]
}

// SEO設定
useSeoMeta({
  title: 'テキスト置換ツール | Web開発ツール',
  description: '複数パターンの一括置換・正規表現対応。テキスト処理を効率化。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        テキスト置換ツール
      </h1>
      <p class="text-muted-foreground">
        複数のパターンで一括置換。正規表現にも対応しています。
      </p>
    </div>

    <!-- プリセット -->
    <Card>
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in presets"
            :key="preset.name"
            variant="outline"
            size="sm"
            @click="applyPreset(preset)">
            {{ preset.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 置換ルール -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>置換ルール</CardTitle>
          <div class="flex gap-2">
            <label>
              <input
                type="file"
                accept=".json"
                class="hidden"
                @change="importRules">
              <Button variant="outline" size="sm" as="span">
                <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                インポート
              </Button>
            </label>
            <Button
              variant="outline"
              size="sm"
              @click="exportRules">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              エクスポート
            </Button>
            <Button
              size="sm"
              @click="addRule">
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              ルール追加
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="(rule, index) in replaceRules"
            :key="rule.id"
            class="p-3 border rounded-md space-y-3">
            <div class="flex items-center gap-2">
              <input
                v-model="rule.enabled"
                type="checkbox"
                class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
              <span class="text-sm font-medium">ルール {{ index + 1 }}</span>
              <Button
                v-if="replaceRules.length > 1"
                variant="ghost"
                size="sm"
                class="ml-auto"
                @click="removeRule(rule.id)">
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </Button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium mb-1 block">検索文字列</label>
                <Input
                  v-model="rule.find"
                  :disabled="!rule.enabled"
                  placeholder="置換したい文字列"
                  class="font-mono" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">置換文字列</label>
                <Input
                  v-model="rule.replace"
                  :disabled="!rule.enabled"
                  placeholder="置換後の文字列"
                  class="font-mono" />
              </div>
            </div>

            <div class="flex flex-wrap gap-4 text-sm">
              <label class="flex items-center gap-2">
                <input
                  v-model="rule.regex"
                  :disabled="!rule.enabled"
                  type="checkbox"
                  class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
                正規表現
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="rule.caseSensitive"
                  :disabled="!rule.enabled"
                  type="checkbox"
                  class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
                大文字小文字を区別
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="rule.global"
                  :disabled="!rule.enabled"
                  type="checkbox"
                  class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
                全て置換
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- サンプル -->
    <Card>
      <CardHeader>
        <CardTitle>サンプルテキスト</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleTexts"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="inputText = sample.text">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 入力 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>入力テキスト</CardTitle>
            <Button
              v-if="inputText"
              size="sm"
              variant="ghost"
              @click="reset">
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="inputText"
            placeholder="置換したいテキストを入力してください"
            class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-background resize-none"
            spellcheck="false"></textarea>

          <div class="mt-2 text-sm text-muted-foreground">
            文字数: {{ statistics.inputLength }}
          </div>
        </CardContent>
      </Card>

      <!-- 出力 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>置換結果</CardTitle>
            <Button
              v-if="outputText"
              size="sm"
              variant="ghost"
              @click="copyToClipboard">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="outputText"
            readonly
            placeholder="置換結果がここに表示されます"
            class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted resize-none"
            spellcheck="false"></textarea>

          <div class="mt-2 text-sm text-muted-foreground">
            文字数: {{ statistics.outputLength }}
            <span v-if="statistics.difference !== 0" class="ml-2">
              ({{ statistics.difference > 0 ? '+' : '' }}{{ statistics.difference }})
            </span>
          </div>

          <Alert v-if="error" variant="destructive" class="mt-2">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>

    <!-- プレビュー -->
    <Card v-if="previewDiff && previewDiff.length > 0">
      <CardHeader>
        <CardTitle>変更プレビュー（最初の10件）</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="(change, index) in previewDiff"
            :key="index"
            class="flex items-center gap-2 text-sm">
            <code class="px-2 py-1 bg-red-100 text-red-800 rounded">{{ change.before }}</code>
            <Icon name="heroicons:arrow-right" class="w-4 h-4 text-muted-foreground" />
            <code class="px-2 py-1 bg-green-100 text-green-800 rounded">{{ change.after }}</code>
            <span class="text-xs text-muted-foreground ml-2">位置: {{ change.position }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 統計情報 -->
    <Card>
      <CardHeader>
        <CardTitle>統計情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-2xl font-bold">
              {{ statistics.inputLength }}
            </p>
            <p class="text-sm text-muted-foreground">
              入力文字数
            </p>
          </div>
          <div>
            <p class="text-2xl font-bold">
              {{ statistics.outputLength }}
            </p>
            <p class="text-sm text-muted-foreground">
              出力文字数
            </p>
          </div>
          <div>
            <p class="text-2xl font-bold">
              {{ Math.abs(statistics.difference) }}
            </p>
            <p class="text-sm text-muted-foreground">
              文字数{{ statistics.difference >= 0 ? '増加' : '減少' }}
            </p>
          </div>
          <div>
            <p class="text-2xl font-bold">
              {{ statistics.activeRules }}
            </p>
            <p class="text-sm text-muted-foreground">
              有効なルール
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>使い方</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              基本的な使い方
            </h3>
            <ol class="list-decimal list-inside space-y-1">
              <li>置換ルールを設定（検索文字列と置換文字列）</li>
              <li>必要に応じてオプションを設定</li>
              <li>テキストを入力すると自動的に置換</li>
              <li>複数のルールを追加して一括処理も可能</li>
            </ol>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              正規表現の例
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><code>\\d+</code> - 数字の連続</li>
              <li><code>\\s+</code> - 空白文字の連続</li>
              <li><code>^.*$</code> - 行全体</li>
              <li><code>(\\w+)@(\\w+\\.\\w+)</code> - メールアドレス</li>
              <li><code>\\$1, \\$2</code> - キャプチャグループの参照</li>
            </ul>
          </div>
          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              正規表現を使用する場合は、エスケープが必要な文字に注意してください。
              バックスラッシュは「\\」のように二重にする必要があります。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
