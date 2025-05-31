<script setup lang="ts">
import { ref, computed } from 'vue'

interface GradientStop {
  color: string
  position: number
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
  return `style="background: ${cssGradient.value}"`
})

// SVGグラデーション生成用のID
const svgGradientId = 'gradient-' + Date.now()

// クリップボードにコピー
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: トースト通知を表示
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// ランダムグラデーション生成
const generateRandomGradient = () => {
  const numStops = Math.floor(Math.random() * 3) + 2 // 2-4 stops
  const newStops: GradientStop[] = []
  
  for (let i = 0; i < numStops; i++) {
    newStops.push({
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      position: Math.round((100 / (numStops - 1)) * i),
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
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="mb-8">
      <NuxtLink
        to="/tools"
        class="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <Icon name="ChevronLeft" class="w-4 h-4 mr-1" />
        ツール一覧に戻る
      </NuxtLink>
      
      <h1 class="text-3xl font-bold mb-2">グラデーションメーカー</h1>
      <p class="text-muted-foreground">
        美しいCSS/SVGグラデーションを視覚的に作成できます。
      </p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- プレビューエリア -->
      <div class="space-y-6">
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

        <!-- プリセット -->
        <Card>
          <CardHeader>
            <CardTitle>プリセット</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="preset in presets"
                :key="preset.name"
                @click="applyPreset(preset)"
                class="group relative h-20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div
                  class="absolute inset-0"
                  :style="{
                    background: preset.type === 'linear'
                      ? `linear-gradient(${preset.angle}deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                      : `radial-gradient(circle at center, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                  }">
                </div>
                <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <span class="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ preset.name }}
                  </span>
                </div>
              </button>
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
                <h4 class="text-sm font-medium">CSS</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(cssCode)">
                  <Icon name="Copy" class="w-4 h-4" />
                </Button>
              </div>
              <div class="p-3 bg-muted rounded-md">
                <code class="text-sm">{{ cssCode }}</code>
              </div>
            </div>

            <!-- Tailwind -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium">Tailwind CSS</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(tailwindCode)">
                  <Icon name="Copy" class="w-4 h-4" />
                </Button>
              </div>
              <div class="p-3 bg-muted rounded-md">
                <code class="text-sm">{{ tailwindCode }}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- コントロールパネル -->
      <div class="space-y-6">
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
                  @click="gradientType = type"
                  size="sm">
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </Button>
              </div>
            </div>

            <!-- タイプ別設定 -->
            <div v-if="gradientType === 'linear'">
              <label class="text-sm font-medium mb-2 block">
                角度: {{ angle }}°
              </label>
              <input
                v-model="angle"
                type="range"
                min="0"
                max="360"
                class="w-full">
            </div>

            <div v-if="gradientType === 'radial'" class="space-y-4">
              <div>
                <label class="text-sm font-medium mb-2 block">形状</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="shape in ['circle', 'ellipse'] as const"
                    :key="shape"
                    :variant="radialShape === shape ? 'default' : 'outline'"
                    @click="radialShape = shape"
                    size="sm">
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
                <input
                  v-model="centerX"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full">
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">
                  中心 Y: {{ centerY }}%
                </label>
                <input
                  v-model="centerY"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full">
              </div>
            </div>

            <div v-if="gradientType === 'conic'">
              <label class="text-sm font-medium mb-2 block">
                開始角度: {{ angle }}°
              </label>
              <input
                v-model="angle"
                type="range"
                min="0"
                max="360"
                class="w-full">
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
                  <Icon name="Shuffle" class="w-4 h-4 mr-1" />
                  ランダム
                </Button>
                <Button
                  size="sm"
                  @click="addStop">
                  <Icon name="Plus" class="w-4 h-4 mr-1" />
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
                  <input
                    v-model.number="stop.position"
                    type="range"
                    min="0"
                    max="100"
                    class="flex-1"
                    @change="sortStops">
                  <span class="text-sm w-12 text-right">{{ stop.position }}%</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="removeStop(index)"
                  :disabled="stops.length <= 2">
                  <Icon name="X" class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="range"] {
  height: 0.5rem;
  @apply bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700;
}

input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-primary rounded-full cursor-pointer;
}

input[type="range"]::-moz-range-thumb {
  @apply w-4 h-4 bg-primary rounded-full cursor-pointer border-0;
}
</style>