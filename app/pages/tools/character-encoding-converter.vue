<script setup lang="ts">
definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputText = ref('')
const outputText = ref('')
const inputEncoding = ref('UTF-8')
const outputEncoding = ref('Shift_JIS')
const autoDetect = ref(false)
const detectedEncoding = ref('')
const showHexView = ref(false)
const error = ref('')

// サポートするエンコーディング
const encodings = [
  { value: 'UTF-8', label: 'UTF-8' },
  { value: 'Shift_JIS', label: 'Shift_JIS (Windows-31J)' },
  { value: 'EUC-JP', label: 'EUC-JP' },
  { value: 'ISO-2022-JP', label: 'ISO-2022-JP (JIS)' },
  { value: 'UTF-16', label: 'UTF-16' },
  { value: 'UTF-16BE', label: 'UTF-16BE (Big Endian)' },
  { value: 'UTF-16LE', label: 'UTF-16LE (Little Endian)' },
  { value: 'UTF-32', label: 'UTF-32' },
  { value: 'ISO-8859-1', label: 'ISO-8859-1 (Latin-1)' },
  { value: 'Windows-1252', label: 'Windows-1252' },
  { value: 'GB2312', label: 'GB2312 (簡体字中国語)' },
  { value: 'GBK', label: 'GBK (簡体字中国語)' },
  { value: 'Big5', label: 'Big5 (繁体字中国語)' },
  { value: 'EUC-KR', label: 'EUC-KR (韓国語)' },
]

// エンコーディング検出（簡易版）
const detectEncoding = (data: Uint8Array): string => {
  // BOMチェック
  if (data.length >= 3) {
    if (data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
      return 'UTF-8'
    }
  }
  if (data.length >= 2) {
    if (data[0] === 0xFF && data[1] === 0xFE) {
      return 'UTF-16LE'
    }
    if (data[0] === 0xFE && data[1] === 0xFF) {
      return 'UTF-16BE'
    }
  }

  // 簡易的な文字パターン検出
  let utf8Valid = true
  let shiftJisValid = true
  let eucJpValid = true

  for (let i = 0; i < data.length; i++) {
    const byte = data[i]

    // UTF-8チェック
    if (utf8Valid) {
      if (byte >= 0x80) {
        if (byte >= 0xC0 && byte <= 0xDF) {
          // 2バイト文字
          if (i + 1 >= data.length || data[i + 1] < 0x80 || data[i + 1] > 0xBF) {
            utf8Valid = false
          }
          i++
        }
        else if (byte >= 0xE0 && byte <= 0xEF) {
          // 3バイト文字
          if (i + 2 >= data.length
            || data[i + 1] < 0x80 || data[i + 1] > 0xBF
            || data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
            utf8Valid = false
          }
          i += 2
        }
        else {
          utf8Valid = false
        }
      }
    }

    // Shift_JISチェック（簡易版）
    if (shiftJisValid && ((byte >= 0x81 && byte <= 0x9F) || (byte >= 0xE0 && byte <= 0xFC))) {
      if (i + 1 >= data.length) {
        shiftJisValid = false
      }
      i++
    }

    // EUC-JPチェック（簡易版）
    if (eucJpValid && byte >= 0xA1 && byte <= 0xFE) {
      if (i + 1 >= data.length || data[i + 1] < 0xA1 || data[i + 1] > 0xFE) {
        eucJpValid = false
      }
      i++
    }
  }

  if (utf8Valid) return 'UTF-8'
  if (shiftJisValid) return 'Shift_JIS'
  if (eucJpValid) return 'EUC-JP'

  return 'UTF-8' // デフォルト
}

// 文字列をバイト配列に変換
const stringToBytes = (str: string, encoding: string): Uint8Array => {
  try {
    const encoder = new TextEncoder()

    // TextEncoderはUTF-8のみサポート
    if (encoding === 'UTF-8') {
      return encoder.encode(str)
    }

    // 他のエンコーディングは簡易実装
    const bytes: number[] = []

    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)

      switch (encoding) {
        case 'UTF-16BE':
          bytes.push((code >> 8) & 0xFF)
          bytes.push(code & 0xFF)
          break
        case 'UTF-16LE':
          bytes.push(code & 0xFF)
          bytes.push((code >> 8) & 0xFF)
          break
        case 'ISO-8859-1':
        case 'Windows-1252':
          bytes.push(code & 0xFF)
          break
        default:
          // その他のエンコーディングは未実装
          throw new Error(`エンコーディング ${encoding} はサポートされていません`)
      }
    }

    return new Uint8Array(bytes)
  }
  catch (e) {
    console.error('Encoding error:', e)
    throw new Error('エンコードに失敗しました')
  }
}

// バイト配列を文字列に変換
const bytesToString = (bytes: Uint8Array, encoding: string): string => {
  try {
    const decoder = new TextDecoder(encoding)
    return decoder.decode(bytes)
  }
  catch {
    // フォールバック
    try {
      const decoder = new TextDecoder('UTF-8')
      return decoder.decode(bytes)
    }
    catch {
      throw new Error('デコードに失敗しました')
    }
  }
}

