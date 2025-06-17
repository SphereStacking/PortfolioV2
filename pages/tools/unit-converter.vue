<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const selectedCategory = ref<'length' | 'area' | 'weight' | 'temperature' | 'data' | 'time' | 'css'>('length')
const fromUnit = ref('')
const toUnit = ref('')
const fromValue = ref<string>('1')
const precision = ref([6])

// 単位カテゴリと変換データ
const unitCategories = {
  length: {
    name: '長さ',
    icon: 'heroicons:ruler',
    units: {
      // メートル法
      km: { name: 'キロメートル', factor: 1000 },
      m: { name: 'メートル', factor: 1 },
      cm: { name: 'センチメートル', factor: 0.01 },
      mm: { name: 'ミリメートル', factor: 0.001 },
      um: { name: 'マイクロメートル', factor: 0.000001 },
      nm: { name: 'ナノメートル', factor: 0.000000001 },
      // インペリアル
      mi: { name: 'マイル', factor: 1609.344 },
      yd: { name: 'ヤード', factor: 0.9144 },
      ft: { name: 'フィート', factor: 0.3048 },
      in: { name: 'インチ', factor: 0.0254 },
      // 日本の単位
      ri: { name: '里', factor: 3927.27 },
      cho: { name: '町', factor: 109.09 },
      ken: { name: '間', factor: 1.818 },
      shaku: { name: '尺', factor: 0.303 },
      sun: { name: '寸', factor: 0.0303 },
    },
  },
  area: {
    name: '面積',
    icon: 'heroicons:square-2-stack',
    units: {
      // メートル法
      km2: { name: '平方キロメートル', factor: 1000000 },
      m2: { name: '平方メートル', factor: 1 },
      cm2: { name: '平方センチメートル', factor: 0.0001 },
      mm2: { name: '平方ミリメートル', factor: 0.000001 },
      // インペリアル
      mi2: { name: '平方マイル', factor: 2589988.11 },
      acre: { name: 'エーカー', factor: 4046.86 },
      yd2: { name: '平方ヤード', factor: 0.836127 },
      ft2: { name: '平方フィート', factor: 0.092903 },
      in2: { name: '平方インチ', factor: 0.00064516 },
      // 日本の単位
      chobu: { name: '町歩', factor: 9917.36 },
      tanbu: { name: '反歩', factor: 991.74 },
      se: { name: '畝', factor: 99.17 },
      tsubo: { name: '坪', factor: 3.306 },
      jo: { name: '畳（京間）', factor: 1.824 },
    },
  },
  weight: {
    name: '重さ',
    icon: 'heroicons:scale',
    units: {
      // メートル法
      t: { name: 'トン', factor: 1000000 },
      kg: { name: 'キログラム', factor: 1000 },
      g: { name: 'グラム', factor: 1 },
      mg: { name: 'ミリグラム', factor: 0.001 },
      ug: { name: 'マイクログラム', factor: 0.000001 },
      // インペリアル
      lb: { name: 'ポンド', factor: 453.592 },
      oz: { name: 'オンス', factor: 28.3495 },
      stone: { name: 'ストーン', factor: 6350.29 },
      // 日本の単位
      kan: { name: '貫', factor: 3750 },
      kin: { name: '斤', factor: 600 },
      monme: { name: '匁', factor: 3.75 },
    },
  },
  temperature: {
    name: '温度',
    icon: 'heroicons:fire',
    units: {
      c: { name: '摂氏（°C）', convert: (v: number, to: string) => {
        if (to === 'c') return v
        if (to === 'f') return v * 9 / 5 + 32
        if (to === 'k') return v + 273.15
        return v
      } },
      f: { name: '華氏（°F）', convert: (v: number, to: string) => {
        if (to === 'f') return v
        if (to === 'c') return (v - 32) * 5 / 9
        if (to === 'k') return (v - 32) * 5 / 9 + 273.15
        return v
      } },
      k: { name: 'ケルビン（K）', convert: (v: number, to: string) => {
        if (to === 'k') return v
        if (to === 'c') return v - 273.15
        if (to === 'f') return (v - 273.15) * 9 / 5 + 32
        return v
      } },
    },
  },
  data: {
    name: 'データサイズ',
    icon: 'heroicons:cpu-chip',
    units: {
      // バイト系
      tb: { name: 'テラバイト（TB）', factor: 1099511627776 },
      gb: { name: 'ギガバイト（GB）', factor: 1073741824 },
      mb: { name: 'メガバイト（MB）', factor: 1048576 },
      kb: { name: 'キロバイト（KB）', factor: 1024 },
      b: { name: 'バイト（B）', factor: 1 },
      // ビット系
      tbit: { name: 'テラビット（Tbit）', factor: 137438953472 },
      gbit: { name: 'ギガビット（Gbit）', factor: 134217728 },
      mbit: { name: 'メガビット（Mbit）', factor: 131072 },
      kbit: { name: 'キロビット（Kbit）', factor: 128 },
      bit: { name: 'ビット（bit）', factor: 0.125 },
    },
  },
  time: {
    name: '時間',
    icon: 'heroicons:clock',
    units: {
      year: { name: '年', factor: 31536000 },
      month: { name: '月（30日）', factor: 2592000 },
      week: { name: '週', factor: 604800 },
      day: { name: '日', factor: 86400 },
      hour: { name: '時間', factor: 3600 },
      min: { name: '分', factor: 60 },
      sec: { name: '秒', factor: 1 },
      ms: { name: 'ミリ秒', factor: 0.001 },
      us: { name: 'マイクロ秒', factor: 0.000001 },
      ns: { name: 'ナノ秒', factor: 0.000000001 },
    },
  },
  css: {
    name: 'CSS単位',
    icon: 'heroicons:code-bracket',
    units: {
      // 絶対単位
      px: { name: 'ピクセル（px）', factor: 1 },
      pt: { name: 'ポイント（pt）', factor: 1.333333 },
      pc: { name: 'パイカ（pc）', factor: 16 },
      cm: { name: 'センチメートル（cm）', factor: 37.795276 },
      mm: { name: 'ミリメートル（mm）', factor: 3.7795276 },
      in: { name: 'インチ（in）', factor: 96 },
      // 相対単位（基準値を仮定）
      rem: { name: 'rem（基準16px）', factor: 16 },
      em: { name: 'em（基準16px）', factor: 16 },
      vw: { name: 'vw（画面幅1920px）', factor: 19.2 },
      vh: { name: 'vh（画面高1080px）', factor: 10.8 },
    },
  },
}

