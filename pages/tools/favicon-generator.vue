<script setup lang="ts">
import { useDropZone, useFileDialog, useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

// 画像データ
const originalImage = ref<string>('')
const fileName = ref('')
const favicons = ref<{ size: number, url: string }[]>([])
const isGenerating = ref(false)

// ファビコンサイズ
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png', description: 'ブラウザタブ用' },
  { size: 32, name: 'favicon-32x32.png', description: 'ブラウザタブ用（高解像度）' },
  { size: 48, name: 'favicon-48x48.png', description: 'Windows用' },
  { size: 64, name: 'favicon-64x64.png', description: 'Windows用（高解像度）' },
  { size: 128, name: 'favicon-128x128.png', description: 'Chrome Web Store' },
  { size: 180, name: 'apple-touch-icon.png', description: 'iOS Safari' },
  { size: 192, name: 'android-chrome-192x192.png', description: 'Android Chrome' },
  { size: 512, name: 'android-chrome-512x512.png', description: 'Android Chrome（高解像度）' },
]

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

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    favicons.value = []
  }
  reader.readAsDataURL(file)
}

// ファビコン生成
const generateFavicons = async () => {
  if (!originalImage.value) return

  isGenerating.value = true
  favicons.value = []

  try {
    const img = new Image()
    img.onload = () => {
      // 各サイズのファビコンを生成
      faviconSizes.forEach(({ size }) => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 画像を正方形にクロップして描画
        const sourceSize = Math.min(img.width, img.height)
        const sourceX = (img.width - sourceSize) / 2
        const sourceY = (img.height - sourceSize) / 2

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size,
        )

        favicons.value.push({
          size,
          url: canvas.toDataURL('image/png'),
        })
      })

      isGenerating.value = false
    }
    img.src = originalImage.value
  }
  catch (error) {
    console.error(error)
    toast({
      title: 'エラー',
      description: 'ファビコンの生成に失敗しました',
      variant: 'destructive',
    })
    isGenerating.value = false
  }
}

