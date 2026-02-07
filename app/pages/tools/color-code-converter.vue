<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const colorPicker = ref('#FF5733')
const alpha = ref([100])
const activeFormat = ref<'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk'>('hex')

// 各形式の入力値
const hexInput = ref('#FF5733')
const rgbInput = ref({ r: 255, g: 87, b: 51 })
const hslInput = ref({ h: 10, s: 100, l: 60 })
const hsvInput = ref({ h: 10, s: 80, v: 100 })
const cmykInput = ref({ c: 0, m: 66, y: 80, k: 0 })

// 色変換関数
const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const rgbToHsl = (r: number, g: number, b: number): { h: number, s: number, l: number } => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
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

const hslToRgb = (h: number, s: number, l: number): { r: number, g: number, b: number } => {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
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

const rgbToHsv = (r: number, g: number, b: number): { h: number, s: number, v: number } => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max !== min) {
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
    v: Math.round(v * 100),
  }
}

const hsvToRgb = (h: number, s: number, v: number): { r: number, g: number, b: number } => {
  h /= 360
  s /= 100
  v /= 100

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  let r, g, b

  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
    default:
      r = 0
      g = 0
      b = 0
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

const rgbToCmyk = (r: number, g: number, b: number): { c: number, m: number, y: number, k: number } => {
  r /= 255
  g /= 255
  b /= 255

  const k = 1 - Math.max(r, g, b)
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

const cmykToRgb = (c: number, m: number, y: number, k: number): { r: number, g: number, b: number } => {
  c /= 100
  m /= 100
  y /= 100
  k /= 100

  const r = 255 * (1 - c) * (1 - k)
  const g = 255 * (1 - m) * (1 - k)
  const b = 255 * (1 - y) * (1 - k)

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  }
}

// 現在のRGB値（全形式の基準）
const currentRgb = computed(() => {
  switch (activeFormat.value) {
    case 'hex':
      return hexToRgb(hexInput.value) || { r: 0, g: 0, b: 0 }
    case 'rgb':
      return rgbInput.value
    case 'hsl':
      return hslToRgb(hslInput.value.h, hslInput.value.s, hslInput.value.l)
    case 'hsv':
      return hsvToRgb(hsvInput.value.h, hsvInput.value.s, hsvInput.value.v)
    case 'cmyk':
      return cmykToRgb(cmykInput.value.c, cmykInput.value.m, cmykInput.value.y, cmykInput.value.k)
    default:
      return { r: 0, g: 0, b: 0 }
  }
})

// 各形式の計算値
const computedHex = computed(() => rgbToHex(currentRgb.value.r, currentRgb.value.g, currentRgb.value.b))
const computedRgb = computed(() => currentRgb.value)
const computedHsl = computed(() => rgbToHsl(currentRgb.value.r, currentRgb.value.g, currentRgb.value.b))
const computedHsv = computed(() => rgbToHsv(currentRgb.value.r, currentRgb.value.g, currentRgb.value.b))
const computedCmyk = computed(() => rgbToCmyk(currentRgb.value.r, currentRgb.value.g, currentRgb.value.b))

// 色名の定義
const colorNames = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'Aqua', hex: '#00FFFF' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Silver', hex: '#C0C0C0' },
]

// 最も近い色名を取得
const getClosestColorName = (hex: string): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'Unknown'

  let closestColor = colorNames[0]
  let minDistance = Infinity

  for (const color of colorNames) {
    const colorRgb = hexToRgb(color.hex)
    if (!colorRgb) continue

    const distance = Math.sqrt(
      Math.pow(rgb.r - colorRgb.r, 2)
      + Math.pow(rgb.g - colorRgb.g, 2)
      + Math.pow(rgb.b - colorRgb.b, 2),
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = color
    }
  }

  return closestColor.name
}

// カラーパレット生成
const generatePalette = (type: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary') => {
  const hsl = computedHsl.value
  const colors: string[] = []

  switch (type) {
    case 'complementary':
      colors.push(computedHex.value)
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))))
      break
    case 'analogous':
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))))
      colors.push(computedHex.value)
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l))))
      break
    case 'triadic':
      colors.push(computedHex.value)
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l))))
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l))))
      break
    case 'tetradic':
      colors.push(computedHex.value)
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 90) % 360, hsl.s, hsl.l))))
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))))
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 270) % 360, hsl.s, hsl.l))))
      break
    case 'split-complementary':
      colors.push(computedHex.value)
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 150) % 360, hsl.s, hsl.l))))
      colors.push(rgbToHex(...Object.values(hslToRgb((hsl.h + 210) % 360, hsl.s, hsl.l))))
      break
  }

  return colors
}

// カラーピッカーの変更を監視
watch(colorPicker, (newColor) => {
  hexInput.value = newColor
  activeFormat.value = 'hex'
})

