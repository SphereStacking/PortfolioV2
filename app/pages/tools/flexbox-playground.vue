<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})
// Flexboxプロパティの定義
const containerProps = ref({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  gap: '10',
})

const items = ref([
  { id: 1, order: 0, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto' },
  { id: 2, order: 0, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto' },
  { id: 3, order: 0, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto' },
])

const selectedItemId = ref<number | null>(null)

// アイテムを追加
const addItem = () => {
  const newId = Math.max(...items.value.map(i => i.id)) + 1
  items.value.push({
    id: newId,
    order: 0,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'auto',
  })
}

// アイテムを削除
const removeItem = (id: number) => {
  if (items.value.length > 1) {
    items.value = items.value.filter(item => item.id !== id)
    if (selectedItemId.value === id) {
      selectedItemId.value = null
    }
  }
}

// 選択されたアイテム
const selectedItem = computed(() => {
  return items.value.find(item => item.id === selectedItemId.value)
})

// コンテナーのスタイル
const containerStyle = computed(() => ({
  display: containerProps.value.display,
  flexDirection: containerProps.value.flexDirection,
  flexWrap: containerProps.value.flexWrap,
  justifyContent: containerProps.value.justifyContent,
  alignItems: containerProps.value.alignItems,
  alignContent: containerProps.value.alignContent,
  gap: `${containerProps.value.gap}px`,
  minHeight: '300px',
  padding: '20px',
  backgroundColor: '#f3f4f6',
  border: '2px dashed #d1d5db',
  borderRadius: '8px',
}))

// アイテムのスタイル
const getItemStyle = (item: typeof items.value[0]) => ({
  order: item.order,
  flexGrow: item.flexGrow,
  flexShrink: item.flexShrink,
  flexBasis: item.flexBasis,
  alignSelf: item.alignSelf,
  backgroundColor: selectedItemId.value === item.id ? '#3b82f6' : '#8b5cf6',
  color: 'white',
  padding: '20px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minWidth: '60px',
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

// CSS コード生成
const cssCode = computed(() => {
  let code = `.container {
  display: ${containerProps.value.display};
  flex-direction: ${containerProps.value.flexDirection};
  flex-wrap: ${containerProps.value.flexWrap};
  justify-content: ${containerProps.value.justifyContent};
  align-items: ${containerProps.value.alignItems};
  align-content: ${containerProps.value.alignContent};
  gap: ${containerProps.value.gap}px;
}\n\n`

  items.value.forEach((item, index) => {
    const hasCustomProps = item.order !== 0 || item.flexGrow !== 0 || item.flexShrink !== 1 || item.flexBasis !== 'auto' || item.alignSelf !== 'auto'

    if (hasCustomProps) {
      code += `.item-${index + 1} {`
      if (item.order !== 0) code += `\n  order: ${item.order};`
      if (item.flexGrow !== 0) code += `\n  flex-grow: ${item.flexGrow};`
      if (item.flexShrink !== 1) code += `\n  flex-shrink: ${item.flexShrink};`
      if (item.flexBasis !== 'auto') code += `\n  flex-basis: ${item.flexBasis};`
      if (item.alignSelf !== 'auto') code += `\n  align-self: ${item.alignSelf};`
      code += '\n}\n\n'
    }
  })

  return code.trim()
})

// プリセット
const presets = [
  {
    name: 'センター',
    container: { justifyContent: 'center', alignItems: 'center' },
  },
  {
    name: '等間隔',
    container: { justifyContent: 'space-between' },
  },
  {
    name: '等間隔（周囲も）',
    container: { justifyContent: 'space-around' },
  },
  {
    name: '等間隔（均等）',
    container: { justifyContent: 'space-evenly' },
  },
  {
    name: '縦並び',
    container: { flexDirection: 'column' },
  },
  {
    name: '折り返し',
    container: { flexWrap: 'wrap' },
  },
  {
    name: '逆順',
    container: { flexDirection: 'row-reverse' },
  },
  {
    name: 'カード',
    container: { flexWrap: 'wrap', gap: '20' },
    items: [
      { flexGrow: 1, flexBasis: '300px' },
      { flexGrow: 1, flexBasis: '300px' },
      { flexGrow: 1, flexBasis: '300px' },
    ],
  },
]

const applyPreset = (preset: typeof presets[0]) => {
  if (preset.container) {
    Object.assign(containerProps.value, preset.container)
  }
  if (preset.items) {
    preset.items.forEach((itemProps, index) => {
      if (items.value[index]) {
        Object.assign(items.value[index], itemProps)
      }
    })
  }
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async () => {
  try {
    await copy(cssCode.value)
    toast({
      title: 'コピーしました',
      description: 'CSSコードをクリップボードにコピーしました',
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
  title: 'Flexboxプレイグラウンド | Web開発ツール',
  description: 'Flexboxのプロパティを視覚的に学習。リアルタイムでプレビューを確認しながらCSSを生成。',
})
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        Flexboxプレイグラウンド
      </h1>
      <p class="text-muted-foreground">
        Flexboxのプロパティを視覚的に学習できます。
      </p>
    </div>

    <!-- プリセット -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-4 gap-3">
          <Button
            v-for="preset in presets"
            :key="preset.name"
            variant="outline"
            size="sm"
            @click="applyPreset(preset)">
            {{ preset.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 左側：コントロールパネル -->
    <div class="space-y-6 col-span-1">
      <!-- コンテナー設定 -->
      <Card>
        <CardHeader>
          <CardTitle>コンテナー設定</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- flex-direction -->
          <div>
            <label class="text-sm font-medium mb-2 block">flex-direction</label>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="value in ['row', 'row-reverse', 'column', 'column-reverse']"
                :key="value"
                :variant="containerProps.flexDirection === value ? 'default' : 'outline'"
                size="sm"
                @click="containerProps.flexDirection = value">
                {{ value }}
              </Button>
            </div>
          </div>

          <!-- flex-wrap -->
          <div>
            <label class="text-sm font-medium mb-2 block">flex-wrap</label>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="value in ['nowrap', 'wrap', 'wrap-reverse']"
                :key="value"
                :variant="containerProps.flexWrap === value ? 'default' : 'outline'"
                size="sm"
                @click="containerProps.flexWrap = value">
                {{ value }}
              </Button>
            </div>
          </div>

          <!-- justify-content -->
          <div>
            <label class="text-sm font-medium mb-2 block">justify-content</label>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="value in ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']"
                :key="value"
                :variant="containerProps.justifyContent === value ? 'default' : 'outline'"
                size="sm"
                class="text-xs"
                @click="containerProps.justifyContent = value">
                {{ value }}
              </Button>
            </div>
          </div>

          <!-- align-items -->
          <div>
            <label class="text-sm font-medium mb-2 block">align-items</label>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="value in ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']"
                :key="value"
                :variant="containerProps.alignItems === value ? 'default' : 'outline'"
                size="sm"
                @click="containerProps.alignItems = value">
                {{ value }}
              </Button>
            </div>
          </div>

          <!-- align-content -->
          <div>
            <label class="text-sm font-medium mb-2 block">align-content</label>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="value in ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around']"
                :key="value"
                :variant="containerProps.alignContent === value ? 'default' : 'outline'"
                size="sm"
                class="text-xs"
                @click="containerProps.alignContent = value">
                {{ value }}
              </Button>
            </div>
          </div>

          <!-- gap -->
          <div>
            <label class="text-sm font-medium mb-2 block">
              gap: {{ containerProps.gap }}px
            </label>
            <Slider
              :model-value="[containerProps.gap]"
              :min="0"
              :max="50"
              :step="1"
              @update:model-value="containerProps.gap = $event[0]" />
          </div>
        </CardContent>
      </Card>

      <!-- アイテム設定 -->
      <Card v-if="selectedItem">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>アイテム {{ selectedItemId }} の設定</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              :disabled="items.length <= 1"
              @click="removeItem(selectedItemId!)">
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- order -->
          <div>
            <label class="text-sm font-medium mb-2 block">order</label>
            <Input
              v-model.number="selectedItem.order"
              type="number"
              class="h-9" />
          </div>

          <!-- flex-grow -->
          <div>
            <label class="text-sm font-medium mb-2 block">
              flex-grow: {{ selectedItem.flexGrow }}
            </label>
            <Slider
              :model-value="[selectedItem.flexGrow]"
              :min="0"
              :max="5"
              :step="1"
              @update:model-value="selectedItem.flexGrow = $event[0]" />
          </div>

          <!-- flex-shrink -->
          <div>
            <label class="text-sm font-medium mb-2 block">
              flex-shrink: {{ selectedItem.flexShrink }}
            </label>
            <Slider
              :model-value="[selectedItem.flexShrink]"
              :min="0"
              :max="5"
              :step="1"
              @update:model-value="selectedItem.flexShrink = $event[0]" />
          </div>

          <!-- flex-basis -->
          <div>
            <label class="text-sm font-medium mb-2 block">flex-basis</label>
            <Input
              v-model="selectedItem.flexBasis"
              placeholder="auto, 100px, 50%..."
              class="h-9" />
          </div>

          <!-- align-self -->
          <div>
            <label class="text-sm font-medium mb-2 block">align-self</label>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="value in ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch']"
                :key="value"
                :variant="selectedItem.alignSelf === value ? 'default' : 'outline'"
                size="sm"
                @click="selectedItem.alignSelf = value">
                {{ value }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div v-else class="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
        アイテムをクリックして編集
      </div>
    </div>

    <!-- 右側：メインエリア -->
    <div class="space-y-6 col-span-2">
      <!-- プレビュー -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>プレビュー</CardTitle>
            <Button
              size="sm"
              @click="addItem">
              <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
              アイテム追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div :style="containerStyle">
            <div
              v-for="item in items"
              :key="item.id"
              :style="getItemStyle(item)"
              class="hover:opacity-90"
              @click="selectedItemId = item.id">
              <span class="font-bold text-lg">{{ item.id }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 生成されたコード -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>生成されたCSS</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              @click="copyToClipboard">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre class="p-4 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ cssCode }}</code></pre>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
