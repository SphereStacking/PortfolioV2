<script setup lang="ts">
definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputText = ref('')
const encodingType = ref<'url' | 'html' | 'base64' | 'unicode' | 'escape'>('url')
const decodeMode = ref(false)
const _preserveLineBreaks = ref(true)
const urlComponentMode = ref(false)
const htmlEntityMode = ref<'named' | 'numeric' | 'hex'>('named')
const unicodeFormat = ref<'codepoint' | 'jsEscape' | 'cssEscape' | 'pythonEscape'>('jsEscape')
const escapeQuotes = ref<'single' | 'double' | 'both'>('double')

// Quote options for template
const quoteOptions = [
  { value: 'single', label: 'Single (\')' },
  { value: 'double', label: 'Double (")' },
  { value: 'both', label: 'Both' },
]

// 出力
const outputText = computed(() => {
  if (!inputText.value) return ''

  try {
    if (decodeMode.value) {
      return decode(inputText.value, encodingType.value)
    }
    else {
      return encode(inputText.value, encodingType.value)
    }
  }
  catch (err) {
    return `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
})

// エンコード処理
const encode = (text: string, type: string): string => {
  switch (type) {
    case 'url':
      return urlComponentMode.value
        ? encodeURIComponent(text)
        : encodeURI(text)

    case 'html':
      return encodeHTML(text)

    case 'base64':
      // Convert string to base64
      return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))

    case 'unicode':
      return encodeUnicode(text)

    case 'escape':
      return escapeString(text)

    default:
      return text
  }
}

// デコード処理
const decode = (text: string, type: string): string => {
  switch (type) {
    case 'url':
      return urlComponentMode.value
        ? decodeURIComponent(text)
        : decodeURI(text)

    case 'html':
      return decodeHTML(text)

    case 'base64':
      // Decode base64
      try {
        return decodeURIComponent(atob(text).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
      }
      catch {
        return 'Invalid base64'
      }

    case 'unicode':
      return decodeUnicode(text)

    case 'escape':
      return unescapeString(text)

    default:
      return text
  }
}

// HTML エンコード
const encodeHTML = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  let encoded = div.innerHTML

  if (htmlEntityMode.value === 'numeric') {
    // 数値参照に変換
    // eslint-disable-next-line no-control-regex
    encoded = encoded.replace(/[^\x00-\x7F]/g, (char) => {
      return `&#${char.charCodeAt(0)};`
    })
  }
  else if (htmlEntityMode.value === 'hex') {
    // 16進数参照に変換
    // eslint-disable-next-line no-control-regex
    encoded = encoded.replace(/[^\x00-\x7F]/g, (char) => {
      return `&#x${char.charCodeAt(0).toString(16)};`
    })
  }
  else {
    // 名前付き実体参照
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&apos;',
      '¢': '&cent;',
      '£': '&pound;',
      '¥': '&yen;',
      '€': '&euro;',
      '©': '&copy;',
      '®': '&reg;',
      '™': '&trade;',
      '°': '&deg;',
      '±': '&plusmn;',
      '¼': '&frac14;',
      '½': '&frac12;',
      '¾': '&frac34;',
      '×': '&times;',
      '÷': '&divide;',
      '–': '&ndash;',
      '—': '&mdash;',
      '…': '&hellip;',
      '•': '&bull;',
      '→': '&rarr;',
      '←': '&larr;',
      '↑': '&uarr;',
      '↓': '&darr;',
      '♠': '&spades;',
      '♣': '&clubs;',
      '♥': '&hearts;',
      '♦': '&diams;',
    }

    for (const [char, entity] of Object.entries(entities)) {
      encoded = encoded.replace(new RegExp(char, 'g'), entity)
    }
  }

  return encoded
}

// HTML デコード
const decodeHTML = (text: string): string => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

