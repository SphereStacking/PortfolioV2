<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const rows = ref(3)
const columns = ref(3)
const alignment = ref<'left' | 'center' | 'right'>('left')
const hasHeader = ref(true)
const cellPadding = ref(1)

// Slider用の配列値
const rowsArray = computed({
  get: () => [rows.value],
  set: (val) => { rows.value = val[0] },
})

const columnsArray = computed({
  get: () => [columns.value],
  set: (val) => { columns.value = val[0] },
})

// テーブルデータ
const tableData = ref<string[][]>([
  ['ヘッダー1', 'ヘッダー2', 'ヘッダー3'],
  ['セル1-1', 'セル1-2', 'セル1-3'],
  ['セル2-1', 'セル2-2', 'セル2-3'],
  ['セル3-1', 'セル3-2', 'セル3-3'],
])

// テーブルサイズの変更を監視
watch([rows, columns], ([newRows, newCols]) => {
  const currentRows = tableData.value.length
  const currentCols = tableData.value[0]?.length || 0

  // 行の調整
  if (newRows > currentRows) {
    for (let i = currentRows; i < newRows; i++) {
      tableData.value.push(Array(currentCols).fill(''))
    }
  }
  else if (newRows < currentRows) {
    tableData.value = tableData.value.slice(0, newRows)
  }

  // 列の調整
  if (newCols > currentCols) {
    tableData.value = tableData.value.map((row) => {
      const newRow = [...row]
      for (let i = currentCols; i < newCols; i++) {
        newRow.push('')
      }
      return newRow
    })
  }
  else if (newCols < currentCols) {
    tableData.value = tableData.value.map(row => row.slice(0, newCols))
  }
})

// Markdownテーブルの生成
const generateMarkdown = computed(() => {
  if (tableData.value.length === 0 || tableData.value[0].length === 0) {
    return ''
  }

  const padding = ' '.repeat(cellPadding.value)
  const dataToUse = hasHeader.value ? tableData.value : [Array(columns.value).fill(''), ...tableData.value]

  // 各列の最大幅を計算
  const columnWidths = Array(columns.value).fill(0)
  dataToUse.forEach((row) => {
    row.forEach((cell, colIndex) => {
      columnWidths[colIndex] = Math.max(columnWidths[colIndex], cell.length)
    })
  })

  // ヘッダー行
  let markdown = '|'
  const headerRow = hasHeader.value ? tableData.value[0] : Array(columns.value).fill('')
  headerRow.forEach((cell, i) => {
    const cellContent = padding + cell.padEnd(columnWidths[i]) + padding
    markdown += cellContent + '|'
  })
  markdown += '\n'

  // 区切り行
  markdown += '|'
  for (let i = 0; i < columns.value; i++) {
    const separatorLength = columnWidths[i] + cellPadding.value * 2
    let separator = '-'.repeat(separatorLength)

    if (alignment.value === 'center') {
      separator = ':' + separator.slice(1, -1) + ':'
    }
    else if (alignment.value === 'right') {
      separator = separator.slice(0, -1) + ':'
    }
    else {
      separator = ':' + separator.slice(1)
    }

    markdown += separator + '|'
  }
  markdown += '\n'

  // データ行
  const dataRows = hasHeader.value ? tableData.value.slice(1) : tableData.value
  dataRows.forEach((row) => {
    markdown += '|'
    row.forEach((cell, i) => {
      const cellContent = padding + cell.padEnd(columnWidths[i]) + padding
      markdown += cellContent + '|'
    })
    markdown += '\n'
  })

  return markdown
})

// テーブルプレビュー用データ
const previewHeaders = computed(() => {
  if (!hasHeader.value || tableData.value.length === 0) return []
  return tableData.value[0]
})

const previewRows = computed(() => {
  if (tableData.value.length === 0) return []
  return hasHeader.value ? tableData.value.slice(1) : tableData.value
})

// CSVからのインポート
const importCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n')
  const newData: string[][] = []

  lines.forEach((line) => {
    const cells = line.split(',').map(cell => cell.trim())
    newData.push(cells)
  })

  if (newData.length > 0) {
    rows.value = newData.length
    columns.value = newData[0].length
    tableData.value = newData
  }
}

// ファイル読み込み
const loadFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    importCSV(content)
  }
  reader.readAsText(file)
}

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

