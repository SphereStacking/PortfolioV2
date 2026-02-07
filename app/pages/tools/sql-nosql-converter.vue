<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const sqlQuery = ref('')
const mongodbQuery = ref('')
const error = ref('')
const explanation = ref<string[]>([])

// SQL解析結果
interface ParsedSQL {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  fields: string[]
  table: string
  where?: string
  orderBy?: string
  groupBy?: string
  limit?: number
  joins?: Array<{ type: string, table: string, condition: string }>
}

// SQLパーサー（簡易実装）
function parseSQL(sql: string): ParsedSQL | null {
  try {
    const normalizedSQL = sql.trim().replace(/\s+/g, ' ').toUpperCase()

    if (normalizedSQL.startsWith('SELECT')) {
      return parseSELECT(sql)
    }
    else if (normalizedSQL.startsWith('INSERT')) {
      return parseINSERT(sql)
    }
    else if (normalizedSQL.startsWith('UPDATE')) {
      return parseUPDATE(sql)
    }
    else if (normalizedSQL.startsWith('DELETE')) {
      return parseDELETE(sql)
    }

    return null
  }
  catch {
    return null
  }
}

function parseSELECT(sql: string): ParsedSQL {
  const parts = sql.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?(?:\s+GROUP\s+BY\s+(.*?))?(?:\s+LIMIT\s+(\d+))?/i)

  if (!parts) throw new Error('Invalid SELECT syntax')

  const fields = parts[1].split(',').map(f => f.trim())
  const table = parts[2]
  const where = parts[3]
  const orderBy = parts[4]
  const groupBy = parts[5]
  const limit = parts[6] ? parseInt(parts[6]) : undefined

  return {
    type: 'SELECT',
    fields,
    table,
    where,
    orderBy,
    groupBy,
    limit,
  }
}

function parseINSERT(sql: string): ParsedSQL {
  const parts = sql.match(/INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i)

  if (!parts) throw new Error('Invalid INSERT syntax')

  const table = parts[1]
  const fields = parts[2].split(',').map(f => f.trim())

  return {
    type: 'INSERT',
    fields,
    table,
  }
}

function parseUPDATE(sql: string): ParsedSQL {
  const parts = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*?))?/i)

  if (!parts) throw new Error('Invalid UPDATE syntax')

  const table = parts[1]
  const setClause = parts[2]
  const where = parts[3]

  return {
    type: 'UPDATE',
    fields: [setClause],
    table,
    where,
  }
}

function parseDELETE(sql: string): ParsedSQL {
  const parts = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?/i)

  if (!parts) throw new Error('Invalid DELETE syntax')

  const table = parts[1]
  const where = parts[2]

  return {
    type: 'DELETE',
    fields: [],
    table,
    where,
  }
}

