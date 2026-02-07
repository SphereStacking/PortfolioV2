<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Input } from '~/components/ui/input'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

const csvInput = ref('')
const jsonInput = ref('')
const delimiter = ref(',')
const hasHeader = ref(true)
const prettyPrint = ref(true)

// サンプルデータ
const sampleData = [
  {
    name: 'ユーザーデータ',
    csv: `id,name,email,age
1,田中太郎,tanaka@example.com,30
2,佐藤花子,sato@example.com,25
3,鈴木一郎,suzuki@example.com,35`,
    json: `[
  {
    "id": "1",
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "age": "30"
  },
  {
    "id": "2",
    "name": "佐藤花子",
    "email": "sato@example.com",
    "age": "25"
  },
  {
    "id": "3",
    "name": "鈴木一郎",
    "email": "suzuki@example.com",
    "age": "35"
  }
]`,
  },
  {
    name: '商品データ',
    csv: `商品ID,商品名,価格,在庫
P001,ノートパソコン,98000,15
P002,マウス,2500,100
P003,キーボード,5800,50`,
    json: `[
  {
    "商品ID": "P001",
    "商品名": "ノートパソコン",
    "価格": "98000",
    "在庫": "15"
  },
  {
    "商品ID": "P002",
    "商品名": "マウス",
    "価格": "2500",
    "在庫": "100"
  },
  {
    "商品ID": "P003",
    "商品名": "キーボード",
    "価格": "5800",
    "在庫": "50"
  }
]`,
  },
  {
    name: 'タブ区切り',
    csv: `name\tdepartment\tsalary
John Doe\tEngineering\t80000
Jane Smith\tMarketing\t75000
Bob Johnson\tSales\t70000`,
    json: `[
  {
    "name": "John Doe",
    "department": "Engineering",
    "salary": "80000"
  },
  {
    "name": "Jane Smith",
    "department": "Marketing",
    "salary": "75000"
  },
  {
    "name": "Bob Johnson",
    "department": "Sales",
    "salary": "70000"
  }
]`,
  },
]

const loadSample = (sample: typeof sampleData[0]) => {
  csvInput.value = sample.csv
  jsonInput.value = sample.json
  // タブ区切りの検出
  if (sample.csv.includes('\t')) {
    delimiter.value = '\t'
  }
}

// CSVをJSONに変換
const csvToJson = () => {
  try {
    if (!csvInput.value.trim()) {
      toast({
        title: 'エラー',
        description: 'CSVデータを入力してください',
        variant: 'destructive',
      })
      return
    }

    const lines = csvInput.value.trim().split('\n')
    if (lines.length === 0) {
      jsonInput.value = '[]'
      return
    }

    const result: Record<string, string>[] | string[][] = []
    const headers = hasHeader.value ? lines[0].split(delimiter.value).map(h => h.trim()) : []

    const startIndex = hasHeader.value ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(delimiter.value)

      if (hasHeader.value) {
        const obj: Record<string, string> = {}
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim() || ''
        })
        ;(result as Record<string, string>[]).push(obj)
      }
      else {
        ;(result as string[][]).push(values.map(v => v.trim()))
      }
    }

    jsonInput.value = prettyPrint.value
      ? JSON.stringify(result, null, 2)
      : JSON.stringify(result)
  }
  catch {
    toast({
      title: 'エラー',
      description: 'CSV変換中にエラーが発生しました',
      variant: 'destructive',
    })
  }
}

