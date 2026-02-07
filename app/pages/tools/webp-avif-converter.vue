<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const files = ref<File[]>([])
const format = ref<'webp' | 'avif'>('webp')
const quality = ref([80])
const processing = ref(false)
const results = ref<ConversionResult[]>([])
const progress = ref(0)

interface ConversionResult {
  originalFile: File
  convertedBlob: Blob | null
  convertedSize: number
  error?: string
  url?: string
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
const isDragging = ref(false)
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files) {
    const droppedFiles = Array.from(event.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length > 0) {
      files.value = imageFiles
      results.value = []
    }
    else {
      toast({
        title: 'エラー',
        description: '画像ファイルを選択してください',
        variant: 'destructive',
      })
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

// WebP/AVIF変換（シンプルな実装）
const convertImage = async (file: File): Promise<ConversionResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const img = new Image()

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve({
            originalFile: file,
            convertedBlob: null,
            convertedSize: 0,
            error: 'Canvas context not available',
          })
          return
        }

        ctx.drawImage(img, 0, 0)

        // 注意: ブラウザのネイティブサポートに依存
        const mimeType = format.value === 'webp' ? 'image/webp' : 'image/avif'
        const qualityValue = quality.value[0] / 100

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve({
                originalFile: file,
                convertedBlob: blob,
                convertedSize: blob.size,
                url,
              })
            }
            else {
              resolve({
                originalFile: file,
                convertedBlob: null,
                convertedSize: 0,
                error: `${format.value.toUpperCase()}形式への変換に失敗しました。ブラウザがサポートしていない可能性があります。`,
              })
            }
          },
          mimeType,
          qualityValue,
        )
      }

      img.onerror = () => {
        resolve({
          originalFile: file,
          convertedBlob: null,
          convertedSize: 0,
          error: '画像の読み込みに失敗しました',
        })
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      resolve({
        originalFile: file,
        convertedBlob: null,
        convertedSize: 0,
        error: 'ファイルの読み込みに失敗しました',
      })
    }

    reader.readAsDataURL(file)
  })
}

