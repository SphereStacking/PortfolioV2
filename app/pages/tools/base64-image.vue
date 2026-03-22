<script setup lang="ts">
definePageMeta({
  layout: 'tools',
})

// 状態管理
const imageFile = ref<File | null>(null)
const imageUrl = ref('')
const base64Output = ref('')
const imageFormat = ref<'dataurl' | 'base64'>('dataurl')
const loading = ref(false)
const error = ref('')

// プレビュー用
const previewUrl = ref('')

// 画像情報
const imageInfo = ref({
  name: '',
  size: 0,
  type: '',
  width: 0,
  height: 0,
})

// ファイル選択
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = '画像ファイルを選択してください'
    return
  }

  imageFile.value = file
  imageInfo.value.name = file.name
  imageInfo.value.size = file.size
  imageInfo.value.type = file.type

  error.value = ''
  processImage(file)
}

// 画像処理
const processImage = async (file: File) => {
  loading.value = true
  error.value = ''

  try {
    const reader = new FileReader()

    reader.onload = (e) => {
      const result = e.target?.result as string
      previewUrl.value = result

      // 画像サイズを取得
      const img = new Image()
      img.onload = () => {
        imageInfo.value.width = img.width
        imageInfo.value.height = img.height
      }
      img.src = result

      // 出力形式に応じて変換
      if (imageFormat.value === 'dataurl') {
        base64Output.value = result
      }
      else {
        // data:image/png;base64, の部分を削除
        const base64 = result.split(',')[1]
        base64Output.value = base64
      }
    }

    reader.onerror = () => {
      error.value = 'ファイルの読み込みに失敗しました'
    }

    reader.readAsDataURL(file)
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '画像の処理に失敗しました'
  }
  finally {
    loading.value = false
  }
}

// URLから画像を読み込み
const loadFromUrl = async () => {
  if (!imageUrl.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(imageUrl.value)

    if (!response.ok) {
      throw new Error('画像の読み込みに失敗しました')
    }

    const blob = await response.blob()

    if (!blob.type.startsWith('image/')) {
      throw new Error('URLが画像を指していません')
    }

    const file = new File([blob], 'image', { type: blob.type })
    imageFile.value = file
    imageInfo.value.name = 'URLから読み込み'
    imageInfo.value.size = blob.size
    imageInfo.value.type = blob.type

    processImage(file)
  }
  catch (err) {
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      error.value = 'CORSエラー: この画像は外部から読み込むことができません'
    }
    else {
      error.value = err instanceof Error ? err.message : '画像の読み込みに失敗しました'
    }
  }
  finally {
    loading.value = false
  }
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

  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    imageFile.value = file
    imageInfo.value.name = file.name
    imageInfo.value.size = file.size
    imageInfo.value.type = file.type
    processImage(file)
  }
  else {
    error.value = '画像ファイルをドロップしてください'
  }
}

// クリップボード操作
const { copyToClipboard } = useCopyToClipboard()

