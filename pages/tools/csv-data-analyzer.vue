<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const csvData = ref('')
const parsedData = ref<string[][]>([])
const headers = ref<string[]>([])
const error = ref('')
const selectedColumns = ref<string[]>([])
const chartType = ref<'bar' | 'line' | 'pie'>('bar')
const showChart = ref(false)

// 統計データ
const statistics = ref<Record<string, unknown>>({})

// CSV解析
const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.trim().split('\n')
  const result: string[][] = []

  for (const line of lines) {
    // 簡易CSVパーサー（カンマ区切り、ダブルクォート対応）
    const cells: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // エスケープされたクォートをスキップ
        }
        else {
          inQuotes = !inQuotes
        }
      }
      else if (char === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      }
      else {
        current += char
      }
    }

    cells.push(current.trim())
    result.push(cells)
  }

  return result
}

// データ解析
const analyzeData = () => {
  error.value = ''

  if (!csvData.value.trim()) {
    error.value = 'CSVデータを入力してください'
    return
  }

  try {
    const parsed = parseCSV(csvData.value)

    if (parsed.length === 0) {
      error.value = 'データが見つかりません'
      return
    }

    // ヘッダー（最初の行）とデータを分離
    headers.value = parsed[0]
    parsedData.value = parsed.slice(1)

    // 統計計算
    calculateStatistics()

    toast({
      description: `${parsedData.value.length}行のデータを解析しました`,
    })
  }
  catch (e) {
    error.value = 'CSV解析エラーが発生しました'
    console.error('CSV parse error:', e)
  }
}

// 統計計算
const calculateStatistics = () => {
  const stats: Record<string, unknown> = {}

  headers.value.forEach((header, colIndex) => {
    const values = parsedData.value.map(row => row[colIndex]).filter(val => val !== undefined && val !== '')

    stats[header] = {
      count: values.length,
      unique: new Set(values).size,
      missing: parsedData.value.length - values.length,
    }

    // 数値データの場合の統計
    const numericValues = values.map(val => parseFloat(val)).filter(val => !isNaN(val))

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b)
      const sum = numericValues.reduce((a, b) => a + b, 0)
      const mean = sum / numericValues.length

      stats[header] = {
        ...stats[header],
        isNumeric: true,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        mean: parseFloat(mean.toFixed(2)),
        median: sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)],
        sum: parseFloat(sum.toFixed(2)),
        std: parseFloat(Math.sqrt(numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length).toFixed(2)),
      }
    }
    else {
      // テキストデータの場合
      const frequencies: Record<string, number> = {}
      values.forEach((val) => {
        frequencies[val] = (frequencies[val] || 0) + 1
      })

      const topValues = Object.entries(frequencies)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

      stats[header] = {
        ...stats[header],
        isNumeric: false,
        topValues: topValues.map(([value, count]) => ({ value, count, percentage: ((count / values.length) * 100).toFixed(1) })),
      }
    }
  })

  statistics.value = stats
}

// データフィルタリング
const filteredData = computed(() => {
  if (selectedColumns.value.length === 0) {
    return parsedData.value
  }

  const selectedIndices = selectedColumns.value.map(col => headers.value.indexOf(col))
  return parsedData.value.map(row =>
    selectedIndices.map(index => row[index]),
  )
})

const filteredHeaders = computed(() => {
  if (selectedColumns.value.length === 0) {
    return headers.value
  }
  return selectedColumns.value
})

// チャートデータ生成
const chartData = computed(() => {
  if (!showChart.value || selectedColumns.value.length === 0) return null

  const column = selectedColumns.value[0]
  const columnIndex = headers.value.indexOf(column)
  const values = parsedData.value.map(row => row[columnIndex]).filter(val => val !== undefined && val !== '')

  // 数値データの場合
  const numericValues = values.map(val => parseFloat(val)).filter(val => !isNaN(val))
  if (numericValues.length > 0) {
    // ヒストグラム用のビン作成
    const min = Math.min(...numericValues)
    const max = Math.max(...numericValues)
    const binCount = Math.min(10, Math.ceil(Math.sqrt(numericValues.length)))
    const binSize = (max - min) / binCount

    const bins: Record<string, number> = {}
    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binSize
      const binEnd = binStart + binSize
      const label = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`
      bins[label] = 0
    }

    numericValues.forEach((val) => {
      const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1)
      const binStart = min + binIndex * binSize
      const binEnd = binStart + binSize
      const label = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`
      bins[label]++
    })

    return {
      labels: Object.keys(bins),
      values: Object.values(bins),
      type: 'numeric',
    }
  }
  else {
    // カテゴリデータの場合
    const frequencies: Record<string, number> = {}
    values.forEach((val) => {
      frequencies[val] = (frequencies[val] || 0) + 1
    })

    const sorted = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // 上位10個

    return {
      labels: sorted.map(([label]) => label),
      values: sorted.map(([, count]) => count),
      type: 'categorical',
    }
  }
})