// 変換処理
const convert = () => {
  error.value = ''
  outputText.value = ''
  detectedEncoding.value = ''

  if (!inputText.value) {
    error.value = 'テキストを入力してください'
    return
  }

  try {
    // 入力テキストをバイト配列に変換
    const bytes = stringToBytes(inputText.value, inputEncoding.value)

    // 自動検出
    if (autoDetect.value) {
      detectedEncoding.value = detectEncoding(bytes)
      inputEncoding.value = detectedEncoding.value
    }

    // 出力エンコーディングに変換
    if (inputEncoding.value === outputEncoding.value) {
      outputText.value = inputText.value
    }
    else {
      // 一旦元のエンコーディングでデコードしてから、目的のエンコーディングでエンコード
      const decoded = bytesToString(bytes, inputEncoding.value)
      const reencoded = stringToBytes(decoded, outputEncoding.value)
      outputText.value = bytesToString(reencoded, outputEncoding.value)
    }

    toast.add({
      title: '変換完了',
      description: `${inputEncoding.value} → ${outputEncoding.value} への変換が完了しました`,
    })
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '変換に失敗しました'
    toast.add({
      title: 'エラー',
      description: error.value,
      color: 'error',
    })
  }
}

// 16進数表示
const hexView = computed(() => {
  if (!inputText.value || !showHexView.value) return ''

  try {
    const bytes = stringToBytes(inputText.value, inputEncoding.value)
    const hex: string[] = []

    for (let i = 0; i < bytes.length; i += 16) {
      const line: string[] = []
      const chars: string[] = []

      // アドレス
      line.push(i.toString(16).padStart(8, '0') + ':')

      // 16バイト分のデータ
      for (let j = 0; j < 16; j++) {
        if (i + j < bytes.length) {
          const byte = bytes[i + j]
          line.push(byte.toString(16).padStart(2, '0'))
          chars.push(byte >= 0x20 && byte <= 0x7E ? String.fromCharCode(byte) : '.')
        }
        else {
          line.push('  ')
          chars.push(' ')
        }

        if (j === 7) line.push(' ')
      }

      hex.push(line.join(' ') + '  |' + chars.join('') + '|')
    }

    return hex.join('\n')
  }
  catch {
    return 'エンコードエラー'
  }
})

// 文字化け修復のヒント
const mojibakeHints = [
  {
    pattern: '譁・ｭ怜喧縺',
    hint: 'UTF-8をShift_JISで読んでいる可能性があります',
    fix: { from: 'Shift_JIS', to: 'UTF-8' },
  },
  {
    pattern: '繧ｳ繝ｼ繝',
    hint: 'UTF-8をEUC-JPで読んでいる可能性があります',
    fix: { from: 'EUC-JP', to: 'UTF-8' },
  },
  {
    pattern: '\\u3042\\u3044',
    hint: 'エスケープされたUnicode文字列の可能性があります',
    fix: null,
  },
  {
    pattern: '?????',
    hint: 'エンコーディングがサポートしていない文字が含まれています',
    fix: null,
  },
]

// 文字化け検出
const detectMojibake = computed(() => {
  if (!outputText.value) return null

  for (const hint of mojibakeHints) {
    if (outputText.value.includes(hint.pattern)) {
      return hint
    }
  }

  // その他の文字化けパターン
  const questionMarkCount = (outputText.value.match(/\?/g) || []).length
  const textLength = outputText.value.length

  if (questionMarkCount > textLength * 0.3) {
    return {
      pattern: '?の多発',
      hint: '変換先のエンコーディングが文字をサポートしていない可能性があります',
      fix: null,
    }
  }

  return null
})

// サンプルテキスト
const sampleTexts = [
  { label: '日本語（ひらがな・カタカナ・漢字）', text: 'こんにちは、世界！\nカタカナとHello World\n漢字も含まれています。' },
  { label: '絵文字入り', text: 'こんにちは😊\n絵文字🎉も変換できます👍' },
  { label: '特殊記号', text: '①②③ ♪♫♬ ㈱㈲ ℃℉ €£¥' },
  { label: '中国語（簡体字）', text: '你好，世界！\n这是简体中文。' },
  { label: '韓国語', text: '안녕하세요!\n한국어 텍스트입니다.' },
]

// ファイル読み込み
const loadFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // エンコーディング自動検出
    if (autoDetect.value) {
      const detected = detectEncoding(bytes)
      detectedEncoding.value = detected
      inputEncoding.value = detected
    }

    // テキストに変換
    inputText.value = bytesToString(bytes, inputEncoding.value)

    toast.add({
      title: 'ファイル読み込み完了',
      description: `${file.name} を読み込みました`,
    })
  }
  catch {
    toast.add({
      title: 'エラー',
      description: 'ファイルの読み込みに失敗しました',
      color: 'error',
    })
  }
}

