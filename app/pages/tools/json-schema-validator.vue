<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const jsonData = ref('')
const schemaData = ref('')
const validationResult = ref<ValidationResult | null>(null)
const error = ref('')
const mode = ref<'validate' | 'generate'>('validate')

// バリデーション結果の型定義
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  path: string
  message: string
  value?: any
  schema?: any
}

// 簡易JSON Schema バリデーター
const validateJSON = (data: any, schema: any, path = ''): ValidationError[] => {
  const errors: ValidationError[] = []

  // 型チェック
  if (schema.type) {
    const expectedType = schema.type
    const actualType = getJSONType(data)

    if (expectedType !== actualType) {
      errors.push({
        path: path || 'root',
        message: `Expected type '${expectedType}' but got '${actualType}'`,
        value: data,
        schema,
      })
      return errors
    }
  }

  // required プロパティのチェック
  if (schema.required && Array.isArray(schema.required)) {
    for (const required of schema.required) {
      if (data === null || data === undefined || !(required in data)) {
        errors.push({
          path: path ? `${path}.${required}` : required,
          message: `Missing required property '${required}'`,
          value: data,
          schema,
        })
      }
    }
  }

  // properties のチェック
  if (schema.properties && typeof data === 'object' && data !== null) {
    for (const [prop, propSchema] of Object.entries(schema.properties)) {
      if (prop in data) {
        const propPath = path ? `${path}.${prop}` : prop
        const propErrors = validateJSON(data[prop], propSchema, propPath)
        errors.push(...propErrors)
      }
    }
  }

  // additionalProperties のチェック
  if (schema.additionalProperties === false && typeof data === 'object' && data !== null) {
    const allowedProps = new Set(Object.keys(schema.properties || {}))
    for (const prop of Object.keys(data)) {
      if (!allowedProps.has(prop)) {
        errors.push({
          path: path ? `${path}.${prop}` : prop,
          message: `Additional property '${prop}' is not allowed`,
          value: data[prop],
          schema,
        })
      }
    }
  }

  // 配列のバリデーション
  if (schema.type === 'array' && Array.isArray(data)) {
    // items スキーマのチェック
    if (schema.items) {
      data.forEach((item, index) => {
        const itemPath = `${path}[${index}]`
        const itemErrors = validateJSON(item, schema.items, itemPath)
        errors.push(...itemErrors)
      })
    }

    // minItems, maxItems のチェック
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push({
        path: path || 'root',
        message: `Array should have at least ${schema.minItems} items but has ${data.length}`,
        value: data,
        schema,
      })
    }

    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push({
        path: path || 'root',
        message: `Array should have at most ${schema.maxItems} items but has ${data.length}`,
        value: data,
        schema,
      })
    }
  }

  // 文字列のバリデーション
  if (schema.type === 'string' && typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({
        path: path || 'root',
        message: `String should be at least ${schema.minLength} characters but is ${data.length}`,
        value: data,
        schema,
      })
    }

    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({
        path: path || 'root',
        message: `String should be at most ${schema.maxLength} characters but is ${data.length}`,
        value: data,
        schema,
      })
    }

    if (schema.pattern) {
      const regex = new RegExp(schema.pattern)
      if (!regex.test(data)) {
        errors.push({
          path: path || 'root',
          message: `String does not match pattern '${schema.pattern}'`,
          value: data,
          schema,
        })
      }
    }

    if (schema.format) {
      const formatError = validateFormat(data, schema.format)
      if (formatError) {
        errors.push({
          path: path || 'root',
          message: formatError,
          value: data,
          schema,
        })
      }
    }
  }

  // 数値のバリデーション
  if (schema.type === 'number' && typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({
        path: path || 'root',
        message: `Number should be >= ${schema.minimum} but is ${data}`,
        value: data,
        schema,
      })
    }

    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({
        path: path || 'root',
        message: `Number should be <= ${schema.maximum} but is ${data}`,
        value: data,
        schema,
      })
    }

    if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
      errors.push({
        path: path || 'root',
        message: `Number should be multiple of ${schema.multipleOf} but is ${data}`,
        value: data,
        schema,
      })
    }
  }

  // enum のチェック
  if (schema.enum && !schema.enum.includes(data)) {
    errors.push({
      path: path || 'root',
      message: `Value should be one of ${schema.enum.join(', ')} but is '${data}'`,
      value: data,
      schema,
    })
  }

  return errors
}

// JSON型の判定
const getJSONType = (value: any): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'boolean') return 'boolean'
  return 'unknown'
}

// フォーマットバリデーション
const validateFormat = (value: string, format: string): string | null => {
  switch (format) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email format'
    case 'uri':
      try {
        new URL(value)
        return null
      }
      catch {
        return 'Invalid URI format'
      }
    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : 'Invalid date format (YYYY-MM-DD)'
    case 'time':
      return /^\d{2}:\d{2}:\d{2}$/.test(value) ? null : 'Invalid time format (HH:MM:SS)'
    case 'date-time':
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) ? null : 'Invalid datetime format'
    default:
      return null
  }
}