// Unicode エンコード
const encodeUnicode = (text: string): string => {
  return text.split('').map((char) => {
    const code = char.charCodeAt(0)

    switch (unicodeFormat.value) {
      case 'codepoint':
        return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`

      case 'jsEscape':
        if (code > 127) {
          return `\\u${code.toString(16).padStart(4, '0')}`
        }
        return char

      case 'cssEscape':
        if (code > 127) {
          return `\\${code.toString(16).padStart(6, '0')}`
        }
        return char

      case 'pythonEscape':
        if (code > 127) {
          if (code <= 0xFFFF) {
            return `\\u${code.toString(16).padStart(4, '0')}`
          }
          else {
            return `\\U${code.toString(16).padStart(8, '0')}`
          }
        }
        return char

      default:
        return char
    }
  }).join('')
}

// Unicode デコード
const decodeUnicode = (text: string): string => {
  // U+XXXX形式
  text = text.replace(/U\+([0-9A-Fa-f]{4,6})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })

  // \uXXXX形式
  text = text.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })

  // \UXXXXXXXX形式（Python）
  text = text.replace(/\\U([0-9A-Fa-f]{8})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })

  // CSS形式 \XXXXXX
  text = text.replace(/\\([0-9A-Fa-f]{1,6})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })

  return text
}

// 文字列エスケープ
const escapeString = (text: string): string => {
  const escapes: Record<string, string> = {
    '\0': '\\0',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\v': '\\v',
    '\\': '\\\\',
  }

  if (escapeQuotes.value === 'single' || escapeQuotes.value === 'both') {
    escapes['\''] = '\\\''
  }

  if (escapeQuotes.value === 'double' || escapeQuotes.value === 'both') {
    escapes['"'] = '\\"'
  }

  let escaped = text
  for (const [char, escape] of Object.entries(escapes)) {
    escaped = escaped.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), escape)
  }

  // 非ASCII文字をエスケープ
  escaped = escaped.replace(/[^\x20-\x7E]/g, (char) => {
    const code = char.charCodeAt(0)
    if (code <= 0xFF) {
      return `\\x${code.toString(16).padStart(2, '0')}`
    }
    else if (code <= 0xFFFF) {
      return `\\u${code.toString(16).padStart(4, '0')}`
    }
    else {
      return `\\u{${code.toString(16)}}`
    }
  })

  return escaped
}

// エスケープ解除
const unescapeString = (text: string): string => {
  return text
    .replace(/\\0/g, '\0')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\v/g, '\v')
    .replace(/\\'/g, '\'')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u\{([0-9A-Fa-f]+)\}/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

// バイト数計算
const byteCount = computed(() => {
  if (!inputText.value) return 0
  return new Blob([inputText.value]).size
})

// 文字数情報
const charInfo = computed(() => {
  const text = inputText.value
  return {
    characters: text.length,
    codePoints: [...text].length,
    graphemes: [...text].length, // Simplified grapheme count
    lines: text.split('\n').length,
    words: text.trim().split(/\s+/).filter(w => w.length > 0).length,
  }
})

// サンプルテキスト
const sampleTexts = [
  {
    name: 'URL with params',
    text: 'https://example.com/api?name=John Doe&email=john@example.com&tag=web development',
    type: 'url',
  },
  {
    name: 'HTML content',
    text: '<div class="container">\n  <h1>Title & Subtitle</h1>\n  <p>This is a "quoted" text with \'apostrophes\'.</p>\n  <span>© 2024 • All rights reserved™</span>\n</div>',
    type: 'html',
  },
  {
    name: 'JSON string',
    text: '{"name": "John Doe", "message": "Hello\\nWorld!", "path": "C:\\\\Users\\\\John"}',
    type: 'escape',
  },
  {
    name: 'Unicode text',
    text: 'Hello 世界 🌍 Здравствуй мир नमस्ते दुनिया',
    type: 'unicode',
  },
  {
    name: 'Base64 data',
    text: 'SGVsbG8gV29ybGQhIPCfmIo=',
    type: 'base64',
  },
]

const loadSample = (sample: typeof sampleTexts[0]) => {
  inputText.value = sample.text
  encodingType.value = sample.type as 'url' | 'html' | 'base64' | 'unicode' | 'escape'
  decodeMode.value = sample.type === 'base64'
}

// クリップボード操作
const { copyToClipboard } = useCopyToClipboard()

// リセット
const reset = () => {
  inputText.value = ''
}

// SEO設定
useSeoMeta({
  title: 'String Encoder/Decoder | Web開発ツール',
  description: 'Encode and decode strings for web development. Support for URL encoding, HTML entities, Base64, Unicode escapes, and string literals. Essential tool for developers.',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        String Encoder/Decoder
      </h1>
      <p class="text-muted-foreground">
        Encode and decode strings for URLs, HTML, Base64, Unicode, and programming languages. Essential for web development and API integration.
      </p>
    </div>

    <!-- エンコーディングタイプ選択 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          Encoding Type
        </h3>
      </template>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
        <UButton
          v-for="type in [
            { value: 'url', label: 'URL', icon: 'heroicons:link' },
            { value: 'html', label: 'HTML', icon: 'heroicons:code-bracket' },
            { value: 'base64', label: 'Base64', icon: 'heroicons:key' },
            { value: 'unicode', label: 'Unicode', icon: 'heroicons:language' },
            { value: 'escape', label: 'Escape', icon: 'heroicons:command-line' },
          ]"
          :key="type.value"
          :variant="encodingType === type.value ? 'default' : 'outline'"
          size="sm"
          @click="encodingType = type.value as 'url' | 'html' | 'base64' | 'unicode' | 'escape'">
          <Icon :name="type.icon" class="w-4 h-4 mr-2" />
          {{ type.label }}
        </UButton>
      </div>

      <!-- モード切り替え -->
      <div class="mt-4 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <UButton
            :variant="!decodeMode ? 'default' : 'outline'"
            size="sm"
            @click="decodeMode = false">
            Encode
          </UButton>
          <Icon name="heroicons:arrow-right" class="w-4 h-4 text-muted-foreground" />
          <UButton
            :variant="decodeMode ? 'default' : 'outline'"
            size="sm"
            @click="decodeMode = true">
            Decode
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- オプション設定 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          Options
        </h3>
      </template>
      <!-- URL Options -->
      <div v-if="encodingType === 'url'" class="space-y-4">
        <div class="flex items-center gap-2">
          <input
            id="urlComponent"
            v-model="urlComponentMode"
            type="checkbox"
            class="rounded border-border">
          <label for="urlComponent" class="text-sm">
            Use encodeURIComponent (encode all characters including /, ?, &, =)
          </label>
        </div>
        <UAlert icon="heroicons:information-circle">
          <template #description>
            <strong>encodeURI:</strong> For complete URLs (preserves URL structure)<br>
            <strong>encodeURIComponent:</strong> For URL parameters and values
          </template>
        </UAlert>
      </div>

      <!-- HTML Options -->
      <div v-if="encodingType === 'html'" class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">Entity Format</label>
          <div class="flex gap-2">
            <UButton
              v-for="mode in [
                { value: 'named', label: 'Named (&amp;)' },
                { value: 'numeric', label: 'Numeric (&#38;)' },
                { value: 'hex', label: 'Hex (&#x26;)' },
              ]"
              :key="mode.value"
              :variant="htmlEntityMode === mode.value ? 'default' : 'outline'"
              size="sm"
              @click="htmlEntityMode = mode.value as 'named' | 'numeric' | 'hex'">
              {{ mode.label }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Unicode Options -->
      <div v-if="encodingType === 'unicode'" class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">Format</label>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              v-for="format in [
                { value: 'codepoint', label: 'Code Point (U+0000)' },
                { value: 'jsEscape', label: 'JavaScript (\\u0000)' },
                { value: 'cssEscape', label: 'CSS (\\000000)' },
                { value: 'pythonEscape', label: 'Python (\\u0000)' },
              ]"
              :key="format.value"
              :variant="unicodeFormat === format.value ? 'default' : 'outline'"
              size="sm"
              @click="unicodeFormat = format.value as 'codepoint' | 'jsEscape' | 'cssEscape' | 'pythonEscape'">
              {{ format.label }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Escape Options -->
      <div v-if="encodingType === 'escape'" class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">Quote Escaping</label>
          <div class="flex gap-2">
            <UButton
              v-for="quote in quoteOptions"
              :key="quote.value"
              :variant="escapeQuotes === quote.value ? 'default' : 'outline'"
              size="sm"
              @click="escapeQuotes = quote.value as 'single' | 'double' | 'both'">
              {{ quote.label }}
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 入出力エリア -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 入力 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              {{ decodeMode ? 'Encoded' : 'Original' }} Text
            </h3>
            <div class="flex items-center gap-2">
              <UBadge variant="outline">
                {{ charInfo.characters }} chars
              </UBadge>
              <UBadge variant="outline">
                {{ byteCount }} bytes
              </UBadge>
            </div>
          </div>
        </template>
        <textarea
          v-model="inputText"
          placeholder="Enter text to encode/decode..."
          class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-background resize-none"
          spellcheck="false"></textarea>
        <div class="flex items-center justify-between mt-2">
          <div class="text-xs text-muted-foreground">
            Lines: {{ charInfo.lines }}, Words: {{ charInfo.words }}
          </div>
          <UButton
            variant="outline"
            size="sm"
            @click="reset">
            Clear
          </UButton>
        </div>
      </UCard>

      <!-- 出力 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              {{ decodeMode ? 'Decoded' : 'Encoded' }} Result
            </h3>
            <UButton
              size="sm"
              variant="ghost"
              :disabled="!outputText"
              @click="copyToClipboard(outputText)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
        <textarea
          :value="outputText"
          readonly
          placeholder="Result will appear here..."
          class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted resize-none"
          spellcheck="false"></textarea>
        <div class="mt-2 text-xs text-muted-foreground">
          Output: {{ outputText.length }} characters
        </div>
      </UCard>
    </div>

    <!-- サンプル -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          Sample Inputs
        </h3>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <UButton
          v-for="sample in sampleTexts"
          :key="sample.name"
          variant="outline"
          size="sm"
          class="justify-start"
          @click="loadSample(sample)">
          <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
          {{ sample.name }}
        </UButton>
      </div>
    </UCard>

    <!-- 使用ガイド -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          Usage Guide
        </h3>
      </template>
      <div class="space-y-4 text-muted-foreground">
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            URL Encoding
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li><strong>encodeURI:</strong> For complete URLs, preserves :/?#[]@!$&'()*+,;=</li>
            <li><strong>encodeURIComponent:</strong> For query parameters, encodes all special characters</li>
            <li>Use for API calls, form submissions, and URL construction</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            HTML Entities
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>Prevents XSS attacks by escaping special characters</li>
            <li>Named entities are more readable (&amp;copy; vs &#169;)</li>
            <li>Numeric entities have better compatibility</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            Base64
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>Binary-safe text encoding for data transmission</li>
            <li>Common in APIs, data URIs, and authentication</li>
            <li>Increases data size by ~33%</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-foreground mb-2">
            Unicode Escapes
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>JavaScript: \u0000 format for JSON and JS strings</li>
            <li>CSS: \000000 format for content and pseudo-elements</li>
            <li>Python: Supports both \u and \U formats</li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>
