<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'tools',
})

interface ImageFile {
  id: string
  file: File
  originalSize: number
  compressedSize?: number
  compressedBlob?: Blob
  preview: string
  compressedPreview?: string
  status: 'pending' | 'compressing' | 'completed' | 'error'
  error?: string
}

// 状態管理
const images = ref<ImageFile[]>([])
const quality = ref(80)
const maxWidth = ref(1920)
const maxHeight = ref(1080)
const maintainAspectRatio = ref(true)
const outputFormat = ref<'original' | 'jpeg' | 'webp' | 'png'>('original')
const isProcessing = ref(false)

// ファイル選択
const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'エラー',
        description: `${file.name}は画像ファイルではありません`,
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      images.value.push({
        id: Date.now().toString() + Math.random(),
        file,
        originalSize: file.size,
        preview: e.target?.result as string,
        status: 'pending',
      })
    }
    reader.readAsDataURL(file)
  })
}

// ドラッグ&ドロップ
const isDragging = ref(false)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files) return

  const fileInput = { target: { files } } as unknown as Event
  handleFileSelect(fileInput)
}

// 画像圧縮
const compressImage = async (imageFile: ImageFile) => {
  imageFile.status = 'compressing'

  try {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas context not available')

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageFile.preview
    })

    // サイズ計算
    let { width, height } = img

    if (width > maxWidth.value || height > maxHeight.value) {
      if (maintainAspectRatio.value) {
        const ratio = Math.min(maxWidth.value / width, maxHeight.value / height)
        width *= ratio
        height *= ratio
      }
      else {
        width = Math.min(width, maxWidth.value)
        height = Math.min(height, maxHeight.value)
      }
    }

    canvas.width = width
    canvas.height = height

    // 圧縮設定
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)

    // 出力フォーマット決定
    let mimeType = imageFile.file.type
    let _extension = imageFile.file.name.split('.').pop()

    if (outputFormat.value !== 'original') {
      switch (outputFormat.value) {
        case 'jpeg':
          mimeType = 'image/jpeg'
          _extension = 'jpg'
          break
        case 'webp':
          mimeType = 'image/webp'
          _extension = 'webp'
          break
        case 'png':
          mimeType = 'image/png'
          _extension = 'png'
          break
      }
    }

    // Blob生成
    await new Promise<void>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            imageFile.compressedBlob = blob
            imageFile.compressedSize = blob.size
            imageFile.compressedPreview = URL.createObjectURL(blob)
            imageFile.status = 'completed'
          }
          else {
            imageFile.status = 'error'
            imageFile.error = '圧縮に失敗しました'
          }
          resolve()
        },
        mimeType,
        quality.value / 100,
      )
    })
  }
  catch (error) {
    imageFile.status = 'error'
    imageFile.error = error instanceof Error ? error.message : '不明なエラー'
  }
}

// 全画像を圧縮
const compressAll = async () => {
  isProcessing.value = true

  for (const image of images.value) {
    if (image.status === 'pending') {
      await compressImage(image)
    }
  }

  isProcessing.value = false
}

// 画像を削除
const removeImage = (id: string) => {
  const image = images.value.find(img => img.id === id)
  if (image?.compressedPreview) {
    URL.revokeObjectURL(image.compressedPreview)
  }
  images.value = images.value.filter(img => img.id !== id)
}

// すべてクリア
const clearAll = () => {
  images.value.forEach((image) => {
    if (image.compressedPreview) {
      URL.revokeObjectURL(image.compressedPreview)
    }
  })
  images.value = []
}

// 画像をダウンロード
const downloadImage = (image: ImageFile) => {
  if (!image.compressedBlob) return

  const url = URL.createObjectURL(image.compressedBlob)
  const a = document.createElement('a')
  a.href = url

  const nameParts = image.file.name.split('.')
  nameParts.pop()
  const baseName = nameParts.join('.')
  const extension = outputFormat.value === 'original'
    ? image.file.name.split('.').pop()
    : outputFormat.value === 'jpeg' ? 'jpg' : outputFormat.value

  a.download = `${baseName}_compressed.${extension}`
  a.click()
  URL.revokeObjectURL(url)
}

