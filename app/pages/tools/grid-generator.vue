<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

interface GridItem {
  id: string
  name: string
  gridColumn: string
  gridRow: string
  backgroundColor: string
}

// 状態管理
const gridColumns = ref(3)
const gridRows = ref(3)
const columnGap = ref(16)
const rowGap = ref(16)
const gridTemplateColumns = ref('1fr 1fr 1fr')
const gridTemplateRows = ref('1fr 1fr 1fr')
const alignItems = ref('stretch')
const justifyItems = ref('stretch')
const alignContent = ref('stretch')
const justifyContent = ref('stretch')
const autoFlow = ref('row')
const autoColumns = ref('auto')
const autoRows = ref('auto')

// グリッドアイテム
const items = ref<GridItem[]>([
  { id: '1', name: 'Item 1', gridColumn: 'auto', gridRow: 'auto', backgroundColor: '#3b82f6' },
  { id: '2', name: 'Item 2', gridColumn: 'auto', gridRow: 'auto', backgroundColor: '#8b5cf6' },
  { id: '3', name: 'Item 3', gridColumn: 'auto', gridRow: 'auto', backgroundColor: '#10b981' },
  { id: '4', name: 'Item 4', gridColumn: 'auto', gridRow: 'auto', backgroundColor: '#f59e0b' },
  { id: '5', name: 'Item 5', gridColumn: 'auto', gridRow: 'auto', backgroundColor: '#ef4444' },
])

const selectedItemId = ref<string | null>(null)

// グリッドテンプレートの更新
watch([gridColumns, gridRows], () => {
  gridTemplateColumns.value = Array(gridColumns.value).fill('1fr').join(' ')
  gridTemplateRows.value = Array(gridRows.value).fill('1fr').join(' ')
})

// アイテムを追加
const addItem = () => {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6']
  const newItem: GridItem = {
    id: Date.now().toString(),
    name: `Item ${items.value.length + 1}`,
    gridColumn: 'auto',
    gridRow: 'auto',
    backgroundColor: colors[items.value.length % colors.length],
  }
  items.value.push(newItem)
}

// アイテムを削除
const removeItem = (id: string) => {
  items.value = items.value.filter(item => item.id !== id)
  if (selectedItemId.value === id) {
    selectedItemId.value = null
  }
}

// 選択されたアイテム
const selectedItem = computed(() => {
  return items.value.find(item => item.id === selectedItemId.value)
})

// グリッドスタイル
const gridStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: gridTemplateColumns.value,
    gridTemplateRows: gridTemplateRows.value,
    columnGap: `${columnGap.value}px`,
    rowGap: `${rowGap.value}px`,
    alignItems: alignItems.value,
    justifyItems: justifyItems.value,
    alignContent: alignContent.value,
    justifyContent: justifyContent.value,
    gridAutoFlow: autoFlow.value,
    gridAutoColumns: autoColumns.value,
    gridAutoRows: autoRows.value,
    minHeight: '400px',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    border: '2px dashed #d1d5db',
  }
})

// アイテムスタイル
const getItemStyle = (item: GridItem) => {
  return {
    gridColumn: item.gridColumn,
    gridRow: item.gridRow,
    backgroundColor: item.backgroundColor,
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: selectedItemId.value === item.id ? '3px solid #1e293b' : 'none',
  }
}

// CSS コード生成
const cssCode = computed(() => {
  let code = `.container {
  display: grid;
  grid-template-columns: ${gridTemplateColumns.value};
  grid-template-rows: ${gridTemplateRows.value};
  column-gap: ${columnGap.value}px;
  row-gap: ${rowGap.value}px;
  align-items: ${alignItems.value};
  justify-items: ${justifyItems.value};
  align-content: ${alignContent.value};
  justify-content: ${justifyContent.value};
  grid-auto-flow: ${autoFlow.value};
  grid-auto-columns: ${autoColumns.value};
  grid-auto-rows: ${autoRows.value};
}

`

  items.value.forEach((item, index) => {
    if (item.gridColumn !== 'auto' || item.gridRow !== 'auto') {
      code += `.item-${index + 1} {
  grid-column: ${item.gridColumn};
  grid-row: ${item.gridRow};
}

`
    }
  })

  return code.trim()
})

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

// プリセット
const presets = [
  {
    name: 'Holy Grail',
    grid: {
      gridTemplateColumns: '200px 1fr 200px',
      gridTemplateRows: 'auto 1fr auto',
      items: [
        { gridColumn: '1 / -1', gridRow: '1', name: 'Header' },
        { gridColumn: '1', gridRow: '2', name: 'Sidebar' },
        { gridColumn: '2', gridRow: '2', name: 'Main' },
        { gridColumn: '3', gridRow: '2', name: 'Aside' },
        { gridColumn: '1 / -1', gridRow: '3', name: 'Footer' },
      ],
    },
  },
  {
    name: 'Card Grid',
    grid: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gridTemplateRows: 'auto',
      columnGap: 20,
      rowGap: 20,
    },
  },
  {
    name: 'Dashboard',
    grid: {
      gridTemplateColumns: '250px 1fr 1fr',
      gridTemplateRows: '60px 1fr 1fr',
      items: [
        { gridColumn: '1 / -1', gridRow: '1', name: 'Header' },
        { gridColumn: '1', gridRow: '2 / -1', name: 'Sidebar' },
        { gridColumn: '2', gridRow: '2', name: 'Chart 1' },
        { gridColumn: '3', gridRow: '2', name: 'Chart 2' },
        { gridColumn: '2 / -1', gridRow: '3', name: 'Table' },
      ],
    },
  },
  {
    name: 'Magazine',
    grid: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(3, 200px)',
      items: [
        { gridColumn: '1 / 3', gridRow: '1 / 3', name: 'Feature' },
        { gridColumn: '3', gridRow: '1', name: 'Article 1' },
        { gridColumn: '4', gridRow: '1', name: 'Article 2' },
        { gridColumn: '3 / -1', gridRow: '2', name: 'Article 3' },
        { gridColumn: '1 / -1', gridRow: '3', name: 'Footer' },
      ],
    },
  },
]

