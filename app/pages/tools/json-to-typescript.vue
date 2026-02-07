<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

const jsonInput = ref('')
const typeName = ref('MyInterface')
const typeOutput = ref('')
const useInterface = ref(true)
const includeOptional = ref(true)
const error = ref('')

const jsonToType = (obj: unknown, name: string, indent: number = 0): string => {
  const spaces = '  '.repeat(indent)
  const typeKeyword = useInterface.value ? 'interface' : 'type'
  const assignment = useInterface.value ? '' : ' ='

  if (obj === null) return 'null'
  if (obj === undefined) return 'undefined'

  const type = typeof obj

  if (type === 'string') return 'string'
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'

  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'any[]'

    // 配列の要素の型を推論
    const elementTypes = new Set<string>()
    obj.forEach((item) => {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        elementTypes.add('object')
      }
      else {
        elementTypes.add(jsonToType(item, '', 0))
      }
    })

    if (elementTypes.size === 1 && elementTypes.has('object')) {
    // すべてオブジェクトの場合、共通のプロパティを抽出
      const commonProps = new Map<string, Set<string>>()

      obj.forEach((item) => {
        if (item && typeof item === 'object') {
          Object.keys(item).forEach((key) => {
            if (!commonProps.has(key)) {
              commonProps.set(key, new Set())
            }
            commonProps.get(key)!.add(jsonToType(item[key], '', 0))
          })
        }
      })

      let objectType = '{\n'
      commonProps.forEach((types, key) => {
        const isOptional = includeOptional.value && obj.some(item => item && typeof item === 'object' && !(key in item))
        const typeArray = Array.from(types)
        const propType = typeArray.length > 1 ? typeArray.join(' | ') : typeArray[0]
        objectType += `${spaces}    ${key}${isOptional ? '?' : ''}: ${propType}\n`
      })
      objectType += `${spaces}  }[]`

      return objectType
    }

    const unionType = Array.from(elementTypes).join(' | ')
    return elementTypes.size > 1 ? `(${unionType})[]` : `${unionType}[]`
  }

  if (type === 'object') {
    const keys = Object.keys(obj)

    if (keys.length === 0) {
      return useInterface.value ? '{}' : 'Record<string, never>'
    }

    let result = `${typeKeyword} ${name}${assignment} {\n`

    keys.forEach((key) => {
      const value = obj[key]
      const valueType = jsonToType(value, `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`, indent + 1)

      // 予約語やスペースを含むキーの処理
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`

      result += `${spaces}  ${safeKey}: ${valueType}\n`
    })

    result += `${spaces}}`

    return result
  }

  return 'any'
}

const generateTypes = () => {
  error.value = ''
  typeOutput.value = ''

  if (!jsonInput.value.trim()) {
    error.value = 'JSONを入力してください'
    return
  }

  try {
    const parsed = JSON.parse(jsonInput.value)
    const mainType = jsonToType(parsed, typeName.value || 'MyInterface', 0)

    // ネストされたインターフェースの抽出
    const nestedTypes: string[] = []
    const extractNested = (obj: unknown, parentName: string) => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        Object.entries(obj).forEach(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const nestedName = `${parentName}${key.charAt(0).toUpperCase() + key.slice(1)}`
            nestedTypes.push(jsonToType(value, nestedName, 0))
            extractNested(value, nestedName)
          }
          else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            // 配列内のオブジェクトも処理
            const nestedName = `${parentName}${key.charAt(0).toUpperCase() + key.slice(1)}Item`
            if (!Array.isArray(value[0])) {
              nestedTypes.push(jsonToType(value[0], nestedName, 0))
              extractNested(value[0], nestedName)
            }
          }
        })
      }
    }

    if (!Array.isArray(parsed)) {
      extractNested(parsed, typeName.value || 'MyInterface')
    }

    // export文を追加
    const exportKeyword = 'export '
    let output = exportKeyword + mainType

    if (nestedTypes.length > 0) {
      output += '\n\n' + nestedTypes.map(t => exportKeyword + t).join('\n\n')
    }

    typeOutput.value = output
  }
  catch (e) {
    error.value = 'JSONの解析に失敗しました: ' + (e as Error).message
  }
}

const copyOutput = async () => {
  if (!typeOutput.value) return

  await copy(typeOutput.value)
  toast({
    title: 'コピーしました',
    description: 'TypeScript型定義をクリップボードにコピーしました',
  })
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
  }
  catch {
    toast({
      title: 'エラー',
      description: 'JSONのフォーマットに失敗しました',
      variant: 'destructive',
    })
  }
}

const clearAll = () => {
  jsonInput.value = ''
  typeOutput.value = ''
  error.value = ''
}

// JSONプリセット
const jsonPresets = [
  {
    label: 'User Profile',
    value: JSON.stringify({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true,
      profile: {
        age: 30,
        bio: 'Software developer',
        skills: ['TypeScript', 'Vue', 'React'],
      },
      posts: [
        {
          id: 101,
          title: 'Hello World',
          content: 'This is my first post',
          published: true,
          tags: ['tech', 'tutorial'],
        },
      ],
      metadata: {
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    }, null, 2),
  },
  {
    label: 'E-commerce',
    value: JSON.stringify({
      product: {
        id: 'prod_123',
        name: 'Laptop',
        price: 999.99,
        inStock: true,
        categories: ['Electronics', 'Computers'],
        specifications: {
          cpu: 'Intel i7',
          ram: '16GB',
          storage: '512GB SSD',
        },
      },
      reviews: [
        {
          id: 1,
          rating: 5,
          comment: 'Great product!',
          userId: 'user_456',
        },
      ],
    }, null, 2),
  },
  {
    label: 'API Config',
    value: JSON.stringify({
      api: {
        baseUrl: 'https://api.example.com',
        version: 'v1',
        endpoints: {
          users: '/users',
          posts: '/posts',
          comments: '/comments',
        },
        auth: {
          type: 'bearer',
          tokenExpiry: 3600,
        },
      },
    }, null, 2),
  },
]

const selectPreset = (json: string) => {
  jsonInput.value = json
  generateTypes()
}

// SEO設定
useSeoMeta({
  title: 'JSON → TypeScript 型生成 | Web開発ツール',
  description: 'JSONデータからTypeScriptの型定義を自動生成。インターフェースとタイプの切り替え、オプショナルプロパティの自動検出。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        JSON → TypeScript 型生成
      </h1>
      <p class="text-muted-foreground">
        JSONデータからTypeScriptの型定義を自動生成。インターフェースとタイプの切り替え、オプショナルプロパティの自動検出。
      </p>
    </div>

    <!-- プリセットセクション -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>サンプルJSON</CardTitle>
        <CardDescription>実際のユースケースに基づいたJSONサンプル</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in jsonPresets"
            :key="preset.label"
            variant="outline"
            size="sm"
            @click="selectPreset(preset.value)">
            {{ preset.label }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>JSON入力</CardTitle>
        <CardDescription>
          変換したいJSONデータを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <textarea
            v-model="jsonInput"
            class="w-full min-h-[400px] p-3 rounded-md border bg-background font-mono text-sm resize-y"
            placeholder="{&quot;name&quot;: &quot;John&quot;, &quot;age&quot;: 30}"
            @input="generateTypes"></textarea>
          <div v-if="error" class="text-sm text-destructive">
            {{ error }}
          </div>
        </div>

        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="formatJson">
            <Icon name="heroicons:code-bracket" class="w-4 h-4 mr-1" />
            整形
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="clearAll">
            クリア
          </Button>
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>オプション</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">型名</label>
          <Input
            v-model="typeName"
            placeholder="MyInterface"
            @input="generateTypes" />
        </div>

        <div class="space-y-3">
          <label class="flex items-center gap-2">
            <input
              v-model="useInterface"
              type="checkbox"
              class="rounded"
              @change="generateTypes">
            <span class="text-sm">interface を使用（type の代わりに）</span>
          </label>

          <label class="flex items-center gap-2">
            <input
              v-model="includeOptional"
              type="checkbox"
              class="rounded"
              @change="generateTypes">
            <span class="text-sm">配列内で欠けているプロパティをオプショナルにする</span>
          </label>
        </div>
      </CardContent>
    </Card>

    <Card class="h-full">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>TypeScript型定義</CardTitle>
            <CardDescription>
              生成された型定義
            </CardDescription>
          </div>
          <Button
            v-if="typeOutput"
            size="sm"
            variant="outline"
            @click="copyOutput">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-1" />
            コピー
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre v-if="typeOutput" class="p-4 rounded-md bg-muted overflow-x-auto text-sm"><code>{{ typeOutput }}</code></pre>
        <div v-else class="p-4 rounded-md bg-muted text-muted-foreground text-sm">
          JSONを入力すると、ここにTypeScriptの型定義が表示されます
        </div>
      </CardContent>
    </Card>
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>特徴</CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="grid md:grid-cols-2 gap-3 text-sm">
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
            <span>ネストされたオブジェクトを個別のインターフェースに分割</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
            <span>配列内のオブジェクトから共通の型を推論</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
            <span>オプショナルプロパティの自動検出</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
            <span>interface と type の切り替え可能</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
            <span>export文を自動的に追加</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
            <span>特殊なキー名（スペース含む）の適切な処理</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
