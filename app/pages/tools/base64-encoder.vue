<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputText = ref('')
const outputText = ref('')
const mode = ref<'encode' | 'decode'>('encode')
const _charset = ref('UTF-8')
const urlSafe = ref(false)
const error = ref('')

// 文字エンコーディングのオプション
const _charsets = [
  'UTF-8',
  'UTF-16',
  'UTF-16BE',
  'UTF-16LE',
  'Shift_JIS',
  'EUC-JP',
  'ISO-8859-1',
]

// Base64エンコード
const encodeBase64 = () => {
  error.value = ''

  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    // テキストをバイト配列に変換
    const encoder = new TextEncoder()
    const data = encoder.encode(inputText.value)

    // Base64エンコード
    let encoded = btoa(String.fromCharCode(...data))

    // URLセーフな形式に変換
    if (urlSafe.value) {
      encoded = encoded
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    }

    outputText.value = encoded
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'エンコードに失敗しました'
    outputText.value = ''
  }
}

// Base64デコード
const decodeBase64 = () => {
  error.value = ''

  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    let input = inputText.value

    // URLセーフな形式から通常のBase64に戻す
    if (urlSafe.value) {
      input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/')

      // パディングを追加
      const padding = input.length % 4
      if (padding) {
        input += '='.repeat(4 - padding)
      }
    }

    // Base64デコード
    const decoded = atob(input)

    // バイト配列をテキストに変換
    const bytes = new Uint8Array(decoded.length)
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i)
    }

    const decoder = new TextDecoder()
    outputText.value = decoder.decode(bytes)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'デコードに失敗しました'
    outputText.value = ''
  }
}

// 処理実行
const process = () => {
  if (mode.value === 'encode') {
    encodeBase64()
  }
  else {
    decodeBase64()
  }
}

// 入力と出力を入れ替え
const swapInputOutput = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  process()
}

// ファイルからの読み込み
const loadFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()

  if (mode.value === 'encode') {
    // ファイルをBase64エンコード
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const bytes = new Uint8Array(arrayBuffer)
      const binary = String.fromCharCode(...bytes)
      inputText.value = `data:${file.type};base64,${btoa(binary)}`
      process()
    }
    reader.readAsArrayBuffer(file)
  }
  else {
    // テキストファイルとして読み込み
    reader.onload = (e) => {
      inputText.value = e.target?.result as string
      process()
    }
    reader.readAsText(file)
  }
}

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

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    process()
  }
  catch (err) {
    console.error('Failed to paste:', err)
  }
}

// 統計情報
const stats = computed(() => {
  return {
    inputSize: new Blob([inputText.value]).size,
    outputSize: new Blob([outputText.value]).size,
    compressionRatio: inputText.value && outputText.value
      ? (new Blob([outputText.value]).size / new Blob([inputText.value]).size * 100).toFixed(1)
      : 0,
  }
})

// サンプルデータ
const samples = [
  { name: 'Hello World', value: 'Hello, World!' },
  { name: '日本語テキスト', value: 'こんにちは、世界！' },
  { name: 'JSON', value: '{"name":"John","age":30,"city":"Tokyo"}' },
  { name: 'HTML', value: '<h1>Hello</h1><p>This is a test.</p>' },
  { name: 'URL', value: 'https://example.com/path?query=value&foo=bar' },
]

const loadSample = (sample: typeof samples[0]) => {
  inputText.value = sample.value
  mode.value = 'encode'
  process()
}

// SEO設定
useSeoMeta({
  title: 'Base64エンコード/デコード | Web開発ツール',
  description: 'テキストやファイルのBase64エンコード・デコード。URLセーフな形式にも対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        Base64エンコード/デコード
      </h1>
      <p class="text-muted-foreground">
        テキストやファイルをBase64形式にエンコード・デコードします。
        Base64は、バイナリデータをASCII文字列に変換するエンコード方式です。
      </p>
      <ul class="list-disc list-inside space-y-1 text-muted-foreground">
        <li>メールやJSON、XMLなどテキストベースのプロトコルでバイナリデータを扱う際に使用</li>
        <li>データサイズは約33%増加します</li>
        <li>URLセーフ形式は、+を-に、/を_に置換し、パディング（=）を省略</li>
        <li>Data URLスキームで画像やファイルを埋め込む際にも使用</li>
      </ul>
    </div>

    <!-- サンプル -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>サンプル</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-2 grid-cols-5">
          <Button
            v-for="sample in samples"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 入力エリア -->
    <Card class="col-span-1">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>入力</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            @click="inputText = ''; outputText = ''">
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="inputText"
          :placeholder="mode === 'encode' ? 'エンコードするテキストを入力...' : 'デコードするBase64文字列を入力...'"
          class="w-full h-[400px] p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          spellcheck="false"
          @input="process"></textarea>
        <div class="mt-2 text-sm text-muted-foreground">
          サイズ: {{ (stats.inputSize / 1024).toFixed(2) }} KB
        </div>
      </CardContent>
    </Card>

    <!-- 出力エリア -->
    <Card class="col-span-1">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>出力</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            :disabled="!outputText"
            @click="copyToClipboard(outputText)">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="error" class="mb-4">
          <Alert variant="destructive">
            <Icon name="heroicons:exclamation-circle" class="h-4 w-4" />
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>
        </div>
        <textarea
          v-model="outputText"
          readonly
          :placeholder="mode === 'encode' ? 'エンコード結果がここに表示されます...' : 'デコード結果がここに表示されます...'"
          class="w-full h-[400px] p-3 font-mono text-sm border rounded-md bg-muted resize-none"
          spellcheck="false"></textarea>
        <div class="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>サイズ: {{ (stats.outputSize / 1024).toFixed(2) }} KB</span>
          <span v-if="stats.compressionRatio !== 0">
            比率: {{ stats.compressionRatio }}%
          </span>
        </div>
      </CardContent>
    </Card>
    <!-- コントロールパネル -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>コントロールパネル</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-4">
          <!-- モード選択 -->
          <div class="flex gap-2">
            <Button
              v-for="m in ['encode', 'decode'] as const"
              :key="m"
              :variant="mode === m ? 'default' : 'outline'"
              @click="mode = m; process()">
              {{ m === 'encode' ? 'エンコード' : 'デコード' }}
            </Button>
          </div>

          <!-- オプション -->
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="urlSafe"
                type="checkbox"
                class="rounded"
                @change="process">
              URLセーフ
            </label>
          </div>

          <!-- アクション -->
          <div class="flex gap-2 ml-auto">
            <Button
              variant="outline"
              @click="swapInputOutput">
              <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
              入れ替え
            </Button>
            <Button
              variant="outline"
              @click="pasteFromClipboard">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
              貼り付け
            </Button>
            <label>
              <input
                type="file"
                class="hidden"
                @change="loadFile">
              <Button variant="outline" as="span">
                <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                ファイル
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