// サンプルCSV
const sampleCSV = `名前,年齢,職業,給与,部署
田中太郎,28,エンジニア,5000000,開発
佐藤花子,32,デザイナー,4500000,デザイン
山田次郎,25,エンジニア,4000000,開発
鈴木美咲,29,マネージャー,6000000,営業
高橋健一,35,エンジニア,5500000,開発
中村愛,27,デザイナー,4200000,デザイン
小林翔太,30,マネージャー,6200000,営業
加藤結衣,26,エンジニア,4300000,開発`

// サンプル読み込み
const loadSample = () => {
  csvData.value = sampleCSV
  analyzeData()
}

// ファイル読み込み
const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    csvData.value = e.target?.result as string
    analyzeData()
  }
  reader.readAsText(file, 'UTF-8')
}

// エクスポート
const exportFiltered = (format: 'csv' | 'json') => {
  if (parsedData.value.length === 0) {
    toast({
      description: 'エクスポートするデータがありません',
      variant: 'destructive',
    })
    return
  }

  let content = ''
  let filename = ''
  let mimeType = ''

  if (format === 'csv') {
    content = [filteredHeaders.value.join(','), ...filteredData.value.map(row => row.join(','))].join('\n')
    filename = 'filtered-data.csv'
    mimeType = 'text/csv'
  }
  else {
    const jsonData = filteredData.value.map((row) => {
      const obj: Record<string, string> = {}
      filteredHeaders.value.forEach((header, index) => {
        obj[header] = row[index] || ''
      })
      return obj
    })
    content = JSON.stringify(jsonData, null, 2)
    filename = 'filtered-data.json'
    mimeType = 'application/json'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// 簡易チャート描画
const drawChart = () => {
  if (!chartData.value) return

  const canvas = document.getElementById('chart-canvas') as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // キャンバスをクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { labels, values } = chartData.value
  const maxValue = Math.max(...values)
  const padding = 40
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2

  if (chartType.value === 'bar') {
    // 棒グラフ
    const barWidth = chartWidth / labels.length - 10

    values.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + index * (barWidth + 10)
      const y = padding + chartHeight - barHeight

      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(x, y, barWidth, barHeight)

      // ラベル
      ctx.fillStyle = '#000'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(labels[index].length > 10 ? labels[index].substring(0, 10) + '...' : labels[index], x + barWidth / 2, canvas.height - 10)
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
    })
  }
  else if (chartType.value === 'line') {
    // 線グラフ
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()

    values.forEach((value, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      }
      else {
        ctx.lineTo(x, y)
      }

      // ポイント
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    ctx.stroke()
  }
  else if (chartType.value === 'pie') {
    // 円グラフ
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(chartWidth, chartHeight) / 3

    const total = values.reduce((sum, val) => sum + val, 0)
    let currentAngle = 0

    values.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      ctx.fillStyle = `hsl(${(index * 360) / labels.length}, 70%, 50%)`
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // ラベル
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20)

      ctx.fillStyle = '#000'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${labels[index]} (${((value / total) * 100).toFixed(1)}%)`, labelX, labelY)

      currentAngle += sliceAngle
    })
  }
}

// チャート描画の監視
watch([chartData, chartType, showChart], () => {
  if (showChart.value && chartData.value) {
    nextTick(() => {
      drawChart()
    })
  }
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
  }
  catch (err) {
    console.error('Failed to copy:', err)
    toast({
      description: 'コピーに失敗しました',
      variant: 'destructive',
    })
  }
}

// SEO設定
useSeoMeta({
  title: 'CSVデータ分析 | Web開発ツール',
  description: 'CSVファイルの簡易分析・統計・グラフ化。基本統計量の計算と可視化。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        CSVデータ分析
      </h1>
      <p class="text-muted-foreground">
        CSVファイルを読み込んで基本統計量を計算し、簡易的なグラフを生成します。
      </p>
    </div>

    <!-- データ入力 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>データ入力</CardTitle>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="loadSample">
              サンプル読み込み
            </Button>
            <label>
              <input
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleFileUpload">
              <Button variant="outline" size="sm" as="span">
                <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                CSVファイル
              </Button>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <textarea
            v-model="csvData"
            placeholder="CSVデータを貼り付けるか、ファイルを選択してください&#10;例：&#10;名前,年齢,職業&#10;田中太郎,28,エンジニア&#10;佐藤花子,32,デザイナー"
            class="w-full h-48 p-3 font-mono text-sm border rounded-md bg-background resize-none"
            spellcheck="false"></textarea>

          <Alert v-if="error" variant="destructive">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Button
            class="w-full"
            :disabled="!csvData.trim()"
            @click="analyzeData">
            <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-2" />
            データを分析
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- データプレビューと統計 -->
    <div v-if="parsedData.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- データプレビュー -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>データプレビュー</CardTitle>
            <div class="text-sm text-muted-foreground">
              {{ parsedData.length }}行 × {{ headers.length }}列
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead v-for="header in headers.slice(0, 6)" :key="header">
                    {{ header }}
                  </TableHead>
                  <TableHead v-if="headers.length > 6">
                    ...
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(row, index) in parsedData.slice(0, 10)" :key="index">
                  <TableCell v-for="(cell, cellIndex) in row.slice(0, 6)" :key="cellIndex" class="max-w-32 truncate">
                    {{ cell }}
                  </TableCell>
                  <TableCell v-if="row.length > 6">
                    ...
                  </TableCell>
                </TableRow>
                <TableRow v-if="parsedData.length > 10">
                  <TableCell :colspan="Math.min(headers.length, 7)" class="text-center text-muted-foreground">
                    ...他 {{ parsedData.length - 10 }}行
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <!-- 基本統計 -->
      <Card>
        <CardHeader>
          <CardTitle>基本統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div v-for="(stat, column) in statistics" :key="column" class="p-3 border rounded-md">
              <h3 class="font-medium mb-2">
                {{ column }}
              </h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>件数: {{ stat.count }}</div>
                <div>ユニーク: {{ stat.unique }}</div>
                <div v-if="stat.missing > 0" class="col-span-2 text-destructive">
                  欠損値: {{ stat.missing }}
                </div>

                <template v-if="stat.isNumeric">
                  <div>最小値: {{ stat.min }}</div>
                  <div>最大値: {{ stat.max }}</div>
                  <div>平均: {{ stat.mean }}</div>
                  <div>中央値: {{ stat.median }}</div>
                  <div>合計: {{ stat.sum }}</div>
                  <div>標準偏差: {{ stat.std }}</div>
                </template>

                <template v-else>
                  <div class="col-span-2">
                    <div class="text-xs text-muted-foreground mb-1">
                      上位値:
                    </div>
                    <div v-for="item in stat.topValues.slice(0, 3)" :key="item.value" class="text-xs">
                      {{ item.value }}: {{ item.count }}件 ({{ item.percentage }}%)
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- グラフ機能 -->
    <Card v-if="parsedData.length > 0">
      <CardHeader>
        <CardTitle>データ可視化</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- 列選択 -->
          <div>
            <label class="text-sm font-medium mb-2 block">グラフ化する列を選択</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label v-for="header in headers" :key="header" class="flex items-center gap-2 text-sm">
                <input
                  v-model="selectedColumns"
                  type="checkbox"
                  :value="header"
                  class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
                {{ header }}
              </label>
            </div>
          </div>

          <!-- チャートタイプ選択 -->
          <div v-if="selectedColumns.length > 0">
            <label class="text-sm font-medium mb-2 block">グラフの種類</label>
            <div class="flex gap-2">
              <Button
                v-for="type in ['bar', 'line', 'pie']"
                :key="type"
                :variant="chartType === type ? 'default' : 'outline'"
                size="sm"
                @click="chartType = type">
                {{ type === 'bar' ? '棒グラフ' : type === 'line' ? '線グラフ' : '円グラフ' }}
              </Button>
            </div>
          </div>

          <div class="flex gap-2">
            <Button
              :disabled="selectedColumns.length === 0"
              @click="showChart = !showChart">
              <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-2" />
              {{ showChart ? 'グラフを非表示' : 'グラフを表示' }}
            </Button>
          </div>

          <!-- グラフ表示 -->
          <div v-if="showChart && chartData" class="border rounded-md p-4">
            <canvas
              id="chart-canvas"
              width="600"
              height="400"
              class="max-w-full h-auto"></canvas>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- エクスポート -->
    <Card v-if="parsedData.length > 0">
      <CardHeader>
        <CardTitle>データエクスポート</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">
            選択した列のデータをエクスポートできます
            {{ selectedColumns.length > 0 ? `（${selectedColumns.length}列選択中）` : '（全列）' }}
          </p>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="exportFiltered('csv')">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              CSV形式でダウンロード
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="exportFiltered('json')">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              JSON形式でダウンロード
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>機能説明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              対応機能
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>CSVファイルの読み込みと解析</li>
              <li>基本統計量の計算（平均、中央値、標準偏差など）</li>
              <li>カテゴリデータの度数分析</li>
              <li>簡易グラフ生成（棒・線・円グラフ）</li>
              <li>データのフィルタリングとエクスポート</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              使用方法
            </h3>
            <ol class="list-decimal list-inside space-y-1">
              <li>CSVファイルをアップロードまたは直接入力</li>
              <li>「データを分析」ボタンをクリック</li>
              <li>統計結果を確認</li>
              <li>必要に応じてグラフを生成</li>
              <li>結果をエクスポート</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
