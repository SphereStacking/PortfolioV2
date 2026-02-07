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
const imageUrl = ref<string>('')
const fileName = ref('')
const extractedColors = ref<{ hex: string, rgb: string, percentage: number }[]>([])
const isExtracting = ref(false)

// 設定
const colorCount = ref(6)
const quality = ref(10) // サンプリング品質（小さいほど高品質）

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
    imageUrl.value = e.target?.result as string
    extractedColors.value = []
  }
  reader.readAsDataURL(file)
}

// カラーパレット抽出
const extractColors = () => {
  if (!imageUrl.value) return

  isExtracting.value = true

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // キャンバスサイズを設定（処理速度のため縮小）
      const maxSize = 200
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // ピクセルデータを取得
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      // カラーをカウント
      const colorMap = new Map<string, number>()

      for (let i = 0; i < pixels.length; i += quality.value * 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        // 透明ピクセルはスキップ
        if (a < 128) continue

        // 色を量子化（近い色をグループ化）
        const quantizedR = Math.round(r / 16) * 16
        const quantizedG = Math.round(g / 16) * 16
        const quantizedB = Math.round(b / 16) * 16

        const key = `${quantizedR},${quantizedG},${quantizedB}`
        colorMap.set(key, (colorMap.get(key) || 0) + 1)
      }

      // 上位の色を取得
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount.value)

      const totalPixels = sortedColors.reduce((sum, [_, count]) => sum + count, 0)

      extractedColors.value = sortedColors.map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number)
        return {
          hex: rgbToHex(r, g, b),
          rgb: `rgb(${r}, ${g}, ${b})`,
          percentage: Math.round((count / totalPixels) * 100),
        }
      })

      isExtracting.value = false
    }
    catch {
      toast({
        title: 'エラー',
        description: '色の抽出に失敗しました',
        variant: 'destructive',
      })
      isExtracting.value = false
    }
  }
  img.src = imageUrl.value
}

// RGB to HEX変換
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// カラーコピー
const copyColor = async (color: string) => {
  await copy(color)
  toast({
    title: 'コピーしました',
    description: `${color}をクリップボードにコピーしました`,
  })
}

// パレット全体をコピー
const copyPalette = async (format: 'hex' | 'rgb' | 'css' | 'json') => {
  let text = ''

  switch (format) {
    case 'hex':
      text = extractedColors.value.map(c => c.hex).join('\n')
      break
    case 'rgb':
      text = extractedColors.value.map(c => c.rgb).join('\n')
      break
    case 'css':
      text = `:root {\n${extractedColors.value.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`
      break
    case 'json':
      text = JSON.stringify(extractedColors.value.map(c => ({
        hex: c.hex,
        rgb: c.rgb,
        percentage: c.percentage,
      })), null, 2)
      break
  }

  await copy(text)
  toast({
    title: 'コピーしました',
    description: 'カラーパレットをクリップボードにコピーしました',
  })
}

// CSSグラデーション生成
const gradientCss = computed(() => {
  if (extractedColors.value.length < 2) return ''

  const colors = extractedColors.value.map(c => c.hex).join(', ')
  return `background: linear-gradient(to right, ${colors});`
})

// クリア
const clearAll = () => {
  imageUrl.value = ''
  fileName.value = ''
  extractedColors.value = []
  reset()
}

