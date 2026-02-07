<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})
interface JWTHeader {
  alg?: string
  typ?: string
  kid?: string
  [key: string]: unknown
}

interface JWTPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: unknown
}

// 状態管理
const jwtInput = ref('')
const header = ref<JWTHeader | null>(null)
const payload = ref<JWTPayload | null>(null)
const signature = ref('')
const isValid = ref(false)
const error = ref('')
const prettyPrint = ref(true)
const showRawBase64 = ref(false)

// Base64URL デコード
const base64UrlDecode = (str: string) => {
  // Base64URLをBase64に変換
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

  // パディングを追加
  const pad = base64.length % 4
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64url string')
    }
    base64 += new Array(5 - pad).join('=')
  }

  // デコード
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
  }
  catch {
    throw new Error('Invalid base64url encoding')
  }
}

// JWT デコード
const decodeJWT = (token: string) => {
  try {
    error.value = ''
    const parts = token.split('.')

    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts separated by dots')
    }

    // ヘッダーをデコード
    const headerJson = base64UrlDecode(parts[0])
    header.value = JSON.parse(headerJson)

    // ペイロードをデコード
    const payloadJson = base64UrlDecode(parts[1])
    payload.value = JSON.parse(payloadJson)

    // 署名部分
    signature.value = parts[2]

    isValid.value = true
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid JWT token'
    header.value = null
    payload.value = null
    signature.value = ''
    isValid.value = false
  }
}

// JWT入力の監視
watch(jwtInput, (newValue) => {
  if (newValue.trim()) {
    decodeJWT(newValue.trim())
  }
  else {
    header.value = null
    payload.value = null
    signature.value = ''
    isValid.value = false
    error.value = ''
  }
})

// タイムスタンプをフォーマット
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    relative: getRelativeTime(date),
  }
}

// 相対時間を取得
const getRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const absDiff = Math.abs(diff)

  const minutes = Math.floor(absDiff / (1000 * 60))
  const hours = Math.floor(absDiff / (1000 * 60 * 60))
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))

  if (diff > 0) {
    // 過去
    if (days > 0) return `${days}日前`
    if (hours > 0) return `${hours}時間前`
    if (minutes > 0) return `${minutes}分前`
    return '今'
  }
  else {
    // 未来
    if (days > 0) return `${days}日後`
    if (hours > 0) return `${hours}時間後`
    if (minutes > 0) return `${minutes}分後`
    return '今'
  }
}

// トークンの有効期限チェック
const tokenStatus = computed(() => {
  if (!payload.value) return null

  const now = Math.floor(Date.now() / 1000)

  if (payload.value.exp && payload.value.exp < now) {
    return { status: 'expired', message: '期限切れ', variant: 'destructive' }
  }

  if (payload.value.nbf && payload.value.nbf > now) {
    return { status: 'not-yet-valid', message: 'まだ有効ではない', variant: 'warning' }
  }

  return { status: 'valid', message: '有効', variant: 'success' }
})

// 既知のクレーム
const knownClaims = {
  iss: 'Issuer (発行者)',
  sub: 'Subject (主題)',
  aud: 'Audience (対象者)',
  exp: 'Expiration Time (有効期限)',
  nbf: 'Not Before (有効開始時刻)',
  iat: 'Issued At (発行時刻)',
  jti: 'JWT ID (JWT識別子)',
}

