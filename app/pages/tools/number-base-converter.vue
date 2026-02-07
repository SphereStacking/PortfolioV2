<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputValue = ref('42')
const inputBase = ref(10)
const error = ref('')

// 基数の定義
const bases = [
  { value: 2, name: '2進数', prefix: '0b' },
  { value: 8, name: '8進数', prefix: '0o' },
  { value: 10, name: '10進数', prefix: '' },
  { value: 16, name: '16進数', prefix: '0x' },
]

// 変換結果
const results = computed(() => {
  if (error.value) return {}

  try {
    // 入力値を10進数に変換
    const cleanValue = inputValue.value.replace(/^(0x|0X|0b|0B|0o|0O)/, '')
    const decimal = parseInt(cleanValue, inputBase.value)

    if (isNaN(decimal) || decimal < 0) {
      return {}
    }

    // 各基数に変換
    return {
      2: decimal.toString(2),
      8: decimal.toString(8),
      10: decimal.toString(10),
      16: decimal.toString(16).toUpperCase(),
      decimal: decimal,
    }
  }
  catch {
    return {}
  }
})

// 入力値の検証
const validateInput = () => {
  error.value = ''

  if (!inputValue.value) {
    error.value = '値を入力してください'
    return
  }

  const cleanValue = inputValue.value.replace(/^(0x|0X|0b|0B|0o|0O)/, '')
  const validChars = getValidChars(inputBase.value)

  for (const char of cleanValue.toUpperCase()) {
    if (!validChars.includes(char)) {
      error.value = `基数${inputBase.value}では '${char}' は無効な文字です`
      return
    }
  }

  // 数値として有効かチェック
  const decimal = parseInt(cleanValue, inputBase.value)
  if (isNaN(decimal)) {
    error.value = '無効な数値です'
    return
  }
  if (decimal < 0) {
    error.value = '負の数はサポートされていません'
  }
}

// 各基数で有効な文字を取得
const getValidChars = (base: number): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return chars.slice(0, base)
}

// 入力値の変更を監視
watch([inputValue, inputBase], () => {
  validateInput()
})

// プリセット値の設定
const setPresetValue = (value: string, base: number) => {
  inputValue.value = value
  inputBase.value = base
}

// ビット演算の例
const bitOperations = computed(() => {
  if (!results.value.decimal || results.value.decimal === 0) return null

  const num = results.value.decimal
  return {
    not: (~num >>> 0).toString(2), // 32ビット符号なし
    leftShift1: (num << 1).toString(2),
    rightShift1: (num >> 1).toString(2),
    and15: (num & 15).toString(2),
    or8: (num | 8).toString(2),
    xor255: (num ^ 255).toString(2),
  }
})

// ビット演算のラベル
const bitOpLabels = computed(() => {
  const d = results.value.decimal
  if (!d) return null
  return {
    not: `NOT (~${d})`,
    leftShift: `左シフト (${d} ≪ 1)`,
    rightShift: `右シフト (${d} ≫ 1)`,
    and15: `AND (${d} & 15)`,
    or8: `OR (${d} | 8)`,
    xor255: `XOR (${d} ^ 255)`,
  }
})