// 現在のカテゴリのユニット
const currentUnits = computed(() => {
  return unitCategories[selectedCategory.value].units
})

// 変換結果
const convertedValue = computed(() => {
  const value = parseFloat(fromValue.value)
  if (isNaN(value)) return ''
  if (!fromUnit.value || !toUnit.value) return ''

  const fromUnitData = currentUnits.value[fromUnit.value]
  const toUnitData = currentUnits.value[toUnit.value]

  if (!fromUnitData || !toUnitData) return ''

  let result: number

  // 温度の特別処理
  if (selectedCategory.value === 'temperature') {
    result = fromUnitData.convert(value, toUnit.value)
  }
  else {
    // 通常の単位変換
    const baseValue = value * fromUnitData.factor
    result = baseValue / toUnitData.factor
  }

  // 精度調整
  const factor = Math.pow(10, precision.value[0])
  result = Math.round(result * factor) / factor

  return result.toString()
})

// 変換式
const conversionFormula = computed(() => {
  if (!fromUnit.value || !toUnit.value) return ''

  const fromUnitData = currentUnits.value[fromUnit.value]
  const toUnitData = currentUnits.value[toUnit.value]

  if (!fromUnitData || !toUnitData) return ''

  if (selectedCategory.value === 'temperature') {
    // 温度変換の式
    if (fromUnit.value === 'c' && toUnit.value === 'f') {
      return '°F = °C × 9/5 + 32'
    }
    else if (fromUnit.value === 'f' && toUnit.value === 'c') {
      return '°C = (°F - 32) × 5/9'
    }
    else if (fromUnit.value === 'c' && toUnit.value === 'k') {
      return 'K = °C + 273.15'
    }
    else if (fromUnit.value === 'k' && toUnit.value === 'c') {
      return '°C = K - 273.15'
    }
    else if (fromUnit.value === 'f' && toUnit.value === 'k') {
      return 'K = (°F - 32) × 5/9 + 273.15'
    }
    else if (fromUnit.value === 'k' && toUnit.value === 'f') {
      return '°F = (K - 273.15) × 9/5 + 32'
    }
  }
  else {
    // 通常の単位変換の式
    const factor = fromUnitData.factor / toUnitData.factor
    return `1 ${fromUnitData.name} = ${factor} ${toUnitData.name}`
  }

  return ''
})

// よく使う変換
const quickConversions = [
  { category: 'length', from: 'in', to: 'cm', label: 'インチ → センチ' },
  { category: 'length', from: 'ft', to: 'm', label: 'フィート → メートル' },
  { category: 'weight', from: 'lb', to: 'kg', label: 'ポンド → キログラム' },
  { category: 'temperature', from: 'c', to: 'f', label: '摂氏 → 華氏' },
  { category: 'data', from: 'mb', to: 'gb', label: 'MB → GB' },
  { category: 'css', from: 'px', to: 'rem', label: 'px → rem' },
]

// クイック変換を適用
const applyQuickConversion = (conversion: typeof quickConversions[0]) => {
  selectedCategory.value = conversion.category as keyof typeof unitCategories
  // カテゴリ変更を待つ
  nextTick(() => {
    fromUnit.value = conversion.from
    toUnit.value = conversion.to
    fromValue.value = '1'
  })
}

// 単位を入れ替え
const swapUnits = () => {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
}

// カテゴリ変更時の処理
watch(selectedCategory, () => {
  const units = Object.keys(currentUnits.value)
  fromUnit.value = units[0] || ''
  toUnit.value = units[1] || ''
})