// サンプルテーブル
const sampleTables = [
  {
    name: '商品リスト',
    data: [
      ['商品名', '価格', '在庫'],
      ['ノートPC', '¥120,000', '5'],
      ['マウス', '¥3,000', '20'],
      ['キーボード', '¥8,000', '15'],
    ],
  },
  {
    name: 'APIレスポンス',
    data: [
      ['ステータスコード', '説明', '用途'],
      ['200', 'OK', '成功'],
      ['404', 'Not Found', 'リソースが見つからない'],
      ['500', 'Internal Server Error', 'サーバーエラー'],
    ],
  },
  {
    name: '比較表',
    data: [
      ['機能', 'Free', 'Pro', 'Enterprise'],
      ['ユーザー数', '1', '10', '無制限'],
      ['ストレージ', '1GB', '100GB', '無制限'],
      ['サポート', 'なし', 'メール', '24時間対応'],
    ],
  },
]

const loadSample = (sample: typeof sampleTables[0]) => {
  rows.value = sample.data.length
  columns.value = sample.data[0].length
  tableData.value = sample.data
  hasHeader.value = true
}

// 行と列の操作
const addRow = () => {
  rows.value++
}

const removeRow = () => {
  if (rows.value > 1) rows.value--
}

const addColumn = () => {
  columns.value++
}

const removeColumn = () => {
  if (columns.value > 1) columns.value--
}

// SEO設定
useSeoMeta({
  title: 'Markdownテーブル生成 | Web開発ツール',
  description: 'GUIでMarkdownテーブルを簡単作成。CSVインポートや配置調整も可能。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        Markdownテーブル生成
      </h1>
      <p class="text-muted-foreground">
        視覚的にMarkdownテーブルを作成します。セルを編集してリアルタイムでMarkdownを生成。
      </p>
    </div>

    <!-- サンプル -->
    <Card>
      <CardHeader>
        <CardTitle>サンプルテーブル</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleTables"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- テーブル設定 -->
    <Card>
      <CardHeader>
        <CardTitle>テーブル設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">
              行数: {{ rows }}
            </label>
            <div class="flex gap-2">
              <Button size="sm" variant="outline" @click="removeRow">
                <Icon name="heroicons:minus" class="w-4 h-4" />
              </Button>
              <Slider
                v-model="rowsArray"
                :min="1"
                :max="20"
                :step="1"
                class="flex-1" />
              <Button size="sm" variant="outline" @click="addRow">
                <Icon name="heroicons:plus" class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              列数: {{ columns }}
            </label>
            <div class="flex gap-2">
              <Button size="sm" variant="outline" @click="removeColumn">
                <Icon name="heroicons:minus" class="w-4 h-4" />
              </Button>
              <Slider
                v-model="columnsArray"
                :min="1"
                :max="10"
                :step="1"
                class="flex-1" />
              <Button size="sm" variant="outline" @click="addColumn">
                <Icon name="heroicons:plus" class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">配置</label>
            <div class="flex gap-1">
              <Button
                v-for="align in ['left', 'center', 'right'] as const"
                :key="align"
                size="sm"
                :variant="alignment === align ? 'default' : 'outline'"
                @click="alignment = align">
                <Icon
                  :name="`heroicons:bars-3-${align === 'left' ? 'bottom-left' : align === 'center' ? '' : 'bottom-right'}`"
                  class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">オプション</label>
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="hasHeader"
                type="checkbox"
                class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
              ヘッダー行
            </label>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- テーブルエディタ -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>テーブルエディタ</CardTitle>
          <div class="flex gap-2">
            <label>
              <input
                type="file"
                accept=".csv"
                class="hidden"
                @change="loadFile">
              <Button variant="outline" size="sm" as="span">
                <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                CSVインポート
              </Button>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <tbody>
              <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                <td
                  v-for="(cell, colIndex) in row"
                  :key="colIndex"
                  class="border p-1">
                  <input
                    v-model="tableData[rowIndex][colIndex]"
                    type="text"
                    class="w-full px-2 py-1 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                    :class="{ 'font-semibold': hasHeader && rowIndex === 0 }"
                    :placeholder="`${hasHeader && rowIndex === 0 ? 'ヘッダー' : 'セル'}${rowIndex}-${colIndex}`">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Markdown出力 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Markdown出力</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            @click="copyToClipboard(generateMarkdown)">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          :value="generateMarkdown"
          readonly
          class="w-full h-48 p-3 font-mono text-sm border rounded-md bg-muted resize-none"
          spellcheck="false"></textarea>
      </CardContent>
    </Card>

    <!-- プレビュー -->
    <Card>
      <CardHeader>
        <CardTitle>プレビュー</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader v-if="hasHeader">
            <TableRow>
              <TableHead v-for="(header, index) in previewHeaders" :key="index">
                {{ header }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(row, rowIndex) in previewRows" :key="rowIndex">
              <TableCell v-for="(cell, cellIndex) in row" :key="cellIndex">
                {{ cell }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
