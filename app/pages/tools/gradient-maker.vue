<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

definePageMeta({
  layout: 'tools',
})

interface GradientStop {
  color: string
  position: number
}

interface GradientPreset {
  type?: 'linear' | 'radial' | 'conic'
  angle?: number
  stops: GradientStop[]
}

// 状態管理
const gradientType = ref<'linear' | 'radial' | 'conic'>('linear')
const angle = ref(90)
const radialShape = ref<'circle' | 'ellipse'>('circle')
const radialSize = ref<'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner'>('farthest-corner')
const centerX = ref(50)
const centerY = ref(50)

const stops = ref<GradientStop[]>([
  { color: '#3b82f6', position: 0 },
  { color: '#8b5cf6', position: 100 },
])

const _selectPreset = (preset: GradientPreset) => {
  gradientType.value = preset.type || 'linear'
  if (preset.angle !== undefined) angle.value = preset.angle
  stops.value = preset.stops.map((s: GradientStop) => ({ ...s }))
}

// 新しいストップを追加
const addStop = () => {
  const newPosition = stops.value.length > 0
    ? (stops.value[stops.value.length - 1].position + stops.value[0].position) / 2
    : 50
  stops.value.push({
    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    position: Math.round(newPosition),
  })
  sortStops()
}

// ストップを削除
const removeStop = (index: number) => {
  if (stops.value.length > 2) {
    stops.value.splice(index, 1)
  }
}

// ストップをソート
const sortStops = () => {
  stops.value.sort((a, b) => a.position - b.position)
}

// CSSグラデーション生成
const cssGradient = computed(() => {
  const colorStops = stops.value
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')

  switch (gradientType.value) {
    case 'linear':
      return `linear-gradient(${angle.value}deg, ${colorStops})`
    case 'radial':
      return `radial-gradient(${radialShape.value} ${radialSize.value} at ${centerX.value}% ${centerY.value}%, ${colorStops})`
    case 'conic':
      return `conic-gradient(from ${angle.value}deg at ${centerX.value}% ${centerY.value}%, ${colorStops})`
    default:
      return ''
  }
})

// CSS コード生成
const cssCode = computed(() => {
  return `background: ${cssGradient.value};`
})

// Tailwind CSS用のカスタムスタイル
const tailwindCode = computed(() => {
  // Tailwind CSSではインラインスタイルとして使用
  return `bg-gradient-to-r from-[${stops.value[0].color}] to-[${stops.value[stops.value.length - 1].color}]`
})

// SVGグラデーション生成用のID
const _svgGradientId = 'gradient-' + Date.now()

// クリップボードにコピー
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

// ランダムグラデーション生成
const generateRandomGradient = () => {
  const numStops = Math.floor(Math.random() * 3) + 2 // 2-4 stops
  const newStops: GradientStop[] = []

  for (let i = 0; i < numStops; i++) {
    newStops.push({
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      position: Math.round(100 / (numStops - 1) * i),
    })
  }

  stops.value = newStops
  angle.value = Math.floor(Math.random() * 360)
}

// プリセットグラデーション
const presets = [
  {
    name: 'Sunset',
    type: 'linear' as const,
    angle: 45,
    stops: [
      { color: '#ff6b6b', position: 0 },
      { color: '#feca57', position: 50 },
      { color: '#48dbfb', position: 100 },
    ],
  },
  {
    name: 'Ocean',
    type: 'linear' as const,
    angle: 180,
    stops: [
      { color: '#0093E9', position: 0 },
      { color: '#80D0C7', position: 100 },
    ],
  },
  {
    name: 'Purple Dream',
    type: 'radial' as const,
    stops: [
      { color: '#FA8BFF', position: 0 },
      { color: '#2BD2FF', position: 50 },
      { color: '#2BFF88', position: 100 },
    ],
  },
  {
    name: 'Fire',
    type: 'linear' as const,
    angle: 45,
    stops: [
      { color: '#f12711', position: 0 },
      { color: '#f5af19', position: 100 },
    ],
  },
]

const applyPreset = (preset: typeof presets[0]) => {
  gradientType.value = preset.type
  if (preset.angle !== undefined) {
    angle.value = preset.angle
  }
  stops.value = [...preset.stops]
}

