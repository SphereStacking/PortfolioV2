<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const foregroundColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')
const fontSize = ref(16)
const fontWeight = ref<'normal' | 'bold'>('normal')
const sampleText = ref('The quick brown fox jumps over the lazy dog')

// カラー形式
const colorFormat = ref<'hex' | 'rgb' | 'hsl'>('hex')

// カラーブラインドシミュレーション
const colorBlindMode = ref<'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'>('normal')
const showRecommendations = ref(false)
const generateCSSVariables = ref(false)

// RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

// Hex to RGB
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

// RGB to HSL
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
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// HSL to RGB
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

// 相対輝度の計算
const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color)
  if (!rgb) return 0

  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// コントラスト比の計算
const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

// コントラスト比
const contrastRatio = computed(() => {
  return getContrastRatio(foregroundColor.value, backgroundColor.value)
})

// WCAG基準の判定
const wcagLevels = computed(() => {
  const ratio = contrastRatio.value
  const isLargeText = fontSize.value >= 24 || (fontSize.value >= 18.66 && fontWeight.value === 'bold')

  return {
    aa: {
      normal: ratio >= 4.5,
      large: ratio >= 3,
      passed: isLargeText ? ratio >= 3 : ratio >= 4.5,
    },
    aaa: {
      normal: ratio >= 7,
      large: ratio >= 4.5,
      passed: isLargeText ? ratio >= 4.5 : ratio >= 7,
    },
    isLargeText,
  }
})

// 色の入れ替え
const swapColors = () => {
  const temp = foregroundColor.value
  foregroundColor.value = backgroundColor.value
  backgroundColor.value = temp
}

// カラーパレット（推奨色）
const recommendedColors = [
  { name: '黒', value: '#000000' },
  { name: '濃灰', value: '#333333' },
  { name: '中灰', value: '#666666' },
  { name: '薄灰', value: '#999999' },
  { name: '白', value: '#FFFFFF' },
  { name: '赤', value: '#DC2626' },
  { name: '青', value: '#2563EB' },
  { name: '緑', value: '#16A34A' },
]

