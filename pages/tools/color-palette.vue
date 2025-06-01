<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

definePageMeta({
  layout: 'tools',
})
// カラーユーティリティ関数
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// コントラスト比計算
const getLuminance = (r: number, g: number, b: number) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const getContrastRatio = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  if (!rgb1 || !rgb2) return 1

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

// 状態管理
const baseColor = ref('#3b82f6')
const paletteType = ref<'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochromatic'>('analogous')

// プリセットカラー
const colorPresets = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#10b981' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Indigo', value: '#6366f1' },
]

const selectPreset = (color: string) => {
  baseColor.value = color
}

// パレット生成
const generatePalette = computed(() => {
  const rgb = hexToRgb(baseColor.value)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors: string[] = [baseColor.value]

  switch (paletteType.value) {
    case 'analogous':
      // 類似色（30度ずつ）
      colors.push(
        rgbToHex(...Object.values(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 60) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h - 60 + 360) % 360, hsl.s, hsl.l))),
      )
      break
    case 'complementary':
      // 補色（180度）
      colors.push(
        rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))),
      )
      // バリエーション追加
      colors.push(
        rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.min(hsl.l + 20, 100)))),
        rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.max(hsl.l - 20, 0)))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, Math.min(hsl.l + 20, 100)))),
      )
      break
    case 'triadic':
      // トライアド（120度ずつ）
      colors.push(
        rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l))),
      )
      // バリエーション追加
      colors.push(
        rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.min(hsl.l + 15, 100)))),
        rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.max(hsl.l - 15, 0)))),
      )
      break
    case 'tetradic':
      // テトラード（90度ずつ）
      colors.push(
        rgbToHex(...Object.values(hslToRgb((hsl.h + 90) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))),
        rgbToHex(...Object.values(hslToRgb((hsl.h + 270) % 360, hsl.s, hsl.l))),
      )
      break
    case 'monochromatic':
      // モノクロマティック（明度違い）
      const steps = [20, 40, 60, 80]
      steps.forEach((step) => {
        colors.push(
          rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, step))),
        )
      })
      break
  }

  return colors
})

// クリップボードにコピー
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast({
      title: 'コピーしました',
      description: text,
    })
  }
  catch (err) {
    console.error('Failed to copy:', err)
    toast({
      title: 'エラー',
      description: 'クリップボードへのコピーに失敗しました',
      variant: 'destructive',
    })
  }
}

const copyPalette = () => {
  const paletteText = generatePalette.value.join(', ')
  copyToClipboard(paletteText)
}

// SEO設定
useSeoMeta({
  title: 'カラーパレットジェネレーター | Web開発ツール',
  description: '美しい配色を自動生成。類似色、補色、トライアドなど様々なカラーパレットを作成できます。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        カラーパレットジェネレーター
      </h1>
      <p class="text-muted-foreground">
        基準色から美しい配色を自動生成します。Webデザインに最適なカラーパレットを作成できます。
      </p>
    </div>

    <!-- プリセットセクション -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in colorPresets"
            :key="preset.value"
            variant="outline"
            size="sm"
            class="gap-2"
            @click="selectPreset(preset.value)">
            <div
              class="w-4 h-4 rounded border"
              :style="{ backgroundColor: preset.value }"></div>
            {{ preset.label }}
          </Button>
        </div>
      </CardContent>
    </Card>
    <Card class="col-span-1 row-start-3 row-end-6">
      <CardHeader>
        <CardTitle>設定</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- ベースカラー選択 -->
        <div>
          <label class="text-sm font-medium mb-2 block">基準色</label>
          <div class="flex gap-2">
            <Input
              v-model="baseColor"
              type="color"
              class="w-16 h-10 p-1 cursor-pointer" />
            <Input
              v-model="baseColor"
              type="text"
              placeholder="#3b82f6"
              class="flex-1" />
          </div>
        </div>

        <!-- パレットタイプ選択 -->
        <div>
          <label class="text-sm font-medium mb-2 block">パレットタイプ</label>
          <select
            v-model="paletteType"
            class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="analogous">
              類似色
            </option>
            <option value="complementary">
              補色
            </option>
            <option value="triadic">
              トライアド（3色配色）
            </option>
            <option value="tetradic">
              テトラード（4色配色）
            </option>
            <option value="monochromatic">
              モノクロマティック
            </option>
          </select>
        </div>

        <!-- 一括コピー -->
        <Button
          class="w-full"
          variant="outline"
          @click="copyPalette">
          <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
          パレットをコピー
        </Button>
      </CardContent>
      <CardHeader>
        <CardTitle class="text-sm">
          {{
            {
              analogous: '類似色配色',
              complementary: '補色配色',
              triadic: 'トライアド配色',
              tetradic: 'テトラード配色',
              monochromatic: 'モノクロマティック配色',
            }[paletteType]
          }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground">
          {{
            {
              analogous: '色相環で隣り合う色を使った調和のとれた配色です。',
              complementary: '色相環で正反対の色を使った、コントラストの強い配色です。',
              triadic: '色相環を3等分した位置の色を使った、バランスの良い配色です。',
              tetradic: '色相環を4等分した位置の色を使った、豊かな配色です。',
              monochromatic: '同じ色相で明度を変えた、統一感のある配色です。',
            }[paletteType]
          }}
        </p>
      </CardContent>
    </Card>

    <!-- カラーパレット -->
    <Card>
      <CardHeader>
        <CardTitle>生成されたパレット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-5 gap-4">
          <div
            v-for="(color, index) in generatePalette"
            :key="index"
            class="space-y-2">
            <div
              :style="{ backgroundColor: color }"
              class="aspect-square rounded-lg shadow-sm border cursor-pointer hover:scale-105 transition-transform"
              @click="copyToClipboard(color)">
            </div>
            <div class="text-center">
              <p class="text-xs font-mono">
                {{ color }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ index === 0 ? '基準色' : '' }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- コントラスト比チェック -->
    <Card>
      <CardHeader>
        <CardTitle>アクセシビリティチェック</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <!-- 白背景でのテスト -->
            <div>
              <h4 class="text-sm font-medium mb-2">
                白背景（#FFFFFF）
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(color, index) in generatePalette"
                  :key="`white-${index}`"
                  class="flex items-center justify-between p-2 bg-white rounded border">
                  <span
                    :style="{ color }"
                    class="font-medium">
                    サンプルテキスト
                  </span>
                  <Badge
                    :variant="getContrastRatio(color, '#ffffff') >= 4.5 ? 'default' : 'destructive'">
                    {{ getContrastRatio(color, '#ffffff').toFixed(2) }}
                  </Badge>
                </div>
              </div>
            </div>

            <!-- 黒背景でのテスト -->
            <div>
              <h4 class="text-sm font-medium mb-2">
                黒背景（#000000）
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(color, index) in generatePalette"
                  :key="`black-${index}`"
                  class="flex items-center justify-between p-2 bg-black rounded border">
                  <span
                    :style="{ color }"
                    class="font-medium">
                    サンプルテキスト
                  </span>
                  <Badge
                    :variant="getContrastRatio(color, '#000000') >= 4.5 ? 'default' : 'destructive'">
                    {{ getContrastRatio(color, '#000000').toFixed(2) }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            WCAG AA準拠には4.5以上、AAA準拠には7以上のコントラスト比が必要です。
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