// JSONを整形
const formatJSON = (obj: unknown) => {
  if (!prettyPrint.value) {
    return JSON.stringify(obj)
  }
  return JSON.stringify(obj, null, 2)
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string, name: string) => {
  try {
    await copy(text)
    toast({
      title: 'コピーしました',
      description: `${name}をクリップボードにコピーしました`,
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

// サンプルJWT
const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImF1ZCI6WyJhcGkxIiwiYXBpMiJdLCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIn0.5mhBHqs5_DTLdINd9p5m7ZJ6XD0Xc55kIaCRY5r6HRA'

const loadSample = () => {
  jwtInput.value = sampleJWT
}

// SEO設定
useSeoMeta({
  title: 'JWT解析ツール | Web開発ツール',
  description: 'JWTトークンをデコードして内容を確認。ヘッダー、ペイロード、有効期限をチェック。',
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        JWT解析ツール
      </h1>
      <p class="text-muted-foreground">
        JWTトークンをデコードして内容を確認できます。
      </p>
    </div>

    <!-- JWT入力 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>JWTトークン</CardTitle>
          <Button
            size="sm"
            variant="outline"
            @click="loadSample">
            <Icon name="heroicons:document-text" class="w-4 h-4 mr-1" />
            サンプル
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="jwtInput"
          placeholder="JWTトークンを貼り付けてください..."
          class="w-full h-32 p-3 text-sm font-mono border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          spellcheck="false">
        </textarea>
        <div v-if="error" class="mt-2 text-sm text-destructive">
          <Icon name="heroicons:exclamation-circle" class="w-4 h-4 inline mr-1" />
          {{ error }}
        </div>
      </CardContent>
    </Card>

    <!-- 解析結果 -->
    <div v-if="isValid" class="space-y-6">
      <!-- ステータス -->
      <Card v-if="tokenStatus">
        <CardContent class="py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon
                :name="tokenStatus.status === 'valid' ? 'CheckCircle' : tokenStatus.status === 'expired' ? 'XCircle' : 'AlertCircle'"
                :class="[
                  'w-5 h-5',
                  tokenStatus.status === 'valid' ? 'text-green-600' : tokenStatus.status === 'expired' ? 'text-destructive' : 'text-yellow-600',
                ]" />
              <span class="font-medium">トークンステータス: {{ tokenStatus.message }}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="prettyPrint"
                  type="checkbox"
                  class="rounded">
                <span>整形表示</span>
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="showRawBase64"
                  type="checkbox"
                  class="rounded">
                <span>Base64表示</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- ヘッダー -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg">
                ヘッダー
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(formatJSON(header), 'ヘッダー')">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded text-sm overflow-x-auto"><code>{{ formatJSON(header) }}</code></pre>
            <div v-if="header && showRawBase64" class="mt-3">
              <div class="text-xs text-muted-foreground mb-1">
                Base64URL:
              </div>
              <code class="text-xs break-all">{{ jwtInput.split('.')[0] }}</code>
            </div>
          </CardContent>
        </Card>

        <!-- ペイロード -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg">
                ペイロード
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(formatJSON(payload), 'ペイロード')">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded text-sm overflow-x-auto"><code>{{ formatJSON(payload) }}</code></pre>
            <div v-if="payload && showRawBase64" class="mt-3">
              <div class="text-xs text-muted-foreground mb-1">
                Base64URL:
              </div>
              <code class="text-xs break-all">{{ jwtInput.split('.')[1] }}</code>
            </div>
          </CardContent>
        </Card>

        <!-- 署名 -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">
              署名
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="p-3 bg-muted rounded">
              <code class="text-sm break-all">{{ signature }}</code>
            </div>
            <div class="mt-3 text-sm text-muted-foreground">
              <Icon name="heroicons:information-circle" class="w-4 h-4 inline mr-1" />
              署名の検証にはシークレットキーが必要です
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- クレーム詳細 -->
      <Card>
        <CardHeader>
          <CardTitle>クレーム詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- 標準クレーム -->
            <div>
              <h4 class="font-medium mb-3">
                標準クレーム
              </h4>
              <div class="grid md:grid-cols-2 gap-3">
                <div
                  v-for="(description, claim) in knownClaims"
                  v-show="payload && payload[claim] !== undefined"
                  :key="claim"
                  class="p-3 bg-muted rounded">
                  <div class="text-sm text-muted-foreground mb-1">
                    {{ description }}
                  </div>
                  <div class="font-medium">
                    <!-- タイムスタンプの特別処理 -->
                    <template v-if="['exp', 'nbf', 'iat'].includes(claim) && typeof payload[claim] === 'number'">
                      <div>{{ formatTimestamp(payload[claim]).local }}</div>
                      <div class="text-sm text-muted-foreground">
                        {{ formatTimestamp(payload[claim]).relative }}
                      </div>
                    </template>
                    <!-- 配列の処理 -->
                    <template v-else-if="Array.isArray(payload[claim])">
                      <div v-for="(item, index) in payload[claim]" :key="index">
                        {{ item }}
                      </div>
                    </template>
                    <!-- その他 -->
                    <template v-else>
                      {{ payload[claim] }}
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- カスタムクレーム -->
            <div v-if="payload">
              <h4 class="font-medium mb-3">
                カスタムクレーム
              </h4>
              <div class="grid md:grid-cols-2 gap-3">
                <div
                  v-for="(value, key) in payload"
                  v-show="!Object.keys(knownClaims).includes(key)"
                  :key="key"
                  class="p-3 bg-muted rounded">
                  <div class="text-sm text-muted-foreground mb-1">
                    {{ key }}
                  </div>
                  <div class="font-medium">
                    <template v-if="typeof value === 'object'">
                      <pre class="text-sm">{{ JSON.stringify(value, null, 2) }}</pre>
                    </template>
                    <template v-else>
                      {{ value }}
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 初期状態 -->
    <div v-else-if="!jwtInput && !error" class="text-center py-16">
      <Icon name="heroicons:key" class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <p class="text-muted-foreground">
        JWTトークンを入力してください
      </p>
    </div>
    <!-- JWT仕様 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>JWT仕様について</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <p>
          JWT (JSON Web Token) は、2つのパーティ間で情報を安全に転送するためのコンパクトで自己完結的な方法です。
        </p>
        <div>
          <h5 class="font-medium text-foreground mb-2">
            構造:
          </h5>
          <ul class="list-disc list-inside space-y-1">
            <li><strong>ヘッダー:</strong> トークンのタイプと使用されている署名アルゴリズム</li>
            <li><strong>ペイロード:</strong> エンティティ（通常はユーザー）と追加データに関するステートメント</li>
            <li><strong>署名:</strong> トークンが改ざんされていないことを確認するために使用</li>
          </ul>
        </div>
        <div>
          <h5 class="font-medium text-foreground mb-2">
            一般的な使用例:
          </h5>
          <ul class="list-disc list-inside space-y-1">
            <li>認証: ユーザーがログインした後、各リクエストにJWTを含める</li>
            <li>情報交換: 署名により送信者の身元を確認し、内容が改ざんされていないことを検証</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
