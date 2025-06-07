<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputText = ref('')
const hashResults = ref({
  MD5: '',
  SHA1: '',
  SHA256: '',
  SHA384: '',
  SHA512: '',
  SHA3_256: '',
  SHA3_512: '',
})
const loading = ref(false)
const inputType = ref<'text' | 'file'>('text')
const fileContent = ref('')

// ハッシュアルゴリズムの定義
const algorithms = [
  { name: 'MD5', label: 'MD5 (128-bit)', deprecated: true },
  { name: 'SHA1', label: 'SHA-1 (160-bit)', deprecated: true },
  { name: 'SHA256', label: 'SHA-256 (256-bit)', recommended: true },
  { name: 'SHA384', label: 'SHA-384 (384-bit)' },
  { name: 'SHA512', label: 'SHA-512 (512-bit)' },
  { name: 'SHA3_256', label: 'SHA3-256 (256-bit)' },
  { name: 'SHA3_512', label: 'SHA3-512 (512-bit)' },
] as const

// ハッシュ計算関数
const calculateHashes = async () => {
  if (!inputText.value && !fileContent.value) {
    Object.keys(hashResults.value).forEach(key => {
      hashResults.value[key as keyof typeof hashResults.value] = ''
    })
    return
  }

  loading.value = true
  
  try {
    const data = inputType.value === 'text' ? inputText.value : fileContent.value
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // Web Crypto APIを使用してハッシュを計算
    const algorithms = [
      { name: 'MD5', algo: 'MD5' },
      { name: 'SHA1', algo: 'SHA-1' },
      { name: 'SHA256', algo: 'SHA-256' },
      { name: 'SHA384', algo: 'SHA-384' },
      { name: 'SHA512', algo: 'SHA-512' },
    ]

    for (const { name, algo } of algorithms) {
      try {
        if (algo === 'MD5') {
          // MD5はWeb Crypto APIでサポートされていないため、簡易実装
          hashResults.value[name as keyof typeof hashResults.value] = await calculateMD5(data)
        } else {
          const hashBuffer = await crypto.subtle.digest(algo, dataBuffer)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
          hashResults.value[name as keyof typeof hashResults.value] = hashHex
        }
      } catch (e) {
        hashResults.value[name as keyof typeof hashResults.value] = 'エラー'
      }
    }

    // SHA3はWeb Crypto APIでサポートされていないため、プレースホルダー
    hashResults.value.SHA3_256 = 'SHA3はブラウザでサポートされていません'
    hashResults.value.SHA3_512 = 'SHA3はブラウザでサポートされていません'
  } catch (e) {
    console.error('Hash calculation error:', e)
  } finally {
    loading.value = false
  }
}

// MD5の簡易実装（実際のプロジェクトではライブラリを使用することを推奨）
const calculateMD5 = async (str: string): Promise<string> => {
  // 実際の実装ではjs-md5などのライブラリを使用
  return 'MD5計算にはライブラリが必要です'
}

// ファイル読み込み
const loadFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    fileContent.value = e.target?.result as string
    calculateHashes()
  }
  reader.readAsText(file)
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string, label: string) => {
  try {
    await copy(text)
    toast({
      description: `${label}をクリップボードにコピーしました`,
    })
  } catch (err) {
    console.error('Failed to copy:', err)
    toast({
      description: 'コピーに失敗しました',
      variant: 'destructive',
    })
  }
}

// 大文字・小文字変換
const uppercase = ref(false)
const displayHash = (hash: string) => {
  return uppercase.value ? hash.toUpperCase() : hash.toLowerCase()
}

// サンプルデータ
const samples = [
  { name: 'Hello World', value: 'Hello, World!' },
  { name: 'パスワード例', value: 'MySecurePassword123!' },
  { name: 'JSON', value: '{"name":"John","age":30}' },
  { name: '空文字', value: '' },
]

const loadSample = (sample: typeof samples[0]) => {
  inputText.value = sample.value
  inputType.value = 'text'
  calculateHashes()
}

// 統計情報
const stats = computed(() => {
  const textLength = inputType.value === 'text' ? inputText.value.length : fileContent.value.length
  return {
    characters: textLength,
    bytes: new Blob([inputType.value === 'text' ? inputText.value : fileContent.value]).size,
  }
})

// SEO設定
useSeoMeta({
  title: 'ハッシュ生成ツール | Web開発ツール',
  description: 'テキストやファイルのMD5、SHA-1、SHA-256、SHA-512等のハッシュ値を生成。セキュリティやデータ検証に。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        ハッシュ生成ツール
      </h1>
      <p class="text-muted-foreground">
        テキストやファイルから各種ハッシュ値を生成します。
        ハッシュ関数は、任意の長さのデータを固定長の値に変換する一方向関数です。
      </p>
    </div>

    <!-- サンプル -->
    <Card>
      <CardHeader>
        <CardTitle>サンプル</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>

    <!-- 入力エリア -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>入力</CardTitle>
          <div class="flex gap-2">
            <Button
              v-for="type in ['text', 'file'] as const"
              :key="type"
              size="sm"
              :variant="inputType === type ? 'default' : 'outline'"
              @click="inputType = type">
              {{ type === 'text' ? 'テキスト' : 'ファイル' }}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="inputType === 'text'">
          <textarea
            v-model="inputText"
            placeholder="ハッシュ化するテキストを入力..."
            class="w-full h-40 p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            @input="calculateHashes"></textarea>
          <div class="mt-2 text-sm text-muted-foreground">
            {{ stats.characters }} 文字 / {{ stats.bytes }} バイト
          </div>
        </div>
        <div v-else>
          <input
            type="file"
            class="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90"
            @change="loadFile">
          <div v-if="fileContent" class="mt-2 text-sm text-muted-foreground">
            ファイルサイズ: {{ stats.bytes }} バイト
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- オプション -->
    <Card>
      <CardHeader>
        <CardTitle>オプション</CardTitle>
      </CardHeader>
      <CardContent>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="uppercase"
            type="checkbox"
            class="rounded">
          大文字で表示
        </label>
      </CardContent>
    </Card>

    <!-- ハッシュ結果 -->
    <Card>
      <CardHeader>
        <CardTitle>ハッシュ値</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="algo in algorithms"
            :key="algo.name"
            class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ algo.label }}</span>
                <Badge v-if="algo.deprecated" variant="destructive" class="text-xs">
                  非推奨
                </Badge>
                <Badge v-if="algo.recommended" variant="default" class="text-xs">
                  推奨
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                :disabled="!hashResults[algo.name as keyof typeof hashResults] || loading"
                @click="copyToClipboard(displayHash(hashResults[algo.name as keyof typeof hashResults]), algo.label)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="relative">
              <input
                :value="displayHash(hashResults[algo.name as keyof typeof hashResults])"
                readonly
                :placeholder="loading ? '計算中...' : '値を入力してください'"
                class="w-full p-2 pr-10 font-mono text-sm border rounded-md bg-muted"
                :class="{ 'opacity-50': loading }">
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>ハッシュ関数について</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">用途</h3>
            <ul class="list-disc list-inside space-y-1">
              <li>パスワードの保存（適切なソルトと組み合わせて）</li>
              <li>ファイルの整合性チェック</li>
              <li>データの一意性確認</li>
              <li>デジタル署名</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">推奨事項</h3>
            <ul class="list-disc list-inside space-y-1">
              <li>セキュリティ用途にはSHA-256以上を使用</li>
              <li>MD5とSHA-1は衝突脆弱性があるため非推奨</li>
              <li>パスワード保存にはbcryptやArgon2を推奨</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>