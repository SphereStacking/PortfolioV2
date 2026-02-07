<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const password = ref('')
const showPassword = ref(false)
const customDictionary = ref('')
const useCustomDictionary = ref(false)

// パスワード分析結果
interface PasswordAnalysis {
  length: number
  hasLowercase: boolean
  hasUppercase: boolean
  hasDigits: boolean
  hasSymbols: boolean
  hasSpaces: boolean
  symbolCount: number
  digitCount: number
  uppercaseCount: number
  lowercaseCount: number
  uniqueChars: number
  repeatingChars: number
  consecutiveChars: number
  sequentialChars: number
  commonPatterns: string[]
}

// パスワード分析
const analyzePassword = (pwd: string): PasswordAnalysis => {
  const analysis: PasswordAnalysis = {
    length: pwd.length,
    hasLowercase: /[a-z]/.test(pwd),
    hasUppercase: /[A-Z]/.test(pwd),
    hasDigits: /\d/.test(pwd),
    hasSymbols: /[^a-zA-Z0-9\s]/.test(pwd),
    hasSpaces: /\s/.test(pwd),
    symbolCount: (pwd.match(/[^a-zA-Z0-9\s]/g) || []).length,
    digitCount: (pwd.match(/\d/g) || []).length,
    uppercaseCount: (pwd.match(/[A-Z]/g) || []).length,
    lowercaseCount: (pwd.match(/[a-z]/g) || []).length,
    uniqueChars: new Set(pwd).size,
    repeatingChars: 0,
    consecutiveChars: 0,
    sequentialChars: 0,
    commonPatterns: [],
  }

  // 繰り返し文字のカウント
  const charCount: Record<string, number> = {}
  for (const char of pwd) {
    charCount[char] = (charCount[char] || 0) + 1
  }
  analysis.repeatingChars = Object.values(charCount).filter(count => count > 1).reduce((sum, count) => sum + count - 1, 0)

  // 連続する同じ文字
  let maxConsecutive = 0
  let currentConsecutive = 1
  for (let i = 1; i < pwd.length; i++) {
    if (pwd[i] === pwd[i - 1]) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    }
    else {
      currentConsecutive = 1
    }
  }
  analysis.consecutiveChars = maxConsecutive > 1 ? maxConsecutive : 0

  // 連続する文字（キーボード配列、アルファベット順）
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
    '1234567890',
    '0987654321',
  ]

  for (const seq of sequences) {
    for (let i = 0; i < pwd.length - 2; i++) {
      const substring = pwd.substring(i, i + 3).toLowerCase()
      if (seq.includes(substring) || seq.includes(substring.split('').reverse().join(''))) {
        analysis.sequentialChars++
      }
    }
  }

  // よくあるパターンの検出
  const patterns = [
    { pattern: /^(.)\1+$/, name: '同一文字の繰り返し' },
    { pattern: /^(\d+)$/, name: '数字のみ' },
    { pattern: /^[a-z]+$/, name: '小文字のみ' },
    { pattern: /^[A-Z]+$/, name: '大文字のみ' },
    { pattern: /password/i, name: '"password"を含む' },
    { pattern: /admin/i, name: '"admin"を含む' },
    { pattern: /user/i, name: '"user"を含む' },
    { pattern: /123456/, name: '"123456"を含む' },
    { pattern: /qwerty/i, name: '"qwerty"を含む' },
    { pattern: /(19|20)\d{2}/, name: '年（西暦）を含む' },
    { pattern: /\b\d{4}\b/, name: '4桁の数字' },
    { pattern: /^[a-z]+\d+$|^\d+[a-z]+$/i, name: '単純な文字+数字' },
  ]

  for (const { pattern, name } of patterns) {
    if (pattern.test(pwd)) {
      analysis.commonPatterns.push(name)
    }
  }

  return analysis
}