// 個別ダウンロード
const downloadFavicon = (size: number) => {
  const favicon = favicons.value.find(f => f.size === size)
  if (!favicon) return

  const sizeInfo = faviconSizes.find(s => s.size === size)
  const link = document.createElement('a')
  link.href = favicon.url
  link.download = sizeInfo?.name || `favicon-${size}x${size}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 一括ダウンロード（ZIP）
const downloadAll = async () => {
  // 簡易的な実装のため、個別にダウンロード
  for (const { size } of faviconSizes) {
    const favicon = favicons.value.find(f => f.size === size)
    if (favicon) {
      await new Promise(resolve => setTimeout(resolve, 200))
      downloadFavicon(size)
    }
  }

  toast({
    title: 'ダウンロード完了',
    description: 'すべてのファビコンをダウンロードしました',
  })
}

// HTMLコード生成
const htmlCode = computed(() => {
  if (favicons.value.length === 0) return ''

  return `<!-- ファビコン -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- マニフェスト -->
<link rel="manifest" href="/site.webmanifest">`
})

// マニフェストコード
const manifestCode = computed(() => {
  if (favicons.value.length === 0) return ''

  return JSON.stringify({
    name: 'サイト名',
    short_name: 'サイト名',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  }, null, 2)
})

// コードコピー
const copyCode = async (code: string) => {
  await copy(code)
  toast({
    title: 'コピーしました',
    description: 'コードをクリップボードにコピーしました',
  })
}

// クリア
const clearAll = () => {
  originalImage.value = ''
  fileName.value = ''
  favicons.value = []
  reset()
}

// SEO設定
useSeoMeta({
  title: 'ファビコンジェネレーター | Web開発ツール',
  description: '各種サイズのファビコンを一括生成。apple-touch-icon、Android Chrome対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        ファビコンジェネレーター
      </h1>
      <p class="text-muted-foreground">
        各種サイズのファビコンを一括生成。ブラウザタブ、モバイルデバイス、ブックマークに対応。
      </p>
    </div>
    <!-- 入力エリア -->
    <Card class="row-start-2 row-end-5">
      <CardHeader>
        <CardTitle>元画像</CardTitle>
        <CardDescription>
          正方形の画像を推奨（最小512×512px）
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
              PNG, JPEG, SVG対応
            </p>
          </div>
          <div v-else class="space-y-4">
            <img
              :src="originalImage"
              alt="Original"
              class="max-w-full max-h-[200px] mx-auto rounded">
            <p class="text-sm text-muted-foreground">
              {{ fileName }}
            </p>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <Button
            :disabled="!originalImage || isGenerating"
            class="flex-1"
            @click="generateFavicons">
            <Icon name="heroicons:sparkles" class="w-4 h-4 mr-1" />
            ファビコン生成
          </Button>
          <Button
            variant="outline"
            :disabled="!originalImage"
            @click="clearAll">
            クリア
          </Button>
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>推奨事項</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <div>
          <h4 class="font-semibold mb-1 text-foreground">
            元画像について
          </h4>
          <ul class="space-y-1">
            <li>• 512×512px以上の正方形画像を推奨</li>
            <li>• シンプルで認識しやすいデザイン</li>
            <li>• 透過PNGまたは背景付き画像</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-1 text-foreground">
            ファイル配置
          </h4>
          <ul class="space-y-1">
            <li>• favicon.ico → ルートディレクトリ</li>
            <li>• その他のPNG → /icons/フォルダなど</li>
            <li>• site.webmanifest → ルートディレクトリ</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <!-- 生成されたファビコン -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>生成されたファビコン</CardTitle>
            <CardDescription>
              クリックで個別ダウンロード
            </CardDescription>
          </div>
          <Button
            v-if="favicons.length > 0"
            size="sm"
            @click="downloadAll">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
            すべてダウンロード
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isGenerating" class="text-center py-12">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p class="text-sm text-muted-foreground">
            生成中...
          </p>
        </div>
        <div v-else-if="favicons.length > 0" class="grid grid-cols-4 gap-4">
          <button
            v-for="{ size } in faviconSizes"
            :key="size"
            class="group relative"
            @click="downloadFavicon(size)">
            <div class="aspect-square rounded-lg p-2 border hover:border-primary transition-colors bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
              <img
                :src="favicons.find(f => f.size === size)?.url"
                :alt="`${size}x${size}`"
                class="w-full h-full object-contain">
            </div>
            <p class="text-xs mt-1">
              {{ size }}×{{ size }}
            </p>
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Icon name="heroicons:arrow-down-tray" class="w-6 h-6 text-white" />
            </div>
          </button>
        </div>
        <div v-else class="text-center py-12 text-muted-foreground">
          <Icon name="heroicons:star" class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>画像を選択して生成ボタンを押してください</p>
        </div>
      </CardContent>
    </Card>

    <!-- HTMLコード -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>HTMLコード</CardTitle>
            <CardDescription>
              &lt;head&gt;タグ内に貼り付け
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            @click="copyCode(htmlCode)">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre class="p-4 bg-muted rounded-md text-sm overflow-x-auto"><code>{{ htmlCode }}</code></pre>
      </CardContent>
    </Card>

    <!-- マニフェストコード -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>site.webmanifest</CardTitle>
            <CardDescription>
              PWA対応用マニフェストファイル
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            @click="copyCode(manifestCode)">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre class="p-4 bg-muted rounded-md text-sm overflow-x-auto"><code>{{ manifestCode }}</code></pre>
      </CardContent>
    </Card>
    <!-- サイズ一覧 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>ファビコンサイズの用途</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div v-for="sizeInfo in faviconSizes" :key="sizeInfo.size">
            <div class="flex items-center gap-2">
              <code class="bg-muted px-2 py-1 rounded">{{ sizeInfo.size }}×{{ sizeInfo.size }}</code>
              <span class="font-medium">{{ sizeInfo.name }}</span>
            </div>
            <p class="text-muted-foreground mt-1">
              {{ sizeInfo.description }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