// WHERE句の変換
function convertWhereClause(whereClause: string): object {
  const conditions: Record<string, unknown> = {}

  // 簡単な条件のみサポート（= のみ）
  const parts = whereClause.split(/\s+AND\s+/i)

  parts.forEach((part) => {
    const match = part.trim().match(/(\w+)\s*=\s*['"]?(.*?)['"]?$/)
    if (match) {
      const [, field, value] = match
      // 数値の場合は変換
      if (/^\d+$/.test(value)) {
        conditions[field] = parseInt(value)
      }
      else if (/^\d*\.\d+$/.test(value)) {
        conditions[field] = parseFloat(value)
      }
      else {
        conditions[field] = value.replace(/['"]/g, '')
      }
    }
  })

  return conditions
}

// ORDER BY句の変換
function convertOrderBy(orderBy: string): object {
  const parts = orderBy.split(',')
  const sort: Record<string, unknown> = {}

  parts.forEach((part) => {
    const match = part.trim().match(/(\w+)(?:\s+(ASC|DESC))?/i)
    if (match) {
      const [, field, direction] = match
      sort[field] = direction?.toUpperCase() === 'DESC' ? -1 : 1
    }
  })

  return sort
}

// SQLからMongoDBクエリへの変換
function convertToMongoDB(parsed: ParsedSQL): object {
  const explanations: string[] = []

  switch (parsed.type) {
    case 'SELECT':
      return convertSELECT(parsed, explanations)
    case 'INSERT':
      return convertINSERT(parsed, explanations)
    case 'UPDATE':
      return convertUPDATE(parsed, explanations)
    case 'DELETE':
      return convertDELETE(parsed, explanations)
    default:
      throw new Error('Unsupported SQL type')
  }
}

function convertSELECT(parsed: ParsedSQL, explanations: string[]): object {
  const query: Record<string, unknown> = {}

  // find操作
  query.operation = 'find'
  query.collection = parsed.table

  // フィールド選択
  if (parsed.fields[0] !== '*') {
    const projection: Record<string, unknown> = {}
    parsed.fields.forEach((field) => {
      projection[field.replace(/['"]/g, '')] = 1
    })
    query.projection = projection
    explanations.push('プロジェクション: 指定されたフィールドのみ取得')
  }

  // WHERE句
  if (parsed.where) {
    query.filter = convertWhereClause(parsed.where)
    explanations.push('フィルター条件: WHERE句をMongoDBの条件に変換')
  }

  // ORDER BY
  if (parsed.orderBy) {
    query.sort = convertOrderBy(parsed.orderBy)
    explanations.push('ソート: ORDER BY句をsortオプションに変換')
  }

  // LIMIT
  if (parsed.limit) {
    query.limit = parsed.limit
    explanations.push('制限: LIMIT句をlimitオプションに変換')
  }

  explanation.value = explanations
  return query
}

function convertINSERT(parsed: ParsedSQL, explanations: string[]): object {
  const query: Record<string, unknown> = {}

  query.operation = 'insertOne'
  query.collection = parsed.table
  query.document = {}

  explanations.push('挿入操作: insertOne()を使用してドキュメントを挿入')
  explanations.push('注意: 実際の値はVALUES句から取得する必要があります')

  explanation.value = explanations
  return query
}

function convertUPDATE(parsed: ParsedSQL, explanations: string[]): object {
  const query: Record<string, unknown> = {}

  query.operation = 'updateMany'
  query.collection = parsed.table

  if (parsed.where) {
    query.filter = convertWhereClause(parsed.where)
  }
  else {
    query.filter = {}
    explanations.push('警告: WHERE句がないため全ドキュメントが更新されます')
  }

  // SET句の解析は簡略化
  query.update = { $set: {} }
  explanations.push('更新操作: updateMany()または updateOne()を使用')
  explanations.push('$set演算子を使用してフィールドを更新')

  explanation.value = explanations
  return query
}

function convertDELETE(parsed: ParsedSQL, explanations: string[]): object {
  const query: Record<string, unknown> = {}

  query.operation = 'deleteMany'
  query.collection = parsed.table

  if (parsed.where) {
    query.filter = convertWhereClause(parsed.where)
  }
  else {
    query.filter = {}
    explanations.push('警告: WHERE句がないため全ドキュメントが削除されます')
  }

  explanations.push('削除操作: deleteMany()またはdeleteOne()を使用')

  explanation.value = explanations
  return query
}

// 変換処理
const convertQuery = () => {
  error.value = ''
  explanation.value = []
  mongodbQuery.value = ''

  if (!sqlQuery.value.trim()) {
    error.value = 'SQLクエリを入力してください'
    return
  }

  try {
    const parsed = parseSQL(sqlQuery.value)
    if (!parsed) {
      error.value = 'SQLの解析に失敗しました'
      return
    }

    const mongodb = convertToMongoDB(parsed)
    mongodbQuery.value = JSON.stringify(mongodb, null, 2)

    toast({
      description: 'MongoDBクエリに変換しました',
    })
  }
  catch {
    error.value = '変換に失敗しました'
  }
}

// サンプルクエリ
const sampleQueries = [
  {
    name: '基本SELECT',
    sql: 'SELECT name, email FROM users WHERE age > 25 ORDER BY name ASC LIMIT 10',
  },
  {
    name: '全フィールド選択',
    sql: 'SELECT * FROM products WHERE category = "electronics" AND price < 1000',
  },
  {
    name: 'INSERT文',
    sql: 'INSERT INTO users (name, email, age) VALUES ("John Doe", "john@example.com", 30)',
  },
  {
    name: 'UPDATE文',
    sql: 'UPDATE users SET email = "newemail@example.com" WHERE id = 123',
  },
  {
    name: 'DELETE文',
    sql: 'DELETE FROM users WHERE age < 18',
  },
]

// サンプル読み込み
const loadSample = (sample: typeof sampleQueries[0]) => {
  sqlQuery.value = sample.sql
  convertQuery()
}

// MongoDB実行例の生成
const generateExecutionExample = computed(() => {
  if (!mongodbQuery.value) return ''

  try {
    const query = JSON.parse(mongodbQuery.value)
    let example = ''

    switch (query.operation) {
      case 'find':
        example = `db.${query.collection}.find(`
        if (query.filter && Object.keys(query.filter).length > 0) {
          example += JSON.stringify(query.filter, null, 2)
        }
        if (query.projection) {
          example += `, ${JSON.stringify(query.projection, null, 2)}`
        }
        example += ')'

        if (query.sort) {
          example += `.sort(${JSON.stringify(query.sort, null, 2)})`
        }
        if (query.limit) {
          example += `.limit(${query.limit})`
        }
        break

      case 'insertOne':
        example = `db.${query.collection}.insertOne({\n  // ドキュメントのフィールドを指定\n})`
        break

      case 'updateMany':
        example = `db.${query.collection}.updateMany(\n  ${JSON.stringify(query.filter, null, 2)},\n  ${JSON.stringify(query.update, null, 2)}\n)`
        break

      case 'deleteMany':
        example = `db.${query.collection}.deleteMany(${JSON.stringify(query.filter, null, 2)})`
        break
    }

    return example
  }
  catch {
    return ''
  }
})

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
  title: 'SQL → NoSQL変換 | Web開発ツール',
  description: 'SQLクエリをMongoDBクエリに変換。リレーショナルDBからNoSQLへの移行支援。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        SQL → NoSQL変換
      </h1>
      <p class="text-muted-foreground">
        SQLクエリをMongoDBクエリに変換します。リレーショナルデータベースからNoSQLデータベースへの移行を支援。
      </p>
    </div>

    <!-- 警告 -->
    <Alert>
      <Icon name="heroicons:information-circle" class="w-4 h-4" />
      <AlertTitle>変換の制限について</AlertTitle>
      <AlertDescription>
        このツールは基本的なSQL文の変換のみサポートしています。
        複雑なJOINやサブクエリ、関数などは完全に変換されない場合があります。
      </AlertDescription>
    </Alert>

    <!-- サンプルクエリ -->
    <Card>
      <CardHeader>
        <CardTitle>サンプルクエリ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Button
            v-for="sample in sampleQueries"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- SQL入力 -->
      <Card>
        <CardHeader>
          <CardTitle>SQL クエリ</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <textarea
              v-model="sqlQuery"
              placeholder="SELECT * FROM users WHERE age > 25 ORDER BY name ASC LIMIT 10"
              class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-background resize-none"
              spellcheck="false"></textarea>

            <div v-if="error" class="text-destructive text-sm">
              {{ error }}
            </div>

            <Button class="w-full" @click="convertQuery">
              <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
              MongoDBクエリに変換
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- MongoDB出力 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>MongoDB クエリ</CardTitle>
            <Button
              v-if="mongodbQuery"
              size="sm"
              variant="ghost"
              @click="copyToClipboard(mongodbQuery)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <textarea
              v-model="mongodbQuery"
              readonly
              placeholder="変換されたMongoDBクエリがここに表示されます"
              class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted resize-none"
              spellcheck="false"></textarea>

            <!-- 変換説明 -->
            <div v-if="explanation.length > 0" class="space-y-2">
              <h4 class="font-medium text-sm">
                変換の説明:
              </h4>
              <ul class="text-sm text-muted-foreground space-y-1">
                <li v-for="(item, index) in explanation" :key="index" class="flex items-start gap-2">
                  <Icon name="heroicons:arrow-right" class="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 実行例 -->
    <Card v-if="generateExecutionExample">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>MongoDB Shell 実行例</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            @click="copyToClipboard(generateExecutionExample)">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm font-mono">{{ generateExecutionExample }}</pre>
      </CardContent>
    </Card>

    <!-- 対応表 -->
    <Card>
      <CardHeader>
        <CardTitle>SQL ↔ MongoDB 対応表</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SQL操作</TableHead>
                <TableHead>MongoDB操作</TableHead>
                <TableHead>説明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  SELECT
                </TableCell>
                <TableCell class="font-mono text-sm">
                  find()
                </TableCell>
                <TableCell class="text-sm">
                  ドキュメントの検索
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  INSERT
                </TableCell>
                <TableCell class="font-mono text-sm">
                  insertOne() / insertMany()
                </TableCell>
                <TableCell class="text-sm">
                  ドキュメントの挿入
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  UPDATE
                </TableCell>
                <TableCell class="font-mono text-sm">
                  updateOne() / updateMany()
                </TableCell>
                <TableCell class="text-sm">
                  ドキュメントの更新
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  DELETE
                </TableCell>
                <TableCell class="font-mono text-sm">
                  deleteOne() / deleteMany()
                </TableCell>
                <TableCell class="text-sm">
                  ドキュメントの削除
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  WHERE
                </TableCell>
                <TableCell class="font-mono text-sm">
                  filter条件
                </TableCell>
                <TableCell class="text-sm">
                  検索条件の指定
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  ORDER BY
                </TableCell>
                <TableCell class="font-mono text-sm">
                  sort()
                </TableCell>
                <TableCell class="text-sm">
                  結果のソート（1:昇順, -1:降順）
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  LIMIT
                </TableCell>
                <TableCell class="font-mono text-sm">
                  limit()
                </TableCell>
                <TableCell class="text-sm">
                  結果件数の制限
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-mono text-sm">
                  JOIN
                </TableCell>
                <TableCell class="font-mono text-sm">
                  $lookup (集約パイプライン)
                </TableCell>
                <TableCell class="text-sm">
                  コレクション間の結合
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 注意事項 -->
    <Card>
      <CardHeader>
        <CardTitle>データモデリングの違い</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              リレーショナル vs ドキュメント
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>SQLは正規化されたテーブル構造</li>
              <li>MongoDBは非正規化されたドキュメント構造</li>
              <li>JOINの代わりに埋め込みドキュメントや配列を使用</li>
              <li>スキーマが柔軟で、フィールドの追加が容易</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              移行時の考慮点
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>データの非正規化を検討する</li>
              <li>配列やサブドキュメントの活用</li>
              <li>インデックス戦略の見直し</li>
              <li>アプリケーションロジックの調整</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