// エントロピー計算
const calculateEntropy = (pwd: string, analysis: PasswordAnalysis): number => {
  if (pwd.length === 0) return 0

  // 文字セットのサイズ計算
  let charsetSize = 0
  if (analysis.hasLowercase) charsetSize += 26
  if (analysis.hasUppercase) charsetSize += 26
  if (analysis.hasDigits) charsetSize += 10
  if (analysis.hasSymbols) charsetSize += 32 // 一般的な記号の数
  if (analysis.hasSpaces) charsetSize += 1

  // 基本エントロピー
  const baseEntropy = pwd.length * Math.log2(charsetSize)

  // ペナルティ計算
  let penalty = 0

  // 繰り返し文字によるペナルティ
  if (analysis.repeatingChars > 0) {
    penalty += analysis.repeatingChars * 2
  }

  // 連続する文字によるペナルティ
  if (analysis.consecutiveChars > 2) {
    penalty += (analysis.consecutiveChars - 2) * 3
  }

  // 連続パターンによるペナルティ
  if (analysis.sequentialChars > 0) {
    penalty += analysis.sequentialChars * 5
  }

  // よくあるパターンによるペナルティ
  penalty += analysis.commonPatterns.length * 10

  // 短いパスワードへの追加ペナルティ
  if (pwd.length < 8) {
    penalty += (8 - pwd.length) * 5
  }

  return Math.max(0, baseEntropy - penalty)
}

// 解読時間の推定
const estimateCrackTime = (entropy: number): { time: number, unit: string, formatted: string } => {
  // 1秒間に10億回（10^9）の試行を想定
  const attemptsPerSecond = 1e9
  const possibleCombinations = Math.pow(2, entropy)
  const secondsToCrack = possibleCombinations / (2 * attemptsPerSecond) // 平均的には半分で見つかる

  const units = [
    { name: '秒', seconds: 1 },
    { name: '分', seconds: 60 },
    { name: '時間', seconds: 3600 },
    { name: '日', seconds: 86400 },
    { name: '年', seconds: 31536000 },
    { name: '世紀', seconds: 3153600000 },
  ]

  for (let i = units.length - 1; i >= 0; i--) {
    if (secondsToCrack >= units[i].seconds) {
      const time = secondsToCrack / units[i].seconds
      if (time > 1000000) {
        return {
          time: time,
          unit: units[i].name,
          formatted: time.toExponential(2) + ' ' + units[i].name,
        }
      }
      return {
        time: time,
        unit: units[i].name,
        formatted: time.toFixed(time < 10 ? 1 : 0) + ' ' + units[i].name,
      }
    }
  }

  return {
    time: secondsToCrack,
    unit: '秒',
    formatted: '1秒未満',
  }
}

// パスワード分析結果
const analysis = computed(() => analyzePassword(password.value))
const entropy = computed(() => calculateEntropy(password.value, analysis.value))
const crackTime = computed(() => estimateCrackTime(entropy.value))

// 強度レベル
const strengthLevel = computed(() => {
  const e = entropy.value
  if (e < 20) return { level: 0, label: '非常に弱い', color: 'bg-red-500' }
  if (e < 40) return { level: 1, label: '弱い', color: 'bg-orange-500' }
  if (e < 60) return { level: 2, label: '普通', color: 'bg-yellow-500' }
  if (e < 80) return { level: 3, label: '強い', color: 'bg-green-500' }
  return { level: 4, label: '非常に強い', color: 'bg-green-600' }
})

// 改善提案
const suggestions = computed(() => {
  const tips: string[] = []
  const a = analysis.value

  if (password.value.length === 0) {
    return ['パスワードを入力してください']
  }

  if (a.length < 8) {
    tips.push('最低8文字以上にしてください')
  }
  else if (a.length < 12) {
    tips.push('12文字以上にするとより安全です')
  }

  if (!a.hasLowercase) tips.push('小文字を含めてください')
  if (!a.hasUppercase) tips.push('大文字を含めてください')
  if (!a.hasDigits) tips.push('数字を含めてください')
  if (!a.hasSymbols) tips.push('記号を含めてください（!@#$%など）')

  if (a.consecutiveChars > 2) {
    tips.push(`同じ文字の連続（${a.consecutiveChars}文字）を避けてください`)
  }

  if (a.sequentialChars > 0) {
    tips.push('連続する文字や数字（abc、123など）を避けてください')
  }

  if (a.commonPatterns.length > 0) {
    tips.push(`よくあるパターンを避けてください：${a.commonPatterns.join('、')}`)
  }

  if (a.uniqueChars < a.length / 2) {
    tips.push('もっと多様な文字を使用してください')
  }

  return tips
})

// サンプルパスワード
const samplePasswords = [
  { password: 'password', label: '最悪の例' },
  { password: 'Password1', label: '弱い例' },
  { password: 'P@ssw0rd123', label: '普通の例' },
  { password: 'K#9mN$2pL@8qR', label: '強い例' },
  { password: 'Tr0ub4dor&3', label: 'xkcd例' },
  { password: 'correct horse battery staple', label: 'パスフレーズ例' },
]

