<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const originalImage = ref<string>('')
const processedImage = ref<string>('')
const processing = ref(false)
const error = ref('')
const brushSize = ref(20)
const isErasing = ref(true)
const showOriginal = ref(false)
const edgeFeather = ref(2)

// Canvas参照
const canvasRef = ref<HTMLCanvasElement>()
const overlayCanvasRef = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)
const overlayCtx = ref<CanvasRenderingContext2D | null>(null)

// マスクデータ
const maskData = ref<ImageData | null>(null)
const originalImageData = ref<ImageData | null>(null)

// 画像アップロード処理
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = '画像ファイルを選択してください'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    processedImage.value = ''
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

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    processedImage.value = ''
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
    if (!canvasRef.value || !overlayCanvasRef.value) return

    // キャンバスのサイズを画像に合わせる
    canvasRef.value.width = img.width
    canvasRef.value.height = img.height
    overlayCanvasRef.value.width = img.width
    overlayCanvasRef.value.height = img.height

    // コンテキスト取得
    ctx.value = canvasRef.value.getContext('2d')
    overlayCtx.value = overlayCanvasRef.value.getContext('2d')

    if (!ctx.value || !overlayCtx.value) return

    // 画像を描画
    ctx.value.drawImage(img, 0, 0)

    // 元画像データを保存
    originalImageData.value = ctx.value.getImageData(0, 0, img.width, img.height)

    // マスクを初期化（全て不透明）
    maskData.value = ctx.value.createImageData(img.width, img.height)
    const data = maskData.value.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 // R
      data[i + 1] = 255 // G
      data[i + 2] = 255 // B
      data[i + 3] = 255 // A
    }

    // 簡易的な自動背景検出を実行
    autoDetectBackground()
  }
  img.src = originalImage.value
}

// 簡易的な背景自動検出（エッジ検出ベース）
const autoDetectBackground = async () => {
  if (!ctx.value || !canvasRef.value || !originalImageData.value || !maskData.value) return

  processing.value = true
  error.value = ''

  try {
    const width = canvasRef.value.width
    const height = canvasRef.value.height
    const imageData = originalImageData.value
    const mask = maskData.value

    // エッジ検出（Sobelフィルタ）
    const edges = detectEdges(imageData, width, height)

    // エッジの外側を背景として検出
    const threshold = 30
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const edgeStrength = edges[y * width + x]

        // エッジが弱い部分を背景とみなす
        if (edgeStrength < threshold) {
          // 画像の端に近いほど背景の可能性が高い
          const distanceFromEdge = Math.min(x, y, width - x - 1, height - y - 1)
          if (distanceFromEdge < 50 || edgeStrength < threshold / 2) {
            mask.data[idx + 3] = 0 // 透明にする
          }
        }
      }
    }

    // マスクを適用
    applyMask()

    toast({
      title: '背景検出完了',
      description: '手動で調整が必要な部分を修正してください',
    })
  }
  catch {
    error.value = '背景検出に失敗しました'
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

// エッジ検出（Sobelフィルタ）
const detectEdges = (imageData: ImageData, width: number, height: number): Float32Array => {
  const data = imageData.data
  const edges = new Float32Array(width * height)

  // Sobelカーネル
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0

      // 3x3カーネルを適用
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          const kernelIdx = (ky + 1) * 3 + (kx + 1)

          gx += gray * sobelX[kernelIdx]
          gy += gray * sobelY[kernelIdx]
        }
      }

      edges[y * width + x] = Math.sqrt(gx * gx + gy * gy)
    }
  }

  return edges
}

// 手動ブラシ処理
const isDrawing = ref(false)
const lastPos = ref({ x: 0, y: 0 })

const startDrawing = (event: MouseEvent) => {
  if (!overlayCanvasRef.value) return

  isDrawing.value = true
  const rect = overlayCanvasRef.value.getBoundingClientRect()
  lastPos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

const draw = (event: MouseEvent) => {
  if (!isDrawing.value || !overlayCanvasRef.value || !maskData.value) return

  const rect = overlayCanvasRef.value.getBoundingClientRect()
  const currentPos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }

  // Canvas上の実際の座標に変換
  const scaleX = overlayCanvasRef.value.width / rect.width
  const scaleY = overlayCanvasRef.value.height / rect.height

  const x1 = Math.floor(lastPos.value.x * scaleX)
  const y1 = Math.floor(lastPos.value.y * scaleY)
  const x2 = Math.floor(currentPos.x * scaleX)
  const y2 = Math.floor(currentPos.y * scaleY)

  // ブラシで線を描画
  drawLine(x1, y1, x2, y2)

  lastPos.value = currentPos
  applyMask()
}

