<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const inputText = ref('')
const outputText = ref('')
const password = ref('')
const algorithm = ref<'AES-256' | 'AES-128'>('AES-256')
const outputFormat = ref<'base64' | 'hex'>('base64')
const showPassword = ref(false)
const processing = ref(false)

// Web Crypto API を使用した暗号化
async function encryptText(text: string, password: string): Promise<string> {
  try {
    // パスワードからキーを生成
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const passwordBuffer = encoder.encode(password)

    // PBKDF2でキー導出
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    )

    // ランダムなソルトとIVを生成
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // AESキーを導出
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: algorithm.value === 'AES-256' ? 256 : 128 },
      false,
      ['encrypt'],
    )

    // 暗号化
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data,
    )

    // 結果を結合（salt + iv + encrypted）
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)

    // 指定フォーマットで返す
    if (outputFormat.value === 'base64') {
      return btoa(String.fromCharCode(...combined))
    }
    else {
      return Array.from(combined)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }
  }
  catch (error) {
    console.error('Encryption error:', error)
    throw new Error('暗号化に失敗しました')
  }
}

// 復号化
async function decryptText(encryptedText: string, password: string): Promise<string> {
  try {
    // 暗号化データをバイト配列に変換
    let combined: Uint8Array
    if (outputFormat.value === 'base64') {
      const binaryString = atob(encryptedText)
      combined = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i)
      }
    }
    else {
      const bytes = encryptedText.match(/.{1,2}/g)
      if (!bytes) throw new Error('Invalid hex format')
      combined = new Uint8Array(bytes.map(byte => parseInt(byte, 16)))
    }

    // salt, iv, 暗号化データを分離
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const encrypted = combined.slice(28)

    // パスワードからキーを生成
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    )

    // AESキーを導出
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: algorithm.value === 'AES-256' ? 256 : 128 },
      false,
      ['decrypt'],
    )

    // 復号化
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted,
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }
  catch (error) {
    console.error('Decryption error:', error)
    throw new Error('復号化に失敗しました。パスワードが正しくない可能性があります。')
  }
}

// 処理実行
const process = async () => {
  if (!inputText.value.trim()) {
    toast.add({
      title: 'エラー',
      description: mode.value === 'encrypt' ? 'テキストを入力してください' : '暗号化されたテキストを入力してください',
      color: 'error',
    })
    return
  }

  if (!password.value) {
    toast.add({
      title: 'エラー',
      description: 'パスワードを入力してください',
      color: 'error',
    })
    return
  }

  processing.value = true
  outputText.value = ''

  try {
    if (mode.value === 'encrypt') {
      outputText.value = await encryptText(inputText.value, password.value)
      toast.add({
        title: '暗号化完了',
        description: 'テキストが暗号化されました',
      })
    }
    else {
      outputText.value = await decryptText(inputText.value, password.value)
      toast.add({
        title: '復号化完了',
        description: 'テキストが復号化されました',
      })
    }
  }
  catch (error) {
    toast.add({
      title: 'エラー',
      description: error instanceof Error ? error.message : '処理に失敗しました',
      color: 'error',
    })
  }
  finally {
    processing.value = false
  }
}

// パスワード強度チェック
const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) return { strength: 0, label: '未入力', color: 'text-muted-foreground' }

  let strength = 0
  const checks = [
    pwd.length >= 8,
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^a-zA-Z0-9]/.test(pwd),
  ]

  strength = checks.filter(check => check).length

  const labels = ['非常に弱い', '弱い', '普通', '強い', '非常に強い']
  const colors = [
    'text-red-600 dark:text-red-400',
    'text-orange-600 dark:text-orange-400',
    'text-yellow-600 dark:text-yellow-400',
    'text-green-600 dark:text-green-400',
    'text-green-600 dark:text-green-400',
  ]

  return {
    strength,
    label: labels[strength],
    color: colors[strength],
  }
})

// 入出力クリア
const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
  password.value = ''
}

// モード切り替え
const switchMode = () => {
  mode.value = mode.value === 'encrypt' ? 'decrypt' : 'encrypt'
  // 入出力を入れ替え
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
}

// クリップボード操作
const { copy } = useClipboard()
const toast = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast.add({
      description: 'クリップボードにコピーしました',
    })
  }
  catch (err) {
    console.error('Failed to copy:', err)
    toast.add({
      description: 'コピーに失敗しました',
      color: 'error',
    })
  }
}

// ファイル読み込み
const loadFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    inputText.value = e.target?.result as string
  }
  reader.readAsText(file)
}