const loadSample = (sample: string) => {
  password.value = sample
}

// カスタム辞書チェック
const isInCustomDictionary = computed(() => {
  if (!useCustomDictionary.value || !customDictionary.value.trim()) {
    return false
  }

  const words = customDictionary.value.split(/[\n,;\s]+/).filter(w => w.length > 0)
  const lowerPassword = password.value.toLowerCase()

  return words.some((word) => {
    const lowerWord = word.toLowerCase()
    return lowerPassword.includes(lowerWord) || lowerWord.includes(lowerPassword)
  })
})

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyReport = async () => {
  const report = `パスワード強度分析レポート
======================
パスワード長: ${analysis.value.length}文字
エントロピー: ${entropy.value.toFixed(2)}ビット
強度: ${strengthLevel.value.label}
推定解読時間: ${crackTime.value.formatted}

文字種:
- 小文字: ${analysis.value.hasLowercase ? '○' : '×'}
- 大文字: ${analysis.value.hasUppercase ? '○' : '×'}
- 数字: ${analysis.value.hasDigits ? '○' : '×'}
- 記号: ${analysis.value.hasSymbols ? '○' : '×'}

改善提案:
${suggestions.value.map(s => '- ' + s).join('\n')}`

  try {
    await copy(report)
    toast({
      description: 'レポートをコピーしました',
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
  title: '暗号強度計算 | Web開発ツール',
  description: 'パスワードのエントロピー計算と強度評価。解読時間の推定と改善提案。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        暗号強度計算
      </h1>
      <p class="text-muted-foreground">
        パスワードの強度を評価し、エントロピーと推定解読時間を計算します。
      </p>
    </div>

    <!-- パスワード入力 -->
    <Card>
      <CardHeader>
        <CardTitle>パスワード評価</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">パスワード</label>
            <div class="relative">
              <Input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="評価するパスワードを入力"
                class="pr-10" />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                @click="showPassword = !showPassword">
                <Icon
                  :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                  class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">サンプル</label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="sample in samplePasswords"
                :key="sample.label"
                variant="outline"
                size="sm"
                @click="loadSample(sample.password)">
                {{ sample.label }}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 強度メーター -->
    <Card v-if="password">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>強度評価</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            @click="copyReport">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <!-- 強度バー -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl font-bold">{{ strengthLevel.label }}</span>
              <span class="text-sm text-muted-foreground">{{ entropy.toFixed(2) }} ビット</span>
            </div>
            <div class="w-full h-4 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="strengthLevel.color"
                :style="{ width: `${Math.min(100, (entropy / 100) * 100)}%` }">
              </div>
            </div>
            <div class="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0</span>
              <span>20</span>
              <span>40</span>
              <span>60</span>
              <span>80</span>
              <span>100+</span>
            </div>
          </div>

          <!-- 推定解読時間 -->
          <div class="p-4 bg-muted rounded-md">
            <div class="text-sm text-muted-foreground mb-1">
              推定解読時間（10億回/秒）
            </div>
            <div class="text-2xl font-bold">
              {{ crackTime.formatted }}
            </div>
          </div>

          <!-- 詳細分析 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium mb-2">
                文字構成
              </h4>
              <div class="space-y-1 text-sm">
                <div class="flex items-center justify-between">
                  <span>長さ</span>
                  <span class="font-mono">{{ analysis.length }}文字</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>ユニーク文字</span>
                  <span class="font-mono">{{ analysis.uniqueChars }}種類</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>小文字</span>
                  <span :class="analysis.hasLowercase ? 'text-green-600' : 'text-red-600'">
                    {{ analysis.hasLowercase ? '○' : '×' }} {{ analysis.lowercaseCount }}文字
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>大文字</span>
                  <span :class="analysis.hasUppercase ? 'text-green-600' : 'text-red-600'">
                    {{ analysis.hasUppercase ? '○' : '×' }} {{ analysis.uppercaseCount }}文字
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>数字</span>
                  <span :class="analysis.hasDigits ? 'text-green-600' : 'text-red-600'">
                    {{ analysis.hasDigits ? '○' : '×' }} {{ analysis.digitCount }}文字
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>記号</span>
                  <span :class="analysis.hasSymbols ? 'text-green-600' : 'text-red-600'">
                    {{ analysis.hasSymbols ? '○' : '×' }} {{ analysis.symbolCount }}文字
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-medium mb-2">
                パターン分析
              </h4>
              <div class="space-y-1 text-sm">
                <div class="flex items-center justify-between">
                  <span>繰り返し文字</span>
                  <span :class="analysis.repeatingChars > 0 ? 'text-orange-600' : 'text-green-600'">
                    {{ analysis.repeatingChars }}文字
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>連続文字</span>
                  <span :class="analysis.consecutiveChars > 2 ? 'text-orange-600' : 'text-green-600'">
                    {{ analysis.consecutiveChars > 0 ? `最大${analysis.consecutiveChars}文字` : 'なし' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>連続パターン</span>
                  <span :class="analysis.sequentialChars > 0 ? 'text-orange-600' : 'text-green-600'">
                    {{ analysis.sequentialChars }}個
                  </span>
                </div>
                <div v-if="analysis.commonPatterns.length > 0" class="mt-2">
                  <div class="text-xs text-orange-600">
                    検出されたパターン:
                    <div class="mt-1">
                      {{ analysis.commonPatterns.join('、') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 改善提案 -->
    <Card v-if="password && suggestions.length > 0">
      <CardHeader>
        <CardTitle>改善提案</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Icon name="heroicons:light-bulb" class="w-4 h-4" />
          <AlertDescription>
            <ul class="list-disc list-inside space-y-1">
              <li v-for="(tip, index) in suggestions" :key="index">
                {{ tip }}
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <!-- カスタム辞書 -->
    <Card>
      <CardHeader>
        <CardTitle>カスタム辞書チェック</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <label class="flex items-center gap-2">
            <input
              v-model="useCustomDictionary"
              type="checkbox"
              class="w-4 h-4 rounded border-zinc-300 text-primary">
            カスタム辞書を使用する
          </label>

          <div v-if="useCustomDictionary">
            <label class="text-sm font-medium mb-2 block">
              禁止ワードリスト（改行またはカンマ区切り）
            </label>
            <textarea
              v-model="customDictionary"
              placeholder="company\nproduct\nservice\n2024"
              class="w-full h-32 p-3 font-mono text-sm border rounded-md bg-background resize-none"
              spellcheck="false"></textarea>

            <Alert v-if="isInCustomDictionary" variant="destructive" class="mt-2">
              <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
              <AlertDescription>
                パスワードに辞書内の単語が含まれています
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>エントロピーと強度について</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              エントロピーとは
            </h3>
            <p>
              パスワードの予測困難性を表す指標です。使用可能な文字の種類と長さから計算され、
              ビット単位で表されます。エントロピーが高いほど、総当たり攻撃に対して強力です。
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-foreground mb-2">
              強度レベルの目安
            </h3>
            <ul class="space-y-1">
              <li><strong class="text-red-600">非常に弱い（&lt; 20ビット）:</strong> 数秒で解読可能</li>
              <li><strong class="text-orange-600">弱い（20-40ビット）:</strong> 数時間〜数日で解読可能</li>
              <li><strong class="text-yellow-600">普通（40-60ビット）:</strong> 数ヶ月〜数年で解読可能</li>
              <li><strong class="text-green-600">強い（60-80ビット）:</strong> 数十年〜数世紀必要</li>
              <li><strong class="text-green-700">非常に強い（> 80ビット）:</strong> 現実的に解読不可能</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold text-foreground mb-2">
              強力なパスワードの作り方
            </h3>
            <ol class="list-decimal list-inside space-y-1">
              <li>最低12文字以上の長さ</li>
              <li>大文字・小文字・数字・記号を混在</li>
              <li>辞書に載っている単語を避ける</li>
              <li>個人情報（誕生日、名前など）を使わない</li>
              <li>キーボードの配列パターンを避ける</li>
              <li>パスフレーズの使用を検討する</li>
            </ol>
          </div>

          <div>
            <h3 class="font-semibold text-foreground mb-2">
              計算方法
            </h3>
            <p>
              基本エントロピー = log₂(文字セットサイズ) × パスワード長
            </p>
            <p class="mt-2">
              ただし、繰り返しパターン、連続文字、よくある単語などがある場合は
              ペナルティを適用して実効エントロピーを減少させています。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
