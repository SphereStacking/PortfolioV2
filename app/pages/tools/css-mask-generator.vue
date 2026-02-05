<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const originalImage = ref<string>('')
// const processing = ref(false)
const error = ref('')
const outputFormat = ref<'css-mask' | 'clip-path' | 'svg-mask'>('clip-path')
const maskShape = ref<'circle' | 'ellipse' | 'polygon' | 'custom'>('circle')
const polygonSides = ref([6])
const cornerRadius = ref([0])
const rotation = ref([0])

// Canvas参照
const canvasRef = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)
const previewCanvas = ref<HTMLCanvasElement>()
const previewCtx = ref<CanvasRenderingContext2D | null>(null)

// 画像情報
const imageInfo = ref({
  width: 0,
  height: 0,
  aspectRatio: '',
})

// 出力コード
const cssCode = ref('')
const currentPath = ref('')

// カスタムポイント for polygon
const customPoints = ref<Array<{ x: number, y: number }>>([])
const isDrawingCustom = ref(false)

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
    if (!canvasRef.value || !previewCanvas.value) return

    // キャンバスのサイズを画像に合わせる
    const maxSize = 600
    let width = img.width
    let height = img.height

    if (width > maxSize || height > maxSize) {
      const scale = Math.min(maxSize / width, maxSize / height)
      width *= scale
      height *= scale
    }

    canvasRef.value.width = width
    canvasRef.value.height = height
    previewCanvas.value.width = width
    previewCanvas.value.height = height

    // コンテキスト取得
    ctx.value = canvasRef.value.getContext('2d')
    previewCtx.value = previewCanvas.value.getContext('2d')

    if (!ctx.value || !previewCtx.value) return

    // 画像情報を保存
    imageInfo.value.width = width
    imageInfo.value.height = height
    imageInfo.value.aspectRatio = `${img.width} / ${img.height}`

    // 画像を描画
    ctx.value.drawImage(img, 0, 0, width, height)

    // デフォルトマスクを生成
    generateMask()
  }
  img.src = originalImage.value
}

// マスク生成
const generateMask = () => {
  if (!imageInfo.value.width || !imageInfo.value.height) return

  const width = imageInfo.value.width
  const height = imageInfo.value.height
  const centerX = width / 2
  const centerY = height / 2

  switch (maskShape.value) {
    case 'circle': {
      const radius = Math.min(width, height) / 2
      currentPath.value = `circle(${radius}px at ${centerX}px ${centerY}px)`
      break
    }
    case 'ellipse': {
      const radiusX = width / 2
      const radiusY = height / 2
      currentPath.value = `ellipse(${radiusX}px ${radiusY}px at ${centerX}px ${centerY}px)`
      break
    }
    case 'polygon': {
      const points = generatePolygonPoints(centerX, centerY, Math.min(width, height) / 2, polygonSides.value[0], rotation.value[0])
      const pathPoints = points.map(p => `${p.x}px ${p.y}px`).join(', ')
      currentPath.value = `polygon(${pathPoints})`
      break
    }
    case 'custom': {
      if (customPoints.value.length >= 3) {
        const pathPoints = customPoints.value.map(p => `${p.x}px ${p.y}px`).join(', ')
        currentPath.value = `polygon(${pathPoints})`
      }
      break
    }
  }

  generateCode()
  updatePreview()
}

// 多角形の頂点を生成
const generatePolygonPoints = (cx: number, cy: number, radius: number, sides: number, rotation: number) => {
  const points: Array<{ x: number, y: number }> = []
  const angleStep = (Math.PI * 2) / sides
  const rotationRad = (rotation * Math.PI) / 180

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2 + rotationRad
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push({ x, y })
  }

  return points
}

