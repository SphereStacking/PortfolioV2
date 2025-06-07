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

// YAML to JSON変換（簡易実装）
const yamlToJson = (yaml: string): any => {
  // 実際のプロジェクトではjs-yamlなどのライブラリを使用することを推奨
  // ここでは簡易的な実装を提供
  const lines = yaml.split('\n')
  const result: any = {}
  const stack: any[] = [result]
  const indentStack: number[] = [0]
  
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    
    const indent = line.search(/\S/)
    const trimmed = line.trim()
    
    // インデントレベルの調整
    while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1]) {
      stack.pop()
      indentStack.pop()
    }
    
    if (trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':')
      const value = valueParts.join(':').trim()
      
      if (value) {
        // 値がある場合
        const parent = stack[stack.length - 1]
        if (Array.isArray(parent)) {
          parent.push({ [key]: parseValue(value) })
        } else {
          parent[key] = parseValue(value)
        }
      } else {
        // 値がない場合（ネストの開始）
        const parent = stack[stack.length - 1]
        const newObj = {}
        if (Array.isArray(parent)) {
          parent.push({ [key]: newObj })
          stack.push(newObj)
        } else {
          parent[key] = newObj
          stack.push(newObj)
        }
        indentStack.push(indent)
      }
    } else if (trimmed.startsWith('- ')) {
      // 配列要素
      const value = trimmed.substring(2)
      const parent = stack[stack.length - 1]
      
      if (!Array.isArray(parent)) {
        // 親をオブジェクトから配列に変換
        const lastKey = Object.keys(parent).pop()
        if (lastKey && typeof parent[lastKey] === 'object' && Object.keys(parent[lastKey]).length === 0) {
          parent[lastKey] = []
          stack[stack.length - 1] = parent[lastKey]
        }
      }
      
      if (Array.isArray(stack[stack.length - 1])) {
        stack[stack.length - 1].push(parseValue(value))
      }
    }
  }
  
  return result
}

// 値のパース
const parseValue = (value: string): any => {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1)
  if (!isNaN(Number(value))) return Number(value)
  return value
}

// JSON to YAML変換
const jsonToYaml = (obj: any, indent: number = 0): string => {
  const spaces = ' '.repeat(indent)
  
  if (obj === null) return 'null'
  if (typeof obj === 'boolean') return obj.toString()
  if (typeof obj === 'number') return obj.toString()
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes('"') || obj.includes("'")) {
      return `"${obj.replace(/"/g, '\\"')}"`
    }
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const yaml = jsonToYaml(item, indent + indentSize.value)
        return `${spaces}- ${yaml.split('\n').map((line, i) => 
          i === 0 ? line : ' '.repeat(indentSize.value) + line
        ).join('\n')}`
      }
      return `${spaces}- ${jsonToYaml(item, 0)}`
    }).join('\n')
  }
  
  if (typeof obj === 'object') {
    return Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'object' && value !== null && (Array.isArray(value) || Object.keys(value).length > 0)) {
        return `${spaces}${key}:\n${jsonToYaml(value, indent + indentSize.value)}`
      }
      return `${spaces}${key}: ${jsonToYaml(value, 0)}`
    }).join('\n')
  }
  
  return ''
}

// 変換処理
const convert = () => {
  error.value = ''
  
  if (!inputText.value) {
    outputText.value = ''
    return
  }
  
  try {
    if (mode.value === 'yaml-to-json') {
      const parsed = yamlToJson(inputText.value)
      outputText.value = JSON.stringify(parsed, null, indentSize.value)
    } else {
      const parsed = JSON.parse(inputText.value)
      outputText.value = jsonToYaml(parsed)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '変換に失敗しました'
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
  } catch (err) {
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
}`
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
}`
  }
]

const loadSample = (sample: typeof samples[0]) => {
  if (mode.value === 'yaml-to-json') {
    inputText.value = sample.yaml
  } else {
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
            @click="inputText = ''; outputText = ''">
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="inputText"
          :placeholder="mode === 'yaml-to-json' ? 'YAMLを入力...' : 'JSONを入力...'"
          class="w-full h-[400px] p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          spellcheck="false"
          @input="convert"></textarea>
        <div class="mt-2 text-sm text-muted-foreground">
          {{ stats.inputLines }} 行 / {{ (stats.inputSize / 1024).toFixed(2) }} KB
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
      </CardContent>
    </Card>

    <!-- 注意事項 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>注意事項</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Icon name="heroicons:information-circle" class="h-4 w-4" />
          <AlertDescription>
            このツールは簡易的な変換を行います。複雑なYAML機能（アンカー、エイリアス、複数ドキュメント等）は
            サポートしていません。本格的な変換にはjs-yamlなどのライブラリの使用を推奨します。
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  </div>
</template>