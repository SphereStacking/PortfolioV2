<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const files = ref<File[]>([])
const results = ref<ConversionResult[]>([])
const processing = ref(false)
const includeDataUrl = ref(true)
const chunkSize = ref([76]) // 標準的な行の長さ
const isDragging = ref(false)

interface ConversionResult {
  file: File
  base64: string
  dataUrl: string
  error?: string
}

// ファイル選択
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    files.value = Array.from(target.files)
    results.value = []
  }
}

// ドラッグ&ドロップ
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files) {
    files.value = Array.from(event.dataTransfer.files)
    results.value = []
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

// ファイルをBase64に変換
const convertFileToBase64 = (file: File): Promise<ConversionResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const result = e.target?.result as string
      const base64WithPrefix = result
      const base64 = result.split(',')[1] || ''

      // チャンク分割
      let chunkedBase64 = base64
      if (chunkSize.value[0] > 0) {
        const chunks = []
        for (let i = 0; i < base64.length; i += chunkSize.value[0]) {
          chunks.push(base64.slice(i, i + chunkSize.value[0]))
        }
        chunkedBase64 = chunks.join('\n')
      }

      resolve({
        file,
        base64: chunkedBase64,
        dataUrl: base64WithPrefix,
      })
    }

    reader.onerror = () => {
      resolve({
        file,
        base64: '',
        dataUrl: '',
        error: 'ファイルの読み込みに失敗しました',
      })
    }

    reader.readAsDataURL(file)
  })
}