// 変換テーブル生成
const conversionTable = computed(() => {
  const values = [0.01, 0.1, 1, 10, 100, 1000]
  const table: { input: number, output: string }[] = []

  values.forEach((val) => {
    const tempFromValue = fromValue.value
    fromValue.value = val.toString()
    const result = convertedValue.value
    if (result) {
      table.push({
        input: val,
        output: result,
      })
    }
    fromValue.value = tempFromValue
  })

  return table
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

// リセット
const reset = () => {
  fromValue.value = '1'
  precision.value = [6]
  const units = Object.keys(currentUnits.value)
  fromUnit.value = units[0] || ''
  toUnit.value = units[1] || ''
}

// 初期化
onMounted(() => {
  const units = Object.keys(currentUnits.value)
  fromUnit.value = units[0] || ''
  toUnit.value = units[1] || ''
})

// SEO設定
useSeoMeta({
  title: '単位変換 | Web開発ツール',
  description: '長さ、重さ、温度、データサイズ、CSS単位など各種単位の相互変換。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        単位変換
      </h1>
      <p class="text-muted-foreground">
        様々な単位を簡単に相互変換できます。
      </p>
    </div>

    <!-- カテゴリ選択 -->
    <Card>
      <CardHeader>
        <CardTitle>カテゴリ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <Button
            v-for="(category, key) in unitCategories"
            :key="key"
            :variant="selectedCategory === key ? 'default' : 'outline'"
            size="sm"
            @click="selectedCategory = key">
            <Icon :name="category.icon" class="w-4 h-4 mr-1" />
            {{ category.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- クイック変換 -->
    <Card>
      <CardHeader>
        <CardTitle>よく使う変換</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="conversion in quickConversions"
            :key="`${conversion.from}-${conversion.to}`"
            variant="outline"
            size="sm"
            @click="applyQuickConversion(conversion)">
            {{ conversion.label }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 変換設定 -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>変換設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <!-- From -->
              <div>
                <label class="text-sm font-medium mb-2 block">変換元</label>
                <div class="grid grid-cols-[1fr,2fr] gap-2">
                  <Input
                    v-model="fromValue"
                    type="number"
                    step="any"
                    placeholder="値を入力" />
                  <select
                    v-model="fromUnit"
                    class="w-full px-3 py-2 border rounded-md bg-background">
                    <option v-for="(unit, key) in currentUnits" :key="key" :value="key">
                      {{ unit.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- 入れ替えボタン -->
              <div class="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="swapUnits">
                  <Icon name="heroicons:arrows-up-down" class="w-4 h-4" />
                </Button>
              </div>

              <!-- To -->
              <div>
                <label class="text-sm font-medium mb-2 block">変換先</label>
                <div class="grid grid-cols-[1fr,2fr] gap-2">
                  <div class="flex items-center px-3 py-2 border rounded-md bg-muted">
                    {{ convertedValue || '-' }}
                  </div>
                  <select
                    v-model="toUnit"
                    class="w-full px-3 py-2 border rounded-md bg-background">
                    <option v-for="(unit, key) in currentUnits" :key="key" :value="key">
                      {{ unit.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- 精度設定 -->
              <div>
                <label class="text-sm font-medium mb-2 block">
                  小数点以下の桁数: {{ precision[0] }}
                </label>
                <Slider
                  :model-value="precision"
                  :min="0"
                  :max="10"
                  :step="1"
                  class="w-full"
                  @update:model-value="precision = $event" />
              </div>

              <!-- 変換式 -->
              <Alert v-if="conversionFormula">
                <Icon name="heroicons:information-circle" class="w-4 h-4" />
                <AlertDescription>
                  {{ conversionFormula }}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="reset">
              リセット
            </Button>
            <Button
              v-if="convertedValue"
              size="sm"
              @click="copyToClipboard(convertedValue)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
              結果をコピー
            </Button>
          </CardFooter>
        </Card>

        <!-- 変換テーブル -->
        <Card v-if="fromUnit && toUnit">
          <CardHeader>
            <CardTitle>変換テーブル</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ currentUnits[fromUnit]?.name }}</TableHead>
                  <TableHead class="text-right">
                    {{ currentUnits[toUnit]?.name }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in conversionTable" :key="row.input">
                  <TableCell>{{ row.input }}</TableCell>
                  <TableCell class="text-right font-mono">
                    {{ row.output }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <!-- 単位一覧 -->
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{{ unitCategories[selectedCategory].name }}の単位一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div v-for="(unit, key) in currentUnits" :key="key" class="p-3 bg-muted rounded-md">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">
                      {{ unit.name }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      {{ key }}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {{ unit.factor ? `×${unit.factor}` : '特殊' }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>単位変換について</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              変換精度
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>一般的な用途には十分な精度で変換</li>
              <li>科学計算には専門ツールの使用を推奨</li>
              <li>CSS単位の相対値は基準値を仮定</li>
              <li>月の日数は30日として計算</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              CSS単位について
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>rem/em: 基準フォントサイズ16pxを仮定</li>
              <li>vw: 画面幅1920pxを仮定</li>
              <li>vh: 画面高さ1080pxを仮定</li>
              <li>実際の値はコンテキストにより異なります</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
