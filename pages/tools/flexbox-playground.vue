<script setup lang="ts">
import { ref, computed } from 'vue'

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
const containerStyle = computed(() => {
  return {
    display: containerProps.value.display,
    flexDirection: containerProps.value.flexDirection,
    flexWrap: containerProps.value.flexWrap,
    justifyContent: containerProps.value.justifyContent,
    alignItems: containerProps.value.alignItems,
    alignContent: containerProps.value.alignContent,
    gap: `${containerProps.value.gap}px`,
    minHeight: '400px',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    border: '2px dashed #d1d5db',
  }
})

// アイテムのスタイル
const getItemStyle = (item: typeof items.value[0]) => {
  return {
    order: item.order,
    flexGrow: item.flexGrow,
    flexShrink: item.flexShrink,
    flexBasis: item.flexBasis === 'auto' ? 'auto' : `${item.flexBasis}px`,
    alignSelf: item.alignSelf,
    backgroundColor: selectedItemId.value === item.id ? '#3b82f6' : '#6366f1',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '60px',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
}

// CSSコード生成
const cssCode = computed(() => {
  let code = `.container {
  display: ${containerProps.value.display};
  flex-direction: ${containerProps.value.flexDirection};
  flex-wrap: ${containerProps.value.flexWrap};
  justify-content: ${containerProps.value.justifyContent};
  align-items: ${containerProps.value.alignItems};
  align-content: ${containerProps.value.alignContent};
  gap: ${containerProps.value.gap}px;
}

`

  items.value.forEach((item, index) => {
    code += `.item-${index + 1} {
  order: ${item.order};
  flex-grow: ${item.flexGrow};
  flex-shrink: ${item.flexShrink};
  flex-basis: ${item.flexBasis};
  align-self: ${item.alignSelf};
}

`
  })

  return code.trim()
})

// クリップボード操作
const { toast } = useToast()

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(cssCode.value)
    toast({
      title: 'コピーしました',
      description: 'CSSコードをクリップボードにコピーしました',
    })
  } catch (err) {
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
    name: '中央揃え',
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  {
    name: '均等配置',
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  {
    name: '縦並び',
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
  },
  {
    name: 'ラップ',
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },
  },
]

const applyPreset = (preset: typeof presets[0]) => {
  Object.assign(containerProps.value, preset.container)
}

// SEO設定
useSeoMeta({
  title: 'Flexboxプレイグラウンド | Web開発ツール',
  description: 'Flexboxのプロパティを視覚的に学習。リアルタイムプレビューとコード生成。',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div class="mb-8">
      <NuxtLink
        to="/tools"
        class="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <Icon name="ChevronLeft" class="w-4 h-4 mr-1" />
        ツール一覧に戻る
      </NuxtLink>
      
      <h1 class="text-3xl font-bold mb-2">Flexboxプレイグラウンド</h1>
      <p class="text-muted-foreground">
        Flexboxのプロパティを視覚的に学習できます。
      </p>
    </div>

    <div class="grid lg:grid-cols-[1fr_350px] gap-8">
      <!-- メインエリア -->
      <div class="space-y-6">
        <!-- プレビュー -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>プレビュー</CardTitle>
              <Button
                size="sm"
                @click="addItem">
                <Icon name="Plus" class="w-4 h-4 mr-1" />
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
                @click="selectedItemId = item.id"
                class="hover:opacity-90">
                <span class="font-bold text-lg">{{ item.id }}</span>
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
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
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

        <!-- 生成されたコード -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>生成されたCSS</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard">
                <Icon name="Copy" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-4 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ cssCode }}</code></pre>
          </CardContent>
        </Card>
      </div>

      <!-- コントロールパネル -->
      <div class="space-y-6">
        <!-- コンテナー設定 -->
        <Card>
          <CardHeader>
            <CardTitle>コンテナー設定</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- flex-direction -->
            <div>
              <label class="text-sm font-medium mb-2 block">flex-direction</label>
              <select
                v-model="containerProps.flexDirection"
                class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="row">row</option>
                <option value="row-reverse">row-reverse</option>
                <option value="column">column</option>
                <option value="column-reverse">column-reverse</option>
              </select>
            </div>

            <!-- flex-wrap -->
            <div>
              <label class="text-sm font-medium mb-2 block">flex-wrap</label>
              <select
                v-model="containerProps.flexWrap"
                class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="nowrap">nowrap</option>
                <option value="wrap">wrap</option>
                <option value="wrap-reverse">wrap-reverse</option>
              </select>
            </div>

            <!-- justify-content -->
            <div>
              <label class="text-sm font-medium mb-2 block">justify-content</label>
              <select
                v-model="containerProps.justifyContent"
                class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="space-evenly">space-evenly</option>
              </select>
            </div>

            <!-- align-items -->
            <div>
              <label class="text-sm font-medium mb-2 block">align-items</label>
              <select
                v-model="containerProps.alignItems"
                class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="baseline">baseline</option>
                <option value="stretch">stretch</option>
              </select>
            </div>

            <!-- align-content -->
            <div>
              <label class="text-sm font-medium mb-2 block">align-content</label>
              <select
                v-model="containerProps.alignContent"
                class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="stretch">stretch</option>
              </select>
            </div>

            <!-- gap -->
            <div>
              <label class="text-sm font-medium mb-2 block">
                gap: {{ containerProps.gap }}px
              </label>
              <input
                v-model.number="containerProps.gap"
                type="range"
                min="0"
                max="50"
                class="w-full">
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
                @click="removeItem(selectedItemId!)"
                :disabled="items.length <= 1">
                <Icon name="Trash2" class="w-4 h-4" />
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
              <input
                v-model.number="selectedItem.flexGrow"
                type="range"
                min="0"
                max="5"
                step="1"
                class="w-full">
            </div>

            <!-- flex-shrink -->
            <div>
              <label class="text-sm font-medium mb-2 block">
                flex-shrink: {{ selectedItem.flexShrink }}
              </label>
              <input
                v-model.number="selectedItem.flexShrink"
                type="range"
                min="0"
                max="5"
                step="1"
                class="w-full">
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
              <select
                v-model="selectedItem.alignSelf"
                class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="auto">auto</option>
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="baseline">baseline</option>
                <option value="stretch">stretch</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div v-else class="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
          アイテムをクリックして編集
        </div>
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