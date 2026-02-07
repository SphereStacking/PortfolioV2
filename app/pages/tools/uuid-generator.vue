<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})
// UUID v4生成
const generateUUIDv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : r & 0x3 | 0x8
    return v.toString(16)
  })
}

// ナノID生成
const generateNanoId = (size: number = 21) => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let id = ''
  for (let i = 0; i < size; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return id
}

// ULID生成（簡易版）
const generateULID = () => {
  const timestamp = Date.now().toString(36).toUpperCase().padStart(10, '0')
  const randomPart = generateNanoId(16).toUpperCase()
  return timestamp + randomPart
}

// 状態管理
const idType = ref<'uuid' | 'nanoid' | 'ulid' | 'timestamp' | 'random'>('uuid')
const generatedIds = ref<string[]>([])
const count = ref(1)
const nanoIdSize = ref(21)
const randomLength = ref(16)
const randomCharset = ref({
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
})
const customSymbols = ref('-_')
const separator = ref('')
const separatorPosition = ref(4)
const prefix = ref('')
const suffix = ref('')
const caseType = ref<'lower' | 'upper' | 'none'>('none')

// ID生成
const generateId = () => {
  let id = ''

  switch (idType.value) {
    case 'uuid':
      id = generateUUIDv4()
      break
    case 'nanoid':
      id = generateNanoId(nanoIdSize.value)
      break
    case 'ulid':
      id = generateULID()
      break
    case 'timestamp':
      id = Date.now().toString()
      break
    case 'random':
      id = generateCustomRandom()
      break
  }

  // プレフィックス・サフィックスの適用
  if (prefix.value) id = prefix.value + id
  if (suffix.value) id = id + suffix.value

  // セパレーターの適用
  if (separator.value && separatorPosition.value > 0) {
    const parts = []
    for (let i = 0; i < id.length; i += separatorPosition.value) {
      parts.push(id.slice(i, i + separatorPosition.value))
    }
    id = parts.join(separator.value)
  }

  // 大文字小文字の適用
  if (caseType.value === 'lower') id = id.toLowerCase()
  else if (caseType.value === 'upper') id = id.toUpperCase()

  return id
}

