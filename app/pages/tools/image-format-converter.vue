<script setup lang="ts">
import { useDropZone, useFileDialog } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Slider } from '~/components/ui/slider'

definePageMeta({
  layout: 'tools',
})

const { toast } = useToast()

// 画像データ
const originalImage = ref<string>('')
const convertedImage = ref<string>('')
const fileName = ref('')
const fileSize = ref(0)
const imageWidth = ref(0)
const imageHeight = ref(0)

// 変換設定
const outputFormat = ref<'png' | 'jpeg' | 'webp' | 'avif'>('webp')
const quality = ref([85])
const isConverting = ref(false)

// リサイズ設定
const enableResize = ref(false)
const targetWidth = ref('800')
const targetHeight = ref('600')
const maintainAspectRatio = ref(true)
const resizeMode = ref<'fit' | 'fill' | 'cover'>('fit')

// フィルター設定
const enableFilters = ref(false)
const filters = ref({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
})

// Slider用の配列形式フィルター値
const brightnessArray = computed({
  get: () => [filters.value.brightness],
  set: (val) => { filters.value.brightness = val[0] },
})
const contrastArray = computed({
  get: () => [filters.value.contrast],
  set: (val) => { filters.value.contrast = val[0] },
})
const saturationArray = computed({
  get: () => [filters.value.saturation],
  set: (val) => { filters.value.saturation = val[0] },
})
const hueArray = computed({
  get: () => [filters.value.hue],
  set: (val) => { filters.value.hue = val[0] },
})
const blurArray = computed({
  get: () => [filters.value.blur],
  set: (val) => { filters.value.blur = val[0] },
})
const grayscaleArray = computed({
  get: () => [filters.value.grayscale],
  set: (val) => { filters.value.grayscale = val[0] },
})
const sepiaArray = computed({
  get: () => [filters.value.sepia],
  set: (val) => { filters.value.sepia = val[0] },
})
const invertArray = computed({
  get: () => [filters.value.invert],
  set: (val) => { filters.value.invert = val[0] },
})

// ファイル選択
const dropZoneRef = ref<HTMLDivElement>()
const { open: openFileDialog, reset, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
})

onChange((files) => {
  if (files && files.length > 0) {
    handleFile(files[0])
  }
})

// ドロップゾーン
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  },
  dataTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
})

// ファイル処理
const handleFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast({
      title: 'エラー',
      description: '画像ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  fileName.value = file.name
  fileSize.value = file.size

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    convertedImage.value = ''

    // 画像サイズを取得
    const img = new Image()
    img.onload = () => {
      imageWidth.value = img.width
      imageHeight.value = img.height
    }
    img.src = originalImage.value
  }
  reader.readAsDataURL(file)
}

// アスペクト比を維持した場合のサイズ計算
const calculateAspectRatioSize = () => {
  if (!maintainAspectRatio.value || !imageWidth.value || !imageHeight.value) return

  const aspectRatio = imageWidth.value / imageHeight.value
  const newWidth = parseInt(targetWidth.value)
  if (!isNaN(newWidth)) {
    targetHeight.value = Math.round(newWidth / aspectRatio).toString()
  }
}

// サイズ変更時の処理
watch(targetWidth, () => {
  calculateAspectRatioSize()
})

// リセット処理
const resetFilters = () => {
  filters.value = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
  }
}

