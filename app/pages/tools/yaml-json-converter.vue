<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputText = ref('')
const outputText = ref('')
const mode = ref<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json')
const indentSize = ref(2)
const error = ref('')
const errorLine = ref<number | null>(null)
const preserveComments = ref(false)
const sortKeys = ref(false)
const validateSchema = ref(false)
const jsonSchema = ref('')

// YAML Parser Types

interface ParseContext {
  lines: string[]
  index: number
  errors: Array<{ line: number, message: string }>
  comments: Map<number, string>
}

// Improved YAML to JSON converter
const yamlToJson = (yaml: string): unknown => {
  const lines = yaml.split('\n')
  const context: ParseContext = {
    lines,
    index: 0,
    errors: [],
    comments: new Map(),
  }

  const result = parseYAMLDocument(context)
  if (context.errors.length > 0) {
    const firstError = context.errors[0]
    errorLine.value = firstError.line
    throw new Error(`Line ${firstError.line}: ${firstError.message}`)
  }
  return result
}

// Parse YAML document
const parseYAMLDocument = (ctx: ParseContext): unknown => {
  const result: Record<string, unknown> = {}
  const stack: Array<Record<string, unknown> | unknown[]> = [result]
  const indentStack: number[] = [0]
  const keyStack: string[] = []

  while (ctx.index < ctx.lines.length) {
    const line = ctx.lines[ctx.index]
    const lineNum = ctx.index + 1
    ctx.index++

    // Skip empty lines
    if (!line.trim()) continue

    // Handle comments
    if (line.trim().startsWith('#')) {
      if (preserveComments.value) {
        ctx.comments.set(lineNum, line.trim())
      }
      continue
    }

    const indent = line.search(/\S/)
    const trimmed = line.trim()

    // Handle indentation
    while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1]) {
      stack.pop()
      indentStack.pop()
      keyStack.pop()
    }

    // Handle different YAML constructs
    if (trimmed.startsWith('- ')) {
      // Array item
      handleArrayItem(ctx, line, indent, stack, indentStack, keyStack)
    }
    else if (trimmed.includes(':')) {
      // Key-value pair
      handleKeyValue(ctx, line, indent, stack, indentStack, keyStack)
    }
    else {
      ctx.errors.push({ line: lineNum, message: `Invalid YAML syntax: ${trimmed}` })
    }
  }

  return result
}

// Handle array items
const handleArrayItem = (ctx: ParseContext, line: string, indent: number, stack: Array<Record<string, unknown> | unknown[]>, indentStack: number[], keyStack: string[]) => {
  const trimmed = line.trim()
  const value = trimmed.substring(2).trim()
  const parent = stack[stack.length - 1]

  // Ensure parent is an array
  if (!Array.isArray(parent)) {
    const lastKey = keyStack[keyStack.length - 1]
    const parentObj = parent as Record<string, unknown>
    if (lastKey && typeof parentObj[lastKey] === 'object' && parentObj[lastKey] !== null && Object.keys(parentObj[lastKey] as Record<string, unknown>).length === 0) {
      parentObj[lastKey] = []
      stack[stack.length - 1] = parentObj[lastKey] as unknown[]
    }
  }

  if (Array.isArray(stack[stack.length - 1])) {
    const currentArray = stack[stack.length - 1] as unknown[]
    if (value.includes(':')) {
      // Nested object in array
      const obj: Record<string, unknown> = {}
      currentArray.push(obj)
      stack.push(obj)
      indentStack.push(indent)
      keyStack.push('')
      ctx.index-- // Re-process this line as key-value
    }
    else {
      // Simple value
      currentArray.push(parseValue(value))
    }
  }
}

// Handle key-value pairs
const handleKeyValue = (ctx: ParseContext, line: string, indent: number, stack: Array<Record<string, unknown> | unknown[]>, indentStack: number[], keyStack: string[]) => {
  const trimmed = line.trim()
  const colonIndex = trimmed.indexOf(':')
  const key = trimmed.substring(0, colonIndex).trim()
  const value = trimmed.substring(colonIndex + 1).trim()

  const parent = stack[stack.length - 1]

  if (value) {
    // Has value
    if (Array.isArray(parent)) {
      const lastItem = parent[parent.length - 1]
      if (typeof lastItem === 'object' && !Array.isArray(lastItem) && lastItem !== null) {
        (lastItem as Record<string, unknown>)[key] = parseValue(value)
      }
    }
    else {
      (parent as Record<string, unknown>)[key] = parseValue(value)
    }
  }
  else {
    // No value - nested structure
    const newObj: Record<string, unknown> = {}
    if (Array.isArray(parent)) {
      const lastItem = parent[parent.length - 1]
      if (typeof lastItem === 'object' && !Array.isArray(lastItem) && lastItem !== null) {
        (lastItem as Record<string, unknown>)[key] = newObj
        stack.push(newObj)
      }
    }
    else {
      (parent as Record<string, unknown>)[key] = newObj
      stack.push(newObj)
    }
    indentStack.push(indent)
    keyStack.push(key)
  }
}