// カスタムランダム生成
const generateCustomRandom = () => {
  let charset = ''
  if (randomCharset.value.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (randomCharset.value.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (randomCharset.value.numbers) charset += '0123456789'
  if (randomCharset.value.symbols) charset += customSymbols.value

  let result = ''
  for (let i = 0; i < randomLength.value; i++) {
    result += charset[Math.floor(Math.random() * charset.length)]
  }
  return result
}

// 複数生成
const generateMultiple = () => {
  const ids = []
  for (let i = 0; i < count.value; i++) {
    ids.push(generateId())
  }
  generatedIds.value = ids
}

// 1つ生成
const generateSingle = () => {
  count.value = 1
  generateMultiple()
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast({
      title: 'コピーしました',
      description: 'IDをクリップボードにコピーしました',
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

const copyAll = () => {
  copyToClipboard(generatedIds.value.join('\n'))
}

// ダウンロード
const downloadIds = () => {
  const blob = new Blob([generatedIds.value.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${idType.value}-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// 初期生成
generateSingle()

// プリセット設定
const presets = [
  {
    name: '標準UUID',
    config: {
      idType: 'uuid',
      caseType: 'lower',
      prefix: '',
      suffix: '',
      separator: '',
    },
  },
  {
    name: 'ユーザーID',
    config: {
      idType: 'nanoid',
      nanoIdSize: 12,
      prefix: 'user_',
      caseType: 'none',
    },
  },
  {
    name: 'セッションID',
    config: {
      idType: 'uuid',
      prefix: 'sess_',
      caseType: 'lower',
    },
  },
  {
    name: 'APIキー',
    config: {
      idType: 'random',
      randomLength: 32,
      randomCharset: { uppercase: true, lowercase: true, numbers: true, symbols: false },
      prefix: 'sk_live_',
    },
  },
  {
    name: '注文番号',
    config: {
      idType: 'ulid',
      prefix: 'ORD-',
      caseType: 'upper',
    },
  },
  {
    name: 'トークン',
    config: {
      idType: 'random',
      randomLength: 24,
      randomCharset: { uppercase: true, lowercase: true, numbers: true, symbols: false },
      separator: '-',
      separatorPosition: 6,
    },
  },
]

// プリセットを適用
const applyPreset = (preset: typeof presets[0]) => {
  const config = preset.config

  if (config.idType) idType.value = config.idType
  if (config.caseType !== undefined) caseType.value = config.caseType
  if (config.prefix !== undefined) prefix.value = config.prefix
  if (config.suffix !== undefined) suffix.value = config.suffix
  if (config.separator !== undefined) separator.value = config.separator
  if (config.separatorPosition !== undefined) separatorPosition.value = config.separatorPosition
  if (config.nanoIdSize !== undefined) nanoIdSize.value = config.nanoIdSize
  if (config.randomLength !== undefined) randomLength.value = config.randomLength
  if (config.randomCharset !== undefined) {
    randomCharset.value = { ...randomCharset.value, ...config.randomCharset }
  }

  // 適用後すぐに生成
  generateSingle()
}

// IDタイプの説明
const idTypeDescriptions = {
  uuid: 'UUID v4 - 標準的な128ビットの識別子',
  nanoid: 'Nano ID - URLセーフでコンパクトな識別子',
  ulid: 'ULID - ソート可能なタイムスタンプ付き識別子',
  timestamp: 'タイムスタンプ - Unix時間（ミリ秒）',
  random: 'カスタムランダム - 自由にカスタマイズ可能',
}

// SEO設定
useSeoMeta({
  title: 'UUID/ID生成ツール | Web開発ツール',
  description: 'UUID、Nano ID、ULID、タイムスタンプなど各種ID形式を生成。カスタマイズ可能。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        UUID/ID生成ツール
      </h1>
      <p class="text-muted-foreground">
        各種フォーマットのユニークIDを生成します。
      </p>
    </div>

    <!-- プリセット -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-3 gap-2">
          <Button
            v-for="preset in presets"
            :key="preset.name"
            size="sm"
            variant="outline"
            @click="applyPreset(preset)">
            {{ preset.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 設定パネル -->
    <div class="space-y-6">
      <!-- IDタイプ選択 -->
      <Card>
        <CardHeader>
          <CardTitle>IDタイプ</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="(desc, type) in idTypeDescriptions"
              :key="type"
              class="flex items-start gap-3">
              <input
                :id="type"
                v-model="idType"
                :value="type"
                type="radio"
                class="mt-1">
              <label :for="type" class="flex-1 cursor-pointer">
                <div class="font-medium">{{ type.toUpperCase() }}</div>
                <div class="text-sm text-muted-foreground">{{ desc }}</div>
              </label>
            </div>
          </div>
        </CardContent>

        <!-- タイプ別オプション -->
        <template v-if="idType === 'nanoid'">
          <CardHeader>
            <CardTitle>Nano ID設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label class="text-sm font-medium mb-2 block">
                長さ: {{ nanoIdSize }}文字
              </label>
              <Slider
                :model-value="[nanoIdSize]"
                :min="6"
                :max="36"
                :step="1"
                class="w-full"
                @update:model-value="nanoIdSize = $event[0]" />
            </div>
          </CardContent>
        </template>

        <template v-if="idType === 'random'">
          <CardHeader>
            <CardTitle>カスタムランダム設定</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">
                長さ: {{ randomLength }}文字
              </label>
              <Slider
                :model-value="[randomLength]"
                :min="4"
                :max="64"
                :step="1"
                class="w-full"
                @update:model-value="randomLength = $event[0]" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium block">文字セット</label>
              <label class="flex items-center gap-2">
                <input
                  v-model="randomCharset.uppercase"
                  type="checkbox"
                  class="rounded">
                <span class="text-sm">大文字 (A-Z)</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="randomCharset.lowercase"
                  type="checkbox"
                  class="rounded">
                <span class="text-sm">小文字 (a-z)</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="randomCharset.numbers"
                  type="checkbox"
                  class="rounded">
                <span class="text-sm">数字 (0-9)</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="randomCharset.symbols"
                  type="checkbox"
                  class="rounded">
                <span class="text-sm">記号</span>
              </label>
            </div>

            <div v-if="randomCharset.symbols">
              <label class="text-sm font-medium mb-2 block">使用する記号</label>
              <Input
                v-model="customSymbols"
                placeholder="-_!@#$%^&*()"
                class="font-mono" />
            </div>
          </CardContent>
        </template>
        <CardHeader>
          <CardTitle>オプション</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">生成数</label>
            <Input
              v-model.number="count"
              type="number"
              min="1"
              max="1000" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium mb-2 block">プレフィックス</label>
              <Input
                v-model="prefix"
                placeholder="user_" />
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">サフィックス</label>
              <Input
                v-model="suffix"
                placeholder="_2024" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium mb-2 block">セパレーター</label>
              <Input
                v-model="separator"
                placeholder="-" />
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">間隔</label>
              <Input
                v-model.number="separatorPosition"
                type="number"
                min="0"
                :disabled="!separator" />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">大文字/小文字</label>
            <select
              v-model="caseType"
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="none">
                変更なし
              </option>
              <option value="lower">
                小文字
              </option>
              <option value="upper">
                大文字
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Button
        class="w-full"
        @click="generateMultiple">
        <Icon name="heroicons:bolt" class="w-4 h-4 mr-2" />
        生成
      </Button>
    </div>
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>
            生成されたID
            <Badge class="ml-2">
              {{ generatedIds.length }}個
            </Badge>
          </CardTitle>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              :disabled="generatedIds.length === 0"
              @click="copyAll">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-1" />
              すべてコピー
            </Button>
            <Button
              size="sm"
              variant="outline"
              :disabled="generatedIds.length === 0"
              @click="downloadIds">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
              ダウンロード
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="(id, index) in generatedIds"
            :key="index"
            class="group flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors">
            <code class="font-mono text-sm break-all">{{ id }}</code>
            <Button
              size="sm"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click="copyToClipboard(id)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ID形式の説明 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>ID形式について</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4 text-sm">
        <div>
          <h4 class="font-medium mb-1">
            UUID v4
          </h4>
          <p class="text-muted-foreground">
            RFC 4122準拠の標準的なUUID。128ビットのランダム値で、衝突の可能性は極めて低い。
            形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
          </p>
        </div>
        <div>
          <h4 class="font-medium mb-1">
            Nano ID
          </h4>
          <p class="text-muted-foreground">
            URLセーフな文字のみを使用する軽量なID。UUIDより短く、同等の一意性を提供。
            デフォルト21文字で126ビット相当のエントロピー。
          </p>
        </div>
        <div>
          <h4 class="font-medium mb-1">
            ULID
          </h4>
          <p class="text-muted-foreground">
            タイムスタンプを含むソート可能なID。最初の10文字がタイムスタンプ、
            残り16文字がランダム。時系列でのソートが可能。
          </p>
        </div>
        <div>
          <h4 class="font-medium mb-1">
            タイムスタンプ
          </h4>
          <p class="text-muted-foreground">
            Unix時間（1970年1月1日からのミリ秒）。シンプルで時系列順になるが、
            同時生成で衝突の可能性があるため、単体での使用は推奨されない。
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