// 色覚異常シミュレーション
const simulateColorBlindness = (color: string, type: string): string => {
  const rgb = hexToRgb(color)
  if (!rgb) return color

  let { r, g, b } = rgb

  // Normalize to 0-1
  r /= 255
  g /= 255
  b /= 255

  // Color blindness transformation matrices
  const matrices: Record<string, number[][]> = {
    protanopia: [ // Red-blind
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    deuteranopia: [ // Green-blind
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    tritanopia: [ // Blue-blind
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
    achromatopsia: [ // Total color blindness
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
    ],
  }

  if (type === 'normal' || !matrices[type]) {
    return color
  }

  const matrix = matrices[type]
  const newR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b
  const newG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b
  const newB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b

  return rgbToHex(
    Math.round(newR * 255),
    Math.round(newG * 255),
    Math.round(newB * 255),
  )
}

// 推奨色の自動生成
const getRecommendedColors = (baseColor: string, targetRatio: number, isBackground: boolean): string[] => {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return []

  const recommendations: string[] = []
  const baseLuminance = getLuminance(baseColor)

  // Calculate target luminance
  const targetLuminances: number[] = []
  if (isBackground) {
    // If this is the background, we need foreground colors
    targetLuminances.push((baseLuminance + 0.05) * targetRatio - 0.05)
    targetLuminances.push((baseLuminance + 0.05) / targetRatio - 0.05)
  }
  else {
    // If this is the foreground, we need background colors
    targetLuminances.push((baseLuminance + 0.05) / targetRatio - 0.05)
    targetLuminances.push((baseLuminance + 0.05) * targetRatio - 0.05)
  }

  // Generate colors with target luminance
  for (const targetLum of targetLuminances) {
    if (targetLum < 0 || targetLum > 1) continue

    // Simple approach: adjust brightness
    const factor = Math.sqrt(targetLum / (baseLuminance || 0.01))
    const newColor = rgbToHex(
      Math.min(255, Math.round(rgb.r * factor)),
      Math.min(255, Math.round(rgb.g * factor)),
      Math.min(255, Math.round(rgb.b * factor)),
    )

    recommendations.push(newColor)
  }

  // Add some hue variations
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const hueShifts = [30, -30, 60, -60, 180]

  for (const shift of hueShifts) {
    const newHue = (hsl.h + shift + 360) % 360
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
    const newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b)

    // Check if it meets the target ratio
    const ratio = isBackground
      ? getContrastRatio(baseColor, newColor)
      : getContrastRatio(newColor, baseColor)

    if (ratio >= targetRatio * 0.9) {
      recommendations.push(newColor)
    }
  }

  return [...new Set(recommendations)].slice(0, 6)
}

// コントラスト比の改善提案
const getSuggestions = computed(() => {
  const suggestions = []
  const ratio = contrastRatio.value

  if (ratio < 3) {
    suggestions.push('コントラストが非常に低いです。色の明度差を大きくしてください。')
  }
  else if (ratio < 4.5) {
    suggestions.push('通常テキストのAA基準を満たしていません。前景色をより暗く、または背景色をより明るくしてください。')
  }
  else if (ratio < 7) {
    suggestions.push('AA基準は満たしていますが、AAA基準には達していません。')
  }

  if (wcagLevels.value.isLargeText && !wcagLevels.value.aa.large) {
    suggestions.push('大きなテキストでもAA基準を満たしていません。')
  }

  return suggestions
})

// 色覚異常シミュレーション適用後の色
const simulatedColors = computed(() => {
  return {
    foreground: simulateColorBlindness(foregroundColor.value, colorBlindMode.value),
    background: simulateColorBlindness(backgroundColor.value, colorBlindMode.value),
  }
})

// シミュレーション後のコントラスト比
const simulatedContrastRatio = computed(() => {
  return getContrastRatio(simulatedColors.value.foreground, simulatedColors.value.background)
})

// CSS変数生成
const cssVariables = computed(() => {
  if (!generateCSSVariables.value) return ''

  const fg = hexToRgb(foregroundColor.value)
  const bg = hexToRgb(backgroundColor.value)
  const fgHsl = fg ? rgbToHsl(fg.r, fg.g, fg.b) : null
  const bgHsl = bg ? rgbToHsl(bg.r, bg.g, bg.b) : null

  return `:root {
  /* Colors */
  --color-foreground: ${foregroundColor.value};
  --color-background: ${backgroundColor.value};
  
  /* RGB values */
  --color-foreground-rgb: ${fg ? `${fg.r}, ${fg.g}, ${fg.b}` : '0, 0, 0'};
  --color-background-rgb: ${bg ? `${bg.r}, ${bg.g}, ${bg.b}` : '255, 255, 255'};
  
  /* HSL values */
  --color-foreground-hsl: ${fgHsl ? `${fgHsl.h}, ${fgHsl.s}%, ${fgHsl.l}%` : '0, 0%, 0%'};
  --color-background-hsl: ${bgHsl ? `${bgHsl.h}, ${bgHsl.s}%, ${bgHsl.l}%` : '0, 0%, 100%'};
  
  /* Contrast ratio */
  --contrast-ratio: ${contrastRatio.value.toFixed(2)};
  
  /* WCAG compliance */
  --wcag-aa: ${wcagLevels.value.aa.passed ? 'true' : 'false'};
  --wcag-aaa: ${wcagLevels.value.aaa.passed ? 'true' : 'false'};
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

// 色覚異常タイプ
const colorBlindTypes = [
  { value: 'normal', label: '通常', description: '色覚異常なし' },
  { value: 'protanopia', label: '第1色覚異常', description: '赤色が見えにくい' },
  { value: 'deuteranopia', label: '第2色覚異常', description: '緑色が見えにくい' },
  { value: 'tritanopia', label: '第3色覚異常', description: '青色が見えにくい' },
  { value: 'achromatopsia', label: '全色盲', description: '色が全く見えない' },
]

// サンプルの組み合わせ
const sampleCombinations = [
  { name: '黒文字・白背景', fg: '#000000', bg: '#FFFFFF' },
  { name: '白文字・黒背景', fg: '#FFFFFF', bg: '#000000' },
  { name: '青リンク・白背景', fg: '#0066CC', bg: '#FFFFFF' },
  { name: '赤エラー・薄赤背景', fg: '#DC2626', bg: '#FEE2E2' },
  { name: '低コントラスト例', fg: '#999999', bg: '#CCCCCC' },
]

// 推奨色の計算
const recommendedForegroundColors = computed(() => {
  if (!showRecommendations.value) return []
  const targetRatio = wcagLevels.value.isLargeText ? 3 : 4.5
  return getRecommendedColors(backgroundColor.value, targetRatio, true)
})

const recommendedBackgroundColors = computed(() => {
  if (!showRecommendations.value) return []
  const targetRatio = wcagLevels.value.isLargeText ? 3 : 4.5
  return getRecommendedColors(foregroundColor.value, targetRatio, false)
})

const loadSample = (sample: typeof sampleCombinations[0]) => {
  foregroundColor.value = sample.fg
  backgroundColor.value = sample.bg
}

// SEO設定
useSeoMeta({
  title: 'カラーコントラストチェッカー | Web開発ツール',
  description: 'WCAG準拠のカラーコントラスト比を計算。アクセシビリティに配慮したWebデザインに。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        カラーコントラストチェッカー
      </h1>
      <p class="text-muted-foreground">
        前景色と背景色のコントラスト比を計算し、WCAG（Web Content Accessibility Guidelines）の
        基準を満たしているかチェックします。
      </p>
    </div>

    <!-- サンプル -->
    <Card>
      <CardHeader>
        <CardTitle>サンプルの組み合わせ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleCombinations"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- カラー選択 -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>前景色（テキスト）</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <input
                v-model="foregroundColor"
                type="color"
                class="w-20 h-20 border rounded cursor-pointer">
              <input
                v-model="foregroundColor"
                type="text"
                class="flex-1 px-3 py-2 border rounded-md font-mono"
                placeholder="#000000">
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="color in recommendedColors"
                :key="color.name"
                class="p-3 border rounded text-xs"
                :style="{ backgroundColor: color.value, color: getLuminance(color.value) > 0.5 ? '#000' : '#fff' }"
                @click="foregroundColor = color.value">
                {{ color.name }}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>背景色</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <input
                v-model="backgroundColor"
                type="color"
                class="w-20 h-20 border rounded cursor-pointer">
              <input
                v-model="backgroundColor"
                type="text"
                class="flex-1 px-3 py-2 border rounded-md font-mono"
                placeholder="#FFFFFF">
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="color in recommendedColors"
                :key="color.name"
                class="p-3 border rounded text-xs"
                :style="{ backgroundColor: color.value, color: getLuminance(color.value) > 0.5 ? '#000' : '#fff' }"
                @click="backgroundColor = color.value">
                {{ color.name }}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- コントラスト比の結果 -->
    <Card>
      <CardHeader>
        <CardTitle>コントラスト比</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-center">
          <div class="text-6xl font-bold mb-4">
            {{ contrastRatio.toFixed(2) }}:1
          </div>
          <div class="flex justify-center gap-4 mb-6">
            <Badge
              :variant="wcagLevels.aa.passed ? 'default' : 'destructive'"
              class="text-lg px-4 py-2">
              WCAG AA: {{ wcagLevels.aa.passed ? '合格' : '不合格' }}
            </Badge>
            <Badge
              :variant="wcagLevels.aaa.passed ? 'default' : 'destructive'"
              class="text-lg px-4 py-2">
              WCAG AAA: {{ wcagLevels.aaa.passed ? '合格' : '不合格' }}
            </Badge>
          </div>
          <div class="text-sm text-muted-foreground">
            {{ wcagLevels.isLargeText ? '大きなテキストとして評価' : '通常のテキストとして評価' }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- プレビュー -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>プレビュー</CardTitle>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="showRecommendations = !showRecommendations">
              <Icon name="heroicons:light-bulb" class="w-4 h-4 mr-2" />
              推奨色
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="swapColors">
              <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
              色を入れ替え
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            class="p-8 rounded-md"
            :style="{
              backgroundColor: colorBlindMode === 'normal' ? backgroundColor : simulatedColors.background,
              color: colorBlindMode === 'normal' ? foregroundColor : simulatedColors.foreground,
            }">
            <p
              :style="{ fontSize: fontSize + 'px', fontWeight: fontWeight }"
              class="mb-4">
              {{ sampleText }}
            </p>
            <p class="text-sm">
              日本語のサンプルテキスト: 私は猫です。名前はまだありません。
            </p>
            <p class="text-xs mt-4">
              小さなテキスト (12px): Lorem ipsum dolor sit amet
            </p>
          </div>

          <!-- 色覚異常シミュレーション選択 -->
          <div>
            <label class="text-sm font-medium mb-2 block">色覚異常シミュレーション</label>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Button
                v-for="type in colorBlindTypes"
                :key="type.value"
                size="sm"
                :variant="colorBlindMode === type.value ? 'default' : 'outline'"
                class="text-xs"
                @click="colorBlindMode = type.value">
                {{ type.label }}
              </Button>
            </div>
            <p v-if="colorBlindMode !== 'normal'" class="mt-2 text-sm text-muted-foreground">
              {{ colorBlindTypes.find(t => t.value === colorBlindMode)?.description }}
              <br>
              シミュレーション後のコントラスト比: {{ simulatedContrastRatio.toFixed(2) }}:1
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 推奨色 -->
    <Card v-if="showRecommendations">
      <CardHeader>
        <CardTitle>推奨色の提案</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <h3 class="font-medium mb-2">
              推奨前景色（テキスト色）
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="color in recommendedForegroundColors"
                :key="color"
                class="p-4 rounded border-2 transition-all hover:scale-105"
                :style="{ backgroundColor: backgroundColor, color: color, borderColor: color }"
                @click="foregroundColor = color">
                <span class="font-mono text-sm">{{ color }}</span>
                <br>
                <span class="text-xs">
                  比率: {{ getContrastRatio(color, backgroundColor).toFixed(2) }}:1
                </span>
              </button>
            </div>
          </div>

          <div>
            <h3 class="font-medium mb-2">
              推奨背景色
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="color in recommendedBackgroundColors"
                :key="color"
                class="p-4 rounded border-2 transition-all hover:scale-105"
                :style="{ backgroundColor: color, color: foregroundColor, borderColor: foregroundColor }"
                @click="backgroundColor = color">
                <span class="font-mono text-sm">{{ color }}</span>
                <br>
                <span class="text-xs">
                  比率: {{ getContrastRatio(foregroundColor, color).toFixed(2) }}:1
                </span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- テキスト設定 -->
    <Card>
      <CardHeader>
        <CardTitle>テキスト設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">
              フォントサイズ: {{ fontSize }}px
            </label>
            <Slider
              v-model="fontSize"
              :min="8"
              :max="48"
              :step="1"
              class="w-full" />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">フォントウェイト</label>
            <div class="flex gap-2">
              <Button
                v-for="weight in ['normal', 'bold'] as const"
                :key="weight"
                size="sm"
                :variant="fontWeight === weight ? 'default' : 'outline'"
                @click="fontWeight = weight">
                {{ weight === 'normal' ? '通常' : '太字' }}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- WCAG基準の詳細 -->
    <Card>
      <CardHeader>
        <CardTitle>WCAG基準の詳細</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>基準</TableHead>
              <TableHead>通常のテキスト</TableHead>
              <TableHead>大きなテキスト</TableHead>
              <TableHead>現在の状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell class="font-medium">
                WCAG AA
              </TableCell>
              <TableCell>4.5:1 以上</TableCell>
              <TableCell>3:1 以上</TableCell>
              <TableCell>
                <Badge :variant="wcagLevels.aa.passed ? 'default' : 'destructive'">
                  {{ wcagLevels.aa.passed ? '合格' : '不合格' }}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="font-medium">
                WCAG AAA
              </TableCell>
              <TableCell>7:1 以上</TableCell>
              <TableCell>4.5:1 以上</TableCell>
              <TableCell>
                <Badge :variant="wcagLevels.aaa.passed ? 'default' : 'destructive'">
                  {{ wcagLevels.aaa.passed ? '合格' : '不合格' }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div class="mt-4 text-sm text-muted-foreground">
          <p>※ 大きなテキスト: 24px以上、または18px以上の太字</p>
        </div>
      </CardContent>
    </Card>

    <!-- 改善提案 -->
    <Card v-if="getSuggestions.length > 0">
      <CardHeader>
        <CardTitle>改善提案</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Icon name="heroicons:light-bulb" class="h-4 w-4" />
          <AlertDescription>
            <ul class="list-disc list-inside space-y-1">
              <li v-for="(suggestion, index) in getSuggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <!-- CSS変数生成 -->
    <Card>
      <CardHeader>
        <CardTitle>CSS変数生成</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="generateCSSVariables"
              type="checkbox"
              class="rounded">
            CSS変数を生成
          </label>

          <div v-if="generateCSSVariables">
            <div class="relative">
              <pre class="p-4 bg-muted rounded-md overflow-x-auto text-sm font-mono">{{ cssVariables }}</pre>
              <Button
                size="sm"
                variant="ghost"
                class="absolute top-2 right-2"
                @click="copyToClipboard(cssVariables)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 機能説明 -->
    <Card>
      <CardHeader>
        <CardTitle>機能説明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              WCAG基準について
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>AA基準:</strong> 最低限のアクセシビリティ要件</li>
              <li><strong>AAA基準:</strong> より高いアクセシビリティ要件</li>
              <li><strong>大きなテキスト:</strong> 24px以上、または18px以上の太字</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              色覚異常シミュレーション
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>世界の男性の約8%、女性の約0.5%が何らかの色覚異常を持つ</li>
              <li>最も一般的なのは赤緑色覚異常（第1・第2色覚異常）</li>
              <li>シミュレーションで実際の見え方を確認できます</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              推奨色の提案
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>現在の色を基準にWCAG基準を満たす色を自動生成</li>
              <li>明度調整と色相シフトで複数の選択肢を提供</li>
              <li>クリックして直接適用可能</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