// Parse scalar values with better type detection
const parseValue = (value: string): unknown => {
  // Handle quoted strings
  if ((value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith('\'') && value.endsWith('\''))) {
    return value.slice(1, -1).replace(/\\(.)/g, '$1')
  }

  // Handle special values
  const lowerValue = value.toLowerCase()
  if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === 'on') return true
  if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === 'off') return false
  if (lowerValue === 'null' || lowerValue === '~') return null

  // Handle numbers
  if (/^-?\d+$/.test(value)) return parseInt(value, 10)
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value)
  if (/^0x[0-9a-fA-F]+$/.test(value)) return parseInt(value, 16)
  if (/^0o[0-7]+$/.test(value)) return parseInt(value, 8)

  // Handle dates (ISO format)
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(value)) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) return date.toISOString()
  }

  // Default to string
  return value
}

// Improved JSON to YAML converter
const jsonToYaml = (obj: unknown, indent: number = 0, options: { sortKeys?: boolean } = {}): string => {
  const spaces = ' '.repeat(indent)

  // Handle null
  if (obj === null) return 'null'

  // Handle primitives
  if (typeof obj === 'boolean') return obj.toString()
  if (typeof obj === 'number') {
    // Handle special numbers
    if (obj === Infinity) return '.inf'
    if (obj === -Infinity) return '-.inf'
    if (isNaN(obj)) return '.nan'
    return obj.toString()
  }

  // Handle strings
  if (typeof obj === 'string') {
    // Check if string needs quoting
    const needsQuoting = (
      obj.includes('\n')
      || obj.includes('#')
      || obj.includes(':')
      || obj.includes('"')
      || obj.includes('\'')
      || obj.startsWith(' ')
      || obj.endsWith(' ')
      || /^(true|false|null|yes|no|on|off|~)$/i.test(obj)
      || /^-?\d+(\.\d+)?$/.test(obj)
    )

    if (needsQuoting) {
      // Use double quotes and escape
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
    }
    return obj
  }

  // Handle dates
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'

    return obj.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const yaml = jsonToYaml(item, indent + indentSize.value, options)
        const lines = yaml.split('\n')
        if (lines.length === 1) {
          return `${spaces}- ${lines[0]}`
        }
        return `${spaces}-\n${yaml}`
      }
      return `${spaces}- ${jsonToYaml(item, 0, options)}`
    }).join('\n')
  }

  // Handle objects
  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
    if (entries.length === 0) return '{}'

    // Sort keys if requested
    if (options.sortKeys || sortKeys.value) {
      entries.sort(([a], [b]) => a.localeCompare(b))
    }

    return entries.map(([key, value]) => {
      // Quote key if necessary
      const quotedKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `"${key}"`

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          return `${spaces}${quotedKey}: []`
        }
        if (!Array.isArray(value) && Object.keys(value).length === 0) {
          return `${spaces}${quotedKey}: {}`
        }
        return `${spaces}${quotedKey}:\n${jsonToYaml(value, indent + indentSize.value, options)}`
      }
      return `${spaces}${quotedKey}: ${jsonToYaml(value, 0, options)}`
    }).join('\n')
  }

  return String(obj)
}

// Schema validation
const validateAgainstSchema = (data: unknown, schema: Record<string, unknown>): { valid: boolean, errors: string[] } => {
  const errors: string[] = []

  // Simple schema validation (in production, use ajv or similar)
  const validateType = (value: unknown, schemaType: string): boolean => {
    switch (schemaType) {
      case 'string': return typeof value === 'string'
      case 'number': return typeof value === 'number'
      case 'boolean': return typeof value === 'boolean'
      case 'object': return typeof value === 'object' && !Array.isArray(value) && value !== null
      case 'array': return Array.isArray(value)
      case 'null': return value === null
      default: return true
    }
  }

  const validate = (obj: unknown, schemaObj: Record<string, unknown>, path: string = '') => {
    if (schemaObj.type && !validateType(obj, schemaObj.type)) {
      errors.push(`${path}: Expected ${schemaObj.type}, got ${typeof obj}`)
    }

    if (schemaObj.properties && typeof obj === 'object' && obj !== null) {
      const objRecord = obj as Record<string, unknown>
      for (const [key, propSchema] of Object.entries(schemaObj.properties as Record<string, unknown>)) {
        const fullPath = path ? `${path}.${key}` : key
        const required = schemaObj.required as string[] | undefined
        if (required?.includes(key) && !(key in objRecord)) {
          errors.push(`${fullPath}: Required property missing`)
        }
        else if (key in objRecord) {
          validate(objRecord[key], propSchema as Record<string, unknown>, fullPath)
        }
      }
    }

    if (schemaObj.items && Array.isArray(obj)) {
      obj.forEach((item, index) => {
        validate(item, schemaObj.items as Record<string, unknown>, `${path}[${index}]`)
      })
    }
  }

  validate(data, schema)
  return { valid: errors.length === 0, errors }
}

