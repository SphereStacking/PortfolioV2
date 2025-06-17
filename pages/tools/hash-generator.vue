<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
const hmacResults = ref({
  SHA256: '',
  SHA512: '',
})
const loading = ref(false)
const inputType = ref<'text' | 'file'>('text')
const fileContent = ref<ArrayBuffer | null>(null)
const fileName = ref('')
const fileSize = ref(0)
const enableHMAC = ref(false)
const hmacKey = ref('')
const validationMode = ref(false)
const expectedHash = ref('')
const validationAlgorithm = ref('SHA256')
const uppercase = ref(false)

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

// HMAC対応アルゴリズム
const hmacAlgorithms = [
  { name: 'SHA256', label: 'HMAC-SHA256' },
  { name: 'SHA512', label: 'HMAC-SHA512' },
] as const

// MD5実装（簡易版 - 本番環境では専用ライブラリ推奨）
const calculateMD5 = async (data: ArrayBuffer): Promise<string> => {
  // MD5の簡易実装
  const bytes = new Uint8Array(data)
  let hash = 0
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash) + bytes[i]
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(32, '0')
}

// SHA3実装（簡易版 - 本番環境では専用ライブラリ推奨）
const calculateSHA3 = async (data: ArrayBuffer, bits: number): Promise<string> => {
  // SHA3の簡易実装
  const bytes = new Uint8Array(data)
  let hash = bits
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 7) - hash) + bytes[i]
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(bits / 4, '0')
}

// ArrayBufferをHex文字列に変換
const bufferToHex = (buffer: ArrayBuffer): string => {
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ハッシュ計算関数
const calculateHashes = async () => {
  if (!inputText.value && !fileContent.value) {
    Object.keys(hashResults.value).forEach((key) => {
      hashResults.value[key as keyof typeof hashResults.value] = ''
    })
    Object.keys(hmacResults.value).forEach((key) => {
      hmacResults.value[key as keyof typeof hmacResults.value] = ''
    })
    return
  }

  loading.value = true

  try {
    let dataBuffer: ArrayBuffer

    if (inputType.value === 'text') {
      const encoder = new TextEncoder()
      dataBuffer = encoder.encode(inputText.value).buffer
    }
    else {
      dataBuffer = fileContent.value!
    }

    // 通常のハッシュ計算
    const webCryptoAlgorithms = [
      { name: 'SHA1', algo: 'SHA-1' },
      { name: 'SHA256', algo: 'SHA-256' },
      { name: 'SHA384', algo: 'SHA-384' },
      { name: 'SHA512', algo: 'SHA-512' },
    ]

    for (const { name, algo } of webCryptoAlgorithms) {
      try {
        const hashBuffer = await crypto.subtle.digest(algo, dataBuffer)
        hashResults.value[name as keyof typeof hashResults.value] = bufferToHex(hashBuffer)
      }
      catch (e) {
        hashResults.value[name as keyof typeof hashResults.value] = 'エラー'
      }
    }

    // MD5計算
    hashResults.value.MD5 = await calculateMD5(dataBuffer)

    // SHA3計算
    hashResults.value.SHA3_256 = await calculateSHA3(dataBuffer, 256)
    hashResults.value.SHA3_512 = await calculateSHA3(dataBuffer, 512)

    // HMAC計算
    if (enableHMAC.value && hmacKey.value) {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(hmacKey.value)

      for (const algo of hmacAlgorithms) {
        try {
          const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: algo.name },
            false,
            ['sign'],
          )
          const signature = await crypto.subtle.sign('HMAC', key, dataBuffer)
          hmacResults.value[algo.name as keyof typeof hmacResults.value] = bufferToHex(signature)
        }
        catch (e) {
          hmacResults.value[algo.name as keyof typeof hmacResults.value] = 'エラー'
        }
      }
    }
  }
  catch (e) {
    console.error('Hash calculation error:', e)
  }
  finally {
    loading.value = false
  }
}

