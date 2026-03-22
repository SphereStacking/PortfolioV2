<script setup lang="ts">
definePageMeta({
  layout: 'tools',
})

// 状態管理
const originalImage = ref<string>('')
const asciiArt = ref<string>('')
const processing = ref(false)
const error = ref('')

// 設定
const charDensity = ref(100) // 文字密度（幅の文字数）
const charSet = ref<'standard' | 'simple' | 'blocks' | 'japanese'>('standard')
const colorMode = ref<'mono' | 'color'>('mono')
const invertBrightness = ref(false)
const fontSize = ref(10)
const lineHeight = ref(1.0)
const backgroundColor = ref('#000000')
const textColor = ref('#00FF00')

// Canvas参照
const canvasRef = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)

// 文字セット定義
const charSets = {
  standard: ' .:-=+*#%@',
  simple: ' .oO0@',
  blocks: ' ░▒▓█',
  japanese: ' 、。一十百千万億兆京',
}

// カラーモード用のHTMLエスケープ
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

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
    processImage()
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
    processImage()
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

// 画像をアスキーアートに変換
const processImage = async () => {
  if (!originalImage.value) return

  processing.value = true
  error.value = ''

  try {
    const img = new Image()
    img.src = originalImage.value

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    if (!canvasRef.value) return

    // アスペクト比を維持しながらサイズを計算
    const aspectRatio = img.height / img.width
    const charWidth = charDensity.value
    const charHeight = Math.floor(charWidth * aspectRatio * 0.5) // 文字の縦横比を考慮

    // キャンバスサイズ設定
    canvasRef.value.width = charWidth
    canvasRef.value.height = charHeight
    ctx.value = canvasRef.value.getContext('2d')

    if (!ctx.value) return

    // 画像を縮小して描画
    ctx.value.drawImage(img, 0, 0, charWidth, charHeight)

    // ピクセルデータを取得
    const imageData = ctx.value.getImageData(0, 0, charWidth, charHeight)

    // アスキーアートに変換
    if (colorMode.value === 'mono') {
      asciiArt.value = convertToMonoAscii(imageData)
    }
    else {
      asciiArt.value = convertToColorAscii(imageData)
    }

    toast.add({
      title: '変換完了',
      description: 'アスキーアートを生成しました',
    })
  }
  catch (err) {
    error.value = '画像の処理に失敗しました'
    console.error('ASCII art conversion error:', err)
    toast.add({
      title: 'エラー',
      description: error.value,
      color: 'error',
    })
  }
  finally {
    processing.value = false
  }
}

// モノクロアスキーアート変換
const convertToMonoAscii = (imageData: ImageData): string => {
  const { width, height, data } = imageData
  const chars = charSets[charSet.value]
  const lines: string[] = []

  for (let y = 0; y < height; y++) {
    let line = ''
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // RGB値から輝度を計算
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255

      // 輝度を文字にマップ
      const adjustedBrightness = invertBrightness.value ? 1 - brightness : brightness
      const charIndex = Math.floor(adjustedBrightness * (chars.length - 1))
      line += chars[charIndex]
    }
    lines.push(line)
  }

  return lines.join('\n')
}

// カラーアスキーアート変換（HTML形式）
const convertToColorAscii = (imageData: ImageData): string => {
  const { width, height, data } = imageData
  const chars = charSets[charSet.value]
  const lines: string[] = []

  lines.push('<pre style="font-family: monospace; line-height: 1; letter-spacing: 0;">')

  for (let y = 0; y < height; y++) {
    let line = ''
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255

      const adjustedBrightness = invertBrightness.value ? 1 - brightness : brightness
      const charIndex = Math.floor(adjustedBrightness * (chars.length - 1))
      const char = chars[charIndex]

      // 色付きのspan要素を生成
      const color = `rgb(${r},${g},${b})`
      line += `<span style="color:${color}">${escapeHtml(char)}</span>`
    }
    line += '<br>'
    lines.push(line)
  }

  lines.push('</pre>')
  return lines.join('')
}

// パラメータ変更時の再生成
watch([charDensity, charSet, colorMode, invertBrightness], () => {
  if (originalImage.value) {
    processImage()
  }
})