// 変換処理
const convert = () => {
  error.value = ''
  errorLine.value = null

  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'yaml-to-json') {
      const parsed = yamlToJson(inputText.value)

      // Validate against schema if enabled
      if (validateSchema.value && jsonSchema.value) {
        try {
          const schema = JSON.parse(jsonSchema.value)
          const validation = validateAgainstSchema(parsed, schema)
          if (!validation.valid) {
            error.value = 'Schema validation failed:\n' + validation.errors.join('\n')
          }
        }
        catch {
          error.value = 'Invalid JSON Schema'
        }
      }

      outputText.value = JSON.stringify(parsed, null, indentSize.value)
    }
    else {
      const parsed = JSON.parse(inputText.value)
      outputText.value = jsonToYaml(parsed)
    }
  }
  catch (e) {
    if (e instanceof Error) {
      error.value = e.message
      // Extract line number from error message if available
      const lineMatch = e.message.match(/Line (\d+):/)
      if (lineMatch) {
        errorLine.value = parseInt(lineMatch[1], 10)
      }
    }
    else {
      error.value = '変換に失敗しました'
    }
    outputText.value = ''
  }
}

// 入力と出力を入れ替え
const swapInputOutput = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  mode.value = mode.value === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json'
  convert()
}

// ファイル読み込み
const loadFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    inputText.value = e.target?.result as string
    convert()
  }
  reader.readAsText(file)
}