// 画像変換
const convertImage = async () => {
  if (!originalImage.value) return

  isConverting.value = true
  try {
    const img = new Image()
    img.onload = () => {
      // キャンバスサイズの決定
      let canvasWidth = img.width
      let canvasHeight = img.height

      if (enableResize.value) {
        canvasWidth = parseInt(targetWidth.value) || img.width
        canvasHeight = parseInt(targetHeight.value) || img.height
      }

      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // フィルター適用
      if (enableFilters.value) {
        const filterString = [
          `brightness(${filters.value.brightness}%)`,
          `contrast(${filters.value.contrast}%)`,
          `saturate(${filters.value.saturation}%)`,
          `hue-rotate(${filters.value.hue}deg)`,
          `blur(${filters.value.blur}px)`,
          `grayscale(${filters.value.grayscale}%)`,
          `sepia(${filters.value.sepia}%)`,
          `invert(${filters.value.invert}%)`,
        ].join(' ')
        ctx.filter = filterString
      }

      // リサイズモードに応じて描画
      if (enableResize.value) {
        if (resizeMode.value === 'fill') {
          // フィル: アスペクト比を無視して引き伸ばし
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
        }
        else if (resizeMode.value === 'cover') {
          // カバー: アスペクト比を保持して全体を覆う
          const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const x = (canvasWidth - scaledWidth) / 2
          const y = (canvasHeight - scaledHeight) / 2
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        }
        else {
          // フィット: アスペクト比を保持して内接
          const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const x = (canvasWidth - scaledWidth) / 2
          const y = (canvasHeight - scaledHeight) / 2
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        }
      }
      else {
        ctx.drawImage(img, 0, 0)
      }

      // 変換
      const mimeType = `image/${outputFormat.value}`
      const qualityValue = outputFormat.value === 'png' ? 1 : quality.value[0] / 100

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader()
          reader.onload = (e) => {
            convertedImage.value = e.target?.result as string
            isConverting.value = false
          }
          reader.readAsDataURL(blob)
        }
      }, mimeType, qualityValue)
    }
    img.src = originalImage.value
  }
  catch {
    toast({
      title: 'エラー',
      description: '画像の変換に失敗しました',
      variant: 'destructive',
    })
    isConverting.value = false
  }
}