// ダウンロード
const downloadBase64 = () => {
  const blob = new Blob([base64Output.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${imageInfo.value.name || 'image'}.base64.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// クリア
const clearAll = () => {
  imageFile.value = null
  imageUrl.value = ''
  base64Output.value = ''
  previewUrl.value = ''
  error.value = ''
  imageInfo.value = {
    name: '',
    size: 0,
    type: '',
    width: 0,
    height: 0,
  }
}

// ファイルサイズのフォーマット
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Base64サイズ
const base64Size = computed(() => {
  return base64Output.value.length
})

// SEO設定
useSeoMeta({
  title: 'Base64画像エンコーダー | Web開発ツール',
  description: '画像をBase64形式に変換。Data URL形式での出力にも対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        Base64画像エンコーダー
      </h1>
      <p class="text-muted-foreground">
        画像をBase64形式に変換します。Data URL形式での出力にも対応。
      </p>
    </div>

    <!-- 画像入力 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          画像を選択
        </h3>
      </template>
      <!-- ドラッグ&ドロップエリア -->
      <div
        :class="[
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        ]"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop">
        <input
          type="file"
          accept="image/*"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          @change="handleFileSelect">

        <Icon name="heroicons:arrow-up-tray" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p class="text-sm font-medium">
          画像をドラッグ&ドロップ
        </p>
        <p class="text-xs text-muted-foreground mt-1">
          またはクリックして選択
        </p>
      </div>

      <!-- URL入力 -->
      <div class="space-y-2">
        <label class="text-sm font-medium">URLから読み込み</label>
        <div class="flex gap-2">
          <UInput
            v-model="imageUrl"
            placeholder="https://example.com/image.png"
            @keydown.enter="loadFromUrl" />
          <UButton
            :disabled="!imageUrl || loading"
            @click="loadFromUrl">
            読み込み
          </UButton>
        </div>
        <p class="text-xs text-muted-foreground">
          ※ CORSの制限により一部の画像は読み込めません
        </p>
      </div>
      <h3 class="font-semibold mt-4 mb-2">
        出力設定
      </h3>
      <div class="space-y-3">
        <label class="flex items-center gap-3">
          <input
            v-model="imageFormat"
            value="dataurl"
            type="radio"
            class="text-primary">
          <div>
            <div class="font-medium">Data URL形式</div>
            <div class="text-sm text-muted-foreground">data:image/png;base64,...</div>
          </div>
        </label>
        <label class="flex items-center gap-3">
          <input
            v-model="imageFormat"
            value="base64"
            type="radio"
            class="text-primary">
          <div>
            <div class="font-medium">Base64のみ</div>
            <div class="text-sm text-muted-foreground">プレフィックスなしの文字列</div>
          </div>
        </label>
      </div>
    </UCard>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">
            Base64出力
          </h3>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="outline"
              @click="copyToClipboard(base64Output)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-1" />
              コピー
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              @click="downloadBase64">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
              保存
            </UButton>
          </div>
        </div>
      </template>
      <textarea
        v-model="base64Output"
        readonly
        class="w-full h-64 p-3 font-mono text-xs border rounded-md bg-muted resize-none"
        spellcheck="false">
            </textarea>
      <div class="flex items-center justify-between mt-4 mb-2">
        <h3 class="font-semibold">
          プレビュー
        </h3>
        <UButton
          size="sm"
          variant="ghost"
          @click="clearAll">
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </UButton>
      </div>
      <div class="rounded-lg p-4 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <img
          :src="previewUrl"
          alt="Preview"
          class="max-w-full h-auto mx-auto rounded shadow-lg">
      </div>
      <h3 class="font-semibold mt-4 mb-2">
        画像情報
      </h3>
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-muted-foreground">
            ファイル名:
          </dt>
          <dd class="font-medium">
            {{ imageInfo.name }}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">
            形式:
          </dt>
          <dd class="font-medium">
            {{ imageInfo.type }}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">
            サイズ:
          </dt>
          <dd class="font-medium">
            {{ formatFileSize(imageInfo.size) }}
          </dd>
        </div>
        <div v-if="imageInfo.width" class="flex justify-between">
          <dt class="text-muted-foreground">
            寸法:
          </dt>
          <dd class="font-medium">
            {{ imageInfo.width }} × {{ imageInfo.height }}px
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">
            Base64サイズ:
          </dt>
          <dd class="font-medium">
            {{ formatFileSize(base64Size) }}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">
            増加率:
          </dt>
          <dd class="font-medium">
            {{ imageInfo.size ? ((base64Size / imageInfo.size) * 100).toFixed(1) : 0 }}%
          </dd>
        </div>
      </dl>
    </UCard>

    <!-- エラー表示 -->
    <UAlert
      v-if="error" class="col-span-full" color="error"
      icon="heroicons:exclamation-circle" :description="error" />

    <!-- 使い方 -->
    <UCard class="col-span-full">
      <template #header>
        <h3 class="font-semibold">
          使い方
        </h3>
      </template>
      <p>
        画像をBase64形式にエンコードすることで、HTMLやCSSに直接埋め込むことができます。
      </p>
      <ul class="list-disc list-inside space-y-1">
        <li>小さなアイコンやロゴの埋め込みに最適</li>
        <li>HTTPリクエストを削減できる</li>
        <li>Data URL形式はimg要素のsrc属性やCSSのbackground-imageで使用可能</li>
        <li>ファイルサイズは約33%増加するため、大きな画像には不向き</li>
      </ul>
      <div class="mt-4 p-3 bg-muted rounded-md">
        <p class="text-xs font-mono">
          &lt;img src="data:image/png;base64,iVBORw0..." /&gt;
        </p>
      </div>
    </UCard>
  </div>
</template>
