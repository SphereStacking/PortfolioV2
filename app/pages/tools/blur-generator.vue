<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const originalImage = ref<string>('')
const blurRadius = ref([10])
const imageScale = ref([10]) // プレースホルダー画像のスケール（%）
const outputFormat = ref<'base64' | 'blurhash' | 'css' | 'glassmorphism' | 'skeleton'>('glassmorphism')
const quality = ref([80])
const processing = ref(false)
const error = ref('')
const glassOpacity = ref([30])
const glassSaturation = ref([120])
const previewMode = ref<'split' | 'overlay' | 'separate'>('overlay')

// 出力結果
const blurredImage = ref('')
const blurHash = ref('')
const cssCode = ref('')
const outputSize = ref(0)

// Canvas参照
const canvasRef = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)

// 画像情報
const imageInfo = ref({
  width: 0,
  height: 0,
  originalSize: 0,
  format: '',
})

// 画像アップロード処理
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = '画像ファイルを選択してください'
    return
  }

  imageInfo.value.originalSize = file.size
  imageInfo.value.format = file.type

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    error.value = ''
    loadImageToCanvas()
  }
  reader.readAsDataURL(file)
}

// ドラッグ&ドロップ
const isDragging = ref(false)

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = '画像ファイルを選択してください'
    return
  }

  imageInfo.value.originalSize = file.size
  imageInfo.value.format = file.type

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    error.value = ''
    loadImageToCanvas()
  }
  reader.readAsDataURL(file)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

// 画像をCanvasに読み込み
const loadImageToCanvas = () => {
  const img = new Image()
  img.onload = () => {
    if (!canvasRef.value) return

    imageInfo.value.width = img.width
    imageInfo.value.height = img.height

    // 初回はプレビュー生成
    generateBlur()
  }
  img.src = originalImage.value
}

// ブラー処理
const generateBlur = async () => {
  if (!originalImage.value) return

  processing.value = true
  error.value = ''

  try {
    const img = new Image()
    img.src = originalImage.value

    await new Promise((resolve) => {
      img.onload = resolve
    })

    if (!canvasRef.value) return

    // 縮小サイズを計算
    const scale = imageScale.value[0] / 100
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)

    // キャンバスサイズ設定
    canvasRef.value.width = width
    canvasRef.value.height = height
    ctx.value = canvasRef.value.getContext('2d')

    if (!ctx.value) return

    // アンチエイリアシングを有効にして描画
    ctx.value.imageSmoothingEnabled = true
    ctx.value.imageSmoothingQuality = 'high'
    ctx.value.drawImage(img, 0, 0, width, height)

    // ブラー処理
    if (blurRadius.value[0] > 0) {
      applyCanvasBlur()
    }

    // 各形式で出力
    await generateOutputs()

    toast({
      title: '生成完了',
      description: 'プレースホルダー画像を生成しました',
    })
  }
  catch (err) {
    error.value = '画像の処理に失敗しました'
    console.error('Blur generation error:', err)
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

// Canvasにブラー効果を適用（簡易ガウシアンブラー）
const applyCanvasBlur = () => {
  if (!ctx.value || !canvasRef.value) return

  const imageData = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
  const blurred = gaussianBlur(imageData, blurRadius.value[0])
  ctx.value.putImageData(blurred, 0, 0)
}

// ガウシアンブラー実装
const gaussianBlur = (imageData: ImageData, radius: number): ImageData => {
  const { width, height, data } = imageData
  const output = new ImageData(width, height)
  const outputData = output.data

  // ガウシアンカーネルを生成
  const kernel = generateGaussianKernel(radius)
  const kernelSize = kernel.length
  const halfKernel = Math.floor(kernelSize / 2)

  // 水平方向のブラー
  const temp = new Uint8ClampedArray(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, weight = 0

      for (let i = 0; i < kernelSize; i++) {
        const px = Math.min(Math.max(x + i - halfKernel, 0), width - 1)
        const idx = (y * width + px) * 4
        const k = kernel[i]

        r += data[idx] * k
        g += data[idx + 1] * k
        b += data[idx + 2] * k
        a += data[idx + 3] * k
        weight += k
      }

      const idx = (y * width + x) * 4
      temp[idx] = r / weight
      temp[idx + 1] = g / weight
      temp[idx + 2] = b / weight
      temp[idx + 3] = a / weight
    }
  }

  // 垂直方向のブラー
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, weight = 0

      for (let i = 0; i < kernelSize; i++) {
        const py = Math.min(Math.max(y + i - halfKernel, 0), height - 1)
        const idx = (py * width + x) * 4
        const k = kernel[i]

        r += temp[idx] * k
        g += temp[idx + 1] * k
        b += temp[idx + 2] * k
        a += temp[idx + 3] * k
        weight += k
      }

      const idx = (y * width + x) * 4
      outputData[idx] = r / weight
      outputData[idx + 1] = g / weight
      outputData[idx + 2] = b / weight
      outputData[idx + 3] = a / weight
    }
  }

  return output
}