// アスキーアートのスタイル
const asciiStyle = computed(() => ({
  fontFamily: 'monospace',
  fontSize: `${fontSize.value}px`,
  lineHeight: lineHeight.value,
  backgroundColor: backgroundColor.value,
  color: colorMode.value === 'mono' ? textColor.value : 'inherit',
  padding: '1rem',
  overflow: 'auto',
  whiteSpace: 'pre',
  letterSpacing: '0',
}))

// サンプル画像
const sampleImages = [
  { name: 'Portrait', url: 'https://picsum.photos/400/400?random=1' },
  { name: 'Landscape', url: 'https://picsum.photos/600/400?random=2' },
  { name: 'Abstract', url: 'https://picsum.photos/500/500?random=3' },
]

const loadSampleImage = async (url: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const reader = new FileReader()

    reader.onload = (e) => {
      originalImage.value = e.target?.result as string
      error.value = ''
      processImage()
    }

    reader.readAsDataURL(blob)
  }
  catch {
    error.value = 'サンプル画像の読み込みに失敗しました'
  }
}

// クリップボード操作
const { copyToClipboard } = useCopyToClipboard()

const copyAsciiArt = () => {
  if (!asciiArt.value) return
  const textToCopy = colorMode.value === 'mono'
    ? asciiArt.value
    : asciiArt.value.replace(/<[^>]*>/g, '')
  copyToClipboard(textToCopy)
}

// テキストファイルとしてダウンロード
const downloadAsText = () => {
  if (!asciiArt.value) return

  const content = colorMode.value === 'mono'
    ? asciiArt.value
    : asciiArt.value.replace(/<[^>]*>/g, '') // HTMLタグを除去

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'ascii-art.txt'
  link.click()

  URL.revokeObjectURL(url)
}

// HTMLファイルとしてダウンロード
const downloadAsHtml = () => {
  if (!asciiArt.value) return

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ASCII Art</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background-color: ${backgroundColor.value};
      color: ${textColor.value};
      font-family: monospace;
      font-size: ${fontSize.value}px;
      line-height: ${lineHeight.value};
    }
    pre {
      margin: 0;
      white-space: pre;
      letter-spacing: 0;
    }
  </style>
</head>
<body>
  ${colorMode.value === 'mono' ? `<pre>${escapeHtml(asciiArt.value)}</pre>` : asciiArt.value}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'ascii-art.html'
  link.click()

  URL.revokeObjectURL(url)
}

// リセット
const reset = () => {
  originalImage.value = ''
  asciiArt.value = ''
  error.value = ''
}