// JSONをCSVに変換
const jsonToCsv = () => {
  try {
    if (!jsonInput.value.trim()) {
      toast({
        title: 'エラー',
        description: 'JSONデータを入力してください',
        variant: 'destructive',
      })
      return
    }

    const data = JSON.parse(jsonInput.value)

    if (!Array.isArray(data)) {
      toast({
        title: 'エラー',
        description: 'JSONは配列である必要があります',
        variant: 'destructive',
      })
      return
    }

    if (data.length === 0) {
      csvInput.value = ''
      return
    }

    // 配列の最初の要素から判断
    if (Array.isArray(data[0])) {
      // 配列の配列の場合
      csvInput.value = data
        .map(row => row.map((cell: unknown) => String(cell)).join(delimiter.value))
        .join('\n')
    }
    else if (typeof data[0] === 'object' && data[0] !== null) {
      // オブジェクトの配列の場合
      const headers = Object.keys(data[0])
      const rows = [
        hasHeader.value ? headers.join(delimiter.value) : '',
        ...data.map(obj =>
          headers.map((key) => {
            const value = (obj as Record<string, unknown>)[key]
            // 値に区切り文字や改行が含まれる場合はクォートで囲む
            const stringValue = String(value || '')
            if (stringValue.includes(delimiter.value) || stringValue.includes('\n') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          }).join(delimiter.value),
        ),
      ].filter(row => row !== '')

      csvInput.value = rows.join('\n')
    }
  }
  catch {
    toast({
      title: 'エラー',
      description: 'JSON解析中にエラーが発生しました',
      variant: 'destructive',
    })
  }
}

// Data Table用の状態
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const globalFilter = ref('')

// テーブルデータの整形
const tableData = computed(() => {
  try {
    if (!csvInput.value.trim()) return []

    const lines = csvInput.value.trim().split('\n')
    if (lines.length === 0) return []

    const headers = hasHeader.value
      ? lines[0].split(delimiter.value).map(h => h.trim())
      : lines[0].split(delimiter.value).map((_, i) => `Column ${i + 1}`)

    const startIndex = hasHeader.value ? 1 : 0
    const data = lines.slice(startIndex).map((line, index) => {
      const values = line.split(delimiter.value).map(v => v.trim())
      const row: Record<string, string | number> = { _index: index }
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })

    return data
  }
  catch {
    return []
  }
})

// 動的なカラム定義
const columns = computed<ColumnDef<Record<string, string | number>>[]>(() => {
  if (!csvInput.value.trim()) return []

  const lines = csvInput.value.trim().split('\n')
  if (lines.length === 0) return []

  const headers = hasHeader.value
    ? lines[0].split(delimiter.value).map(h => h.trim())
    : lines[0].split(delimiter.value).map((_, i) => `Column ${i + 1}`)

  return headers.map(header => ({
    accessorKey: header,
    header: () => h('div', { class: 'font-medium' }, header),
    cell: ({ row }) => {
      const value = row.getValue(header)
      return h('div', { class: 'text-sm' }, String(value))
    },
  }))
})

// テーブルインスタンス
const table = computed(() =>
  useVueTable({
    data: tableData.value,
    columns: columns.value,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
    },
    onColumnFiltersChange: (updater) => {
      columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater
    },
    onColumnVisibilityChange: (updater) => {
      columnVisibility.value = typeof updater === 'function' ? updater(columnVisibility.value) : updater
    },
    onRowSelectionChange: (updater) => {
      rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater
    },
    state: {
      sorting: sorting.value,
      columnFilters: columnFilters.value,
      columnVisibility: columnVisibility.value,
      rowSelection: rowSelection.value,
      globalFilter: globalFilter.value,
    },
  }),
)

// クリア
const clearAll = () => {
  csvInput.value = ''
  jsonInput.value = ''
}

// コピー
const copyCsv = async () => {
  if (!csvInput.value) return

  await copy(csvInput.value)
  toast({
    title: 'コピーしました',
    description: 'CSVデータをクリップボードにコピーしました',
  })
}

const copyJson = async () => {
  if (!jsonInput.value) return

  await copy(jsonInput.value)
  toast({
    title: 'コピーしました',
    description: 'JSONデータをクリップボードにコピーしました',
  })
}

// JSONフォーマット
const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
  }
  catch {
    toast({
      title: 'エラー',
      description: 'JSONのフォーマットに失敗しました',
      variant: 'destructive',
    })
  }
}