// ビット情報
const bitInfo = computed(() => {
  if (!results.value.decimal) return null

  const binary = results.value[2]
  const setBits = binary.split('').filter(bit => bit === '1').length
  const totalBits = binary.length

  return {
    setBits,
    totalBits,
    leadingZeros: 32 - totalBits,
  }
})

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string, label: string) => {
  try {
    await copy(text)
    toast({
      description: `${label}をクリップボードにコピーしました`,
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

// サンプル値
const samples = [
  { name: '42', value: '42', base: 10 },
  { name: '0xFF', value: 'FF', base: 16 },
  { name: '0b101010', value: '101010', base: 2 },
  { name: '0o777', value: '777', base: 8 },
  { name: '255', value: '255', base: 10 },
  { name: '1024', value: '1024', base: 10 },
]

// SEO設定
useSeoMeta({
  title: '進数変換計算機 | Web開発ツール',
  description: '2進数、8進数、10進数、16進数の相互変換。ビット演算の確認も可能。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        進数変換計算機
      </h1>
      <p class="text-muted-foreground">
        2進数、8進数、10進数、16進数を相互に変換します。
        プログラミングでの数値表現やビット演算の確認に便利です。
      </p>
    </div>

    <!-- サンプル -->
    <Card>
      <CardHeader>
        <CardTitle>サンプル値</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in samples"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="setPresetValue(sample.value, sample.base)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 入力 -->
    <Card>
      <CardHeader>
        <CardTitle>入力</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">値</label>
            <input
              v-model="inputValue"
              type="text"
              class="w-full px-3 py-2 font-mono text-lg border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="42">
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">入力の基数</label>
            <div class="grid grid-cols-4 gap-2">
              <Button
                v-for="base in bases"
                :key="base.value"
                :variant="inputBase === base.value ? 'default' : 'outline'"
                @click="inputBase = base.value">
                {{ base.name }}
              </Button>
            </div>
          </div>

          <div v-if="error">
            <Alert variant="destructive">
              <Icon name="heroicons:exclamation-circle" class="h-4 w-4" />
              <AlertDescription>
                {{ error }}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 変換結果 -->
    <Card v-if="!error && results.decimal !== undefined">
      <CardHeader>
        <CardTitle>変換結果</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-for="base in bases" :key="base.value" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ base.name }}</span>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(base.prefix + results[base.value], base.name)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-sm text-muted-foreground">{{ base.prefix }}</span>
              <span class="font-mono text-lg">{{ results[base.value] }}</span>
            </div>
            <Separator />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ビット情報 -->
    <Card v-if="bitInfo">
      <CardHeader>
        <CardTitle>ビット情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold">
              {{ bitInfo.totalBits }}
            </div>
            <div class="text-sm text-muted-foreground">
              総ビット数
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold">
              {{ bitInfo.setBits }}
            </div>
            <div class="text-sm text-muted-foreground">
              1のビット数
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold">
              {{ bitInfo.totalBits - bitInfo.setBits }}
            </div>
            <div class="text-sm text-muted-foreground">
              0のビット数
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ビット演算の例 -->
    <Card v-if="bitOperations">
      <CardHeader>
        <CardTitle>ビット演算の例</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">{{ bitOpLabels.not }}</span>
              <div class="font-mono text-muted-foreground">
                {{ bitOperations.not }}
              </div>
            </div>
            <div>
              <span class="font-medium">{{ bitOpLabels.leftShift }}</span>
              <div class="font-mono text-muted-foreground">
                {{ bitOperations.leftShift1 }}
              </div>
            </div>
            <div>
              <span class="font-medium">{{ bitOpLabels.rightShift }}</span>
              <div class="font-mono text-muted-foreground">
                {{ bitOperations.rightShift1 }}
              </div>
            </div>
            <div>
              <span class="font-medium">{{ bitOpLabels.and15 }}</span>
              <div class="font-mono text-muted-foreground">
                {{ bitOperations.and15 }}
              </div>
            </div>
            <div>
              <span class="font-medium">{{ bitOpLabels.or8 }}</span>
              <div class="font-mono text-muted-foreground">
                {{ bitOperations.or8 }}
              </div>
            </div>
            <div>
              <span class="font-medium">{{ bitOpLabels.xor255 }}</span>
              <div class="font-mono text-muted-foreground">
                {{ bitOperations.xor255 }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>進数システムについて</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              各進数の用途
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>2進数（Binary）</strong>: コンピュータの基本、ビット演算、フラグ管理</li>
              <li><strong>8進数（Octal）</strong>: Unixファイルパーミッション（例: 755）</li>
              <li><strong>10進数（Decimal）</strong>: 一般的な数値表現</li>
              <li><strong>16進数（Hexadecimal）</strong>: カラーコード、メモリアドレス、バイトデータ</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold text-foreground mb-2">
              プログラミングでの表記
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>進数</TableHead>
                  <TableHead>JavaScript/TypeScript</TableHead>
                  <TableHead>Python</TableHead>
                  <TableHead>C/C++</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2進数</TableCell>
                  <TableCell class="font-mono">
                    0b1010
                  </TableCell>
                  <TableCell class="font-mono">
                    0b1010
                  </TableCell>
                  <TableCell class="font-mono">
                    0b1010
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>8進数</TableCell>
                  <TableCell class="font-mono">
                    0o12
                  </TableCell>
                  <TableCell class="font-mono">
                    0o12
                  </TableCell>
                  <TableCell class="font-mono">
                    012
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>16進数</TableCell>
                  <TableCell class="font-mono">
                    0xA
                  </TableCell>
                  <TableCell class="font-mono">
                    0xA
                  </TableCell>
                  <TableCell class="font-mono">
                    0xA
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