// CSS変数生成
const cssVariables = computed(() => {
  const rgb = currentRgb.value
  const hsl = computedHsl.value
  const alphaPercent = alpha.value[0] / 100

  return `:root {
  /* HEX */
  --color-primary: ${computedHex.value};
  
  /* RGB */
  --color-primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
  --color-primary-rgba: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaPercent});
  
  /* HSL */
  --color-primary-hsl: ${hsl.h}, ${hsl.s}%, ${hsl.l}%;
  --color-primary-hsla: hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaPercent});
}`
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
  catch (err) {
    console.error('Failed to copy:', err)
    toast({
      description: 'コピーに失敗しました',
      variant: 'destructive',
    })
  }
}

// フォーマット文字列
const formatRgb = computed(() => `rgb(${computedRgb.value.r}, ${computedRgb.value.g}, ${computedRgb.value.b})`)
const formatRgba = computed(() => `rgba(${computedRgb.value.r}, ${computedRgb.value.g}, ${computedRgb.value.b}, ${(alpha.value[0] / 100).toFixed(2)})`)
const formatHsl = computed(() => `hsl(${computedHsl.value.h}, ${computedHsl.value.s}%, ${computedHsl.value.l}%)`)
const formatHsla = computed(() => `hsla(${computedHsl.value.h}, ${computedHsl.value.s}%, ${computedHsl.value.l}%, ${(alpha.value[0] / 100).toFixed(2)})`)
const formatCmyk = computed(() => `cmyk(${computedCmyk.value.c}%, ${computedCmyk.value.m}%, ${computedCmyk.value.y}%, ${computedCmyk.value.k}%)`)

// SEO設定
useSeoMeta({
  title: 'カラーコード変換 | Web開発ツール',
  description: 'HEX/RGB/HSL/HSV/CMYK間の相互変換。カラーパレット生成、CSS変数出力対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        カラーコード変換
      </h1>
      <p class="text-muted-foreground">
        HEX、RGB、HSL、HSV、CMYK形式間で色を相互変換します。
      </p>
    </div>

    <!-- カラーピッカーとプレビュー -->
    <Card>
      <CardHeader>
        <CardTitle>色の選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">カラーピッカー</label>
              <div class="flex gap-4 items-center">
                <input
                  v-model="colorPicker"
                  type="color"
                  class="w-20 h-20 rounded cursor-pointer"
                  :style="{ backgroundColor: computedHex }">
                <div class="flex-1">
                  <p class="font-mono text-lg">
                    {{ computedHex }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    近似色: {{ getClosestColorName(computedHex) }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">
                透明度: {{ alpha[0] }}%
              </label>
              <Slider
                :model-value="alpha"
                :min="0"
                :max="100"
                :step="1"
                class="w-full"
                @update:model-value="alpha = $event" />
            </div>
          </div>

          <div
            class="h-40 rounded-lg border-2"
            :style="{ backgroundColor: formatRgba }">
            <div class="h-full w-full flex items-center justify-center">
              <span class="text-sm font-mono px-3 py-1 rounded bg-background/80">
                {{ formatRgba }}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 色形式変換 -->
    <Card>
      <CardHeader>
        <CardTitle>色形式変換</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- HEX -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">
                HEX
              </h3>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(computedHex)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="flex gap-2">
              <Input
                v-model="hexInput"
                placeholder="#FF0000"
                class="font-mono"
                @focus="activeFormat = 'hex'" />
              <Badge variant="outline" class="px-3">
                {{ computedHex }}
              </Badge>
            </div>
          </div>

          <!-- RGB -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">
                RGB / RGBA
              </h3>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(formatRgb)">
                  RGB
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(formatRgba)">
                  RGBA
                </Button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-xs text-muted-foreground">R</label>
                <Input
                  v-model.number="rgbInput.r"
                  type="number"
                  min="0"
                  max="255"
                  class="font-mono"
                  @focus="activeFormat = 'rgb'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">G</label>
                <Input
                  v-model.number="rgbInput.g"
                  type="number"
                  min="0"
                  max="255"
                  class="font-mono"
                  @focus="activeFormat = 'rgb'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">B</label>
                <Input
                  v-model.number="rgbInput.b"
                  type="number"
                  min="0"
                  max="255"
                  class="font-mono"
                  @focus="activeFormat = 'rgb'" />
              </div>
            </div>
            <div class="text-sm text-muted-foreground font-mono">
              {{ formatRgb }} / {{ formatRgba }}
            </div>
          </div>

          <!-- HSL -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">
                HSL / HSLA
              </h3>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(formatHsl)">
                  HSL
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(formatHsla)">
                  HSLA
                </Button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-xs text-muted-foreground">H (°)</label>
                <Input
                  v-model.number="hslInput.h"
                  type="number"
                  min="0"
                  max="360"
                  class="font-mono"
                  @focus="activeFormat = 'hsl'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">S (%)</label>
                <Input
                  v-model.number="hslInput.s"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'hsl'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">L (%)</label>
                <Input
                  v-model.number="hslInput.l"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'hsl'" />
              </div>
            </div>
            <div class="text-sm text-muted-foreground font-mono">
              {{ formatHsl }} / {{ formatHsla }}
            </div>
          </div>

          <!-- HSV -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">
                HSV / HSB
              </h3>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(`hsv(${computedHsv.h}, ${computedHsv.s}%, ${computedHsv.v}%)`)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-xs text-muted-foreground">H (°)</label>
                <Input
                  v-model.number="hsvInput.h"
                  type="number"
                  min="0"
                  max="360"
                  class="font-mono"
                  @focus="activeFormat = 'hsv'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">S (%)</label>
                <Input
                  v-model.number="hsvInput.s"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'hsv'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">V (%)</label>
                <Input
                  v-model.number="hsvInput.v"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'hsv'" />
              </div>
            </div>
            <div class="text-sm text-muted-foreground font-mono">
              hsv({{ computedHsv.h }}, {{ computedHsv.s }}%, {{ computedHsv.v }}%)
            </div>
          </div>

          <!-- CMYK -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">
                CMYK
              </h3>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(formatCmyk)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div>
                <label class="text-xs text-muted-foreground">C (%)</label>
                <Input
                  v-model.number="cmykInput.c"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'cmyk'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">M (%)</label>
                <Input
                  v-model.number="cmykInput.m"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'cmyk'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">Y (%)</label>
                <Input
                  v-model.number="cmykInput.y"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'cmyk'" />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">K (%)</label>
                <Input
                  v-model.number="cmykInput.k"
                  type="number"
                  min="0"
                  max="100"
                  class="font-mono"
                  @focus="activeFormat = 'cmyk'" />
              </div>
            </div>
            <div class="text-sm text-muted-foreground font-mono">
              {{ formatCmyk }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- カラーパレット -->
    <Card>
      <CardHeader>
        <CardTitle>カラーパレット生成</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <h3 class="font-medium mb-2">
              補色（Complementary）
            </h3>
            <div class="flex gap-2">
              <div
                v-for="color in generatePalette('complementary')"
                :key="color"
                class="flex-1 h-20 rounded cursor-pointer transition-transform hover:scale-105"
                :style="{ backgroundColor: color }"
                @click="copyToClipboard(color)">
                <div class="h-full flex items-end justify-center pb-2">
                  <span class="text-xs font-mono bg-background/80 px-1 rounded">
                    {{ color }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-medium mb-2">
              類似色（Analogous）
            </h3>
            <div class="flex gap-2">
              <div
                v-for="color in generatePalette('analogous')"
                :key="color"
                class="flex-1 h-20 rounded cursor-pointer transition-transform hover:scale-105"
                :style="{ backgroundColor: color }"
                @click="copyToClipboard(color)">
                <div class="h-full flex items-end justify-center pb-2">
                  <span class="text-xs font-mono bg-background/80 px-1 rounded">
                    {{ color }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-medium mb-2">
              三色配色（Triadic）
            </h3>
            <div class="flex gap-2">
              <div
                v-for="color in generatePalette('triadic')"
                :key="color"
                class="flex-1 h-20 rounded cursor-pointer transition-transform hover:scale-105"
                :style="{ backgroundColor: color }"
                @click="copyToClipboard(color)">
                <div class="h-full flex items-end justify-center pb-2">
                  <span class="text-xs font-mono bg-background/80 px-1 rounded">
                    {{ color }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-medium mb-2">
              四色配色（Tetradic）
            </h3>
            <div class="flex gap-2">
              <div
                v-for="color in generatePalette('tetradic')"
                :key="color"
                class="flex-1 h-20 rounded cursor-pointer transition-transform hover:scale-105"
                :style="{ backgroundColor: color }"
                @click="copyToClipboard(color)">
                <div class="h-full flex items-end justify-center pb-2">
                  <span class="text-xs font-mono bg-background/80 px-1 rounded">
                    {{ color }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- CSS変数生成 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>CSS変数</CardTitle>
          <Button
            size="sm"
            variant="outline"
            @click="copyToClipboard(cssVariables)">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
            コピー
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre class="p-4 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ cssVariables }}</code></pre>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>色形式について</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              各形式の特徴
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>HEX:</strong> Web開発で最も一般的。#RRGGBBの16進数表記</li>
              <li><strong>RGB:</strong> 赤・緑・青の光の三原色。0-255の値で指定</li>
              <li><strong>HSL:</strong> 色相・彩度・明度。人間の色認識に近い</li>
              <li><strong>HSV:</strong> 色相・彩度・明度（値）。グラフィックソフトで使用</li>
              <li><strong>CMYK:</strong> 印刷用の色空間。シアン・マゼンタ・イエロー・ブラック</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              配色理論
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>補色:</strong> 色相環の反対側にある色</li>
              <li><strong>類似色:</strong> 色相環で隣接する色</li>
              <li><strong>三色配色:</strong> 色相環を3等分した位置の色</li>
              <li><strong>四色配色:</strong> 色相環を4等分した位置の色</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
