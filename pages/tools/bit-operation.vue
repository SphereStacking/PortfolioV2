<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputA = ref('42')
const inputB = ref('25')
const inputBase = ref<'decimal' | 'hex' | 'binary'>('decimal')
const bitLength = ref<8 | 16 | 32>(8)
const operation = ref<'AND' | 'OR' | 'XOR' | 'NOT' | 'SHIFT_LEFT' | 'SHIFT_RIGHT' | 'ROTATE_LEFT' | 'ROTATE_RIGHT'>('AND')

// 数値変換
const parseInput = (input: string, base: string): number => {
  switch (base) {
    case 'hex':
      return parseInt(input, 16) || 0
    case 'binary':
      return parseInt(input, 2) || 0
    default:
      return parseInt(input, 10) || 0
  }
}

const formatNumber = (num: number, base: string, length: number): string => {
  switch (base) {
    case 'hex':
      return '0x' + num.toString(16).toUpperCase().padStart(length / 4, '0')
    case 'binary':
      return '0b' + num.toString(2).padStart(length, '0')
    default:
      return num.toString()
  }
}

// ビット演算実行
const performOperation = (a: number, b: number, op: string, length: number): number => {
  // ビット長に応じたマスク
  const mask = (1 << length) - 1
  a = a & mask
  b = b & mask

  switch (op) {
    case 'AND':
      return a & b
    case 'OR':
      return a | b
    case 'XOR':
      return a ^ b
    case 'NOT':
      return (~a) & mask
    case 'SHIFT_LEFT':
      return (a << b) & mask
    case 'SHIFT_RIGHT':
      return a >> b
    case 'ROTATE_LEFT':
      b = b % length
      return ((a << b) | (a >> (length - b))) & mask
    case 'ROTATE_RIGHT':
      b = b % length
      return ((a >> b) | (a << (length - b))) & mask
    default:
      return 0
  }
}

// 計算値
const valueA = computed(() => parseInput(inputA.value, inputBase.value))
const valueB = computed(() => parseInput(inputB.value, inputBase.value))
const result = computed(() => performOperation(valueA.value, valueB.value, operation.value, bitLength.value))

// ビット配列生成
const getBits = (num: number, length: number): boolean[] => {
  const bits: boolean[] = []
  for (let i = length - 1; i >= 0; i--) {
    bits.push((num & (1 << i)) !== 0)
  }
  return bits
}

const bitsA = computed(() => getBits(valueA.value, bitLength.value))
const bitsB = computed(() => getBits(valueB.value, bitLength.value))
const bitsResult = computed(() => getBits(result.value, bitLength.value))

// 演算の説明
const operationExplanation = computed(() => {
  switch (operation.value) {
    case 'AND':
      return 'AND演算: 両方のビットが1の場合のみ1を返します'
    case 'OR':
      return 'OR演算: どちらかのビットが1の場合に1を返します'
    case 'XOR':
      return 'XOR演算: ビットが異なる場合に1を返します'
    case 'NOT':
      return 'NOT演算: ビットを反転します（0→1、1→0）'
    case 'SHIFT_LEFT':
      return '左シフト: ビットを左に移動し、右側に0を追加します'
    case 'SHIFT_RIGHT':
      return '右シフト: ビットを右に移動し、左側に0を追加します'
    case 'ROTATE_LEFT':
      return '左回転: ビットを左に回転し、溢れたビットを右端に移動します'
    case 'ROTATE_RIGHT':
      return '右回転: ビットを右に回転し、溢れたビットを左端に移動します'
    default:
      return ''
  }
})