const stopDrawing = () => {
  isDrawing.value = false
}

// ブラシで線を描画
const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
  if (!maskData.value || !canvasRef.value) return

  const width = canvasRef.value.width
  const height = canvasRef.value.height
  const mask = maskData.value.data
  const radius = Math.floor(brushSize.value / 2)

  // Bresenhamのアルゴリズムで線を描画
  const dx = Math.abs(x2 - x1)
  const dy = Math.abs(y2 - y1)
  const sx = x1 < x2 ? 1 : -1
  const sy = y1 < y2 ? 1 : -1
  let err = dx - dy

  while (true) {
    // ブラシの円を描画
    for (let by = -radius; by <= radius; by++) {
      for (let bx = -radius; bx <= radius; bx++) {
        if (bx * bx + by * by <= radius * radius) {
          const px = x1 + bx
          const py = y1 + by

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4 + 3
            mask[idx] = isErasing.value ? 0 : 255
          }
        }
      }
    }

    if (x1 === x2 && y1 === y2) break

    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x1 += sx
    }
    if (e2 < dx) {
      err += dx
      y1 += sy
    }
  }
}

// マスクを適用
const applyMask = () => {
  if (!ctx.value || !originalImageData.value || !maskData.value || !canvasRef.value) return

  const width = canvasRef.value.width
  const height = canvasRef.value.height
  const output = ctx.value.createImageData(width, height)
  const original = originalImageData.value.data
  const _mask = maskData.value.data
  const out = output.data

  // フェザリング処理
  const featheredMask = featherMask(maskData.value, edgeFeather.value)

  // マスクを適用
  for (let i = 0; i < original.length; i += 4) {
    out[i] = original[i] // R
    out[i + 1] = original[i + 1] // G
    out[i + 2] = original[i + 2] // B
    out[i + 3] = featheredMask.data[i + 3] // A (マスクのアルファ値を使用)
  }

  ctx.value.putImageData(output, 0, 0)
}

// マスクのフェザリング（エッジをぼかす）
const featherMask = (mask: ImageData, radius: number): ImageData => {
  if (radius <= 0) return mask

  const width = mask.width
  const height = mask.height
  const result = new ImageData(width, height)
  const src = mask.data
  const dst = result.data

  // ガウシアンブラー（簡易版）
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let count = 0

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = x + dx
          const py = y + dy

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const weight = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius))
            sum += src[(py * width + px) * 4 + 3] * weight
            count += weight
          }
        }
      }

      const idx = (y * width + x) * 4
      dst[idx] = src[idx]
      dst[idx + 1] = src[idx + 1]
      dst[idx + 2] = src[idx + 2]
      dst[idx + 3] = Math.round(sum / count)
    }
  }

  return result
}

// 背景を削除して保存
const saveProcessedImage = () => {
  if (!canvasRef.value) return

  processedImage.value = canvasRef.value.toDataURL('image/png')

  toast({
    title: '画像を生成しました',
    description: 'ダウンロードボタンから保存できます',
  })
}

// ダウンロード
const downloadImage = () => {
  if (!processedImage.value) return

  const link = document.createElement('a')
  link.href = processedImage.value
  link.download = 'removed-background.png'
  link.click()
}

// リセット
const reset = () => {
  originalImage.value = ''
  processedImage.value = ''
  error.value = ''
  maskData.value = null
  originalImageData.value = null

  if (ctx.value && canvasRef.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
  if (overlayCtx.value && overlayCanvasRef.value) {
    overlayCtx.value.clearRect(0, 0, overlayCanvasRef.value.width, overlayCanvasRef.value.height)
  }
}

// Toast
const { toast } = useToast()

// カーソルスタイル
const cursorStyle = computed(() => {
  if (!originalImage.value) return 'default'
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize.value}" height="${brushSize.value}"><circle cx="${brushSize.value / 2}" cy="${brushSize.value / 2}" r="${brushSize.value / 2 - 1}" fill="none" stroke="${isErasing.value ? 'red' : 'green'}" stroke-width="2"/></svg>') ${brushSize.value / 2} ${brushSize.value / 2}, crosshair`
})