// SEO設定
useSeoMeta({
  title: 'グラデーションメーカー | Web開発ツール',
  description: 'CSS/SVGグラデーションを視覚的に作成。リニア、ラジアル、コニックグラデーションに対応。',
})
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        グラデーションメーカー
      </h1>
      <p class="text-muted-foreground">
        美しいCSS/SVGグラデーションを視覚的に作成できます。
      </p>
    </div>

    <!-- プリセットセクション -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="preset in presets"
            :key="preset.name"
            class="group relative h-16 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            @click="applyPreset(preset)">
            <div
              class="absolute inset-0"
              :style="{
                background: preset.type === 'linear'
                  ? `linear-gradient(${preset.angle}deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                  : `radial-gradient(circle at center, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
              }">
            </div>
            <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <span class="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {{ preset.name }}
              </span>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- 左側：コントロールパネル -->
    <div class="space-y-6 col-span-1">
      <!-- グラデーション設定 -->
      <Card>
        <CardHeader>
          <CardTitle>グラデーション設定</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- グラデーションタイプ -->
          <div>
            <label class="text-sm font-medium mb-2 block">タイプ</label>
            <div class="grid grid-cols-3 gap-2">
              <Button
                v-for="type in ['linear', 'radial', 'conic'] as const"
                :key="type"
                :variant="gradientType === type ? 'default' : 'outline'"
                size="sm"
                @click="gradientType = type">
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </Button>
            </div>
          </div>

          <!-- タイプ別設定 -->
          <div v-if="gradientType === 'linear'">
            <label class="text-sm font-medium mb-2 block">
              角度: {{ angle }}°
            </label>
            <Slider
              :model-value="[angle]"
              :min="0"
              :max="360"
              :step="1"
              class="w-full"
              @update:model-value="angle = $event[0]" />
          </div>

          <div v-if="gradientType === 'radial'" class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">形状</label>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  v-for="shape in ['circle', 'ellipse'] as const"
                  :key="shape"
                  :variant="radialShape === shape ? 'default' : 'outline'"
                  size="sm"
                  @click="radialShape = shape">
                  {{ shape.charAt(0).toUpperCase() + shape.slice(1) }}
                </Button>
              </div>
            </div>
          </div>

          <div v-if="gradientType !== 'linear'" class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">
                中心 X: {{ centerX }}%
              </label>
              <Slider
                :model-value="[centerX]"
                :min="0"
                :max="100"
                :step="1"
                class="w-full"
                @update:model-value="centerX = $event[0]" />
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">
                中心 Y: {{ centerY }}%
              </label>
              <Slider
                :model-value="[centerY]"
                :min="0"
                :max="100"
                :step="1"
                class="w-full"
                @update:model-value="centerY = $event[0]" />
            </div>
          </div>

          <div v-if="gradientType === 'conic'">
            <label class="text-sm font-medium mb-2 block">
              開始角度: {{ angle }}°
            </label>
            <Slider
              :model-value="[angle]"
              :min="0"
              :max="360"
              :step="1"
              class="w-full"
              @update:model-value="angle = $event[0]" />
          </div>
        </CardContent>
      </Card>

      <!-- カラーストップ -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>カラーストップ</CardTitle>
            <div class="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                @click="generateRandomGradient">
                <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-1" />
                ランダム
              </Button>
              <Button
                size="sm"
                @click="addStop">
                <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
                追加
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="(stop, index) in stops"
              :key="index"
              class="flex items-center gap-3">
              <Input
                v-model="stop.color"
                type="color"
                class="w-12 h-10 p-1 cursor-pointer" />
              <Input
                v-model="stop.color"
                type="text"
                class="w-24"
                @change="sortStops" />
              <div class="flex-1 flex items-center gap-2">
                <Slider
                  :model-value="[stop.position]"
                  :min="0"
                  :max="100"
                  :step="1"
                  class="flex-1"
                  @update:model-value="stop.position = $event[0]; sortStops()" />
                <span class="text-sm w-12 text-right">{{ stop.position }}%</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                :disabled="stops.length <= 2"
                @click="removeStop(index)">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 右側：プレビューと結果 -->
    <div class="space-y-6 col-span-2">
      <!-- プレビュー -->
      <Card>
        <CardHeader>
          <CardTitle>プレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="aspect-video rounded-lg shadow-inner"
            :style="{ background: cssGradient }">
          </div>
        </CardContent>
      </Card>

      <!-- 生成されたコード -->
      <Card>
        <CardHeader>
          <CardTitle>生成されたコード</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- CSS -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium">
                CSS
              </h4>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(cssCode)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="p-3 bg-muted rounded-md">
              <code class="text-sm">{{ cssCode }}</code>
            </div>
          </div>

          <!-- Tailwind -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium">
                Tailwind CSS
              </h4>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(tailwindCode)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="p-3 bg-muted rounded-md">
              <code class="text-sm">{{ tailwindCode }}</code>
            </div>
            <p class="text-xs text-muted-foreground mt-2">
              ※ 複雑なグラデーションはstyle属性で指定: style="{{ cssGradient }}"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