// コード生成
const generateCode = () => {
  if (!currentPath.value) return

  const imageName = 'your-image.jpg'

  if (outputFormat.value === 'clip-path') {
    cssCode.value = `/* CSS Clip-Path */
.clipped-image {
  width: ${imageInfo.value.width}px;
  height: ${imageInfo.value.height}px;
  clip-path: ${currentPath.value};
}

/* Responsive Version */
.clipped-responsive {
  width: 100%;
  max-width: ${imageInfo.value.width}px;
  aspect-ratio: ${imageInfo.value.aspectRatio};
  clip-path: ${currentPath.value};
}

/* With Animation */
.clipped-animated {
  clip-path: ${currentPath.value};
  transition: clip-path 0.3s ease;
}

.clipped-animated:hover {
  clip-path: circle(50% at 50% 50%);
}

/* Usage */
<img src="${imageName}" class="clipped-image" alt="Clipped image" />`
  }
  else if (outputFormat.value === 'css-mask') {
    cssCode.value = `/* CSS Mask */
.masked-image {
  width: ${imageInfo.value.width}px;
  height: ${imageInfo.value.height}px;
  -webkit-mask-image: radial-gradient(${currentPath.value}, transparent 100%);
  mask-image: radial-gradient(${currentPath.value}, transparent 100%);
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

/* Alternative with SVG mask */
.masked-svg {
  width: ${imageInfo.value.width}px;
  height: ${imageInfo.value.height}px;
  mask: url(#mask-shape);
}

/* Usage */
<img src="${imageName}" class="masked-image" alt="Masked image" />`
  }
  else if (outputFormat.value === 'svg-mask') {
    const svgPath = convertToSVGPath(currentPath.value)
    cssCode.value = `<!-- SVG Mask Definition -->
<svg width="0" height="0">
  <defs>
    <mask id="mask-shape">
      <rect width="100%" height="100%" fill="white" />
      <path d="${svgPath}" fill="black" />
    </mask>
    
    <clipPath id="clip-shape">
      <path d="${svgPath}" />
    </clipPath>
  </defs>
</svg>

<!-- Usage with mask -->
<svg viewBox="0 0 ${imageInfo.value.width} ${imageInfo.value.height}">
  <image href="${imageName}" 
         width="${imageInfo.value.width}" 
         height="${imageInfo.value.height}"
         mask="url(#mask-shape)" />
</svg>

<!-- Usage with clipPath -->
<svg viewBox="0 0 ${imageInfo.value.width} ${imageInfo.value.height}">
  <image href="${imageName}" 
         width="${imageInfo.value.width}" 
         height="${imageInfo.value.height}"
         clip-path="url(#clip-shape)" />
</svg>`
  }
}

