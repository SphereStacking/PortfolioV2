<script setup lang="ts">
import { useDropZone, useFileDialog, useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

// 画像データ
interface SpriteImage {
  id: string
  name: string
  url: string
  width: number
  height: number
}

const images = ref<SpriteImage[]>([])
const spriteSheetUrl = ref('')
const cssCode = ref('')

// 設定
const columns = ref('4')
const padding = ref('10')
const backgroundColor = ref('#ffffff')
const outputFormat = ref<'png' | 'jpeg'>('png')

// ファイル選択
const dropZoneRef = ref<HTMLDivElement>()
const { open: openFileDialog, reset, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: true,
})

onChange((files) => {
  if (files && files.length > 0) {
    handleFiles(Array.from(files))
  }
})

// ドロップゾーン
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    if (files && files.length > 0) {
      handleFiles(Array.from(files))
    }
  },
})

// ファイル処理
const handleFiles = async (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    toast({
      title: 'エラー',
      description: '画像ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  for (const file of imageFiles) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      const img = new Image()
      img.onload = () => {
        images.value.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
          width: img.width,
          height: img.height,
        })
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }
}

// 画像削除
const removeImage = (id: string) => {
  images.value = images.value.filter(img => img.id !== id)
}

// スプライトシート生成
const generateSpriteSheet = () => {
  if (images.value.length === 0) {
    toast({
      title: 'エラー',
      description: '画像を追加してください',
      variant: 'destructive',
    })
    return
  }

  const cols = parseInt(columns.value)
  const pad = parseInt(padding.value)

  // 必要な行数を計算
  const rows = Math.ceil(images.value.length / cols)

  // 各セルの最大サイズを計算
  const maxWidth = Math.max(...images.value.map(img => img.width))
  const maxHeight = Math.max(...images.value.map(img => img.height))

  // キャンバスサイズを計算
  const canvasWidth = cols * (maxWidth + pad * 2)
  const canvasHeight = rows * (maxHeight + pad * 2)

  // キャンバスを作成
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 背景色を設定
  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // CSS生成用の情報
  const cssRules: string[] = []

  // 画像を配置
  images.value.forEach((image, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols

    const x = col * (maxWidth + pad * 2) + pad
    const y = row * (maxHeight + pad * 2) + pad

    // 画像を描画
    const img = new Image()
    img.onload = () => {
      // 中央配置
      const offsetX = (maxWidth - image.width) / 2
      const offsetY = (maxHeight - image.height) / 2

      ctx.drawImage(img, x + offsetX, y + offsetY)

      // CSS生成
      const className = `.sprite-${image.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      const bgPosition = `-${x + offsetX}px -${y + offsetY}px`
      cssRules.push(`${className} {
  width: ${image.width}px;
  height: ${image.height}px;
  background-position: ${bgPosition};
}`)

      // 全画像の描画が完了したらスプライトシートを生成
      if (cssRules.length === images.value.length) {
        spriteSheetUrl.value = canvas.toDataURL(`image/${outputFormat.value}`)

        // CSSコードを生成
        cssCode.value = `.sprite {
  background-image: url('sprite-sheet.${outputFormat.value}');
  background-repeat: no-repeat;
  display: inline-block;
}

${cssRules.join('\n\n')}`
      }
    }
    img.src = image.url
  })
}

// ダウンロード
const downloadSpriteSheet = () => {
  if (!spriteSheetUrl.value) return

  const link = document.createElement('a')
  link.href = spriteSheetUrl.value
  link.download = `sprite-sheet.${outputFormat.value}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast({
    title: 'ダウンロード完了',
    description: 'スプライトシートをダウンロードしました',
  })
}

// CSSコピー
const copyCss = async () => {
  if (!cssCode.value) return

  await copy(cssCode.value)
  toast({
    title: 'コピーしました',
    description: 'CSSコードをクリップボードにコピーしました',
  })
}

// クリア
const clearAll = () => {
  images.value = []
  spriteSheetUrl.value = ''
  cssCode.value = ''
  reset()
}

// SEO設定
useSeoMeta({
  title: 'スプライトシート生成 | Web開発ツール',
  description: '複数の画像からCSSスプライトを生成。Webサイトの高速化に貢献。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        スプライトシート生成
      </h1>
      <p class="text-muted-foreground">
        複数の画像を1つにまとめてCSSスプライトを生成。HTTPリクエストを削減してWebサイトを高速化。
      </p>
    </div>

    <!-- 画像アップロード -->
    <Card>
      <CardHeader class="flex items-center justify-between">
        <div>
          <CardTitle>
            画像を追加
          </CardTitle>
          <CardDescription>
            含める画像を選択（複数選択可）
          </CardDescription>
        </div>
        <div class="flex gap-2">
          <Button
            :disabled="images.length === 0"
            class="flex-1"
            @click="generateSpriteSheet">
            <Icon name="heroicons:squares-plus" class="w-4 h-4 mr-1" />
            生成
          </Button>
          <Button
            variant="outline"
            :disabled="images.length === 0"
            @click="clearAll">
            クリア
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref="dropZoneRef"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isOverDropZone ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          ]"
          @click="openFileDialog">
          <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p class="text-sm text-muted-foreground mb-2">
            クリックまたはドロップで画像を追加
          </p>
          <p class="text-xs text-muted-foreground">
            複数ファイル選択可能
          </p>
        </div>

        <!-- 追加済み画像 -->
        <div v-if="images.length > 0" class="mt-6">
          <h4 class="text-sm font-medium mb-3">
            追加済み画像 ({{ images.length }}枚)
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="image in images"
              :key="image.id"
              class="relative group">
              <img
                :src="image.url"
                :alt="image.name"
                class="w-full h-24 object-contain bg-muted rounded border">
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <Button
                  size="sm"
                  variant="destructive"
                  @click="removeImage(image.id)">
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </Button>
              </div>
              <p class="text-xs text-center mt-1 truncate">
                {{ image.name }}
              </p>
              <p class="text-xs text-center text-muted-foreground">
                {{ image.width }}×{{ image.height }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>設定</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">列数</label>
          <Input
            v-model="columns"
            type="number"
            min="1"
            max="20"
            placeholder="4" />
        </div>

        <div>
          <label class="text-sm font-medium mb-2 block">余白 (px)</label>
          <Input
            v-model="padding"
            type="number"
            min="0"
            max="50"
            placeholder="10" />
        </div>

        <div>
          <label class="text-sm font-medium mb-2 block">背景色</label>
          <div class="flex gap-2">
            <input
              v-model="backgroundColor"
              type="color"
              class="h-10 w-16 rounded border cursor-pointer">
            <Input
              v-model="backgroundColor"
              class="flex-1"
              placeholder="#ffffff" />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium mb-2 block">出力形式</label>
          <div class="flex gap-2">
            <Button
              :variant="outputFormat === 'png' ? 'default' : 'outline'"
              size="sm"
              @click="outputFormat = 'png'">
              PNG（透過対応）
            </Button>
            <Button
              :variant="outputFormat === 'jpeg' ? 'default' : 'outline'"
              size="sm"
              @click="outputFormat = 'jpeg'">
              JPEG
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- スプライトシート -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>スプライトシート</CardTitle>
            <CardDescription>
              生成された画像
            </CardDescription>
          </div>
          <Button
            v-if="spriteSheetUrl"
            size="sm"
            @click="downloadSpriteSheet">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
            ダウンロード
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="spriteSheetUrl" class="rounded overflow-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
          <img
            :src="spriteSheetUrl"
            alt="Sprite Sheet"
            class="max-w-full">
        </div>
        <div v-else class="text-center py-12 text-muted-foreground">
          <Icon name="heroicons:squares-plus" class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>画像を追加して生成ボタンを押してください</p>
        </div>
      </CardContent>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>CSSコード</CardTitle>
            <CardDescription>
              スプライトシート用のCSS
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            @click="copyCss">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre class="p-4 bg-muted rounded-md text-sm overflow-x-auto"><code>{{ cssCode }}</code></pre>
      </CardContent>
    </Card>
    <!-- 使い方 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>スプライトシートの利点</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              パフォーマンス向上
            </h4>
            <ul class="space-y-1">
              <li>• HTTPリクエスト数の削減</li>
              <li>• ページ読み込み速度の向上</li>
              <li>• サーバー負荷の軽減</li>
              <li>• キャッシュ効率の改善</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              使用例
            </h4>
            <ul class="space-y-1">
              <li>• アイコンセット</li>
              <li>• UIコンポーネントの画像</li>
              <li>• ゲームのキャラクタースプライト</li>
              <li>• ソーシャルメディアアイコン</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