// 一括変換
const convertAll = async () => {
  if (files.value.length === 0) {
    toast({
      title: 'エラー',
      description: 'ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  processing.value = true
  results.value = []

  try {
    const conversionPromises = files.value.map(file => convertFileToBase64(file))
    results.value = await Promise.all(conversionPromises)

    const successCount = results.value.filter(r => !r.error).length
    toast({
      title: '変換完了',
      description: `${successCount}個のファイルを変換しました`,
    })
  }
  catch (error) {
    console.error('Conversion error:', error)
    toast({
      title: 'エラー',
      description: '変換中にエラーが発生しました',
      variant: 'destructive',
    })
  }
  finally {
    processing.value = false
  }
}

// Base64をファイルに戻す
// const base64ToFile = (base64: string, fileName: string, mimeType: string): File => {
//   const byteCharacters = atob(base64.replace(/\s/g, ''))
//   const byteNumbers = new Array(byteCharacters.length)
//
//   for (let i = 0; i < byteCharacters.length; i++) {
//     byteNumbers[i] = byteCharacters.charCodeAt(i)
//   }
//
//   const byteArray = new Uint8Array(byteNumbers)
//   return new File([byteArray], fileName, { type: mimeType })
// }

// ファイルサイズフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Base64サイズ計算
const calculateBase64Size = (base64: string): number => {
  // 改行を除いた実際のBase64文字数
  const cleanBase64 = base64.replace(/\s/g, '')
  // Base64は3バイトを4文字にエンコードするので、おおよそのサイズを計算
  return Math.ceil((cleanBase64.length * 3) / 4)
}

// 出力コード生成
const generateCode = (result: ConversionResult, format: 'dataUrl' | 'css' | 'html' | 'img') => {
  const dataUrl = result.dataUrl

  switch (format) {
    case 'dataUrl':
      return includeDataUrl.value ? dataUrl : result.base64
    case 'css':
      return `.element {\n  background-image: url('${dataUrl}');\n}`
    case 'html':
      return `<img src="${dataUrl}" alt="${result.file.name}" />`
    case 'img':
      return `<img src="data:${result.file.type};base64,\n${result.base64}" alt="${result.file.name}" />`
    default:
      return dataUrl
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

// ダウンロード
const downloadAsText = (result: ConversionResult) => {
  const blob = new Blob([result.base64], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${result.file.name}.base64.txt`
  link.click()

  URL.revokeObjectURL(url)
}

// クリア
const clearAll = () => {
  files.value = []
  results.value = []
}

// 画像プレビュー判定
const isPreviewable = (mimeType: string): boolean => {
  return mimeType.startsWith('image/')
    || mimeType === 'image/svg+xml'
}

// SEO設定
useSeoMeta({
  title: 'Base64ファイルエンコーダー | Web開発ツール',
  description: 'ファイルをBase64形式にエンコード。Data URL生成、チャンク分割対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        Base64ファイルエンコーダー
      </h1>
      <p class="text-muted-foreground">
        任意のファイルをBase64形式にエンコードします。画像の埋め込みやファイル転送に便利です。
      </p>
    </div>

    <!-- 設定 -->
    <Card>
      <CardHeader>
        <CardTitle>エンコード設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="includeDataUrl"
                type="checkbox"
                class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
              Data URL形式で出力（data:image/png;base64,...）
            </label>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              行の長さ（0で改行なし）: {{ chunkSize[0] }}文字
            </label>
            <Slider
              :model-value="chunkSize"
              :min="0"
              :max="100"
              :step="4"
              class="max-w-md"
              @update:model-value="chunkSize = $event" />
            <p class="text-xs text-muted-foreground mt-1">
              通常は76文字が標準的です
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ファイル選択 -->
    <Card>
      <CardHeader>
        <CardTitle>ファイル選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-border'"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave">
          <Icon name="heroicons:document-arrow-up" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p class="text-muted-foreground mb-2">
            ドラッグ&ドロップまたはクリックしてファイルを選択
          </p>
          <p class="text-xs text-muted-foreground mb-4">
            任意のファイル形式に対応（推奨: 10MB以下）
          </p>
          <label>
            <input
              type="file"
              multiple
              class="hidden"
              @change="handleFileSelect">
            <Button variant="outline" as="span">
              ファイルを選択
            </Button>
          </label>
        </div>

        <div v-if="files.length > 0" class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium">
              選択中: {{ files.length }}個のファイル
            </p>
            <Button
              variant="ghost"
              size="sm"
              @click="clearAll">
              クリア
            </Button>
          </div>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="(file, index) in files"
              :key="index"
              class="flex items-center justify-between p-2 bg-muted rounded text-sm">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <Icon
                  :name="file.type.startsWith('image/') ? 'heroicons:photo' : 'heroicons:document'"
                  class="w-4 h-4 flex-shrink-0" />
                <span class="truncate">{{ file.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ formatFileSize(file.size) }}</span>
                <Badge variant="outline" class="text-xs">
                  {{ file.type || 'unknown' }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          class="w-full"
          :disabled="files.length === 0 || processing"
          @click="convertAll">
          <Icon v-if="processing" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          Base64に変換
        </Button>
      </CardFooter>
    </Card>

    <!-- 変換結果 -->
    <div v-if="results.length > 0" class="space-y-4">
      <Card v-for="(result, index) in results" :key="index">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon
                :name="result.file.type.startsWith('image/') ? 'heroicons:photo' : 'heroicons:document'"
                class="w-5 h-5" />
              <CardTitle class="text-lg">
                {{ result.file.name }}
              </CardTitle>
            </div>
            <div class="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                @click="downloadAsText(result)">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
                TXT保存
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- エラー表示 -->
            <Alert v-if="result.error" variant="destructive">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
              <AlertDescription>{{ result.error }}</AlertDescription>
            </Alert>

            <!-- 成功時の表示 -->
            <template v-else>
              <!-- ファイル情報 -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span class="text-muted-foreground">元のサイズ:</span>
                  <span class="ml-1 font-mono">{{ formatFileSize(result.file.size) }}</span>
                </div>
                <div>
                  <span class="text-muted-foreground">Base64サイズ:</span>
                  <span class="ml-1 font-mono">{{ formatFileSize(calculateBase64Size(result.base64)) }}</span>
                </div>
                <div>
                  <span class="text-muted-foreground">増加率:</span>
                  <span class="ml-1 font-mono">
                    +{{ Math.round((calculateBase64Size(result.base64) / result.file.size - 1) * 100) }}%
                  </span>
                </div>
                <div>
                  <span class="text-muted-foreground">MIME Type:</span>
                  <span class="ml-1 font-mono text-xs">{{ result.file.type || 'unknown' }}</span>
                </div>
              </div>

              <!-- 画像プレビュー -->
              <div v-if="isPreviewable(result.file.type)" class="border rounded-md p-4 bg-background">
                <p class="text-sm font-medium mb-2">
                  プレビュー:
                </p>
                <img
                  :src="result.dataUrl"
                  :alt="result.file.name"
                  class="max-w-full max-h-48 object-contain mx-auto">
              </div>

              <!-- Base64出力 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">
                    Base64出力:
                  </p>
                  <div class="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      @click="copyToClipboard(includeDataUrl ? result.dataUrl : result.base64)">
                      <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <textarea
                  :value="includeDataUrl ? result.dataUrl : result.base64"
                  readonly
                  class="w-full h-32 p-3 font-mono text-xs border rounded-md bg-muted resize-none"
                  spellcheck="false"></textarea>
              </div>

              <!-- コード例 -->
              <div class="space-y-2">
                <p class="text-sm font-medium">
                  使用例:
                </p>
                <Tabs default-value="html" class="w-full">
                  <TabsList>
                    <TabsTrigger value="html">
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="css">
                      CSS
                    </TabsTrigger>
                    <TabsTrigger value="img">
                      IMG Tag
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" class="space-y-2">
                    <pre class="p-3 bg-muted rounded-md overflow-x-auto text-xs"><code>{{ generateCode(result, 'html') }}</code></pre>
                    <Button
                      size="sm"
                      variant="outline"
                      @click="copyToClipboard(generateCode(result, 'html'))">
                      コピー
                    </Button>
                  </TabsContent>
                  <TabsContent value="css" class="space-y-2">
                    <pre class="p-3 bg-muted rounded-md overflow-x-auto text-xs"><code>{{ generateCode(result, 'css') }}</code></pre>
                    <Button
                      size="sm"
                      variant="outline"
                      @click="copyToClipboard(generateCode(result, 'css'))">
                      コピー
                    </Button>
                  </TabsContent>
                  <TabsContent value="img" class="space-y-2">
                    <pre class="p-3 bg-muted rounded-md overflow-x-auto text-xs"><code>{{ generateCode(result, 'img') }}</code></pre>
                    <Button
                      size="sm"
                      variant="outline"
                      @click="copyToClipboard(generateCode(result, 'img'))">
                      コピー
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </template>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>Base64エンコーディングについて</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Base64とは
            </h3>
            <p>
              バイナリデータを64種類の印字可能なASCII文字で表現するエンコード方式です。
              メールやWeb、JSONなどテキストベースのプロトコルでバイナリデータを扱う際に使用されます。
            </p>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              特徴
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>データサイズが約33%増加する</li>
              <li>任意のバイナリデータをテキストとして扱える</li>
              <li>URL安全な変種（Base64URL）も存在</li>
              <li>パディング文字として'='を使用</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              使用例
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>HTML/CSSへの画像埋め込み（Data URL）</li>
              <li>メール添付ファイルのエンコード</li>
              <li>JSONでのバイナリデータ送信</li>
              <li>認証トークンの生成</li>
            </ul>
          </div>
          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              大きなファイルのBase64エンコードは、ブラウザのメモリを大量に消費する可能性があります。
              10MB以上のファイルの処理には注意してください。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