// JSONからスキーマを生成
const generateSchema = (data: any): any => {
  if (data === null) {
    return { type: 'null' }
  }

  if (Array.isArray(data)) {
    const schema: any = { type: 'array' }
    if (data.length > 0) {
      // 最初の要素を基準にスキーマを生成
      schema.items = generateSchema(data[0])
    }
    return schema
  }

  if (typeof data === 'object') {
    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    }

    for (const [key, value] of Object.entries(data)) {
      schema.properties[key] = generateSchema(value)
      schema.required.push(key)
    }

    return schema
  }

  if (typeof data === 'string') {
    const schema: any = { type: 'string' }

    // フォーマットの推測
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
      schema.format = 'email'
    }
    else if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      schema.format = 'date'
    }
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data)) {
      schema.format = 'date-time'
    }
    else if (data.startsWith('http://') || data.startsWith('https://')) {
      schema.format = 'uri'
    }

    return schema
  }

  if (typeof data === 'number') {
    return { type: 'number' }
  }

  if (typeof data === 'boolean') {
    return { type: 'boolean' }
  }

  return { type: 'string' }
}

// バリデーション実行
const performValidation = () => {
  error.value = ''
  validationResult.value = null

  if (!jsonData.value.trim()) {
    error.value = 'JSONデータを入力してください'
    return
  }

  if (!schemaData.value.trim()) {
    error.value = 'JSON Schemaを入力してください'
    return
  }

  try {
    const json = JSON.parse(jsonData.value)
    const schema = JSON.parse(schemaData.value)

    const errors = validateJSON(json, schema)
    validationResult.value = {
      valid: errors.length === 0,
      errors,
    }

    toast({
      title: validationResult.value.valid ? '検証成功' : '検証失敗',
      description: validationResult.value.valid
        ? 'JSONデータはスキーマに適合しています'
        : `${errors.length}個のエラーが見つかりました`,
      variant: validationResult.value.valid ? 'default' : 'destructive',
    })
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'JSON解析エラーが発生しました'
  }
}

// スキーマ生成実行
const performSchemaGeneration = () => {
  error.value = ''

  if (!jsonData.value.trim()) {
    error.value = 'JSONデータを入力してください'
    return
  }

  try {
    const json = JSON.parse(jsonData.value)
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      ...generateSchema(json),
    }

    schemaData.value = JSON.stringify(schema, null, 2)
    toast({
      description: 'JSON Schemaを生成しました',
    })
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'JSON解析エラーが発生しました'
  }
}

// サンプルデータ
const samples = {
  user: {
    name: 'ユーザー情報',
    json: {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
      age: 28,
      isActive: true,
      tags: ['developer', 'frontend'],
    },
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        age: { type: 'number', minimum: 0, maximum: 150 },
        isActive: { type: 'boolean' },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['id', 'name', 'email'],
      additionalProperties: false,
    },
  },
  product: {
    name: '商品情報',
    json: {
      id: 'P001',
      name: 'ノートPC',
      price: 80000,
      category: 'electronics',
      inStock: true,
    },
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^P[0-9]{3}$' },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        price: { type: 'number', minimum: 0 },
        category: {
          type: 'string',
          enum: ['electronics', 'clothing', 'books', 'food'],
        },
        inStock: { type: 'boolean' },
      },
      required: ['id', 'name', 'price', 'category'],
      additionalProperties: false,
    },
  },
}

// サンプル読み込み
const loadSample = (sampleKey: keyof typeof samples) => {
  const sample = samples[sampleKey]
  jsonData.value = JSON.stringify(sample.json, null, 2)
  schemaData.value = JSON.stringify(sample.schema, null, 2)
  mode.value = 'validate'
}