// クリップボード操作
const toast = useToast()
const { copyToClipboard } = useCopyToClipboard()

// SEO設定
useSeoMeta({
  title: '文字コード変換 | Web開発ツール',
  description: '各種文字エンコーディング間の変換。文字化け修復、自動検出対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        文字コード変換
      </h1>
      <p class="text-muted-foreground">
        各種文字エンコーディング間でテキストを変換し、文字化けを修復します。
      </p>
    </div>

    <!-- 設定 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          変換設定
        </h3>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">
              入力エンコーディング
            </label>
            <select
              v-model="inputEncoding"
              class="w-full px-3 py-2 border rounded-md bg-background">
              <option v-for="enc in encodings" :key="enc.value" :value="enc.value">
                {{ enc.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">
              出力エンコーディング
            </label>
            <select
              v-model="outputEncoding"
              class="w-full px-3 py-2 border rounded-md bg-background">
              <option v-for="enc in encodings" :key="enc.value" :value="enc.value">
                {{ enc.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="autoDetect"
              type="checkbox"
              class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
            エンコーディング自動検出
          </label>

          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="showHexView"
              type="checkbox"
              class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
            16進数表示
          </label>
        </div>

        <div v-if="detectedEncoding" class="text-sm">
          <span class="text-muted-foreground">検出されたエンコーディング:</span>
          <UBadge variant="outline" class="ml-2">
            {{ detectedEncoding }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- サンプル -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          サンプルテキスト
        </h3>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="sample in sampleTexts"
          :key="sample.label"
          variant="outline"
          size="sm"
          @click="inputText = sample.text">
          {{ sample.label }}
        </UButton>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 入力 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              入力テキスト
            </h3>
            <label>
              <input
                type="file"
                accept=".txt,.log,.csv"
                class="hidden"
                @change="loadFile">
              <UButton size="sm" variant="outline" as="span">
                <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                ファイル読込
              </UButton>
            </label>
          </div>
        </template>

        <textarea
          v-model="inputText"
          placeholder="変換したいテキストを入力してください"
          class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-background resize-none"
          spellcheck="false"></textarea>

        <div v-if="showHexView && hexView" class="mt-4">
          <p class="text-sm font-medium mb-2">
            16進数ダンプ:
          </p>
          <pre class="p-3 bg-muted rounded-md overflow-x-auto text-xs font-mono">{{ hexView }}</pre>
        </div>
      </UCard>

      <!-- 出力 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              変換結果
            </h3>
            <UButton
              v-if="outputText"
              size="sm"
              variant="ghost"
              @click="copyToClipboard(outputText)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </UButton>
          </div>
        </template>

        <textarea
          v-model="outputText"
          readonly
          placeholder="変換結果がここに表示されます"
          class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted resize-none"
          spellcheck="false"></textarea>

        <UAlert
          v-if="error" class="mt-4" color="error"
          icon="heroicons:exclamation-circle" :description="error" />

        <UAlert
          v-if="detectMojibake" class="mt-4" icon="heroicons:exclamation-triangle"
          title="文字化けの可能性">
          <template #description>
            <p>{{ detectMojibake.hint }}</p>
            <UButton
              v-if="detectMojibake.fix"
              size="sm"
              variant="outline"
              class="mt-2"
              @click="inputEncoding = detectMojibake.fix.from; outputEncoding = detectMojibake.fix.to; convert()">
              {{ detectMojibake.fix.from }} → {{ detectMojibake.fix.to }} で再変換
            </UButton>
          </template>
        </UAlert>
      </UCard>
    </div>

    <!-- 変換ボタン -->
    <div class="flex justify-center">
      <UButton
        size="lg"
        :disabled="!inputText"
        @click="convert">
        <Icon name="heroicons:arrows-right-left" class="w-5 h-5 mr-2" />
        変換実行
      </UButton>
    </div>

    <!-- 説明 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          文字エンコーディングについて
        </h3>
      </template>

      <div class="space-y-4 text-muted-foreground">
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            主要なエンコーディング
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li><strong>UTF-8:</strong> 現在の標準。全世界の文字を表現可能</li>
            <li><strong>Shift_JIS:</strong> Windows日本語環境の標準</li>
            <li><strong>EUC-JP:</strong> Unix/Linux日本語環境で使用</li>
            <li><strong>ISO-2022-JP:</strong> メールで使用される7ビットエンコーディング</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            文字化けの原因
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>保存時と読み込み時のエンコーディングの不一致</li>
            <li>エンコーディングがサポートしていない文字の使用</li>
            <li>BOM（Byte Order Mark）の有無</li>
            <li>自動検出の誤判定</li>
          </ul>
        </div>
        <UAlert icon="heroicons:information-circle" description="このツールは基本的なエンコーディング変換のみサポートしています。 より高度な変換が必要な場合は、専用のテキストエディタの使用を推奨します。" />
      </div>
    </UCard>
  </div>
</template>