// ビットマスク生成
const maskPatterns = {
  allOnes: { name: '全ビット1', generate: (len: number) => (1 << len) - 1 },
  allZeros: { name: '全ビット0', generate: () => 0 },
  alternating: { name: '交互パターン', generate: (len: number) => {
    let mask = 0
    for (let i = 0; i < len; i += 2) {
      mask |= (1 << i)
    }
    return mask
  } },
  lowerHalf: { name: '下位半分', generate: (len: number) => (1 << (len / 2)) - 1 },
  upperHalf: { name: '上位半分', generate: (len: number) => ((1 << (len / 2)) - 1) << (len / 2) },
  singleBit: { name: '単一ビット', generate: () => 1 },
}

const applyMask = (maskType: keyof typeof maskPatterns, target: 'A' | 'B') => {
  const mask = maskPatterns[maskType].generate(bitLength.value)
  const formatted = formatNumber(mask, inputBase.value, bitLength.value)

  if (target === 'A') {
    inputA.value = inputBase.value === 'decimal' ? mask.toString() : formatted.replace(/^0[xb]/, '')
  }
  else {
    inputB.value = inputBase.value === 'decimal' ? mask.toString() : formatted.replace(/^0[xb]/, '')
  }
}

// ビット操作履歴
interface OperationHistory {
  a: number
  b: number
  operation: string
  result: number
  timestamp: Date
}

const history = ref<OperationHistory[]>([])

const addToHistory = () => {
  history.value.unshift({
    a: valueA.value,
    b: valueB.value,
    operation: operation.value,
    result: result.value,
    timestamp: new Date(),
  })

  // 最大20件まで保持
  if (history.value.length > 20) {
    history.value.pop()
  }
}

// サンプル操作
const samples = [
  { name: 'ビットマスク', a: '255', b: '170', op: 'AND', base: 'decimal' },
  { name: 'フラグ設定', a: '0', b: '5', op: 'OR', base: 'decimal' },
  { name: 'ビット反転', a: '170', b: '0', op: 'XOR', base: 'decimal' },
  { name: '2倍（左シフト）', a: '5', b: '1', op: 'SHIFT_LEFT', base: 'decimal' },
  { name: '半分（右シフト）', a: '16', b: '1', op: 'SHIFT_RIGHT', base: 'decimal' },
]