const applyPreset = (preset: typeof presets[0]) => {
  gridTemplateColumns.value = preset.grid.gridTemplateColumns
  gridTemplateRows.value = preset.grid.gridTemplateRows || '1fr 1fr 1fr'

  if (preset.grid.columnGap !== undefined) columnGap.value = preset.grid.columnGap
  if (preset.grid.rowGap !== undefined) rowGap.value = preset.grid.rowGap

  if (preset.grid.items) {
    items.value = preset.grid.items.map((item, index) => ({
      id: (index + 1).toString(),
      name: item.name,
      gridColumn: item.gridColumn || 'auto',
      gridRow: item.gridRow || 'auto',
      backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5],
    }))
  }
}

// SEO設定
useSeoMeta({
  title: 'CSS Gridジェネレーター | Web開発ツール',
  description: 'CSS Gridレイアウトを視覚的に作成。プリセットレイアウトとカスタマイズ機能。',
})
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        CSS Gridジェネレーター
      </h1>
      <p class="text-muted-foreground">
        CSS Gridレイアウトを視覚的に作成できます。
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
      <!-- グリッド設定 -->
      <Card>
        <CardHeader>
          <CardTitle>グリッド設定</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- grid-template-columns -->
          <div>
            <label class="text-sm font-medium mb-2 block">grid-template-columns</label>
            <Input
              v-model="gridTemplateColumns"
              placeholder="1fr 1fr 1fr" />
          </div>

          <!-- grid-template-rows -->
          <div>
            <label class="text-sm font-medium mb-2 block">grid-template-rows</label>
            <Input
              v-model="gridTemplateRows"
              placeholder="1fr 1fr 1fr" />
          </div>

          <!-- gap -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium mb-2 block">
                column-gap: {{ columnGap }}px
              </label>
              <Slider
                :model-value="[columnGap]"
                :min="0"
                :max="50"
                :step="1"
                @update:model-value="columnGap = $event[0]" />
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">
                row-gap: {{ rowGap }}px
              </label>
              <Slider
                :model-value="[rowGap]"
                :min="0"
                :max="50"
                :step="1"
                @update:model-value="rowGap = $event[0]" />
            </div>
          </div>

          <!-- align-items -->
          <div>
            <label class="text-sm font-medium mb-2 block">align-items</label>
            <select
              v-model="alignItems"
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="stretch">
                stretch
              </option>
              <option value="start">
                start
              </option>
              <option value="end">
                end
              </option>
              <option value="center">
                center
              </option>
              <option value="baseline">
                baseline
              </option>
            </select>
          </div>

          <!-- justify-items -->
          <div>
            <label class="text-sm font-medium mb-2 block">justify-items</label>
            <select
              v-model="justifyItems"
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="stretch">
                stretch
              </option>
              <option value="start">
                start
              </option>
              <option value="end">
                end
              </option>
              <option value="center">
                center
              </option>
            </select>
          </div>

          <!-- grid-auto-flow -->
          <div>
            <label class="text-sm font-medium mb-2 block">grid-auto-flow</label>
            <select
              v-model="autoFlow"
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="row">
                row
              </option>
              <option value="column">
                column
              </option>
              <option value="row dense">
                row dense
              </option>
              <option value="column dense">
                column dense
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      <!-- アイテム設定 -->
      <Card v-if="selectedItem">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>{{ selectedItem.name }}の設定</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              @click="removeItem(selectedItemId!)">
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 名前 -->
          <div>
            <label class="text-sm font-medium mb-2 block">名前</label>
            <Input
              v-model="selectedItem.name" />
          </div>

          <!-- grid-column -->
          <div>
            <label class="text-sm font-medium mb-2 block">grid-column</label>
            <Input
              v-model="selectedItem.gridColumn"
              placeholder="auto, 1 / 3, span 2..." />
          </div>

          <!-- grid-row -->
          <div>
            <label class="text-sm font-medium mb-2 block">grid-row</label>
            <Input
              v-model="selectedItem.gridRow"
              placeholder="auto, 1 / 3, span 2..." />
          </div>

          <!-- 背景色 -->
          <div>
            <label class="text-sm font-medium mb-2 block">背景色</label>
            <div class="flex gap-2">
              <Input
                v-model="selectedItem.backgroundColor"
                type="color"
                class="w-12 h-9 p-1 cursor-pointer" />
              <Input
                v-model="selectedItem.backgroundColor"
                type="text"
                class="flex-1" />
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
          <div :style="gridStyle">
            <div
              v-for="item in items"
              :key="item.id"
              :style="getItemStyle(item)"
              class="hover:opacity-90"
              @click="selectedItemId = item.id">
              <span class="font-medium">{{ item.name }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 生成されたCSS -->
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
