<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Slider } from '~/components/ui/slider'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

const password = ref('')
const length = ref([16])
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const excludeAmbiguous = ref(true)

const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
const numberChars = '0123456789'
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const ambiguousChars = 'il1Lo0O'

const generatePassword = () => {
  let chars = ''

  if (includeUppercase.value) chars += uppercaseChars
  if (includeLowercase.value) chars += lowercaseChars
  if (includeNumbers.value) chars += numberChars
  if (includeSymbols.value) chars += symbolChars

  if (!chars) {
    toast({
      title: 'エラー',
      description: '少なくとも1つの文字種類を選択してください',
      variant: 'destructive',
    })
    return
  }

  if (excludeAmbiguous.value) {
    chars = chars.split('').filter(char => !ambiguousChars.includes(char)).join('')
  }

  let result = ''
  const array = new Uint32Array(length.value[0])
  crypto.getRandomValues(array)

  for (let i = 0; i < length.value[0]; i++) {
    result += chars[array[i] % chars.length]
  }

  // 選択された全種類の文字が含まれているか確認
  const hasUppercase = !includeUppercase.value || /[A-Z]/.test(result)
  const hasLowercase = !includeLowercase.value || /[a-z]/.test(result)
  const hasNumbers = !includeNumbers.value || /[0-9]/.test(result)
  const hasSymbols = !includeSymbols.value || /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(result)

  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSymbols) {
    generatePassword()
    return
  }

  password.value = result
}

const copyPassword = async () => {
  if (!password.value) return

  await copy(password.value)
  toast({
    title: 'コピーしました',
    description: 'パスワードをクリップボードにコピーしました',
  })
}

const getPasswordStrength = () => {
  const len = length.value[0]
  const types = [includeUppercase.value, includeLowercase.value, includeNumbers.value, includeSymbols.value].filter(Boolean).length

  if (len < 8 || types < 2) return { label: '弱い', color: 'text-red-500', progress: 25 }
  if (len < 12 || types < 3) return { label: '普通', color: 'text-yellow-500', progress: 50 }
  if (len < 16 || types < 4) return { label: '強い', color: 'text-blue-500', progress: 75 }
  return { label: '非常に強い', color: 'text-green-500', progress: 100 }
}

const strength = computed(() => getPasswordStrength())

// プリセット設定
const presets = [
  {
    name: 'シンプル (8文字)',
    config: {
      length: 8,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeAmbiguous: true,
    },
  },
  {
    name: '標準 (12文字)',
    config: {
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: true,
    },
  },
  {
    name: '強力 (16文字)',
    config: {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false,
    },
  },
  {
    name: '最強 (24文字)',
    config: {
      length: 24,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false,
    },
  },
  {
    name: 'PIN (数字のみ)',
    config: {
      length: 6,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      excludeAmbiguous: false,
    },
  },
  {
    name: '読みやすい',
    config: {
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeAmbiguous: true,
    },
  },
]

const applyPreset = (preset: typeof presets[0]) => {
  const config = preset.config
  length.value = [config.length]
  includeUppercase.value = config.uppercase
  includeLowercase.value = config.lowercase
  includeNumbers.value = config.numbers
  includeSymbols.value = config.symbols
  excludeAmbiguous.value = config.excludeAmbiguous
  generatePassword()
}

onMounted(() => {
  generatePassword()
})

// SEO設定
useSeoMeta({
  title: 'パスワード生成器 | Web開発ツール',
  description: '安全で強力なパスワードを自動生成。文字種類、長さ、強度を自由にカスタマイズ。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        パスワード生成器
      </h1>
      <p class="text-muted-foreground">
        安全で強力なパスワードを自動生成。文字種類、長さ、強度を自由にカスタマイズ。
      </p>
    </div>

    <!-- プリセット -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット設定</CardTitle>
        <CardDescription>
          用途に応じたパスワード設定を選択できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
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

    <Card class="mb-6">
      <CardHeader>
        <CardTitle>設定</CardTitle>
        <CardDescription>
          パスワードの長さと使用する文字を設定
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">長さ</label>
            <span class="text-sm font-mono bg-muted px-2 py-1 rounded">{{ length[0] }}文字</span>
          </div>
          <Slider
            v-model="length"
            :min="4"
            :max="64"
            :step="1"
            class="w-full"
            @update:model-value="generatePassword" />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>64</span>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-medium">
            使用する文字
          </h4>

          <label class="flex items-center gap-3">
            <input
              v-model="includeUppercase"
              type="checkbox"
              class="rounded"
              @change="generatePassword">
            <span class="flex-1 text-sm">大文字 (A-Z)</span>
            <span class="text-xs text-muted-foreground font-mono">ABCDEF...</span>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="includeLowercase"
              type="checkbox"
              class="rounded"
              @change="generatePassword">
            <span class="flex-1 text-sm">小文字 (a-z)</span>
            <span class="text-xs text-muted-foreground font-mono">abcdef...</span>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="includeNumbers"
              type="checkbox"
              class="rounded"
              @change="generatePassword">
            <span class="flex-1 text-sm">数字 (0-9)</span>
            <span class="text-xs text-muted-foreground font-mono">012345...</span>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="includeSymbols"
              type="checkbox"
              class="rounded"
              @change="generatePassword">
            <span class="flex-1 text-sm">記号</span>
            <span class="text-xs text-muted-foreground font-mono">!@#$%...</span>
          </label>
        </div>

        <div class="pt-3 border-t">
          <label class="flex items-center gap-3">
            <input
              v-model="excludeAmbiguous"
              type="checkbox"
              class="rounded"
              @change="generatePassword">
            <span class="flex-1 text-sm">紛らわしい文字を除外</span>
            <span class="text-xs text-muted-foreground font-mono">il1Lo0O</span>
          </label>
        </div>
      </CardContent>
    </Card>

    <Card class="mb-6">
      <CardHeader>
        <CardTitle>生成されたパスワード</CardTitle>
        <CardDescription>
          クリックしてコピー、または再生成してください
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="relative">
          <div class="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <code class="flex-1 text-lg font-mono break-all">{{ password }}</code>
            <Button
              size="sm"
              variant="ghost"
              @click="copyPassword">
              <Icon name="heroicons:clipboard-document" class="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm">強度:</span>
            <span :class="[strength.color, 'text-sm font-medium']">{{ strength.label }}</span>
          </div>
          <div class="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
              :style="{ width: `${strength.progress}%` }"></div>
          </div>
        </div>

        <Button
          class="w-full"
          @click="generatePassword">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
          新しいパスワードを生成
        </Button>
      </CardContent>
    </Card>

    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>パスワードのヒント</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <ul class="space-y-2 list-disc list-inside">
          <li>12文字以上のパスワードを推奨します</li>
          <li>大文字・小文字・数字・記号を組み合わせると強度が上がります</li>
          <li>同じパスワードを複数のサービスで使い回さないでください</li>
          <li>定期的にパスワードを変更することをお勧めします</li>
          <li>パスワードマネージャーの使用を検討してください</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