// ダウンロード
const downloadImage = () => {
  if (!convertedImage.value) return

  const link = document.createElement('a')
  link.href = convertedImage.value
  const ext = outputFormat.value === 'jpeg' ? 'jpg' : outputFormat.value
  link.download = fileName.value.replace(/\.[^/.]+$/, '') + `.${ext}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast({
    title: 'ダウンロード完了',
    description: `画像を${outputFormat.value.toUpperCase()}形式でダウンロードしました`,
  })
}

// クリア
const clearAll = () => {
  originalImage.value = ''
  convertedImage.value = ''
  fileName.value = ''
  fileSize.value = 0
  imageWidth.value = 0
  imageHeight.value = 0
  reset()
}

// フォーマットの説明
const formatDescriptions = {
  png: 'ロスレス圧縮、透明度対応。イラストやロゴに最適',
  jpeg: '非可逆圧縮、ファイルサイズ小。写真に最適',
  webp: '次世代フォーマット、高圧縮率。Web表示に最適',
  avif: '最新フォーマット、最高圧縮率。対応ブラウザ要確認',
}

// サンプル画像
const sampleImages = [
  {
    name: '風景写真',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  },
  {
    name: 'ポートレート',
    url: 'https://avatars.githubusercontent.com/u/108622390?v=4',
  },
  {
    name: 'イラスト',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop',
  },
]

const loadSampleImage = async (url: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' })
    handleFile(file)
  }
  catch {
    toast({
      title: 'エラー',
      description: 'サンプル画像の読み込みに失敗しました',
      variant: 'destructive',
    })
  }
}

// SEO設定
useSeoMeta({
  title: '画像編集ツール | Web開発ツール',
  description: '画像のフォーマット変換、リサイズ、フィルター適用を一括処理。PNG、JPEG、WebP、AVIF対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        画像編集ツール
      </h1>
      <p class="text-muted-foreground">
        画像のフォーマット変換、リサイズ、フィルター適用を一括で処理。Web最適化に最適。
      </p>
    </div>

    <!-- サンプル画像 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>サンプル画像</CardTitle>
        <CardDescription>
          動作確認用のサンプル画像を読み込めます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleImages"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSampleImage(sample.url)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 入力エリア -->
    <Card>
      <CardHeader>
        <CardTitle>元画像</CardTitle>
        <CardDescription>
          変換したい画像をアップロード
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref="dropZoneRef"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isOverDropZone ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          ]"
          @click="openFileDialog">
          <div v-if="!originalImage">
            <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p class="text-sm text-muted-foreground mb-2">
              クリックまたはドロップで画像を選択
            </p>
            <p class="text-xs text-muted-foreground">
              PNG, JPEG, WebP, AVIF対応
            </p>
          </div>
          <div v-else class="space-y-4">
            <img
              :src="originalImage"
              alt="Original"
              class="max-w-full max-h-[300px] mx-auto rounded">
            <div class="text-sm text-muted-foreground">
              <p>{{ fileName }}</p>
              <p>{{ imageWidth }} × {{ imageHeight }}px</p>
              <p>{{ (fileSize / 1024).toFixed(1) }}KB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 出力エリア -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>変換後</CardTitle>
            <CardDescription>
              {{ outputFormat.toUpperCase() }}形式に変換
            </CardDescription>
          </div>
          <Button
            v-if="convertedImage"
            size="sm"
            @click="downloadImage">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
            ダウンロード
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isConverting" class="text-center py-12">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p class="text-sm text-muted-foreground">
            変換中...
          </p>
        </div>
        <div v-else-if="convertedImage" class="space-y-4">
          <img
            :src="convertedImage"
            alt="Converted"
            class="max-w-full max-h-[400px] mx-auto rounded">
          <div class="text-sm text-muted-foreground text-center">
            <p>変換完了</p>
          </div>
        </div>
        <div v-else class="text-center py-12 text-muted-foreground">
          <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>画像を選択して変換ボタンを押してください</p>
        </div>
      </CardContent>
    </Card>
    <!-- 変換設定 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>変換設定</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- フォーマット選択 -->
        <div>
          <label class="text-sm font-medium mb-3 block">出力フォーマット</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="format in ['png', 'jpeg', 'webp', 'avif']"
              :key="format"
              :class="[
                'p-3 rounded-md border text-sm transition-colors',
                outputFormat === format
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted',
              ]"
              @click="outputFormat = format as typeof outputFormat">
              <div class="font-medium">
                {{ format.toUpperCase() }}
              </div>
              <div class="text-xs opacity-80 mt-1">
                {{ formatDescriptions[format as keyof typeof formatDescriptions] }}
              </div>
            </button>
          </div>
        </div>

        <!-- 品質設定 -->
        <div v-if="outputFormat !== 'png'">
          <label class="text-sm font-medium mb-2 block">
            品質: {{ quality[0] }}%
          </label>
          <Slider
            v-model="quality"
            :max="100"
            :min="1"
            :step="1" />
          <p class="text-xs text-muted-foreground mt-2">
            値が高いほど高品質・大容量
          </p>
        </div>

        <!-- リサイズ設定 -->
        <div class="space-y-4 p-4 border rounded-lg">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">
              リサイズ
            </h4>
            <label class="flex items-center gap-2">
              <input
                v-model="enableResize"
                type="checkbox"
                class="rounded">
              <span class="text-sm">有効</span>
            </label>
          </div>

          <div v-if="enableResize" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-muted-foreground mb-1 block">幅</label>
                <Input
                  v-model="targetWidth"
                  type="number"
                  placeholder="800" />
              </div>
              <div>
                <label class="text-sm text-muted-foreground mb-1 block">高さ</label>
                <Input
                  v-model="targetHeight"
                  type="number"
                  placeholder="600"
                  :disabled="maintainAspectRatio" />
              </div>
            </div>

            <label class="flex items-center gap-2">
              <input
                v-model="maintainAspectRatio"
                type="checkbox"
                class="rounded">
              <span class="text-sm">アスペクト比を維持</span>
            </label>

            <div>
              <label class="text-sm text-muted-foreground mb-2 block">リサイズモード</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="mode in ['fit', 'fill', 'cover'] as const"
                  :key="mode"
                  :class="[
                    'p-2 rounded-md border text-sm transition-colors',
                    resizeMode === mode
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-muted',
                  ]"
                  @click="resizeMode = mode">
                  <div class="font-medium">
                    {{ mode.toUpperCase() }}
                  </div>
                  <div class="text-xs opacity-80">
                    {{ mode === 'fit' ? '内接' : mode === 'fill' ? '引き伸ばし' : 'カバー' }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- フィルター設定 -->
        <div class="space-y-4 p-4 border rounded-lg">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">
              フィルター
            </h4>
            <div class="flex items-center gap-2">
              <Button
                v-if="enableFilters"
                size="sm"
                variant="ghost"
                @click="resetFilters">
                リセット
              </Button>
              <label class="flex items-center gap-2">
                <input
                  v-model="enableFilters"
                  type="checkbox"
                  class="rounded">
                <span class="text-sm">有効</span>
              </label>
            </div>
          </div>

          <div v-if="enableFilters" class="space-y-3">
            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                明るさ: {{ filters.brightness }}%
              </label>
              <Slider
                v-model="brightnessArray"
                :max="200"
                :min="0"
                :step="1" />
            </div>

            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                コントラスト: {{ filters.contrast }}%
              </label>
              <Slider
                v-model="contrastArray"
                :max="200"
                :min="0"
                :step="1" />
            </div>

            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                彩度: {{ filters.saturation }}%
              </label>
              <Slider
                v-model="saturationArray"
                :max="200"
                :min="0"
                :step="1" />
            </div>

            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                色相: {{ filters.hue }}°
              </label>
              <Slider
                v-model="hueArray"
                :max="360"
                :min="-180"
                :step="1" />
            </div>

            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                ブラー: {{ filters.blur }}px
              </label>
              <Slider
                v-model="blurArray"
                :max="20"
                :min="0"
                :step="0.1" />
            </div>

            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                グレースケール: {{ filters.grayscale }}%
              </label>
              <Slider
                v-model="grayscaleArray"
                :max="100"
                :min="0"
                :step="1" />
            </div>

            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                セピア: {{ filters.sepia }}%
              </label>
              <Slider
                v-model="sepiaArray"
                :max="100"
                :min="0"
                :step="1" />
            </div>

            <div>
              <label class="text-sm text-muted-foreground mb-1 block">
                ネガポジ: {{ filters.invert }}%
              </label>
              <Slider
                v-model="invertArray"
                :max="100"
                :min="0"
                :step="1" />
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <Button
            :disabled="!originalImage || isConverting"
            @click="convertImage">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-1" />
            変換
          </Button>
          <Button
            variant="outline"
            :disabled="!originalImage"
            @click="clearAll">
            クリア
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 使い方 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>フォーマットの特徴</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 class="font-semibold mb-2">
              PNG (Portable Network Graphics)
            </h4>
            <ul class="space-y-1 text-muted-foreground">
              <li>• ロスレス圧縮で画質劣化なし</li>
              <li>• 透明度（アルファチャンネル）対応</li>
              <li>• イラスト、ロゴ、スクリーンショットに最適</li>
              <li>• ファイルサイズが大きくなりがち</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">
              JPEG (Joint Photographic Experts Group)
            </h4>
            <ul class="space-y-1 text-muted-foreground">
              <li>• 非可逆圧縮で小さいファイルサイズ</li>
              <li>• 写真や複雑な画像に最適</li>
              <li>• 透明度非対応</li>
              <li>• 繰り返し保存で画質劣化</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">
              WebP
            </h4>
            <ul class="space-y-1 text-muted-foreground">
              <li>• Googleが開発した次世代フォーマット</li>
              <li>• JPEGより25-35%小さいファイルサイズ</li>
              <li>• ロスレス・非可逆圧縮の両対応</li>
              <li>• 透明度・アニメーション対応</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">
              AVIF (AV1 Image File Format)
            </h4>
            <ul class="space-y-1 text-muted-foreground">
              <li>• 最新の画像フォーマット</li>
              <li>• WebPよりさらに高圧縮率</li>
              <li>• HDR・広色域対応</li>
              <li>• ブラウザサポートは発展途上</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