// SEO設定
useSeoMeta({
  title: 'AI背景除去 | Web開発ツール',
  description: 'ブラウザ上で画像の背景を自動検出・除去。手動調整も可能。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        AI背景除去
      </h1>
      <p class="text-muted-foreground">
        画像の背景を自動検出して透過処理を行います。手動での微調整も可能です。
      </p>
    </div>

    <!-- 画像アップロード -->
    <Card v-if="!originalImage">
      <CardContent class="p-6">
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
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
      </CardContent>
    </Card>

    <!-- エディター -->
    <div v-else class="space-y-6">
      <!-- ツールバー -->
      <Card>
        <CardHeader>
          <CardTitle>編集ツール</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex flex-wrap gap-4">
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-primary text-primary-foreground': isErasing }"
                @click="isErasing = true">
                <Icon name="heroicons:minus-circle" class="w-4 h-4 mr-2" />
                背景を消す
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-primary text-primary-foreground': !isErasing }"
                @click="isErasing = false">
                <Icon name="heroicons:plus-circle" class="w-4 h-4 mr-2" />
                背景を戻す
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="processing"
                @click="autoDetectBackground">
                <Icon v-if="processing" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="heroicons:sparkles" class="w-4 h-4 mr-2" />
                自動検出
              </Button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">
                  ブラシサイズ: {{ brushSize }}px
                </label>
                <Slider
                  :model-value="[brushSize]"
                  :min="5"
                  :max="100"
                  :step="5"
                  class="w-full"
                  @update:model-value="brushSize = $event[0]" />
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">
                  エッジのぼかし: {{ edgeFeather }}px
                </label>
                <Slider
                  :model-value="[edgeFeather]"
                  :min="0"
                  :max="10"
                  :step="1"
                  class="w-full"
                  @update:model-value="edgeFeather = $event[0]; applyMask()" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- キャンバスエリア -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>画像編集</CardTitle>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="showOriginal = !showOriginal">
                <Icon name="heroicons:eye" class="w-4 h-4 mr-2" />
                {{ showOriginal ? '編集後' : '元画像' }}を表示
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="reset">
                <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
                リセット
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="relative inline-block max-w-full overflow-auto">
            <!-- 背景チェッカーパターン -->
            <div
              class="absolute inset-0 opacity-10"
              style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23ccc%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23ccc%22/></svg>'); background-repeat: repeat;">
            </div>

            <!-- メインキャンバス -->
            <canvas
              ref="canvasRef"
              class="relative"
              :class="{ 'opacity-0': showOriginal }"></canvas>

            <!-- オーバーレイキャンバス（マウス操作用） -->
            <canvas
              ref="overlayCanvasRef"
              class="absolute inset-0"
              :style="{ cursor: cursorStyle }"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"></canvas>

            <!-- 元画像表示 -->
            <img
              v-if="showOriginal"
              :src="originalImage"
              class="absolute inset-0"
              alt="Original">
          </div>

          <Alert v-if="error" variant="destructive" class="mt-4">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter class="flex justify-end gap-2">
          <Button
            variant="outline"
            @click="saveProcessedImage">
            <Icon name="heroicons:check" class="w-4 h-4 mr-2" />
            処理を完了
          </Button>
        </CardFooter>
      </Card>

      <!-- 処理結果 -->
      <Card v-if="processedImage">
        <CardHeader>
          <CardTitle>処理結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative inline-block">
            <!-- 背景チェッカーパターン -->
            <div
              class="absolute inset-0 opacity-10"
              style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23ccc%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23ccc%22/></svg>'); background-repeat: repeat;">
            </div>
            <img
              :src="processedImage"
              class="relative max-w-full h-auto"
              alt="Processed">
          </div>
        </CardContent>
        <CardFooter>
          <Button @click="downloadImage">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
            ダウンロード (PNG)
          </Button>
        </CardFooter>
      </Card>
    </div>

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
              <li>画像をアップロードします</li>
              <li>「自動検出」ボタンで背景を自動的に検出します</li>
              <li>ブラシツールで手動調整を行います</li>
              <li>「処理を完了」ボタンで結果を生成します</li>
              <li>透過PNG形式でダウンロードします</li>
            </ol>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              手動調整のコツ
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>「背景を消す」モードで不要な部分を削除</li>
              <li>「背景を戻す」モードで必要な部分を復元</li>
              <li>ブラシサイズを調整して細かい部分を編集</li>
              <li>エッジのぼかしで自然な仕上がりに</li>
            </ul>
          </div>
          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              このツールは簡易的なエッジ検出アルゴリズムを使用しています。
              複雑な背景の場合は手動調整が必要になることがあります。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