// エラーの重要度
const getErrorSeverity = (error: ValidationError): 'error' | 'warning' => {
  if (error.message.includes('required') || error.message.includes('type')) {
    return 'error'
  }
  return 'warning'
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

// SEO設定
useSeoMeta({
  title: 'JSON Schema検証 | Web開発ツール',
  description: 'JSON SchemaによるJSONデータの検証。スキーマ生成機能付き。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        JSON Schema検証
      </h1>
      <p class="text-muted-foreground">
        JSON SchemaによるJSONデータの検証と、JSONからのスキーマ自動生成。
      </p>
    </div>

    <!-- モード選択 -->
    <Card>
      <CardHeader>
        <CardTitle>モード選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex gap-2 mb-4">
          <Button
            :variant="mode === 'validate' ? 'default' : 'outline'"
            @click="mode = 'validate'">
            <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
            検証モード
          </Button>
          <Button
            :variant="mode === 'generate' ? 'default' : 'outline'"
            @click="mode = 'generate'">
            <Icon name="heroicons:sparkles" class="w-4 h-4 mr-2" />
            スキーマ生成モード
          </Button>
        </div>

        <div class="flex gap-2">
          <Button
            v-for="(sample, key) in samples"
            :key="key"
            variant="outline"
            size="sm"
            @click="loadSample(key)">
            {{ sample.name }}サンプル
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- JSON入力 -->
      <Card>
        <CardHeader>
          <CardTitle>JSON データ</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="jsonData"
            placeholder="{&#10;  &quot;name&quot;: &quot;田中太郎&quot;,&#10;  &quot;age&quot;: 28,&#10;  &quot;email&quot;: &quot;tanaka@example.com&quot;&#10;}"
            class="w-full h-80 p-3 font-mono text-sm border rounded-md bg-background resize-none"
            spellcheck="false"></textarea>
        </CardContent>
      </Card>

      <!-- Schema入力/表示 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>JSON Schema</CardTitle>
            <Button
              v-if="schemaData"
              size="sm"
              variant="ghost"
              @click="copyToClipboard(schemaData)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="schemaData"
            :readonly="mode === 'generate'"
            placeholder="{&#10;  &quot;$schema&quot;: &quot;http://json-schema.org/draft-07/schema#&quot;,&#10;  &quot;type&quot;: &quot;object&quot;,&#10;  &quot;properties&quot;: {&#10;    &quot;name&quot;: { &quot;type&quot;: &quot;string&quot; }&#10;  }&#10;}"
            class="w-full h-80 p-3 font-mono text-sm border rounded-md resize-none"
            :class="mode === 'generate' ? 'bg-muted' : 'bg-background'"
            spellcheck="false"></textarea>
        </CardContent>
      </Card>
    </div>

    <!-- アクション -->
    <Card>
      <CardContent class="p-6">
        <div class="space-y-4">
          <Alert v-if="error" variant="destructive">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <div class="flex gap-2">
            <Button
              v-if="mode === 'validate'"
              class="flex-1"
              :disabled="!jsonData.trim() || !schemaData.trim()"
              @click="performValidation">
              <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
              JSONを検証
            </Button>

            <Button
              v-if="mode === 'generate'"
              class="flex-1"
              :disabled="!jsonData.trim()"
              @click="performSchemaGeneration">
              <Icon name="heroicons:sparkles" class="w-4 h-4 mr-2" />
              スキーマを生成
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 検証結果 -->
    <Card v-if="validationResult">
      <CardHeader>
        <div class="flex items-center gap-2">
          <Icon
            :name="validationResult.valid ? 'heroicons:check-circle' : 'heroicons:x-circle'"
            :class="validationResult.valid ? 'text-green-500' : 'text-red-500'"
            class="w-5 h-5" />
          <CardTitle>
            {{ validationResult.valid ? '検証成功' : '検証失敗' }}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="validationResult.valid" class="text-green-600">
          <p>JSONデータはスキーマに適合しています。</p>
        </div>

        <div v-else class="space-y-3">
          <p class="text-red-600 font-medium">
            {{ validationResult.errors.length }}個のエラーが見つかりました：
          </p>

          <div class="space-y-2">
            <Alert
              v-for="(error, index) in validationResult.errors"
              :key="index"
              :variant="getErrorSeverity(error) === 'error' ? 'destructive' : 'default'">
              <Icon
                :name="getErrorSeverity(error) === 'error' ? 'heroicons:x-circle' : 'heroicons:exclamation-triangle'"
                class="w-4 h-4" />
              <AlertTitle>{{ error.path }}</AlertTitle>
              <AlertDescription>
                {{ error.message }}
                <span v-if="error.value !== undefined" class="block mt-1 font-mono text-xs">
                  値: {{ JSON.stringify(error.value) }}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>JSON Schema について</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              主要なスキーマプロパティ
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <code class="bg-muted px-1 rounded">type</code>
                <p>データ型の指定</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">required</code>
                <p>必須プロパティ</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">properties</code>
                <p>オブジェクトのプロパティ</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">minimum/maximum</code>
                <p>数値の範囲</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">minLength/maxLength</code>
                <p>文字列の長さ</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">pattern</code>
                <p>正規表現パターン</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">format</code>
                <p>フォーマット検証</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">enum</code>
                <p>許可値の列挙</p>
              </div>
              <div>
                <code class="bg-muted px-1 rounded">items</code>
                <p>配列要素のスキーマ</p>
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              対応フォーマット
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><code>email</code> - メールアドレス形式</li>
              <li><code>uri</code> - URI形式</li>
              <li><code>date</code> - 日付形式 (YYYY-MM-DD)</li>
              <li><code>time</code> - 時刻形式 (HH:MM:SS)</li>
              <li><code>date-time</code> - 日時形式 (ISO 8601)</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              用途例
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>API仕様の定義と検証</li>
              <li>設定ファイルの形式チェック</li>
              <li>フォーム入力値の検証</li>
              <li>データ移行時の整合性確認</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