// SEO設定
useSeoMeta({
  title: 'アスキーアート変換 | Web開発ツール',
  description: '画像をテキストアート（アスキーアート）に変換。モノクロ・カラー対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        アスキーアート変換
      </h1>
      <p class="text-muted-foreground">
        画像をテキストアート（アスキーアート）に変換します。
      </p>
    </div>

    <!-- 画像アップロード -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          画像選択
        </h3>
      </template>
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
            <UButton variant="outline" as="span">
              画像を選択
            </UButton>
          </label>
        </div>

        <div class="flex gap-2">
          <UButton
            v-for="sample in sampleImages"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSampleImage(sample.url)">
            {{ sample.name }}
          </UButton>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">
            画像がアップロードされました
          </p>
          <UButton
            variant="outline"
            size="sm"
            @click="reset">
            <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
            クリア
          </UButton>
        </div>
        <img
          :src="originalImage"
          class="max-w-xs h-auto rounded border"
          alt="Original">
      </div>
    </UCard>

    <!-- 設定 -->
    <UCard v-if="originalImage">
      <template #header>
        <h3 class="font-semibold">
          変換設定
        </h3>
      </template>
      <div class="space-y-6">
        <div>
          <label class="text-sm font-medium mb-2 block">
            文字密度（幅）: {{ charDensity }}文字
          </label>
          <Slider
            :model-value="[charDensity]"
            :min="20"
            :max="200"
            :step="10"
            class="w-full"
            @update:model-value="charDensity = $event[0]" />
          <p class="text-xs text-muted-foreground mt-1">
            値が大きいほど詳細になります
          </p>
        </div>

        <div>
          <label class="text-sm font-medium mb-2 block">文字セット</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <UButton
              v-for="(chars, key) in charSets"
              :key="key"
              :variant="charSet === key ? 'default' : 'outline'"
              size="sm"
              @click="charSet = key">
              {{ key === 'standard' ? '標準' : key === 'simple' ? 'シンプル' : key === 'blocks' ? 'ブロック' : '日本語' }}
            </UButton>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            使用文字: {{ charSets[charSet] }}
          </p>
        </div>

        <div>
          <label class="text-sm font-medium mb-2 block">カラーモード</label>
          <div class="flex gap-2">
            <UButton
              :variant="colorMode === 'mono' ? 'default' : 'outline'"
              size="sm"
              @click="colorMode = 'mono'">
              <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
              モノクロ
            </UButton>
            <UButton
              :variant="colorMode === 'color' ? 'default' : 'outline'"
              size="sm"
              @click="colorMode = 'color'">
              <Icon name="heroicons:paint-brush" class="w-4 h-4 mr-2" />
              カラー
            </UButton>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="invertBrightness"
              type="checkbox"
              class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
            明暗を反転
          </label>
          <p class="text-xs text-muted-foreground mt-1">
            暗い背景用に最適化します
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">
              フォントサイズ: {{ fontSize }}px
            </label>
            <Slider
              :model-value="[fontSize]"
              :min="6"
              :max="20"
              :step="1"
              class="w-full"
              @update:model-value="fontSize = $event[0]" />
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              行間: {{ lineHeight }}
            </label>
            <Slider
              :model-value="[lineHeight]"
              :min="0.8"
              :max="1.5"
              :step="0.1"
              class="w-full"
              @update:model-value="lineHeight = $event[0]" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">背景色</label>
            <div class="flex gap-2">
              <input
                v-model="backgroundColor"
                type="color"
                class="w-10 h-10 rounded cursor-pointer">
              <UInput
                v-model="backgroundColor"
                type="text"
                class="font-mono" />
            </div>
          </div>

          <div v-if="colorMode === 'mono'">
            <label class="text-sm font-medium mb-2 block">文字色</label>
            <div class="flex gap-2">
              <input
                v-model="textColor"
                type="color"
                class="w-10 h-10 rounded cursor-pointer">
              <UInput
                v-model="textColor"
                type="text"
                class="font-mono" />
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 結果表示 -->
    <UCard v-if="asciiArt">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">
            変換結果
          </h3>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="outline"
              @click="copyAsciiArt">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
              コピー
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              @click="downloadAsText">
              <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
              TXT保存
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              @click="downloadAsHtml">
              <Icon name="heroicons:code-bracket" class="w-4 h-4 mr-2" />
              HTML保存
            </UButton>
          </div>
        </div>
      </template>
      <div class="overflow-auto rounded border">
        <div
          v-if="colorMode === 'mono'"
          :style="asciiStyle">
          {{ asciiArt }}
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          v-else
          :style="{ ...asciiStyle, color: 'inherit' }"
          v-html="asciiArt"></div>
      </div>

      <UAlert
        v-if="error" class="mt-4" color="error"
        icon="heroicons:exclamation-circle" :description="error" />
    </UCard>

    <!-- 非表示のCanvas -->
    <canvas ref="canvasRef" class="hidden"></canvas>

    <!-- 説明 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          アスキーアートについて
        </h3>
      </template>
      <div class="space-y-4 text-muted-foreground">
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            特徴
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>画像を文字だけで表現するアート形式</li>
            <li>メールやテキストファイルで画像を共有可能</li>
            <li>レトロな雰囲気の演出</li>
            <li>ファイルサイズが小さい</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            使い方のコツ
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>シンプルな画像ほど良い結果が得られます</li>
            <li>コントラストの高い画像が適しています</li>
            <li>人物の顔は60文字以上の密度推奨</li>
            <li>等幅フォントでの表示が必須</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            用途
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>SNSでの投稿</li>
            <li>プログラムのコメント装飾</li>
            <li>ターミナルでの画像表示</li>
            <li>テキストベースのゲーム素材</li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>