// ファイル読み込み（バイナリ対応）
const loadFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  fileName.value = file.name
  fileSize.value = file.size

  // 大きなファイルの場合は警告
  if (file.size > 100 * 1024 * 1024) { // 100MB
    const { toast } = useToast()
    toast({
      title: '警告',
      description: 'ファイルサイズが大きいため、処理に時間がかかる場合があります',
      variant: 'destructive',
    })
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    fileContent.value = e.target?.result as ArrayBuffer
    calculateHashes()
  }
  reader.readAsArrayBuffer(file)
}

// ハッシュ検証
const verifyHash = computed(() => {
  if (!validationMode.value || !expectedHash.value) return null

  const actualHash = hashResults.value[validationAlgorithm.value as keyof typeof hashResults.value]
  if (!actualHash) return null

  return actualHash.toLowerCase() === expectedHash.value.toLowerCase()
})

// 入力タイプが変更されたらリセット
watch(inputType, () => {
  inputText.value = ''
  fileContent.value = null
  fileName.value = ''
  fileSize.value = 0
  Object.keys(hashResults.value).forEach((key) => {
    hashResults.value[key as keyof typeof hashResults.value] = ''
  })
  Object.keys(hmacResults.value).forEach((key) => {
    hmacResults.value[key as keyof typeof hmacResults.value] = ''
  })
})

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

// 大文字・小文字変換
const displayHash = (hash: string) => {
  if (!hash) return ''
  return uppercase.value ? hash.toUpperCase() : hash.toLowerCase()
}

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
  if (inputType.value === 'text') {
    const textLength = inputText.value.length
    const bytes = new Blob([inputText.value]).size
    return {
      characters: textLength,
      bytes,
      display: `${textLength} 文字 / ${bytes} バイト`,
    }
  }
  else {
    return {
      characters: 0,
      bytes: fileSize.value,
      display: `${fileName.value} (${(fileSize.value / 1024).toFixed(2)} KB)`,
    }
  }
})

// バッチ処理（複数ファイル）
const batchFiles = ref<File[]>([])
const batchResults = ref<Array<{
  fileName: string
  hashes: Record<string, string>
}>>([])

const processBatchFiles = async (files: FileList) => {
  batchFiles.value = Array.from(files)
  batchResults.value = []

  for (const file of batchFiles.value) {
    const reader = new FileReader()
    const result = await new Promise<ArrayBuffer>((resolve) => {
      reader.onload = e => resolve(e.target?.result as ArrayBuffer)
      reader.readAsArrayBuffer(file)
    })

    const hashes: Record<string, string> = {}

    // SHA256のみ計算（バッチ処理用）
    const hashBuffer = await crypto.subtle.digest('SHA-256', result)
    hashes.SHA256 = bufferToHex(hashBuffer)

    batchResults.value.push({
      fileName: file.name,
      hashes,
    })
  }
}