// clip-pathをSVG pathに変換
const convertToSVGPath = (clipPath: string): string => {
  const width = imageInfo.value.width
  const height = imageInfo.value.height

  if (clipPath.includes('circle')) {
    const match = clipPath.match(/(\d+\.?\d*)px at (\d+\.?\d*)px (\d+\.?\d*)px/)
    if (match) {
      const r = parseFloat(match[1])
      const cx = parseFloat(match[2])
      const cy = parseFloat(match[3])
      return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`
    }
  }
  else if (clipPath.includes('ellipse')) {
    const match = clipPath.match(/(\d+\.?\d*)px (\d+\.?\d*)px at (\d+\.?\d*)px (\d+\.?\d*)px/)
    if (match) {
      const rx = parseFloat(match[1])
      const ry = parseFloat(match[2])
      const cx = parseFloat(match[3])
      const cy = parseFloat(match[4])
      return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy}`
    }
  }
  else if (clipPath.includes('polygon')) {
    const points = clipPath.match(/(\d+\.?\d*)px (\d+\.?\d*)px/g) || []
    const coords = points.map((point, i) => {
      const [x, y] = point.match(/\d+\.?\d*/g)!.map(parseFloat)
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`
    })
    return coords.join(' ') + ' Z'
  }

  return `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z`
}

// プレビュー更新
const updatePreview = () => {
  if (!ctx.value || !previewCtx.value || !canvasRef.value || !previewCanvas.value) return

  const width = canvasRef.value.width
  const height = canvasRef.value.height

  // 背景をクリア（チェッカーパターン）
  const checkerSize = 10
  for (let y = 0; y < height; y += checkerSize) {
    for (let x = 0; x < width; x += checkerSize) {
      previewCtx.value.fillStyle = ((x / checkerSize + y / checkerSize) % 2 === 0) ? '#f0f0f0' : '#ffffff'
      previewCtx.value.fillRect(x, y, checkerSize, checkerSize)
    }
  }

  // クリップパスを適用して画像を描画
  previewCtx.value.save()

  // パスを作成
  previewCtx.value.beginPath()
  if (currentPath.value.includes('circle')) {
    const match = currentPath.value.match(/(\d+\.?\d*)px at (\d+\.?\d*)px (\d+\.?\d*)px/)
    if (match) {
      const radius = parseFloat(match[1])
      const x = parseFloat(match[2])
      const y = parseFloat(match[3])
      previewCtx.value.arc(x, y, radius, 0, Math.PI * 2)
    }
  }
  else if (currentPath.value.includes('ellipse')) {
    const match = currentPath.value.match(/(\d+\.?\d*)px (\d+\.?\d*)px at (\d+\.?\d*)px (\d+\.?\d*)px/)
    if (match) {
      const radiusX = parseFloat(match[1])
      const radiusY = parseFloat(match[2])
      const x = parseFloat(match[3])
      const y = parseFloat(match[4])
      previewCtx.value.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2)
    }
  }
  else if (currentPath.value.includes('polygon')) {
    const points = currentPath.value.match(/(\d+\.?\d*)px (\d+\.?\d*)px/g) || []
    points.forEach((point, i) => {
      const [x, y] = point.match(/\d+\.?\d*/g)!.map(parseFloat)
      if (i === 0) {
        previewCtx.value.moveTo(x, y)
      }
      else {
        previewCtx.value.lineTo(x, y)
      }
    })
    previewCtx.value.closePath()
  }

  previewCtx.value.clip()
  previewCtx.value.drawImage(canvasRef.value, 0, 0)
  previewCtx.value.restore()

  // アウトラインを描画
  previewCtx.value.strokeStyle = '#3b82f6'
  previewCtx.value.lineWidth = 2
  previewCtx.value.setLineDash([5, 5])
  previewCtx.value.beginPath()

  if (currentPath.value.includes('circle')) {
    const match = currentPath.value.match(/(\d+\.?\d*)px at (\d+\.?\d*)px (\d+\.?\d*)px/)
    if (match) {
      const radius = parseFloat(match[1])
      const x = parseFloat(match[2])
      const y = parseFloat(match[3])
      previewCtx.value.arc(x, y, radius, 0, Math.PI * 2)
    }
  }
  else if (currentPath.value.includes('ellipse')) {
    const match = currentPath.value.match(/(\d+\.?\d*)px (\d+\.?\d*)px at (\d+\.?\d*)px (\d+\.?\d*)px/)
    if (match) {
      const radiusX = parseFloat(match[1])
      const radiusY = parseFloat(match[2])
      const x = parseFloat(match[3])
      const y = parseFloat(match[4])
      previewCtx.value.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2)
    }
  }
  else if (currentPath.value.includes('polygon')) {
    const points = currentPath.value.match(/(\d+\.?\d*)px (\d+\.?\d*)px/g) || []
    points.forEach((point, i) => {
      const [x, y] = point.match(/\d+\.?\d*/g)!.map(parseFloat)
      if (i === 0) {
        previewCtx.value.moveTo(x, y)
      }
      else {
        previewCtx.value.lineTo(x, y)
      }
    })
    previewCtx.value.closePath()
  }

  previewCtx.value.stroke()
}

// カスタムポイント追加
const addCustomPoint = (event: MouseEvent) => {
  if (!isDrawingCustom.value || !previewCanvas.value) return

  const rect = previewCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  customPoints.value.push({ x, y })

  if (customPoints.value.length >= 3) {
    generateMask()
  }
}

// カスタムポイントリセット
const resetCustomPoints = () => {
  customPoints.value = []
  if (maskShape.value === 'custom') {
    currentPath.value = ''
    cssCode.value = ''
    updatePreview()
  }
}

// パラメータ変更時の再生成
watch([maskShape, polygonSides, rotation, cornerRadius], () => {
  if (originalImage.value) {
    generateMask()
  }
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
  catch {
    toast({
      description: 'コピーに失敗しました',
      variant: 'destructive',
    })
  }
}

// リセット
const reset = () => {
  originalImage.value = ''
  error.value = ''
  cssCode.value = ''
  currentPath.value = ''
  customPoints.value = []
  imageInfo.value = {
    width: 0,
    height: 0,
    aspectRatio: '',
  }
}

// SEO設定
useSeoMeta({
  title: 'CSS Mask & Clip-Path Generator | Web開発ツール',
  description: 'Generate CSS clip-path and mask code for creating custom image shapes. Support for circles, ellipses, polygons, and custom shapes. Perfect for modern web design.',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        CSS Mask & Clip-Path Generator
      </h1>
      <p class="text-muted-foreground">
        Create custom image shapes with CSS clip-path and mask. Perfect for modern web design with non-rectangular images.
      </p>
    </div>

    <!-- 画像アップロード -->
    <Card>
      <CardHeader>
        <CardTitle>Image Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="!originalImage">
          <div
            class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
            :class="isDragging ? 'border-primary bg-primary/5' : 'border-border'"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave">
            <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p class="text-muted-foreground mb-2">
              Drag & drop or click to upload an image
            </p>
            <p class="text-xs text-muted-foreground mb-4">
              PNG, JPEG, WebP supported
            </p>
            <label>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageUpload">
              <Button variant="outline" as="span">
                Choose Image
              </Button>
            </label>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-muted-foreground">
              <p>Size: {{ imageInfo.width }} × {{ imageInfo.height }}px</p>
              <p>Aspect Ratio: {{ imageInfo.aspectRatio }}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="reset">
              <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <Alert v-if="error" variant="destructive">
            <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>

    <!-- 設定とプレビュー -->
    <div v-if="originalImage" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 設定 -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shape Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Shape Type</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="shape in [
                      { value: 'circle', label: 'Circle', icon: 'heroicons:ellipsis-horizontal-circle' },
                      { value: 'ellipse', label: 'Ellipse', icon: 'heroicons:ellipsis-horizontal' },
                      { value: 'polygon', label: 'Polygon', icon: 'heroicons:stop' },
                      { value: 'custom', label: 'Custom', icon: 'heroicons:pencil' },
                    ]"
                    :key="shape.value"
                    :variant="maskShape === shape.value ? 'default' : 'outline'"
                    size="sm"
                    @click="maskShape = shape.value">
                    <Icon :name="shape.icon" class="w-4 h-4 mr-2" />
                    {{ shape.label }}
                  </Button>
                </div>
              </div>

              <!-- Polygon設定 -->
              <div v-if="maskShape === 'polygon'" class="space-y-4">
                <div>
                  <label class="text-sm font-medium mb-2 block">
                    Sides: {{ polygonSides[0] }}
                  </label>
                  <Slider
                    :model-value="polygonSides"
                    :min="3"
                    :max="12"
                    :step="1"
                    class="w-full"
                    @update:model-value="polygonSides = $event" />
                </div>
                <div>
                  <label class="text-sm font-medium mb-2 block">
                    Rotation: {{ rotation[0] }}°
                  </label>
                  <Slider
                    :model-value="rotation"
                    :min="0"
                    :max="360"
                    :step="15"
                    class="w-full"
                    @update:model-value="rotation = $event" />
                </div>
              </div>

              <!-- Custom設定 -->
              <div v-if="maskShape === 'custom'" class="space-y-4">
                <Alert>
                  <Icon name="heroicons:information-circle" class="w-4 h-4" />
                  <AlertDescription>
                    Click on the preview to add points. Need at least 3 points to create a shape.
                  </AlertDescription>
                </Alert>
                <div class="flex items-center justify-between">
                  <p class="text-sm text-muted-foreground">
                    Points: {{ customPoints.length }}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="resetCustomPoints">
                    Reset Points
                  </Button>
                </div>
                <div class="flex items-center gap-2">
                  <Button
                    :variant="isDrawingCustom ? 'default' : 'outline'"
                    size="sm"
                    @click="isDrawingCustom = !isDrawingCustom">
                    <Icon name="heroicons:pencil" class="w-4 h-4 mr-2" />
                    {{ isDrawingCustom ? 'Drawing' : 'Start Drawing' }}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <Button
                v-for="format in [
                  { value: 'clip-path', label: 'CSS Clip-Path', description: 'Best browser support' },
                  { value: 'css-mask', label: 'CSS Mask', description: 'More flexible options' },
                  { value: 'svg-mask', label: 'SVG Mask', description: 'Complex shapes & effects' },
                ]"
                :key="format.value"
                :variant="outputFormat === format.value ? 'default' : 'outline'"
                class="w-full justify-start"
                @click="outputFormat = format.value">
                <div class="text-left">
                  <p class="font-medium">
                    {{ format.label }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ format.description }}
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- プレビュー -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium mb-2">
                    Original
                  </p>
                  <canvas
                    ref="canvasRef"
                    class="w-full h-auto border rounded"
                    style="max-width: 100%; height: auto;"></canvas>
                </div>
                <div>
                  <p class="text-sm font-medium mb-2">
                    Masked
                  </p>
                  <canvas
                    ref="previewCanvas"
                    class="w-full h-auto border rounded cursor-crosshair"
                    style="max-width: 100%; height: auto;"
                    @click="addCustomPoint"></canvas>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 生成されたコード -->
        <Card v-if="cssCode">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Generated Code</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(cssCode)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ cssCode }}</code></pre>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 使用例 -->
    <Card>
      <CardHeader>
        <CardTitle>Examples & Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Common Use Cases
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>Profile pictures with custom shapes</li>
              <li>Hero images with diagonal cuts</li>
              <li>Product images with rounded corners</li>
              <li>Gallery thumbnails with creative shapes</li>
              <li>Logo containers with brand-specific shapes</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Browser Support
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>clip-path:</strong> Supported in all modern browsers</li>
              <li><strong>mask-image:</strong> Requires -webkit- prefix for Safari</li>
              <li><strong>SVG masks:</strong> Excellent support, most flexible</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Performance Tips
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>Use clip-path for simple shapes (best performance)</li>
              <li>SVG masks for complex shapes and gradients</li>
              <li>Avoid animating complex masks on mobile</li>
              <li>Consider using will-change for animated masks</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