// ファイル保存
const saveToFile = () => {
  if (!outputText.value) return

  const blob = new Blob([outputText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = mode.value === 'encrypt' ? 'encrypted.txt' : 'decrypted.txt'
  link.click()

  URL.revokeObjectURL(url)
}

// SEO設定
useSeoMeta({
  title: 'テキスト暗号化 | Web開発ツール',
  description: 'AES暗号化でテキストを安全に暗号化・復号化。パスワード保護対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        テキスト暗号化
      </h1>
      <p class="text-muted-foreground">
        AES暗号化でテキストを安全に暗号化・復号化します。
      </p>
    </div>

    <!-- 警告 -->
    <UAlert
      icon="heroicons:shield-exclamation"
      title="セキュリティに関する注意"
      description="このツールはブラウザ上で動作するため、機密性の高い情報の暗号化には適していません。重要なデータの暗号化には、専門的なセキュリティツールを使用してください。" />

    <!-- モード選択 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          モード選択
        </h3>
      </template>
      <div class="flex gap-2">
        <UButton
          :variant="mode === 'encrypt' ? 'default' : 'outline'"
          @click="mode = 'encrypt'">
          <Icon name="heroicons:lock-closed" class="w-4 h-4 mr-2" />
          暗号化
        </UButton>
        <UButton
          :variant="mode === 'decrypt' ? 'default' : 'outline'"
          @click="mode = 'decrypt'">
          <Icon name="heroicons:lock-open" class="w-4 h-4 mr-2" />
          復号化
        </UButton>
        <UButton
          variant="ghost"
          size="icon"
          @click="switchMode">
          <Icon name="heroicons:arrows-right-left" class="w-4 h-4" />
        </UButton>
      </div>
    </UCard>

    <!-- 設定 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          暗号化設定
        </h3>
      </template>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">
            パスワード
          </label>
          <div class="relative">
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="強力なパスワードを入力"
              class="pr-10" />
            <UButton
              variant="ghost"
              size="icon"
              class="absolute right-0 top-0 h-full px-3"
              @click="showPassword = !showPassword">
              <Icon
                :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="w-4 h-4" />
            </UButton>
          </div>
          <p class="text-sm mt-1" :class="passwordStrength.color">
            強度: {{ passwordStrength.label }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">
              暗号化方式
            </label>
            <div class="flex gap-2">
              <UButton
                v-for="alg in ['AES-256', 'AES-128'] as const"
                :key="alg"
                :variant="algorithm === alg ? 'default' : 'outline'"
                size="sm"
                @click="algorithm = alg">
                {{ alg }}
              </UButton>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              出力形式
            </label>
            <div class="flex gap-2">
              <UButton
                v-for="fmt in ['base64', 'hex'] as const"
                :key="fmt"
                :variant="outputFormat === fmt ? 'default' : 'outline'"
                size="sm"
                @click="outputFormat = fmt">
                {{ fmt.toUpperCase() }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 入力 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">
            {{ mode === 'encrypt' ? '平文テキスト' : '暗号化テキスト' }}
          </h3>
          <div class="flex gap-2">
            <label>
              <input
                type="file"
                accept=".txt"
                class="hidden"
                @change="loadFile">
              <UButton size="sm" variant="outline" as="span">
                <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                ファイル読込
              </UButton>
            </label>
          </div>
        </div>
      </template>
      <textarea
        v-model="inputText"
        :placeholder="mode === 'encrypt' ? 'ここにテキストを入力してください' : 'ここに暗号化されたテキストを貼り付けてください'"
        class="w-full h-48 p-3 font-mono text-sm border rounded-md bg-background resize-none"
        spellcheck="false"></textarea>
      <template #footer>
        <UButton
          class="w-full"
          :disabled="!inputText || !password || processing"
          @click="process">
          <Icon v-if="processing" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          {{ mode === 'encrypt' ? '暗号化' : '復号化' }}
        </UButton>
      </template>
    </UCard>

    <!-- 出力 -->
    <UCard v-if="outputText">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">
            {{ mode === 'encrypt' ? '暗号化結果' : '復号化結果' }}
          </h3>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="ghost"
              @click="copyToClipboard(outputText)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              @click="saveToFile">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              保存
            </UButton>
          </div>
        </div>
      </template>
      <textarea
        v-model="outputText"
        readonly
        class="w-full h-48 p-3 font-mono text-sm border rounded-md bg-muted resize-none"
        spellcheck="false"></textarea>
    </UCard>

    <!-- アクション -->
    <div class="flex justify-end">
      <UButton
        variant="outline"
        @click="clearAll">
        <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
        クリア
      </UButton>
    </div>

    <!-- 説明 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          使用方法と技術仕様
        </h3>
      </template>
      <div class="space-y-4 text-muted-foreground">
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            暗号化プロセス
          </h3>
          <ol class="list-decimal list-inside space-y-1">
            <li>PBKDF2を使用してパスワードからキーを導出（100,000回反復）</li>
            <li>ランダムなソルト（16バイト）とIV（12バイト）を生成</li>
            <li>AES-GCMモードで暗号化</li>
            <li>結果をBase64またはHex形式でエンコード</li>
          </ol>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            セキュリティ機能
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>認証付き暗号化（AES-GCM）でデータの完全性を保証</li>
            <li>各暗号化でランダムなソルトとIVを使用</li>
            <li>PBKDF2による総当たり攻撃への耐性</li>
            <li>Web Crypto APIを使用した安全な実装</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            パスワードの推奨事項
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>最低8文字以上</li>
            <li>大文字・小文字・数字・記号を含む</li>
            <li>辞書に載っている単語を避ける</li>
            <li>個人情報を含めない</li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>