// SEO設定
useSeoMeta({
  title: 'カラーパレット抽出 | Web開発ツール',
  description: '画像から主要な色を抽出してパレット化。配色の参考やデザインの統一に便利。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        カラーパレット抽出
      </h1>
      <p class="text-muted-foreground">
        画像から主要な色を抽出してパレット化。配色の参考やブランドカラーの決定に便利。
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>画像選択</CardTitle>
        <CardDescription>
          カラーパレットを抽出したい画像をアップロード
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
          <div v-if="!imageUrl">
            <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p class="text-sm text-muted-foreground mb-2">
              クリックまたはドロップで画像を選択
            </p>
          </div>
          <div v-else class="space-y-4">
            <img
              :src="imageUrl"
              alt="Selected"
              class="max-w-full max-h-[300px] mx-auto rounded">
            <p class="text-sm text-muted-foreground">
              {{ fileName }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 設定 -->
    <Card>
      <CardHeader>
        <CardTitle>抽出設定</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">
            抽出する色の数: {{ colorCount }}色
          </label>
          <input
            v-model="colorCount"
            type="range"
            min="3"
            max="12"
            step="1"
            class="w-full">
          <div class="flex justify-between text-xs text-muted-foreground mt-1">
            <span>3</span>
            <span>12</span>
          </div>
        </div>

        <div class="flex gap-2">
          <Button
            :disabled="!imageUrl || isExtracting"
            class="flex-1"
            @click="extractColors">
            <Icon name="heroicons:eye-dropper" class="w-4 h-4 mr-1" />
            色を抽出
          </Button>
          <Button
            variant="outline"
            :disabled="!imageUrl"
            @click="clearAll">
            クリア
          </Button>
        </div>
      </CardContent>
    </Card>
    <!-- 抽出された色 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>抽出されたカラーパレット</CardTitle>
            <CardDescription>
              クリックでコピー
            </CardDescription>
          </div>
          <div v-if="extractedColors.length > 0" class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              @click="copyPalette('hex')">
              HEX
            </Button>
            <Button
              size="sm"
              variant="outline"
              @click="copyPalette('css')">
              CSS
            </Button>
            <Button
              size="sm"
              variant="outline"
              @click="copyPalette('json')">
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isExtracting" class="text-center py-12">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p class="text-sm text-muted-foreground">
            色を抽出中...
          </p>
        </div>
        <div v-else-if="extractedColors.length > 0" class="space-y-4">
          <!-- カラーバー -->
          <div class="h-20 rounded-lg overflow-hidden flex">
            <div
              v-for="(color, index) in extractedColors"
              :key="index"
              :style="{ backgroundColor: color.hex, flex: color.percentage }"
              class="transition-all hover:flex-grow"></div>
          </div>

          <!-- カラーリスト -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="(color, index) in extractedColors"
              :key="index"
              class="group"
              @click="copyColor(color.hex)">
              <div class="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors">
                <div
                  :style="{ backgroundColor: color.hex }"
                  class="w-12 h-12 rounded-md shadow-sm"></div>
                <div class="flex-1 text-left">
                  <p class="font-mono text-sm">
                    {{ color.hex }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ color.percentage }}%
                  </p>
                </div>
                <Icon name="heroicons:clipboard-document" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>

          <!-- グラデーション -->
          <div
            v-if="gradientCss"
            class="h-20 rounded-lg"
            :style="gradientCss"></div>
        </div>
        <div v-else class="text-center py-12 text-muted-foreground">
          <Icon name="heroicons:eye-dropper" class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>画像を選択して色を抽出してください</p>
        </div>
      </CardContent>
    </Card>

    <!-- エクスポートオプション -->
    <Card v-if="extractedColors.length > 0">
      <CardHeader>
        <CardTitle>エクスポート形式</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <h4 class="text-sm font-medium mb-2">
            CSS変数
          </h4>
          <pre class="p-3 bg-muted rounded text-xs overflow-x-auto">
            <code>{{ `:root {
${extractedColors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}
}` }}</code>
</pre>
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">
            グラデーション
          </h4>
          <pre class="p-3 bg-muted rounded text-xs overflow-x-auto"><code>{{ gradientCss }}</code></pre>
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">
            Tailwind設定
          </h4>
          <pre class="p-3 bg-muted rounded text-xs overflow-x-auto">
            <code>{{ `colors: {
${extractedColors.map((c, i) => `  'brand-${i + 1}': '${c.hex}',`).join('\n')}
}` }}</code>
</pre>
        </div>
      </CardContent>
    </Card>

    <!-- 使い方 -->
    <Card>
      <CardHeader>
        <CardTitle>活用例</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              デザイン用途
            </h4>
            <ul class="space-y-1">
              <li>• ブランドカラーの決定</li>
              <li>• 写真から配色を抽出</li>
              <li>• 競合サイトの配色分析</li>
              <li>• ムードボードの作成</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              開発用途
            </h4>
            <ul class="space-y-1">
              <li>• CSS変数の生成</li>
              <li>• デザインシステムの構築</li>
              <li>• Tailwind設定の生成</li>
              <li>• テーマカラーの設定</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