// ファイルダウンロード
const downloadOutput = () => {
  if (!outputText.value) return

  const blob = new Blob([outputText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = mode.value === 'yaml-to-json' ? 'output.json' : 'output.yaml'
  a.click()
  URL.revokeObjectURL(url)
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast({
      description: 'クリップボードにコピーしました',
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
  {
    name: '設定ファイル',
    yaml: `server:
  host: localhost
  port: 8080
  ssl: true
database:
  name: myapp
  user: admin
  password: secret123
features:
  - authentication
  - logging
  - caching`,
    json: `{
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": true
  },
  "database": {
    "name": "myapp",
    "user": "admin",
    "password": "secret123"
  },
  "features": [
    "authentication",
    "logging",
    "caching"
  ]
}`,
  },
  {
    name: 'Docker Compose',
    yaml: `version: "3.8"
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: example`,
    json: `{
  "version": "3.8",
  "services": {
    "web": {
      "image": "nginx:latest",
      "ports": ["80:80"],
      "volumes": ["./html:/usr/share/nginx/html"]
    },
    "db": {
      "image": "postgres:13",
      "environment": {
        "POSTGRES_PASSWORD": "example"
      }
    }
  }
}`,
  },
]

const loadSample = (sample: typeof samples[0]) => {
  if (mode.value === 'yaml-to-json') {
    inputText.value = sample.yaml
  }
  else {
    inputText.value = sample.json
  }
  convert()
}

// 統計情報
const stats = computed(() => {
  return {
    inputLines: inputText.value.split('\n').length,
    outputLines: outputText.value.split('\n').length,
    inputSize: new Blob([inputText.value]).size,
    outputSize: new Blob([outputText.value]).size,
  }
})

// SEO設定
useSeoMeta({
  title: 'YAML ↔ JSON変換 | Web開発ツール',
  description: 'YAMLとJSONの相互変換ツール。設定ファイルやAPIレスポンスの形式変換に。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        YAML ↔ JSON変換
      </h1>
      <p class="text-muted-foreground">
        YAMLとJSONを相互に変換します。設定ファイルの形式変換やAPIレスポンスの確認に便利です。
      </p>
    </div>

    <!-- サンプル -->
    <Card class="col-span-full">
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
          <CardTitle>
            {{ mode === 'yaml-to-json' ? 'YAML' : 'JSON' }}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            @click="inputText = ''; outputText = ''; errorLine = null">
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="relative">
          <div v-if="errorLine" class="absolute left-0 top-0 h-full w-full pointer-events-none">
            <div
              class="absolute left-0 right-0 bg-red-500/20 dark:bg-red-400/20"
              :style="{
                top: `${(errorLine - 1) * 1.5}em`,
                height: '1.5em',
              }">
            </div>
          </div>
          <textarea
            v-model="inputText"
            :placeholder="mode === 'yaml-to-json' ? 'YAMLを入力...' : 'JSONを入力...'"
            class="w-full h-[400px] p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary leading-6"
            :class="{ 'border-red-500': errorLine }"
            spellcheck="false"
            @input="convert"></textarea>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{{ stats.inputLines }} 行 / {{ (stats.inputSize / 1024).toFixed(2) }} KB</span>
          <span v-if="errorLine" class="text-red-500">エラー: 行 {{ errorLine }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- 出力エリア -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>
            {{ mode === 'yaml-to-json' ? 'JSON' : 'YAML' }}
          </CardTitle>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              :disabled="!outputText"
              @click="downloadOutput">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              :disabled="!outputText"
              @click="copyToClipboard(outputText)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="error" class="mb-4">
          <Alert variant="destructive">
            <Icon name="heroicons:exclamation-circle" class="h-4 w-4" />
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>
        </div>
        <textarea
          v-model="outputText"
          readonly
          :placeholder="mode === 'yaml-to-json' ? 'JSON出力がここに表示されます...' : 'YAML出力がここに表示されます...'"
          class="w-full h-[400px] p-3 font-mono text-sm border rounded-md bg-muted resize-none"
          spellcheck="false"></textarea>
        <div class="mt-2 text-sm text-muted-foreground">
          {{ stats.outputLines }} 行 / {{ (stats.outputSize / 1024).toFixed(2) }} KB
        </div>
      </CardContent>
    </Card>

    <!-- コントロール -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-4">
            <!-- 変換モード -->
            <div class="flex gap-2">
              <Button
                :variant="mode === 'yaml-to-json' ? 'default' : 'outline'"
                @click="mode = 'yaml-to-json'; convert()">
                YAML → JSON
              </Button>
              <Button
                :variant="mode === 'json-to-yaml' ? 'default' : 'outline'"
                @click="mode = 'json-to-yaml'; convert()">
                JSON → YAML
              </Button>
            </div>

            <!-- インデントサイズ -->
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium">インデント:</label>
              <div class="flex gap-1">
                <Button
                  v-for="size in [2, 4]"
                  :key="size"
                  size="sm"
                  :variant="indentSize === size ? 'default' : 'outline'"
                  @click="indentSize = size; convert()">
                  {{ size }}
                </Button>
              </div>
            </div>

            <!-- アクション -->
            <div class="flex gap-2 ml-auto">
              <Button
                variant="outline"
                @click="swapInputOutput">
                <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
                入れ替え
              </Button>
              <label>
                <input
                  type="file"
                  accept=".yaml,.yml,.json"
                  class="hidden"
                  @change="loadFile">
                <Button variant="outline" as="span">
                  <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                  ファイル
                </Button>
              </label>
            </div>
          </div>

          <!-- 詳細オプション -->
          <div class="space-y-2">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="sortKeys"
                  type="checkbox"
                  class="rounded"
                  @change="convert">
                キーをソート
              </label>
              <label v-if="mode === 'yaml-to-json'" class="flex items-center gap-2 text-sm">
                <input
                  v-model="preserveComments"
                  type="checkbox"
                  class="rounded"
                  @change="convert">
                コメントを保持（開発中）
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="validateSchema"
                  type="checkbox"
                  class="rounded">
                JSON Schema検証
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- JSON Schema入力 -->
    <Card v-if="validateSchema" class="col-span-full">
      <CardHeader>
        <CardTitle>JSON Schema</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="jsonSchema"
          placeholder="JSON Schemaを入力..."
          class="w-full h-[200px] p-3 font-mono text-sm border rounded-md bg-background resize-none"
          spellcheck="false"
          @input="convert"></textarea>
        <div class="mt-2">
          <Button
            size="sm"
            variant="outline"
            @click="jsonSchema = JSON.stringify({
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
              required: ['name'],
            }, null, 2); convert()">
            サンプルスキーマ
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 注意事項 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>機能と制限事項</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold mb-2">
              サポートされている機能
            </h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>基本的なYAML/JSON構造の相互変換</li>
              <li>ネストしたオブジェクトと配列</li>
              <li>各種データ型（文字列、数値、真偽値、null、日付）</li>
              <li>エラー行のハイライト表示</li>
              <li>JSON Schema検証（簡易版）</li>
              <li>キーのソート機能</li>
            </ul>
          </div>
          <Alert>
            <Icon name="heroicons:information-circle" class="h-4 w-4" />
            <AlertDescription>
              このツールは改良されたパーサーを使用していますが、以下のYAML機能はサポートしていません：
              アンカー(&)、エイリアス(*)、複数ドキュメント(---)、タグ(!!)、複数行文字列(|, >)。
              完全なYAML仕様のサポートが必要な場合は、js-yamlなどの専用ライブラリの使用を推奨します。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
