<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputData = ref('')
const delimiter = ref<'space' | 'comma' | 'newline'>('space')
const precision = ref(4)
const showFrequencyTable = ref(true)
const showHistogram = ref(true)
const binCount = ref(10)

// データ解析
const parsedData = computed(() => {
  if (!inputData.value.trim()) return []

  let separator = ' '
  if (delimiter.value === 'comma') separator = ','
  if (delimiter.value === 'newline') separator = '\n'

  const values = inputData.value
    .split(separator)
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v))

  return values
})

// 基本統計量
const statistics = computed(() => {
  const data = parsedData.value
  if (data.length === 0) return null

  // ソート済みデータ
  const sorted = [...data].sort((a, b) => a - b)
  const n = data.length

  // 平均
  const mean = data.reduce((sum, val) => sum + val, 0) / n

  // 中央値
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]

  // 最頻値
  const frequencyMap = new Map<number, number>()
  data.forEach((val) => {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1)
  })
  const maxFreq = Math.max(...frequencyMap.values())
  const modes = Array.from(frequencyMap.entries())
    .filter(([_, freq]) => freq === maxFreq)
    .map(([val, _]) => val)

  // 分散と標準偏差
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
  const stdDev = Math.sqrt(variance)
  const sampleStdDev = Math.sqrt(variance * n / (n - 1))

  // 四分位数
  const q1 = n >= 4 ? sorted[Math.floor((n - 1) * 0.25)] : sorted[0]
  const q3 = n >= 4 ? sorted[Math.floor((n - 1) * 0.75)] : sorted[n - 1]
  const iqr = q3 - q1

  // 歪度（skewness）
  const skewness = n > 2
    ? (n / ((n - 1) * (n - 2))) * data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0)
    : 0

  // 尖度（kurtosis）
  const kurtosis = n > 3
    ? (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) - (3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3)))
    : 0

  // 範囲
  const min = sorted[0]
  const max = sorted[n - 1]
  const range = max - min

  // 変動係数
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0

  // 標準誤差
  const standardError = stdDev / Math.sqrt(n)

  // 信頼区間（95%）
  const t = 1.96 // 正規分布の95%信頼区間
  const marginOfError = t * standardError
  const confidenceInterval = {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
  }

  return {
    count: n,
    mean,
    median,
    modes,
    min,
    max,
    range,
    variance,
    stdDev,
    sampleStdDev,
    q1,
    q3,
    iqr,
    skewness,
    kurtosis,
    cv,
    standardError,
    confidenceInterval,
    sum: data.reduce((sum, val) => sum + val, 0),
  }
})

// 度数分布表
const frequencyDistribution = computed(() => {
  const data = parsedData.value
  if (data.length === 0 || !statistics.value) return []

  const { min, max } = statistics.value
  const binSize = (max - min) / binCount.value

  if (binSize === 0) {
    return [{
      range: `${min}`,
      frequency: data.length,
      relativeFrequency: 1,
      cumulativeFrequency: data.length,
      cumulativeRelative: 1,
    }]
  }

  const bins: Array<{
    range: string
    frequency: number
    relativeFrequency: number
    cumulativeFrequency: number
    cumulativeRelative: number
  }> = []

  let cumulative = 0

  for (let i = 0; i < binCount.value; i++) {
    const binStart = min + i * binSize
    const binEnd = i === binCount.value - 1 ? max + 0.0001 : min + (i + 1) * binSize

    const frequency = data.filter(val => val >= binStart && val < binEnd).length
    cumulative += frequency

    bins.push({
      range: `${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`,
      frequency,
      relativeFrequency: frequency / data.length,
      cumulativeFrequency: cumulative,
      cumulativeRelative: cumulative / data.length,
    })
  }

  return bins
})

// ヒストグラムデータ
const histogramData = computed(() => {
  if (!showHistogram.value || frequencyDistribution.value.length === 0) return null

  const maxFreq = Math.max(...frequencyDistribution.value.map(bin => bin.frequency))

  return {
    bins: frequencyDistribution.value,
    maxFrequency: maxFreq,
  }
})

// サンプルデータ
const sampleData = {
  normal: '23 45 67 32 54 76 43 65 87 34 56 78 45 67 89 43 65 87 54 76 98 65 43 21 34 56 78 90 67 45',
  exam: '85 92 78 88 91 76 82 89 94 87 83 90 79 86 88 92 84 81 87 93',
  height: '165 172 158 180 168 175 162 169 177 164 171 166 173 159 181 167 174 163 170 176',
}

const loadSample = (key: keyof typeof sampleData) => {
  inputData.value = sampleData[key]
  delimiter.value = 'space'
}

// 結果のフォーマット
const formatNumber = (num: number): string => {
  return num.toFixed(precision.value)
}