// SEO設定
useSeoMeta({
  title: 'CSV ↔ JSON Converter | Web開発ツール',
  description: 'CSVとJSONの相互変換ツール。ヘッダー行の自動検出、カスタム区切り文字対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="mb-8 col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        CSV ↔ JSON Converter
      </h1>
      <p class="text-muted-foreground">
        CSVとJSONの相互変換ツール。データの形式変換やAPIレスポンスの確認に便利。
      </p>
    </div>

    <!-- サンプルデータ -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>サンプルデータ</CardTitle>
        <CardDescription>
          よく使われるデータパターンを選択できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleData"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 設定 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>変換設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">区切り文字</label>
            <select
              v-model="delimiter"
              class="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option value=",">
                カンマ (,)
              </option>
              <option value="\t">
                タブ
              </option>
              <option value=";">
                セミコロン (;)
              </option>
              <option value="|">
                パイプ (|)
              </option>
            </select>
          </div>

          <div class="flex items-end">
            <label class="flex items-center gap-2">
              <input
                v-model="hasHeader"
                type="checkbox"
                class="rounded">
              <span class="text-sm">ヘッダー行あり</span>
            </label>
          </div>

          <div class="flex items-end">
            <label class="flex items-center gap-2">
              <input
                v-model="prettyPrint"
                type="checkbox"
                class="rounded">
              <span class="text-sm">JSON整形</span>
            </label>
          </div>

          <div class="flex items-end">
            <Button
              variant="outline"
              size="sm"
              @click="clearAll">
              <Icon name="heroicons:x-mark" class="w-4 h-4 mr-1" />
              クリア
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- CSV入力 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>CSV</CardTitle>
            <CardDescription>CSVデータを入力</CardDescription>
          </div>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              @click="jsonToCsv">
              <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-1" />
              JSONから変換
            </Button>
            <Button
              v-if="csvInput"
              size="sm"
              variant="outline"
              @click="copyCsv">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="csvInput"
          class="w-full h-64 p-3 rounded-md border bg-background font-mono text-sm resize-y"
          placeholder="id,name,email&#10;1,John Doe,john@example.com&#10;2,Jane Smith,jane@example.com"></textarea>
      </CardContent>
    </Card>
    <!-- JSON入力 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>JSON</CardTitle>
            <CardDescription>JSONデータを入力</CardDescription>
          </div>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              @click="csvToJson">
              <Icon name="heroicons:arrow-right" class="w-4 h-4 mr-1" />
              CSVから変換
            </Button>
            <Button
              v-if="jsonInput"
              size="sm"
              variant="outline"
              @click="formatJson">
              <Icon name="heroicons:code-bracket" class="w-4 h-4" />
            </Button>
            <Button
              v-if="jsonInput"
              size="sm"
              variant="outline"
              @click="copyJson">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="jsonInput"
          class="w-full h-64 p-3 rounded-md border bg-background font-mono text-sm resize-y"
          placeholder="[&#10;  {&#10;    &quot;id&quot;: 1,&#10;    &quot;name&quot;: &quot;John Doe&quot;&#10;  }&#10;]"></textarea>
      </CardContent>
    </Card>

    <!-- テーブルプレビュー -->
    <Card v-if="tableData.length > 0" class="col-span-full">
      <CardHeader>
        <CardTitle>テーブルプレビュー</CardTitle>
        <CardDescription>
          {{ tableData.length }}行のデータ
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 検索フィルター -->
        <div class="flex items-center gap-4">
          <Input
            v-model="globalFilter"
            placeholder="検索..."
            class="max-w-sm"
            @input="table.setGlobalFilter(globalFilter)" />
          <div class="ml-auto text-sm text-muted-foreground">
            {{ table.getFilteredRowModel().rows.length }} / {{ tableData.length }} 行を表示
          </div>
        </div>

        <!-- データテーブル -->
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id">
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :class="{
                    'cursor-pointer select-none': header.column.getCanSort(),
                  }"
                  @click="header.column.getToggleSortingHandler()?.($event)">
                  <div class="flex items-center gap-2">
                    <FlexRender
                      :render="header.column.columnDef.header"
                      :props="header.getContext()" />
                    <Icon
                      v-if="header.column.getIsSorted() === 'asc'"
                      name="heroicons:chevron-up"
                      class="w-4 h-4" />
                    <Icon
                      v-else-if="header.column.getIsSorted() === 'desc'"
                      name="heroicons:chevron-down"
                      class="w-4 h-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="table.getRowModel().rows?.length">
                <TableRow
                  v-for="row in table.getRowModel().rows"
                  :key="row.id"
                  :data-state="row.getIsSelected() && 'selected'">
                  <TableCell
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id">
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()" />
                  </TableCell>
                </TableRow>
              </template>
              <template v-else>
                <TableRow>
                  <TableCell
                    :colspan="columns.length"
                    class="h-24 text-center">
                    データがありません
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>

        <!-- ページネーション -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            ページ {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
          </div>
          <div class="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              :disabled="!table.getCanPreviousPage()"
              @click="table.previousPage()">
              <Icon name="heroicons:chevron-left" class="w-4 h-4" />
              前へ
            </Button>
            <Button
              size="sm"
              variant="outline"
              :disabled="!table.getCanNextPage()"
              @click="table.nextPage()">
              次へ
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 使い方 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>使い方のヒント</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <h4 class="font-semibold mb-2">
              CSV → JSON
            </h4>
            <ul class="space-y-1 list-disc list-inside">
              <li>ヘッダー行がある場合はオブジェクトの配列に変換</li>
              <li>ヘッダー行がない場合は配列の配列に変換</li>
              <li>区切り文字は自動検出または手動選択</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">
              JSON → CSV
            </h4>
            <ul class="space-y-1 list-disc list-inside">
              <li>オブジェクトの配列をCSVに変換</li>
              <li>値に区切り文字が含まれる場合は自動でクォート</li>
              <li>ネストされたオブジェクトは文字列として出力</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
