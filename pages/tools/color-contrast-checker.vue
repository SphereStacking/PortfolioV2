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

// RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

// Hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// 相対輝度の計算
const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color)
  if (!rgb) return 0

  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map(c => {
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
      passed: isLargeText ? ratio >= 3 : ratio >= 4.5
    },
    aaa: {
      normal: ratio >= 7,
      large: ratio >= 4.5,
      passed: isLargeText ? ratio >= 4.5 : ratio >= 7
    },
    isLargeText
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

// コントラスト比の改善提案
const getSuggestions = computed(() => {
  const suggestions = []
  const ratio = contrastRatio.value

  if (ratio < 3) {
    suggestions.push('コントラストが非常に低いです。色の明度差を大きくしてください。')
  } else if (ratio < 4.5) {
    suggestions.push('通常テキストのAA基準を満たしていません。前景色をより暗く、または背景色をより明るくしてください。')
  } else if (ratio < 7) {
    suggestions.push('AA基準は満たしていますが、AAA基準には達していません。')
  }

  if (wcagLevels.value.isLargeText && !wcagLevels.value.aa.large) {
    suggestions.push('大きなテキストでもAA基準を満たしていません。')
  }

  return suggestions
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
  } catch (err) {
    console.error('Failed to copy:', err)
    toast({
      description: 'コピーに失敗しました',
      variant: 'destructive',
    })
  }
}

// サンプルの組み合わせ
const sampleCombinations = [
  { name: '黒文字・白背景', fg: '#000000', bg: '#FFFFFF' },
  { name: '白文字・黒背景', fg: '#FFFFFF', bg: '#000000' },
  { name: '青リンク・白背景', fg: '#0066CC', bg: '#FFFFFF' },
  { name: '赤エラー・薄赤背景', fg: '#DC2626', bg: '#FEE2E2' },
  { name: '低コントラスト例', fg: '#999999', bg: '#CCCCCC' },
]

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
    <div class="grid grid-cols-2 gap-6">
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
          <Button
            variant="outline"
            size="sm"
            @click="swapColors">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
            色を入れ替え
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          class="p-8 rounded-md"
          :style="{ backgroundColor: backgroundColor, color: foregroundColor }">
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
              <TableCell class="font-medium">WCAG AA</TableCell>
              <TableCell>4.5:1 以上</TableCell>
              <TableCell>3:1 以上</TableCell>
              <TableCell>
                <Badge :variant="wcagLevels.aa.passed ? 'default' : 'destructive'">
                  {{ wcagLevels.aa.passed ? '合格' : '不合格' }}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="font-medium">WCAG AAA</TableCell>
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
  </div>
</template>