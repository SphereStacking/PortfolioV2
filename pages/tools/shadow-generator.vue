<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Slider } from '~/components/ui/slider'

definePageMeta({
  layout: 'tools',
})

interface Shadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

// シャドウの初期値
const shadows = ref<Shadow[]>([
  {
    x: 0,
    y: 10,
    blur: 20,
    spread: 0,
    color: '#000000',
    opacity: 20,
    inset: false,
  },
])

// シャドウプリセット
const shadowPresets = [
  {
    label: 'Soft',
    value: [{ x: 0, y: 4, blur: 6, spread: -1, color: '#3b82f6', opacity: 20, inset: false }],
  },
  {
    label: 'Medium',
    value: [{ x: 0, y: 10, blur: 15, spread: -3, color: '#8b5cf6', opacity: 30, inset: false }],
  },
  {
    label: 'Large',
    value: [{ x: 0, y: 20, blur: 25, spread: -5, color: '#ec4899', opacity: 40, inset: false }],
  },
  {
    label: 'Material',
    value: [
      { x: 0, y: 2, blur: 4, spread: -1, color: '#6366f1', opacity: 25, inset: false },
      { x: 0, y: 4, blur: 6, spread: -1, color: '#7c3aed', opacity: 20, inset: false },
    ],
  },
  {
    label: 'Neumorphism',
    value: [
      { x: 10, y: 10, blur: 20, spread: 0, color: '#a78bfa', opacity: 60, inset: false },
      { x: -10, y: -10, blur: 20, spread: 0, color: '#fbbf24', opacity: 40, inset: false },
    ],
  },
  {
    label: 'Inset',
    value: [{ x: 0, y: 2, blur: 4, spread: 0, color: '#10b981', opacity: 35, inset: true }],
  },
]

const selectPreset = (preset: Shadow[]) => {
  shadows.value = preset.map(s => ({ ...s }))
}

// ボックス設定
const boxSize = ref(150)
const boxColor = ref('#ffffff')
const boxBackground = ref('#f3f4f6')
const borderRadius = ref(8)

// シャドウを追加
const addShadow = () => {
  shadows.value.push({
    x: 0,
    y: 10,
    blur: 20,
    spread: 0,
    color: '#000000',
    opacity: 20,
    inset: false,
  })
}

// シャドウを削除
const removeShadow = (index: number) => {
  if (shadows.value.length > 1) {
    shadows.value.splice(index, 1)
  }
}

// box-shadowのCSS生成
const boxShadowCSS = computed(() => {
  return shadows.value
    .map((shadow) => {
      const inset = shadow.inset ? 'inset ' : ''
      const color = `${shadow.color}${Math.round(shadow.opacity * 2.55).toString(16).padStart(2, '0')}`
      return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${color}`
    })
    .join(', ')
})

// CSSコード生成
const cssCode = computed(() => {
  return `box-shadow: ${boxShadowCSS.value};
border-radius: ${borderRadius.value}px;`
})

// Tailwind CSS用のカスタムスタイル
const tailwindCode = computed(() => {
  // Tailwind CSSのユーティリティクラス
  const roundedClass = borderRadius.value <= 4 ? 'rounded' : borderRadius.value <= 8 ? 'rounded-lg' : 'rounded-xl'

  // シンプルなシャドウの場合はTailwindクラスを提案
  if (shadows.value.length === 1 && !shadows.value[0].inset) {
    const shadow = shadows.value[0]
    if (shadow.x === 0 && shadow.y <= 4 && shadow.blur <= 6) {
      return `shadow-lg ${roundedClass}`
    }
  }

  // 複雑なシャドウはカスタムクラスとして提案
  return `shadow-[${boxShadowCSS.value.replace(/,/g, '_')}] ${roundedClass}`
})

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
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

// SEO設定
useSeoMeta({
  title: 'シャドウジェネレーター | Web開発ツール',
  description: 'box-shadowを視覚的に調整。複数のシャドウレイヤーに対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        シャドウジェネレーター
      </h1>
      <p class="text-muted-foreground">
        box-shadowを視覚的に調整できます。複数のシャドウレイヤーに対応。
      </p>
    </div>

    <!-- プリセットセクション -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-6 gap-3">
          <button
            v-for="preset in shadowPresets"
            :key="preset.label"
            class="p-4 rounded-lg border hover:border-primary transition-colors text-center"
            @click="selectPreset(preset.value)">
            <div
              class="w-12 h-12 mx-auto mb-2 bg-white rounded"
              :style="{
                boxShadow: preset.value
                  .map(s => {
                    const inset = s.inset ? 'inset ' : ''
                    const color = `${s.color}${Math.round(s.opacity * 2.55).toString(16).padStart(2, '0')}`
                    return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${color}`
                  })
                  .join(', '),
              }">
            </div>
            <div class="text-xs font-medium">
              {{ preset.label }}
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
    <!-- 左側：コントロールパネル -->
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
            <Slider
              :model-value="[boxSize]"
              :min="50"
              :max="300"
              :step="1"
              @update:model-value="(value) => { if (value) boxSize = value[0] }" />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">
              角丸: {{ borderRadius }}px
            </label>
            <Slider
              :model-value="[borderRadius]"
              :min="0"
              :max="50"
              :step="1"
              @update:model-value="(value) => { if (value) borderRadius = value[0] }" />
          </div>
        </CardContent>
      </Card>

      <!-- シャドウ設定 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>シャドウ設定</CardTitle>
            <Button
              size="sm"
              @click="addShadow">
              <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
              追加
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="(shadow, index) in shadows"
            :key="index"
            class="p-4 rounded-lg border space-y-3">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium">
                シャドウ {{ index + 1 }}
              </h4>
              <Button
                v-if="shadows.length > 1"
                size="sm"
                variant="ghost"
                @click="removeShadow(index)">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs mb-1 block">X: {{ shadow.x }}px</label>
                <Slider
                  :model-value="[shadow.x]"
                  :min="-100"
                  :max="100"
                  :step="1"
                  @update:model-value="(value) => { if (value) shadow.x = value[0] }" />
              </div>
              <div>
                <label class="text-xs mb-1 block">Y: {{ shadow.y }}px</label>
                <Slider
                  :model-value="[shadow.y]"
                  :min="-100"
                  :max="100"
                  :step="1"
                  @update:model-value="(value) => { if (value) shadow.y = value[0] }" />
              </div>
              <div>
                <label class="text-xs mb-1 block">ぼかし: {{ shadow.blur }}px</label>
                <Slider
                  :model-value="[shadow.blur]"
                  :min="0"
                  :max="100"
                  :step="1"
                  @update:model-value="(value) => { if (value) shadow.blur = value[0] }" />
              </div>
              <div>
                <label class="text-xs mb-1 block">広がり: {{ shadow.spread }}px</label>
                <Slider
                  :model-value="[shadow.spread]"
                  :min="-50"
                  :max="50"
                  :step="1"
                  @update:model-value="(value) => { if (value) shadow.spread = value[0] }" />
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
                <Slider
                  :model-value="[shadow.opacity]"
                  :min="0"
                  :max="100"
                  :step="1"
                  @update:model-value="(value) => { if (value) shadow.opacity = value[0] }" />
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

    <!-- 右側：プレビューと結果 -->
    <div class="space-y-6">
      <!-- プレビュー -->
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
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="p-3 bg-muted rounded-md">
              <code class="text-sm">{{ tailwindCode }}</code>
            </div>
            <p class="text-xs text-muted-foreground mt-2">
              ※ 複雑なシャドウはstyle属性で指定: style="{{ boxShadowCSS }}"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
