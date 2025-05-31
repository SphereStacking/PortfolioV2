<script setup lang="ts">
import { ref, computed } from 'vue'

interface Shadow {
  id: string
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

// 状態管理
const shadows = ref<Shadow[]>([
  {
    id: '1',
    x: 4,
    y: 4,
    blur: 16,
    spread: 0,
    color: '#000000',
    opacity: 20,
    inset: false,
  },
])

const boxColor = ref('#ffffff')
const boxBackground = ref('#f3f4f6')
const boxSize = ref(200)
const borderRadius = ref(8)

// 新しいシャドウを追加
const addShadow = () => {
  const newShadow: Shadow = {
    id: Date.now().toString(),
    x: 4,
    y: 4,
    blur: 16,
    spread: 0,
    color: '#000000',
    opacity: 20,
    inset: false,
  }
  shadows.value.push(newShadow)
}

// シャドウを削除
const removeShadow = (id: string) => {
  if (shadows.value.length > 1) {
    shadows.value = shadows.value.filter(s => s.id !== id)
  }
}

// シャドウをコピー
const duplicateShadow = (shadow: Shadow) => {
  const newShadow: Shadow = {
    ...shadow,
    id: Date.now().toString(),
  }
  shadows.value.push(newShadow)
}

// box-shadow CSS生成
const boxShadowCSS = computed(() => {
  return shadows.value
    .map((shadow) => {
      const inset = shadow.inset ? 'inset ' : ''
      const color = `${shadow.color}${Math.round(shadow.opacity * 2.55).toString(16).padStart(2, '0')}`
      return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${color}`
    })
    .join(', ')
})

// CSSコード
const cssCode = computed(() => {
  return `box-shadow: ${boxShadowCSS.value};
border-radius: ${borderRadius.value}px;`
})

// Tailwind CSS用のカスタムスタイル
const tailwindCode = computed(() => {
  return `style="box-shadow: ${boxShadowCSS.value}; border-radius: ${borderRadius.value}px;"`
})

// クリップボード操作
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast({
      title: 'コピーしました',
      description: '正常にコピーされました',
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

// プリセット
const presets = [
  {
    name: 'Soft Shadow',
    shadows: [
      { x: 0, y: 4, blur: 20, spread: -5, color: '#000000', opacity: 10, inset: false },
      { x: 0, y: 8, blur: 25, spread: -5, color: '#000000', opacity: 10, inset: false },
    ],
  },
  {
    name: 'Elevation',
    shadows: [
      { x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 12, inset: false },
      { x: 0, y: 2, blur: 6, spread: 0, color: '#000000', opacity: 8, inset: false },
    ],
  },
  {
    name: 'Neumorphism',
    shadows: [
      { x: 6, y: 6, blur: 12, spread: 0, color: '#000000', opacity: 15, inset: false },
      { x: -6, y: -6, blur: 12, spread: 0, color: '#ffffff', opacity: 70, inset: false },
    ],
  },
  {
    name: 'Inner Shadow',
    shadows: [
      { x: 0, y: 2, blur: 4, spread: -2, color: '#000000', opacity: 25, inset: true },
    ],
  },
  {
    name: 'Glowing',
    shadows: [
      { x: 0, y: 0, blur: 20, spread: 5, color: '#3b82f6', opacity: 50, inset: false },
    ],
  },
]

const applyPreset = (preset: typeof presets[0]) => {
  shadows.value = preset.shadows.map(s => ({
    ...s,
    id: Date.now().toString() + Math.random(),
  }))
}

// SEO設定
useSeoMeta({
  title: 'シャドウジェネレーター | Web開発ツール',
  description: 'box-shadowを視覚的に調整。複数のシャドウレイヤーに対応。',
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

      <h1 class="text-3xl font-bold mb-2">
        シャドウジェネレーター
      </h1>
      <p class="text-muted-foreground">
        box-shadowを視覚的に調整できます。複数のシャドウレイヤーに対応。
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
              class="flex items-center justify-center p-12 rounded-lg"
              :style="{ backgroundColor: boxBackground }">
              <div
                :style="{
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  backgroundColor: boxColor,
                  boxShadow: boxShadowCSS,
                  borderRadius: `${borderRadius}px`,
                }">
              </div>
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
                class="p-6 rounded-lg border hover:border-primary transition-colors"
                @click="applyPreset(preset)">
                <div
                  class="w-16 h-16 mx-auto mb-2 bg-white rounded"
                  :style="{
                    boxShadow: preset.shadows
                      .map(s => {
                        const inset = s.inset ? 'inset ' : ''
                        const color = `${s.color}${Math.round(s.opacity * 2.55).toString(16).padStart(2, '0')}`
                        return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${color}`
                      })
                      .join(', '),
                  }">
                </div>
                <div class="text-sm font-medium">
                  {{ preset.name }}
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
                <h4 class="text-sm font-medium">
                  CSS
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(cssCode)">
                  <Icon name="Copy" class="w-4 h-4" />
                </Button>
              </div>
              <div class="p-3 bg-muted rounded-md">
                <code class="text-sm whitespace-pre">{{ cssCode }}</code>
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
        <!-- ボックス設定 -->
        <Card>
          <CardHeader>
            <CardTitle>ボックス設定</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">ボックスカラー</label>
                <div class="flex gap-2">
                  <Input
                    v-model="boxColor"
                    type="color"
                    class="w-12 h-10 p-1 cursor-pointer" />
                  <Input
                    v-model="boxColor"
                    type="text"
                    class="flex-1" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">背景カラー</label>
                <div class="flex gap-2">
                  <Input
                    v-model="boxBackground"
                    type="color"
                    class="w-12 h-10 p-1 cursor-pointer" />
                  <Input
                    v-model="boxBackground"
                    type="text"
                    class="flex-1" />
                </div>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">
                ボックスサイズ: {{ boxSize }}px
              </label>
              <input
                v-model.number="boxSize"
                type="range"
                min="50"
                max="300"
                class="w-full">
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">
                角丸: {{ borderRadius }}px
              </label>
              <input
                v-model.number="borderRadius"
                type="range"
                min="0"
                max="50"
                class="w-full">
            </div>
          </CardContent>
        </Card>

        <!-- シャドウレイヤー -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>シャドウレイヤー</CardTitle>
              <Button
                size="sm"
                @click="addShadow">
                <Icon name="Plus" class="w-4 h-4 mr-1" />
                追加
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-4 max-h-[500px] overflow-y-auto">
            <div
              v-for="(shadow, index) in shadows"
              :key="shadow.id"
              class="p-4 border rounded-lg space-y-3">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium">
                  レイヤー {{ index + 1 }}
                </h4>
                <div class="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="duplicateShadow(shadow)">
                    <Icon name="Copy" class="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    :disabled="shadows.length <= 1"
                    @click="removeShadow(shadow.id)">
                    <Icon name="X" class="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs mb-1 block">X オフセット</label>
                  <Input
                    v-model.number="shadow.x"
                    type="number"
                    class="h-8" />
                </div>
                <div>
                  <label class="text-xs mb-1 block">Y オフセット</label>
                  <Input
                    v-model.number="shadow.y"
                    type="number"
                    class="h-8" />
                </div>
                <div>
                  <label class="text-xs mb-1 block">ぼかし</label>
                  <Input
                    v-model.number="shadow.blur"
                    type="number"
                    min="0"
                    class="h-8" />
                </div>
                <div>
                  <label class="text-xs mb-1 block">広がり</label>
                  <Input
                    v-model.number="shadow.spread"
                    type="number"
                    class="h-8" />
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <label class="text-xs mb-1 block">カラー</label>
                  <div class="flex gap-2">
                    <Input
                      v-model="shadow.color"
                      type="color"
                      class="w-10 h-8 p-1 cursor-pointer" />
                    <Input
                      v-model="shadow.color"
                      type="text"
                      class="flex-1 h-8" />
                  </div>
                </div>
                <div class="w-24">
                  <label class="text-xs mb-1 block">不透明度 {{ shadow.opacity }}%</label>
                  <input
                    v-model.number="shadow.opacity"
                    type="range"
                    min="0"
                    max="100"
                    class="w-full">
                </div>
                <div>
                  <label class="flex items-center gap-2 text-xs">
                    <input
                      v-model="shadow.inset"
                      type="checkbox"
                      class="rounded">
                    Inset
                  </label>
                </div>
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