// 一括変換処理
const convertAll = async () => {
  if (files.value.length === 0) {
    toast({
      title: 'エラー',
      description: '画像ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  processing.value = true
  progress.value = 0
  results.value = []

  const conversionResults: ConversionResult[] = []

  for (let i = 0; i < files.value.length; i++) {
    const result = await convertImage(files.value[i])
    conversionResults.push(result)
    progress.value = ((i + 1) / files.value.length) * 100
  }

  results.value = conversionResults
  processing.value = false

  const successCount = conversionResults.filter(r => r.convertedBlob).length
  const errorCount = conversionResults.filter(r => r.error).length

  if (successCount > 0) {
    toast({
      title: '変換完了',
      description: `${successCount}個のファイルを${format.value.toUpperCase()}に変換しました${errorCount > 0 ? ` (${errorCount}個失敗)` : ''}`,
    })
  }
  else {
    toast({
      title: 'エラー',
      description: 'すべての変換に失敗しました',
      variant: 'destructive',
    })
  }
}

// ファイルサイズフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 圧縮率計算
const getCompressionRatio = (original: number, compressed: number): string => {
  if (original === 0) return '0%'
  const ratio = ((original - compressed) / original) * 100
  return ratio > 0 ? `-${ratio.toFixed(1)}%` : `+${Math.abs(ratio).toFixed(1)}%`
}

// 個別ダウンロード
const downloadFile = (result: ConversionResult) => {
  if (!result.convertedBlob || !result.url) return

  const link = document.createElement('a')
  const originalName = result.originalFile.name
  const baseName = originalName.substring(0, originalName.lastIndexOf('.'))
  const newName = `${baseName}.${format.value}`

  link.href = result.url
  link.download = newName
  link.click()
}

// 一括ダウンロード（ZIP）
const downloadAll = async () => {
  // 注意: 実際の実装では JSZipなどのライブラリを使用
  // ここでは個別ダウンロードを連続実行
  const validResults = results.value.filter(r => r.convertedBlob && r.url)

  if (validResults.length === 0) {
    toast({
      title: 'エラー',
      description: 'ダウンロード可能なファイルがありません',
      variant: 'destructive',
    })
    return
  }

  for (const result of validResults) {
    downloadFile(result)
    // ブラウザのダウンロード制限を回避するため少し待機
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// ブラウザサポート確認
const browserSupport = computed(() => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return { webp: false, avif: false }
  }

  // WebPサポート確認
  canvas.width = canvas.height = 1
  ctx.fillStyle = '#FF0000'
  ctx.fillRect(0, 0, 1, 1)
  const webpDataUrl = canvas.toDataURL('image/webp')
  const webpSupported = webpDataUrl.startsWith('data:image/webp')

  // AVIFサポート確認（簡易チェック）
  const avifDataUrl = canvas.toDataURL('image/avif')
  const avifSupported = avifDataUrl.startsWith('data:image/avif')

  return {
    webp: webpSupported,
    avif: avifSupported,
  }
})

// クリーンアップ
const clearFiles = () => {
  files.value = []
  results.value = []
  progress.value = 0
}

// トースト通知
const { toast } = useToast()

// SEO設定
useSeoMeta({
  title: 'WebP/AVIF変換 | Web開発ツール',
  description: '画像を次世代フォーマット（WebP/AVIF）に一括変換。品質調整可能。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        WebP/AVIF変換
      </h1>
      <p class="text-muted-foreground">
        画像を次世代フォーマットに変換して、ファイルサイズを削減します。
      </p>
    </div>

    <!-- ブラウザサポート警告 -->
    <Alert v-if="!browserSupport.webp || !browserSupport.avif" variant="destructive">
      <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
      <AlertTitle>ブラウザサポート警告</AlertTitle>
      <AlertDescription>
        <div class="space-y-1">
          <p v-if="!browserSupport.webp">
            WebP形式はこのブラウザではサポートされていません。
          </p>
          <p v-if="!browserSupport.avif">
            AVIF形式はこのブラウザではサポートされていません。
          </p>
          <p class="mt-2">
            最新のChrome、Firefox、またはSafariの使用を推奨します。
          </p>
        </div>
      </AlertDescription>
    </Alert>

    <!-- 設定 -->
    <Card>
      <CardHeader>
        <CardTitle>変換設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">出力形式</label>
            <div class="flex gap-2">
              <Button
                :variant="format === 'webp' ? 'default' : 'outline'"
                size="sm"
                :disabled="!browserSupport.webp"
                @click="format = 'webp'">
                WebP
              </Button>
              <Button
                :variant="format === 'avif' ? 'default' : 'outline'"
                size="sm"
                :disabled="!browserSupport.avif"
                @click="format = 'avif'">
                AVIF
              </Button>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              品質: {{ quality[0] }}%
            </label>
            <Slider
              :model-value="quality"
              :min="1"
              :max="100"
              :step="1"
              class="max-w-md"
              @update:model-value="quality = $event" />
            <p class="text-xs text-muted-foreground mt-1">
              低い値 = 小さいファイルサイズ、高い値 = 高品質
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ファイル選択 -->
    <Card>
      <CardHeader>
        <CardTitle>画像ファイル選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-border'"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave">
          <Icon name="heroicons:arrow-up-tray" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p class="text-muted-foreground mb-2">
            ドラッグ&ドロップまたはクリックして画像を選択
          </p>
          <p class="text-xs text-muted-foreground mb-4">
            JPEG, PNG, GIF, BMP, TIFF形式に対応
          </p>
          <label>
            <input
              type="file"
              multiple
              accept="image/*"
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
              @click="clearFiles">
              クリア
            </Button>
          </div>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="(file, index) in files"
              :key="index"
              class="flex items-center justify-between p-2 bg-muted rounded text-sm">
              <span class="truncate flex-1">{{ file.name }}</span>
              <span class="text-muted-foreground ml-2">{{ formatFileSize(file.size) }}</span>
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
          {{ processing ? '変換中...' : '変換開始' }}
        </Button>
      </CardFooter>
    </Card>

    <!-- 進捗表示 -->
    <Card v-if="processing">
      <CardHeader>
        <CardTitle>変換進捗</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>処理中...</span>
            <span>{{ Math.round(progress) }}%</span>
          </div>
          <div class="w-full bg-secondary rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all"
              :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 変換結果 -->
    <Card v-if="results.length > 0">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>変換結果</CardTitle>
          <Button
            v-if="results.some(r => r.convertedBlob)"
            size="sm"
            @click="downloadAll">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
            すべてダウンロード
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="border rounded-lg p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="font-medium text-sm">
                  {{ result.originalFile.name }}
                </p>
                <div v-if="result.convertedBlob" class="mt-2 space-y-1 text-sm">
                  <p class="text-muted-foreground">
                    元のサイズ: {{ formatFileSize(result.originalFile.size) }}
                  </p>
                  <p class="text-muted-foreground">
                    変換後: {{ formatFileSize(result.convertedSize) }}
                    <span :class="result.convertedSize < result.originalFile.size ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                      ({{ getCompressionRatio(result.originalFile.size, result.convertedSize) }})
                    </span>
                  </p>
                </div>
                <Alert v-else variant="destructive" class="mt-2">
                  <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
                  <AlertDescription>
                    {{ result.error || '変換に失敗しました' }}
                  </AlertDescription>
                </Alert>
              </div>
              <Button
                v-if="result.convertedBlob"
                size="sm"
                variant="outline"
                @click="downloadFile(result)">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>次世代画像フォーマットについて</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              WebP
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>Googleが開発した画像フォーマット</li>
              <li>JPEGより25-35%小さいファイルサイズ</li>
              <li>透過（アルファチャンネル）対応</li>
              <li>主要ブラウザでサポート済み</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              AVIF
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>AV1ビデオコーデックベースの画像フォーマット</li>
              <li>WebPよりさらに高圧縮（最大50%削減）</li>
              <li>HDR、広色域対応</li>
              <li>最新ブラウザで対応拡大中</li>
            </ul>
          </div>
          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              本ツールはブラウザのネイティブサポートに依存しています。
              より高度な変換オプションが必要な場合は、サーバーサイドツールの使用を推奨します。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