// すべてダウンロード（ZIP）
const downloadAll = async () => {
  // 簡易実装: 個別にダウンロード
  for (const image of images.value) {
    if (image.status === 'completed' && image.compressedBlob) {
      downloadImage(image)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

// 統計情報
const stats = computed(() => {
  const completed = images.value.filter(img => img.status === 'completed')
  const totalOriginal = completed.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressed = completed.reduce((sum, img) => sum + (img.compressedSize || 0), 0)
  const savedBytes = totalOriginal - totalCompressed
  const savedPercent = totalOriginal > 0 ? savedBytes / totalOriginal * 100 : 0

  return {
    totalImages: images.value.length,
    completedImages: completed.length,
    totalOriginal,
    totalCompressed,
    savedBytes,
    savedPercent,
  }
})

// フォーマットサイズ
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// トースト通知
const { toast } = useToast()

// SEO設定
useSeoMeta({
  title: '画像圧縮ツール | Web開発ツール',
  description: 'ブラウザ上で画像を圧縮。JPEG、WebP、PNG形式に対応。品質とサイズを調整可能。',
})
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        画像圧縮ツール
      </h1>
      <p class="text-muted-foreground">
        画像をブラウザ上で圧縮・変換します。複数ファイルの一括処理に対応。
      </p>
    </div>
    <div class="space-y-6 col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>圧縮設定</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 品質 -->
          <div>
            <label class="text-sm font-medium mb-2 block">
              品質: {{ quality }}%
            </label>
            <Slider
              :model-value="[quality]"
              :min="10"
              :max="100"
              :step="10"
              class="w-full"
              @update:model-value="quality = $event[0]" />
            <div class="flex justify-between text-xs text-muted-foreground mt-1">
              <span>低品質</span>
              <span>高品質</span>
            </div>
          </div>

          <!-- 最大サイズ -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium mb-2 block">最大幅</label>
              <Input
                v-model.number="maxWidth"
                type="number"
                min="100"
                max="4096"
                placeholder="1920" />
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">最大高さ</label>
              <Input
                v-model.number="maxHeight"
                type="number"
                min="100"
                max="4096"
                placeholder="1080" />
            </div>
          </div>

          <label class="flex items-center gap-2">
            <input
              v-model="maintainAspectRatio"
              type="checkbox"
              class="rounded">
            <span class="text-sm">アスペクト比を維持</span>
          </label>

          <!-- 出力フォーマット -->
          <div>
            <label class="text-sm font-medium mb-2 block">出力フォーマット</label>
            <select
              v-model="outputFormat"
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="original">
                元の形式を維持
              </option>
              <option value="jpeg">
                JPEG
              </option>
              <option value="webp">
                WebP
              </option>
              <option value="png">
                PNG
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      <!-- 統計情報 -->
      <Card v-if="stats.totalImages > 0">
        <CardHeader>
          <CardTitle>統計情報</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">処理済み</span>
            <span class="text-sm font-medium">
              {{ stats.completedImages }} / {{ stats.totalImages }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">元のサイズ</span>
            <span class="text-sm font-medium">{{ formatSize(stats.totalOriginal) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">圧縮後</span>
            <span class="text-sm font-medium">{{ formatSize(stats.totalCompressed) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">削減</span>
            <span class="text-sm font-medium text-green-600">
              -{{ formatSize(stats.savedBytes) }} ({{ stats.savedPercent.toFixed(1) }}%)
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- アクション -->
      <div class="space-y-2">
        <Button
          :disabled="images.length === 0 || isProcessing"
          class="w-full"
          @click="compressAll">
          <Icon name="heroicons:bolt" class="w-4 h-4 mr-2" />
          {{ isProcessing ? '処理中...' : 'すべて圧縮' }}
        </Button>
        <Button
          :disabled="stats.completedImages === 0"
          variant="outline"
          class="w-full"
          @click="downloadAll">
          <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
          すべてダウンロード
        </Button>
        <Button
          :disabled="images.length === 0"
          variant="outline"
          class="w-full"
          @click="clearAll">
          <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
          クリア
        </Button>
      </div>
    </div>

    <!-- メインエリア -->
    <div class="space-y-6 col-span-2">
      <!-- ドロップエリア -->
      <div
        :class="[
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        ]"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop">
        <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p class="text-lg font-medium mb-2">
          画像をドラッグ&ドロップ
        </p>
        <p class="text-sm text-muted-foreground mb-4">
          または
        </p>
        <label>
          <input
            type="file"
            multiple
            accept="image/*"
            class="hidden"
            @change="handleFileSelect">
          <Button as="span" variant="outline">
            ファイルを選択
          </Button>
        </label>
      </div>

      <!-- 画像リスト -->
      <div v-if="images.length > 0" class="mt-6 space-y-4">
        <div
          v-for="image in images"
          :key="image.id"
          class="border rounded-lg p-4">
          <div class="flex items-start gap-4">
            <!-- プレビュー -->
            <div class="flex gap-2">
              <div class="w-24 h-24 rounded border overflow-hidden bg-muted">
                <img
                  :src="image.preview"
                  :alt="image.file.name"
                  class="w-full h-full object-cover">
              </div>
              <div v-if="image.compressedPreview" class="w-24 h-24 rounded border overflow-hidden bg-muted">
                <img
                  :src="image.compressedPreview"
                  :alt="`Compressed ${image.file.name}`"
                  class="w-full h-full object-cover">
              </div>
            </div>

            <!-- 情報 -->
            <div class="flex-1">
              <h4 class="font-medium mb-1">
                {{ image.file.name }}
              </h4>
              <div class="space-y-1 text-sm">
                <div class="flex items-center gap-4">
                  <span class="text-muted-foreground">元のサイズ:</span>
                  <span>{{ formatSize(image.originalSize) }}</span>
                </div>
                <div v-if="image.compressedSize" class="flex items-center gap-4">
                  <span class="text-muted-foreground">圧縮後:</span>
                  <span class="font-medium text-green-600">
                    {{ formatSize(image.compressedSize) }}
                    (-{{ ((1 - image.compressedSize / image.originalSize) * 100).toFixed(1) }}%)
                  </span>
                </div>
                <div v-if="image.status === 'error'" class="text-destructive">
                  {{ image.error }}
                </div>
              </div>
            </div>

            <!-- アクション -->
            <div class="flex items-center gap-2">
              <Button
                v-if="image.status === 'pending'"
                size="sm"
                @click="compressImage(image)">
                圧縮
              </Button>
              <Button
                v-if="image.status === 'completed'"
                size="sm"
                variant="outline"
                @click="downloadImage(image)">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                @click="removeImage(image.id)">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <!-- プログレスバー -->
          <div v-if="image.status === 'compressing'" class="mt-3">
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div class="h-full bg-primary animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