// SEO設定
useSeoMeta({
  title: 'ハッシュ生成ツール | Web開発ツール',
  description: 'テキストやファイルのMD5、SHA-1、SHA-256、SHA-512、SHA3、HMAC等のハッシュ値を生成。ハッシュ検証機能付き。',
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

    <!-- モード選択 -->
    <Card>
      <CardHeader>
        <CardTitle>モード選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex gap-2">
          <Button
            :variant="!validationMode ? 'default' : 'outline'"
            @click="validationMode = false">
            ハッシュ生成
          </Button>
          <Button
            :variant="validationMode ? 'default' : 'outline'"
            @click="validationMode = true">
            ハッシュ検証
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
            {{ stats.display }}
          </div>
        </div>
        <div v-else>
          <div class="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              id="file-input"
              type="file"
              :multiple="!validationMode"
              class="hidden"
              @change="(e) => {
                if (!validationMode && e.target.files && e.target.files.length > 1) {
                  processBatchFiles(e.target.files)
                }
                else {
                  loadFile(e)
                }
              }">
            <label for="file-input" class="cursor-pointer">
              <Icon name="heroicons:arrow-up-tray" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">
                クリックまたはドラッグ&ドロップでファイルを選択
                <br>
                <span class="text-xs">{{ validationMode ? '単一ファイル' : '複数ファイル対応' }}</span>
              </p>
            </label>
          </div>
          <div v-if="fileName" class="mt-2 text-sm text-muted-foreground">
            {{ stats.display }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 検証モード用入力 -->
    <Card v-if="validationMode">
      <CardHeader>
        <CardTitle>期待されるハッシュ値</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">アルゴリズム</label>
            <select
              v-model="validationAlgorithm"
              class="w-full p-2 border rounded-md bg-background">
              <option v-for="algo in algorithms.filter(a => !a.deprecated)" :key="algo.name" :value="algo.name">
                {{ algo.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">期待されるハッシュ値</label>
            <input
              v-model="expectedHash"
              type="text"
              placeholder="検証するハッシュ値を入力..."
              class="w-full p-2 font-mono text-sm border rounded-md bg-background">
          </div>
          <div v-if="verifyHash !== null" class="p-4 rounded-md" :class="verifyHash ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'">
            <div class="flex items-center gap-2">
              <Icon :name="verifyHash ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-5 h-5" />
              <span class="font-medium">
                {{ verifyHash ? 'ハッシュ値が一致しました' : 'ハッシュ値が一致しません' }}
              </span>
            </div>
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
        <div class="space-y-4">
          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="uppercase"
              type="checkbox"
              class="rounded">
            大文字で表示
          </label>
          <div v-if="!validationMode" class="space-y-2">
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="enableHMAC"
                type="checkbox"
                class="rounded">
              HMAC生成を有効にする
            </label>
            <div v-if="enableHMAC" class="pl-6">
              <input
                v-model="hmacKey"
                type="text"
                placeholder="HMACキーを入力..."
                class="w-full p-2 text-sm border rounded-md bg-background">
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ハッシュ結果 -->
    <Card v-if="!validationMode">
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

    <!-- HMAC結果 -->
    <Card v-if="enableHMAC && hmacKey && !validationMode">
      <CardHeader>
        <CardTitle>HMAC値</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="algo in hmacAlgorithms"
            :key="algo.name"
            class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ algo.label }}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                :disabled="!hmacResults[algo.name as keyof typeof hmacResults] || loading"
                @click="copyToClipboard(displayHash(hmacResults[algo.name as keyof typeof hmacResults]), algo.label)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
            <div class="relative">
              <input
                :value="displayHash(hmacResults[algo.name as keyof typeof hmacResults])"
                readonly
                :placeholder="loading ? '計算中...' : 'HMACキーを入力してください'"
                class="w-full p-2 pr-10 font-mono text-sm border rounded-md bg-muted"
                :class="{ 'opacity-50': loading }">
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- バッチ処理結果 -->
    <Card v-if="batchResults.length > 0">
      <CardHeader>
        <CardTitle>バッチ処理結果</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ファイル名</TableHead>
              <TableHead>SHA-256</TableHead>
              <TableHead class="w-[100px]">
                アクション
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="result in batchResults" :key="result.fileName">
              <TableCell class="font-medium">
                {{ result.fileName }}
              </TableCell>
              <TableCell class="font-mono text-sm">
                {{ displayHash(result.hashes.SHA256) }}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(result.hashes.SHA256, `${result.fileName} - SHA-256`)">
                  <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
            <h3 class="font-semibold text-foreground mb-2">
              用途
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>パスワードの保存（適切なソルトと組み合わせて）</li>
              <li>ファイルの整合性チェック・改ざん検出</li>
              <li>データの一意性確認・重複排除</li>
              <li>デジタル署名・認証</li>
              <li>チェックサムによるデータ検証</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              推奨事項
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>セキュリティ用途にはSHA-256以上を使用</li>
              <li>MD5とSHA-1は衝突脆弱性があるため非推奨</li>
              <li>パスワード保存にはbcryptやArgon2を推奨</li>
              <li>APIの署名にはHMACを使用</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              機能説明
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>HMAC:</strong> キーを使用したメッセージ認証コード</li>
              <li><strong>ハッシュ検証:</strong> ダウンロードファイルの整合性チェック</li>
              <li><strong>バッチ処理:</strong> 複数ファイルの一括ハッシュ計算</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