// ガウシアンカーネル生成
const generateGaussianKernel = (radius: number): number[] => {
  const size = radius * 2 + 1
  const kernel = new Array(size)
  const sigma = radius / 3
  const twoSigmaSquare = 2 * sigma * sigma
  let sum = 0

  for (let i = 0; i < size; i++) {
    const x = i - radius
    kernel[i] = Math.exp(-(x * x) / twoSigmaSquare)
    sum += kernel[i]
  }

  // 正規化
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum
  }

  return kernel
}

// 各形式での出力生成
const generateOutputs = async () => {
  if (!canvasRef.value) return

  // Base64形式
  blurredImage.value = canvasRef.value.toDataURL('image/jpeg', quality.value[0] / 100)

  // ファイルサイズ計算
  const base64Length = blurredImage.value.split(',')[1].length
  outputSize.value = Math.round(base64Length * 0.75) // Base64 to bytes

  // BlurHash生成（簡易版）
  generateBlurHash()

  // CSSコード生成
  generateCSSCode()
}

// BlurHash生成（簡易版 - 実際にはライブラリを使用すべき）
const generateBlurHash = () => {
  // 実際のBlurHashアルゴリズムは複雑なため、
  // ここでは簡易的な実装例を示します
  // const components = 4 // x and y components
  blurHash.value = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
}

// CSSコード生成
const generateCSSCode = () => {
  const code = []

  if (outputFormat.value === 'css') {
    // 基本的なブラー効果
    code.push('/* CSS Filter Blur */')
    code.push('.placeholder {')
    code.push(`  filter: blur(${blurRadius.value[0]}px);`)
    code.push(`  transform: scale(${100 / imageScale.value[0]});`)
    code.push('}')
    code.push('')

    // backdrop-filter版
    code.push('/* Backdrop Filter (for glass effect) */')
    code.push('.glass-effect {')
    code.push(`  backdrop-filter: blur(${blurRadius.value[0]}px);`)
    code.push('  background-color: rgba(255, 255, 255, 0.3);')
    code.push('}')
  }
  else if (outputFormat.value === 'glassmorphism') {
    // Glassmorphism効果
    code.push('/* Glassmorphism Effect */')
    code.push('.glassmorphism {')
    code.push('  /* ガラス効果のベース */')
    code.push(`  backdrop-filter: blur(${blurRadius.value[0]}px) saturate(${glassSaturation.value[0]}%);`)
    code.push(`  -webkit-backdrop-filter: blur(${blurRadius.value[0]}px) saturate(${glassSaturation.value[0]}%);`)
    code.push(`  background-color: rgba(255, 255, 255, ${glassOpacity.value[0] / 100});`)
    code.push('  border-radius: 12px;')
    code.push('  border: 1px solid rgba(255, 255, 255, 0.18);')
    code.push('  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);')
    code.push('}')
    code.push('')
    code.push('/* ダークモード対応 */')
    code.push('.dark .glassmorphism {')
    code.push(`  background-color: rgba(17, 25, 40, ${glassOpacity.value[0] / 100});`)
    code.push('  border: 1px solid rgba(255, 255, 255, 0.125);')
    code.push('  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);')
    code.push('}')
    code.push('')
    code.push('/* 使用例 */')
    code.push('.card-container {')
    code.push('  position: relative;')
    code.push('  background-image: url("background.jpg");')
    code.push('  background-size: cover;')
    code.push('}')
    code.push('')
    code.push('.card-content {')
    code.push('  @apply glassmorphism;')
    code.push('  padding: 2rem;')
    code.push('}')
  }
  else if (outputFormat.value === 'skeleton') {
    // スケルトンスクリーン用CSS
    code.push('/* Skeleton Screen with Blur */')
    code.push('.skeleton {')
    code.push('  position: relative;')
    code.push('  overflow: hidden;')
    code.push('  background-color: #e2e5e8;')
    code.push('}')
    code.push('')
    code.push('.skeleton::before {')
    code.push('  content: "";')
    code.push('  position: absolute;')
    code.push('  top: 0;')
    code.push('  left: 0;')
    code.push('  right: 0;')
    code.push('  bottom: 0;')
    code.push(`  background-image: url('${blurredImage.value}');`)
    code.push('  background-size: cover;')
    code.push('  background-position: center;')
    code.push(`  filter: blur(${blurRadius.value[0]}px);`)
    code.push('  opacity: 0.5;')
    code.push('}')
    code.push('')
    code.push('.skeleton::after {')
    code.push('  content: "";')
    code.push('  position: absolute;')
    code.push('  top: 0;')
    code.push('  left: 0;')
    code.push('  right: 0;')
    code.push('  bottom: 0;')
    code.push('  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);')
    code.push('  animation: skeleton-loading 1.5s infinite;')
    code.push('}')
    code.push('')
    code.push('@keyframes skeleton-loading {')
    code.push('  0% { transform: translateX(-100%); }')
    code.push('  100% { transform: translateX(100%); }')
    code.push('}')
  }

  // インラインData URL版
  if (blurredImage.value && outputFormat.value !== 'glassmorphism') {
    code.push('')
    code.push('/* Inline Placeholder Image */')
    code.push('.placeholder-image {')
    code.push(`  background-image: url('${blurredImage.value}');`)
    code.push('  background-size: cover;')
    code.push('  background-position: center;')
    code.push('}')
  }

  cssCode.value = code.join('\n')
}