// エクスポート
const exportResults = () => {
  if (!statistics.value) return

  const results = {
    基本統計量: {
      'データ数': statistics.value.count,
      '平均': formatNumber(statistics.value.mean),
      '中央値': formatNumber(statistics.value.median),
      '最頻値': statistics.value.modes.map(m => formatNumber(m)).join(', '),
      '最小値': formatNumber(statistics.value.min),
      '最大値': formatNumber(statistics.value.max),
      '範囲': formatNumber(statistics.value.range),
      '分散': formatNumber(statistics.value.variance),
      '標準偏差': formatNumber(statistics.value.stdDev),
      '標本標準偏差': formatNumber(statistics.value.sampleStdDev),
      '変動係数': formatNumber(statistics.value.cv) + '%',
      '標準誤差': formatNumber(statistics.value.standardError),
      '95%信頼区間': `[${formatNumber(statistics.value.confidenceInterval.lower)}, ${formatNumber(statistics.value.confidenceInterval.upper)}]`,
    },
    四分位数: {
      第1四分位数: formatNumber(statistics.value.q1),
      第3四分位数: formatNumber(statistics.value.q3),
      四分位範囲: formatNumber(statistics.value.iqr),
    },
    形状: {
      歪度: formatNumber(statistics.value.skewness),
      尖度: formatNumber(statistics.value.kurtosis),
    },
  }

  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'statistics-results.json'
  link.click()
  URL.revokeObjectURL(url)
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

// SEO設定
useSeoMeta({
  title: '統計計算ツール | Web開発ツール',
  description: '平均・分散・標準偏差などの基本統計量を計算。度数分布表とヒストグラム生成機能付き。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        統計計算ツール
      </h1>
      <p class="text-muted-foreground">
        データセットから基本統計量を計算し、分布を可視化します。
      </p>
    </div>

    <!-- データ入力 -->
    <Card>
      <CardHeader>
        <CardTitle>データ入力</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium">データ</label>
              <div class="flex gap-2">
                <Button
                  v-for="(data, key) in { normal: '正規分布', exam: '試験点数', height: '身長データ' }"
                  :key="key"
                  variant="outline"
                  size="sm"
                  @click="loadSample(key)">
                  {{ data }}
                </Button>
              </div>
            </div>
            <textarea
              v-model="inputData"
              placeholder="数値を入力（例: 23 45 67 89 または 23,45,67,89）"
              class="w-full h-32 p-3 font-mono text-sm border rounded-md bg-background resize-none"
              spellcheck="false"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium mb-2 block">区切り文字</label>
              <div class="flex gap-2">
                <Button
                  v-for="(label, value) in { space: 'スペース', comma: 'カンマ', newline: '改行' }"
                  :key="value"
                  :variant="delimiter === value ? 'default' : 'outline'"
                  size="sm"
                  @click="delimiter = value">
                  {{ label }}
                </Button>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">
                小数点以下桁数: {{ precision }}
              </label>
              <Slider
                :model-value="[precision]"
                :min="0"
                :max="10"
                :step="1"
                class="w-full"
                @update:model-value="precision = $event[0]" />
            </div>
          </div>

          <div class="text-sm text-muted-foreground">
            データ数: {{ parsedData.length }}個
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 統計量 -->
    <div v-if="statistics" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 基本統計量 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>基本統計量</CardTitle>
            <Button size="sm" variant="outline" @click="exportResults">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              エクスポート
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted-foreground">
                  データ数
                </div>
                <div class="text-xl font-medium">
                  {{ statistics.count }}
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">
                  合計
                </div>
                <div class="text-xl font-medium">
                  {{ formatNumber(statistics.sum) }}
                </div>
              </div>
            </div>

            <Separator />

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm">平均（Mean）</span>
                <span class="font-mono">{{ formatNumber(statistics.mean) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">中央値（Median）</span>
                <span class="font-mono">{{ formatNumber(statistics.median) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">最頻値（Mode）</span>
                <span class="font-mono">{{ statistics.modes.map(m => formatNumber(m)).join(', ') }}</span>
              </div>
            </div>

            <Separator />

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm">最小値</span>
                <span class="font-mono">{{ formatNumber(statistics.min) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">最大値</span>
                <span class="font-mono">{{ formatNumber(statistics.max) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">範囲</span>
                <span class="font-mono">{{ formatNumber(statistics.range) }}</span>
              </div>
            </div>

            <Separator />

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm">分散</span>
                <span class="font-mono">{{ formatNumber(statistics.variance) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">標準偏差（σ）</span>
                <span class="font-mono">{{ formatNumber(statistics.stdDev) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">標本標準偏差（s）</span>
                <span class="font-mono">{{ formatNumber(statistics.sampleStdDev) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">変動係数（CV）</span>
                <span class="font-mono">{{ formatNumber(statistics.cv) }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">標準誤差</span>
                <span class="font-mono">{{ formatNumber(statistics.standardError) }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 四分位数と形状 -->
      <Card>
        <CardHeader>
          <CardTitle>分布の特性</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <h4 class="font-medium mb-3">
                四分位数
              </h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm">第1四分位数（Q1）</span>
                  <span class="font-mono">{{ formatNumber(statistics.q1) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">第3四分位数（Q3）</span>
                  <span class="font-mono">{{ formatNumber(statistics.q3) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">四分位範囲（IQR）</span>
                  <span class="font-mono">{{ formatNumber(statistics.iqr) }}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 class="font-medium mb-3">
                分布の形状
              </h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm">歪度（Skewness）</span>
                  <span class="font-mono">{{ formatNumber(statistics.skewness) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">尖度（Kurtosis）</span>
                  <span class="font-mono">{{ formatNumber(statistics.kurtosis) }}</span>
                </div>
              </div>
              <Alert class="mt-4">
                <Icon name="heroicons:information-circle" class="w-4 h-4" />
                <AlertDescription>
                  <div class="text-xs">
                    歪度: {{ statistics.skewness > 0.5 ? '右に歪んだ分布' : statistics.skewness < -0.5 ? '左に歪んだ分布' : '対称的な分布' }}<br>
                    尖度: {{ statistics.kurtosis > 0.5 ? '尖った分布' : statistics.kurtosis < -0.5 ? '平たい分布' : '正規分布に近い' }}
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            <div>
              <h4 class="font-medium mb-3">
                信頼区間
              </h4>
              <div class="p-3 bg-muted rounded-md">
                <div class="text-sm text-center">
                  95% 信頼区間
                </div>
                <div class="font-mono text-center mt-1">
                  [{{ formatNumber(statistics.confidenceInterval.lower) }}, {{ formatNumber(statistics.confidenceInterval.upper) }}]
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 度数分布表 -->
    <Card v-if="statistics && showFrequencyTable">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>度数分布表</CardTitle>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm">階級数:</label>
              <Input
                v-model.number="binCount"
                type="number"
                min="3"
                max="30"
                class="w-20" />
            </div>
            <Button
              size="sm"
              variant="ghost"
              @click="showFrequencyTable = false">
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>階級</TableHead>
                <TableHead class="text-right">
                  度数
                </TableHead>
                <TableHead class="text-right">
                  相対度数
                </TableHead>
                <TableHead class="text-right">
                  累積度数
                </TableHead>
                <TableHead class="text-right">
                  累積相対度数
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(bin, index) in frequencyDistribution" :key="index">
                <TableCell class="font-mono text-sm">
                  {{ bin.range }}
                </TableCell>
                <TableCell class="text-right">
                  {{ bin.frequency }}
                </TableCell>
                <TableCell class="text-right">
                  {{ (bin.relativeFrequency * 100).toFixed(2) }}%
                </TableCell>
                <TableCell class="text-right">
                  {{ bin.cumulativeFrequency }}
                </TableCell>
                <TableCell class="text-right">
                  {{ (bin.cumulativeRelative * 100).toFixed(2) }}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- ヒストグラム -->
    <Card v-if="statistics && histogramData && showHistogram">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>ヒストグラム</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            @click="showHistogram = false">
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="(bin, index) in histogramData.bins"
            :key="index"
            class="flex items-center gap-2">
            <div class="w-32 text-xs text-right">
              {{ bin.range }}
            </div>
            <div class="flex-1 flex items-center gap-2">
              <div
                class="h-6 bg-primary"
                :style="{ width: `${(bin.frequency / histogramData.maxFrequency) * 100}%` }">
              </div>
              <span class="text-sm">{{ bin.frequency }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>統計用語の説明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
          <div>
            <h4 class="font-medium text-foreground mb-2">
              中心傾向の指標
            </h4>
            <ul class="space-y-1">
              <li><strong>平均:</strong> データの総和を個数で割った値</li>
              <li><strong>中央値:</strong> データを順に並べた時の中央の値</li>
              <li><strong>最頻値:</strong> 最も頻繁に現れる値</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-foreground mb-2">
              ばらつきの指標
            </h4>
            <ul class="space-y-1">
              <li><strong>分散:</strong> 平均からの偏差の2乗の平均</li>
              <li><strong>標準偏差:</strong> 分散の平方根</li>
              <li><strong>変動係数:</strong> 標準偏差を平均で割った値（%）</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-foreground mb-2">
              分布の形状
            </h4>
            <ul class="space-y-1">
              <li><strong>歪度:</strong> 分布の左右対称性（0で対称）</li>
              <li><strong>尖度:</strong> 分布の尖り具合（0で正規分布）</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-foreground mb-2">
              その他
            </h4>
            <ul class="space-y-1">
              <li><strong>四分位数:</strong> データを4等分する値</li>
              <li><strong>信頼区間:</strong> 母平均が含まれる可能性が高い範囲</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