const loadSample = (sample: typeof samples[0]) => {
  inputA.value = sample.a
  inputB.value = sample.b
  operation.value = sample.op as typeof operation.value
  inputBase.value = sample.base as typeof inputBase.value
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

// 結果のコピー
const copyResult = () => {
  const text = `${inputA.value} ${operation.value} ${inputB.value} = ${formatNumber(result.value, inputBase.value, bitLength.value)}`
  copyToClipboard(text)
}

// SEO設定
useSeoMeta({
  title: 'ビット演算ツール | Web開発ツール',
  description: 'ビット演算（AND/OR/XOR/シフト）の可視化と学習ツール。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        ビット演算ツール
      </h1>
      <p class="text-muted-foreground">
        ビット演算の動作を視覚的に理解し、学習するためのツール。
      </p>
    </div>

    <!-- 設定 -->
    <Card>
      <CardHeader>
        <CardTitle>演算設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="text-sm font-medium mb-2 block">入力形式</label>
              <div class="flex gap-1">
                <Button
                  v-for="base in ['decimal', 'hex', 'binary']"
                  :key="base"
                  :variant="inputBase === base ? 'default' : 'outline'"
                  size="sm"
                  @click="inputBase = base">
                  {{ base === 'decimal' ? '10進' : base === 'hex' ? '16進' : '2進' }}
                </Button>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">ビット長</label>
              <div class="flex gap-1">
                <Button
                  v-for="len in [8, 16, 32]"
                  :key="len"
                  :variant="bitLength === len ? 'default' : 'outline'"
                  size="sm"
                  @click="bitLength = len">
                  {{ len }}ビット
                </Button>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">演算</label>
              <select
                v-model="operation"
                class="w-full px-3 py-2 text-sm border rounded-md bg-background">
                <optgroup label="論理演算">
                  <option value="AND">
                    AND
                  </option>
                  <option value="OR">
                    OR
                  </option>
                  <option value="XOR">
                    XOR
                  </option>
                  <option value="NOT">
                    NOT
                  </option>
                </optgroup>
                <optgroup label="シフト演算">
                  <option value="SHIFT_LEFT">
                    左シフト (&lt;&lt;)
                  </option>
                  <option value="SHIFT_RIGHT">
                    右シフト (>>)
                  </option>
                  <option value="ROTATE_LEFT">
                    左回転
                  </option>
                  <option value="ROTATE_RIGHT">
                    右回転
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              {{ operationExplanation }}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>

    <!-- 入力と結果 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>入力値</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- 入力A -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium">値 A</label>
                <div class="flex gap-1">
                  <Button
                    v-for="(mask, key) in { all1: '全1', all0: '全0', alt: '交互' }"
                    :key="key"
                    variant="ghost"
                    size="sm"
                    @click="applyMask(key === 'all1' ? 'allOnes' : key === 'all0' ? 'allZeros' : 'alternating', 'A')">
                    {{ mask }}
                  </Button>
                </div>
              </div>
              <Input
                v-model="inputA"
                :placeholder="inputBase === 'hex' ? 'FF' : inputBase === 'binary' ? '11111111' : '255'" />
              <div class="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>10進: {{ valueA }}</div>
                <div>16進: {{ formatNumber(valueA, 'hex', bitLength) }}</div>
                <div>2進: {{ formatNumber(valueA, 'binary', bitLength) }}</div>
              </div>
            </div>

            <!-- 入力B -->
            <div v-if="operation !== 'NOT'">
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium">
                  値 B {{ ['SHIFT_LEFT', 'SHIFT_RIGHT', 'ROTATE_LEFT', 'ROTATE_RIGHT'].includes(operation) ? '（シフト量）' : '' }}
                </label>
                <div class="flex gap-1">
                  <Button
                    v-for="(mask, key) in { lower: '下位', upper: '上位', single: '単一' }"
                    :key="key"
                    variant="ghost"
                    size="sm"
                    @click="applyMask(key === 'lower' ? 'lowerHalf' : key === 'upper' ? 'upperHalf' : 'singleBit', 'B')">
                    {{ mask }}
                  </Button>
                </div>
              </div>
              <Input
                v-model="inputB"
                :placeholder="inputBase === 'hex' ? 'AA' : inputBase === 'binary' ? '10101010' : '170'" />
              <div class="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>10進: {{ valueB }}</div>
                <div>16進: {{ formatNumber(valueB, 'hex', bitLength) }}</div>
                <div>2進: {{ formatNumber(valueB, 'binary', bitLength) }}</div>
              </div>
            </div>

            <!-- サンプル -->
            <div>
              <label class="text-sm font-medium mb-2 block">サンプル操作</label>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="sample in samples"
                  :key="sample.name"
                  variant="outline"
                  size="sm"
                  @click="loadSample(sample)">
                  {{ sample.name }}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>演算結果</CardTitle>
            <div class="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                @click="copyResult">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                @click="addToHistory">
                <Icon name="heroicons:bookmark" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="p-4 bg-muted rounded-md">
              <div class="text-2xl font-mono font-bold text-center">
                {{ formatNumber(result, inputBase, bitLength) }}
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 text-sm">
              <div>10進: {{ result }}</div>
              <div>16進: {{ formatNumber(result, 'hex', bitLength) }}</div>
              <div>2進: {{ formatNumber(result, 'binary', bitLength) }}</div>
            </div>

            <div class="text-center text-sm text-muted-foreground">
              {{ inputA }} {{ operation }} {{ operation === 'NOT' ? '' : inputB }} = {{ formatNumber(result, inputBase, bitLength) }}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ビット可視化 -->
    <Card>
      <CardHeader>
        <CardTitle>ビット演算の可視化</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 font-mono">
          <!-- 値A -->
          <div class="flex items-center gap-4">
            <div class="w-20 text-right font-medium">
              A:
            </div>
            <div class="flex gap-1">
              <div
                v-for="(bit, index) in bitsA"
                :key="index"
                class="w-8 h-8 flex items-center justify-center border rounded"
                :class="bit ? 'bg-primary text-primary-foreground' : 'bg-muted'">
                {{ bit ? '1' : '0' }}
              </div>
            </div>
            <div class="text-sm text-muted-foreground">
              = {{ valueA }}
            </div>
          </div>

          <!-- 値B -->
          <div v-if="operation !== 'NOT'" class="flex items-center gap-4">
            <div class="w-20 text-right font-medium">
              B:
            </div>
            <div class="flex gap-1">
              <div
                v-for="(bit, index) in bitsB"
                :key="index"
                class="w-8 h-8 flex items-center justify-center border rounded"
                :class="bit ? 'bg-primary text-primary-foreground' : 'bg-muted'">
                {{ bit ? '1' : '0' }}
              </div>
            </div>
            <div class="text-sm text-muted-foreground">
              = {{ valueB }}
            </div>
          </div>

          <!-- 演算子 -->
          <div class="flex items-center gap-4">
            <div class="w-20 text-right font-bold">
              {{ operation }}:
            </div>
            <div class="flex-1 border-t-2"></div>
          </div>

          <!-- 結果 -->
          <div class="flex items-center gap-4">
            <div class="w-20 text-right font-medium">
              結果:
            </div>
            <div class="flex gap-1">
              <div
                v-for="(bit, index) in bitsResult"
                :key="index"
                class="w-8 h-8 flex items-center justify-center border-2 rounded"
                :class="bit ? 'bg-green-500 text-white border-green-600' : 'bg-muted border-border'">
                {{ bit ? '1' : '0' }}
              </div>
            </div>
            <div class="text-sm text-muted-foreground">
              = {{ result }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 履歴 -->
    <Card v-if="history.length > 0">
      <CardHeader>
        <CardTitle>演算履歴</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="(item, index) in history.slice(0, 10)"
            :key="index"
            class="flex items-center justify-between p-2 rounded-md hover:bg-muted">
            <div class="font-mono text-sm">
              {{ item.a }} {{ item.operation }} {{ item.operation === 'NOT' ? '' : item.b }} = {{ item.result }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ new Date(item.timestamp).toLocaleTimeString() }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>ビット演算について</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              基本的なビット演算
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-medium text-foreground">
                  AND (&)
                </h4>
                <p class="text-sm">
                  両方のビットが1の場合のみ1
                </p>
                <code class="text-xs">1010 & 1100 = 1000</code>
              </div>
              <div>
                <h4 class="font-medium text-foreground">
                  OR (|)
                </h4>
                <p class="text-sm">
                  どちらかのビットが1なら1
                </p>
                <code class="text-xs">1010 | 1100 = 1110</code>
              </div>
              <div>
                <h4 class="font-medium text-foreground">
                  XOR (^)
                </h4>
                <p class="text-sm">
                  ビットが異なる場合に1
                </p>
                <code class="text-xs">1010 ^ 1100 = 0110</code>
              </div>
              <div>
                <h4 class="font-medium text-foreground">
                  NOT (~)
                </h4>
                <p class="text-sm">
                  ビットを反転
                </p>
                <code class="text-xs">~1010 = 0101</code>
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              シフト演算
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>左シフト (&lt;&lt;): ビットを左に移動、2のn乗倍</li>
              <li>右シフト (>>): ビットを右に移動、2のn乗で除算</li>
              <li>回転シフト: 溢れたビットを反対側に移動</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              実用例
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>フラグ管理: ORでフラグを立てる、ANDで確認</li>
              <li>ビットマスク: 特定のビットを抽出・変更</li>
              <li>暗号化: XORを使った簡易暗号化</li>
              <li>パフォーマンス: シフトによる高速な乗除算</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