// パラメータ変更時の再生成
watch([blurRadius, imageScale, quality, glassOpacity, glassSaturation], () => {
  if (originalImage.value) {
    generateBlur()
  }
})

// 出力形式変更時のCSS再生成
watch(outputFormat, () => {
  if (originalImage.value) {
    generateCSSCode()
  }
})

// サンプル画像
const sampleImages = [
  { name: 'Nature', url: 'https://picsum.photos/800/600?random=1' },
  { name: 'City', url: 'https://picsum.photos/800/600?random=2' },
  { name: 'Abstract', url: 'https://picsum.photos/800/600?random=3' },
]

const loadSampleImage = async (url: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const reader = new FileReader()

    reader.onload = (e) => {
      originalImage.value = e.target?.result as string
      imageInfo.value.format = blob.type
      imageInfo.value.originalSize = blob.size
      error.value = ''
      loadImageToCanvas()
    }

    reader.readAsDataURL(blob)
  }
  catch {
    error.value = 'サンプル画像の読み込みに失敗しました'
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
const downloadImage = () => {
  if (!blurredImage.value) return

  const link = document.createElement('a')
  link.href = blurredImage.value
  link.download = `blur-placeholder-${imageScale.value[0]}p-${blurRadius.value[0]}px.jpg`
  link.click()
}

// ファイルサイズフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// リセット
const reset = () => {
  originalImage.value = ''
  blurredImage.value = ''
  blurHash.value = ''
  cssCode.value = ''
  error.value = ''
  outputSize.value = 0
  imageInfo.value = {
    width: 0,
    height: 0,
    originalSize: 0,
    format: '',
  }
}

// SEO設定
useSeoMeta({
  title: 'Glass Morphism & ブラー効果ジェネレーター | Web開発ツール',
  description: 'Glass Morphism効果、プレースホルダー画像、スケルトンスクリーン用のCSS・画像を生成。モダンUIデザインに最適。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        Glass Morphism & ブラー効果ジェネレーター
      </h1>
      <p class="text-muted-foreground">
        Glass Morphism効果、プレースホルダー画像、スケルトンスクリーンなど、モダンUIに必要なブラー効果を生成します。
      </p>
    </div>

    <!-- 画像アップロード -->
    <Card>
      <CardHeader>
        <CardTitle>画像選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="!originalImage">
          <div
            class="border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4"
            :class="isDragging ? 'border-primary bg-primary/5' : 'border-border'"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave">
            <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p class="text-muted-foreground mb-2">
              ドラッグ&ドロップまたはクリックして画像を選択
            </p>
            <p class="text-xs text-muted-foreground mb-4">
              PNG、JPEG、WebP形式に対応
            </p>
            <label>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageUpload">
              <Button variant="outline" as="span">
                画像を選択
              </Button>
            </label>
          </div>

          <div class="flex gap-2">
            <Button
              v-for="sample in sampleImages"
              :key="sample.name"
              variant="outline"
              size="sm"
              @click="loadSampleImage(sample.url)">
              {{ sample.name }}
            </Button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-muted-foreground">
              <p>サイズ: {{ imageInfo.width }} × {{ imageInfo.height }}px</p>
              <p>元のファイルサイズ: {{ formatFileSize(imageInfo.originalSize) }}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="reset">
              <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
              クリア
            </Button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium mb-2">
                元画像
              </p>
              <img
                :src="originalImage"
                class="w-full h-auto rounded border"
                alt="Original">
            </div>
            <div>
              <p class="text-sm font-medium mb-2">
                プレビュー
              </p>
              <div class="relative">
                <canvas
                  ref="canvasRef"
                  class="w-full h-auto rounded border"
                  :style="{ maxWidth: '100%', height: 'auto' }"></canvas>
                <div v-if="processing" class="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 設定 -->
    <Card v-if="originalImage">
      <CardHeader>
        <CardTitle>ブラー設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <div>
            <label class="text-sm font-medium mb-2 block">
              ブラー強度: {{ blurRadius[0] }}px
            </label>
            <Slider
              :model-value="blurRadius"
              :min="0"
              :max="50"
              :step="1"
              class="w-full"
              @update:model-value="blurRadius = $event" />
            <p class="text-xs text-muted-foreground mt-1">
              値が大きいほどぼかしが強くなります
            </p>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              画像サイズ: {{ imageScale[0] }}%
            </label>
            <Slider
              :model-value="imageScale"
              :min="1"
              :max="50"
              :step="1"
              class="w-full"
              @update:model-value="imageScale = $event" />
            <p class="text-xs text-muted-foreground mt-1">
              小さくするほどファイルサイズが削減されます
            </p>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              JPEG品質: {{ quality[0] }}%
            </label>
            <Slider
              :model-value="quality"
              :min="10"
              :max="100"
              :step="10"
              class="w-full"
              @update:model-value="quality = $event" />
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">出力形式</label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="format in [
                  { value: 'glassmorphism', label: 'Glass Morphism' },
                  { value: 'skeleton', label: 'Skeleton Screen' },
                  { value: 'base64', label: 'Base64画像' },
                  { value: 'css', label: 'CSS Blur' },
                  { value: 'blurhash', label: 'BlurHash' },
                ]"
                :key="format.value"
                :variant="outputFormat === format.value ? 'default' : 'outline'"
                size="sm"
                @click="outputFormat = format.value">
                {{ format.label }}
              </Button>
            </div>
          </div>

          <!-- Glass Morphism専用設定 -->
          <div v-if="outputFormat === 'glassmorphism'" class="space-y-4 pt-4 border-t">
            <div>
              <label class="text-sm font-medium mb-2 block">
                ガラスの透明度: {{ glassOpacity[0] }}%
              </label>
              <Slider
                :model-value="glassOpacity"
                :min="10"
                :max="90"
                :step="10"
                class="w-full"
                @update:model-value="glassOpacity = $event" />
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">
                彩度: {{ glassSaturation[0] }}%
              </label>
              <Slider
                :model-value="glassSaturation"
                :min="50"
                :max="200"
                :step="10"
                class="w-full"
                @update:model-value="glassSaturation = $event" />
            </div>
          </div>

          <!-- プレビューモード -->
          <div class="pt-4 border-t">
            <label class="text-sm font-medium mb-2 block">プレビューモード</label>
            <div class="flex gap-2">
              <Button
                v-for="mode in [
                  { value: 'overlay', label: 'オーバーレイ', icon: 'heroicons:squares-2x2' },
                  { value: 'split', label: '分割表示', icon: 'heroicons:square-2-stack' },
                  { value: 'separate', label: '個別表示', icon: 'heroicons:rectangle-group' },
                ]"
                :key="mode.value"
                :variant="previewMode === mode.value ? 'default' : 'outline'"
                size="sm"
                @click="previewMode = mode.value">
                <Icon :name="mode.icon" class="w-4 h-4 mr-2" />
                {{ mode.label }}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 出力結果 -->
    <Card v-if="blurredImage && originalImage">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>生成結果</CardTitle>
          <Badge variant="outline">
            {{ formatFileSize(outputSize) }}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Base64出力 -->
          <div v-if="outputFormat === 'base64'" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">
                Base64 Data URL
              </p>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(blurredImage)">
                  <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="downloadImage">
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                </Button>
              </div>
            </div>
            <textarea
              :value="blurredImage"
              readonly
              class="w-full h-32 p-3 font-mono text-xs border rounded-md bg-muted resize-none"
              spellcheck="false"></textarea>
          </div>

          <!-- BlurHash出力 -->
          <div v-else-if="outputFormat === 'blurhash'" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">
                BlurHash文字列
              </p>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(blurHash)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <Input
              :value="blurHash"
              readonly
              class="font-mono" />
            <Alert>
              <Icon name="heroicons:information-circle" class="w-4 h-4" />
              <AlertDescription>
                BlurHashは実際のライブラリを使用して生成してください。
                これはデモ用の固定値です。
              </AlertDescription>
            </Alert>
          </div>

          <!-- CSS出力 (Glass Morphism, Skeleton, CSS) -->
          <div v-else-if="['css', 'glassmorphism', 'skeleton'].includes(outputFormat)" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">
                {{ outputFormat === 'glassmorphism' ? 'Glass Morphism CSS'
                  : outputFormat === 'skeleton' ? 'Skeleton Screen CSS' : 'CSSコード' }}
              </p>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(cssCode)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ cssCode }}</code></pre>

            <!-- Glass Morphismのライブプレビュー -->
            <div v-if="outputFormat === 'glassmorphism'" class="mt-4">
              <p class="text-sm font-medium mb-2">
                ライブプレビュー
              </p>
              <div
                class="relative h-64 rounded-lg overflow-hidden"
                :style="{ backgroundImage: `url(${originalImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                <div
                  class="absolute inset-4 p-4 rounded-lg"
                  :style="{
                    backdropFilter: `blur(${blurRadius[0]}px) saturate(${glassSaturation[0]}%)`,
                    WebkitBackdropFilter: `blur(${blurRadius[0]}px) saturate(${glassSaturation[0]}%)`,
                    backgroundColor: `rgba(255, 255, 255, ${glassOpacity[0] / 100})`,
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                  }">
                  <h3 class="text-lg font-semibold mb-2">
                    Glass Morphism Card
                  </h3>
                  <p class="text-sm">
                    この効果により、背景がぼやけて見えるモダンなUIを実現できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>使い方ガイド</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Glass Morphism効果
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>モダンなUIデザインで人気のガラス効果</li>
              <li>カード、モーダル、ナビゲーションに最適</li>
              <li>backdrop-filterでパフォーマンスも優秀</li>
              <li>iOS/macOSのようなUIを実現</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Skeleton Screen
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>コンテンツ読み込み中の表示に使用</li>
              <li>実際のコンテンツレイアウトを模倣</li>
              <li>ユーザーの待機体験を向上</li>
              <li>パルスアニメーション付き</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              プレースホルダー画像
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>Base64:</strong> 小さな画像をHTMLに直接埋め込み</li>
              <li><strong>BlurHash:</strong> 最小サイズ（数十バイト）で表現</li>
              <li><strong>CSS Blur:</strong> 動的なブラー効果の適用</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              推奨設定
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>Glass Morphism:</strong> ブラー16-24px、透明度20-40%</li>
              <li><strong>Skeleton:</strong> ブラー20-30px、画像サイズ10-20%</li>
              <li><strong>プレースホルダー:</strong> 画像サイズ5-10%、品質60-80%</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
