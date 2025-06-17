<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const outputFormat = ref<'json' | 'csv' | 'sql'>('json')
const recordCount = ref([10])
const seedValue = ref('')
const tableName = ref('users')
const generatedData = ref('')
const error = ref('')

// フィールド定義
interface Field {
  id: string
  name: string
  type: string
  options?: any
}

const fields = ref<Field[]>([
  { id: '1', name: 'id', type: 'id' },
  { id: '2', name: 'name', type: 'fullName' },
  { id: '3', name: 'email', type: 'email' },
])

// データ型定義
const dataTypes = {
  // ID系
  id: { name: 'ID（連番）', generate: (index: number) => index + 1 },
  uuid: { name: 'UUID', generate: () => generateUUID() },
  
  // 人物系
  fullName: { name: '氏名', generate: () => generateFullName() },
  firstName: { name: '名前', generate: () => generateFirstName() },
  lastName: { name: '姓', generate: () => generateLastName() },
  email: { name: 'メールアドレス', generate: () => generateEmail() },
  phone: { name: '電話番号', generate: () => generatePhone() },
  age: { name: '年齢', generate: () => generateAge() },
  
  // 住所系
  address: { name: '住所', generate: () => generateAddress() },
  city: { name: '市区町村', generate: () => generateCity() },
  prefecture: { name: '都道府県', generate: () => generatePrefecture() },
  zipCode: { name: '郵便番号', generate: () => generateZipCode() },
  country: { name: '国', generate: () => generateCountry() },
  
  // 会社系
  company: { name: '会社名', generate: () => generateCompany() },
  jobTitle: { name: '役職', generate: () => generateJobTitle() },
  department: { name: '部署', generate: () => generateDepartment() },
  
  // 商品系
  productName: { name: '商品名', generate: () => generateProductName() },
  price: { name: '価格', generate: () => generatePrice() },
  category: { name: 'カテゴリ', generate: () => generateCategory() },
  
  // 日時系
  date: { name: '日付', generate: () => generateDate() },
  datetime: { name: '日時', generate: () => generateDateTime() },
  timestamp: { name: 'タイムスタンプ', generate: () => generateTimestamp() },
  
  // 基本型
  boolean: { name: 'ブール値', generate: () => seededRandom() > 0.5 },
  number: { name: '数値', generate: () => Math.floor(seededRandom() * 1000) },
  text: { name: 'テキスト', generate: () => generateText() },
  url: { name: 'URL', generate: () => generateURL() },
  
  // その他
  gender: { name: '性別', generate: () => generateGender() },
  bloodType: { name: '血液型', generate: () => generateBloodType() },
  status: { name: 'ステータス', generate: () => generateStatus() },
}

// 日本語データ
const japaneseData = {
  lastNames: ['田中', '佐藤', '鈴木', '高橋', '山田', '中村', '小林', '加藤', '吉田', '山本', '斎藤', '松本', '井上', '木村', '林', '清水', '山口', '池田', '阿部', '橋本'],
  firstNames: ['太郎', '花子', '健一', '美咲', '大輔', '愛', '翔太', '結衣', '拓也', '優子', '直樹', '麻衣', '雅志', '千尋', '修平', '理恵', '和也', '由美子', '敦', '恵'],
  prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
  cities: ['札幌市', '横浜市', '大阪市', '名古屋市', '福岡市', '神戸市', '京都市', '仙台市', '千葉市', '北九州市', '広島市', '静岡市', '新潟市', '浜松市', '熊本市', '相模原市', '岡山市', '鹿児島市', '豊田市', '金沢市'],
  companies: ['株式会社ABC', '有限会社XYZ', '○○商事', '△△システム', '□□製作所', '◇◇開発', '※※企画', '＃＃技研', '＆＆サービス', '＊＊コーポレーション'],
  jobTitles: ['課長', '部長', '主任', '係長', '取締役', '専務', '常務', 'マネージャー', 'リーダー', 'エンジニア', 'デザイナー', 'ディレクター', 'プランナー', 'コンサルタント', 'アナリスト'],
  departments: ['営業部', '開発部', '企画部', '総務部', '人事部', '経理部', 'マーケティング部', '製造部', '品質管理部', 'カスタマーサポート部'],
  productNames: ['ノートPC', 'スマートフォン', 'タブレット', 'ヘッドホン', 'カメラ', 'プリンター', 'モニター', 'キーボード', 'マウス', 'スピーカー'],
  categories: ['家電', '食品', '衣類', '書籍', 'スポーツ用品', '化粧品', '雑貨', 'ゲーム', '音楽', '映画']
}

// ランダム生成関数（シード対応）
const getRandom = <T>(array: T[]): T => {
  return array[Math.floor(seededRandom() * array.length)]
}

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = seededRandom() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const generateFullName = (): string => {
  return `${getRandom(japaneseData.lastNames)} ${getRandom(japaneseData.firstNames)}`
}

const generateFirstName = (): string => {
  return getRandom(japaneseData.firstNames)
}

const generateLastName = (): string => {
  return getRandom(japaneseData.lastNames)
}

const generateEmail = (): string => {
  const domains = ['gmail.com', 'yahoo.co.jp', 'example.com', 'outlook.jp', 'hotmail.com']
  const username = seededRandom().toString(36).substring(2, 10)
  return `${username}@${getRandom(domains)}`
}

const generatePhone = (): string => {
  const areaCode = ['090', '080', '070'][Math.floor(seededRandom() * 3)]
  const number1 = Math.floor(seededRandom() * 9000) + 1000
  const number2 = Math.floor(seededRandom() * 9000) + 1000
  return `${areaCode}-${number1}-${number2}`
}

const generateAge = (): number => {
  return Math.floor(seededRandom() * 60) + 18
}

const generateAddress = (): string => {
  const prefecture = getRandom(japaneseData.prefectures)
  const city = getRandom(japaneseData.cities)
  const block = Math.floor(seededRandom() * 10) + 1
  const number = Math.floor(seededRandom() * 20) + 1
  return `${prefecture}${city}${block}-${number}`
}

const generateCity = (): string => {
  return getRandom(japaneseData.cities)
}

const generatePrefecture = (): string => {
  return getRandom(japaneseData.prefectures)
}

const generateZipCode = (): string => {
  const first = Math.floor(seededRandom() * 900) + 100
  const second = Math.floor(seededRandom() * 9000) + 1000
  return `${first}-${second}`
}

const generateCountry = (): string => {
  const countries = ['日本', 'アメリカ', 'イギリス', 'ドイツ', 'フランス', 'カナダ', 'オーストラリア', '韓国', '中国', 'インド']
  return getRandom(countries)
}

const generateCompany = (): string => {
  return getRandom(japaneseData.companies)
}

const generateJobTitle = (): string => {
  return getRandom(japaneseData.jobTitles)
}

const generateDepartment = (): string => {
  return getRandom(japaneseData.departments)
}

const generateProductName = (): string => {
  const adjectives = ['高性能', '最新', 'プレミアム', '限定版', 'スタンダード', '軽量', 'コンパクト']
  const product = getRandom(japaneseData.productNames)
  return `${getRandom(adjectives)} ${product}`
}

const generatePrice = (): number => {
  return Math.floor(seededRandom() * 100000) + 1000
}

const generateCategory = (): string => {
  return getRandom(japaneseData.categories)
}

const generateDate = (): string => {
  const start = new Date(2020, 0, 1)
  const end = new Date()
  const date = new Date(start.getTime() + seededRandom() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

const generateDateTime = (): string => {
  const start = new Date(2020, 0, 1)
  const end = new Date()
  const date = new Date(start.getTime() + seededRandom() * (end.getTime() - start.getTime()))
  return date.toISOString()
}

const generateTimestamp = (): number => {
  const start = new Date(2020, 0, 1).getTime()
  const end = new Date().getTime()
  return Math.floor(start + seededRandom() * (end - start))
}

const generateText = (): string => {
  const texts = [
    '吾輩は猫である。名前はまだ無い。',
    '春はあけぼの。やうやう白くなりゆく山際、少し明かりて、紫だちたる雲の細くたなびきたる。',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'サンプルテキストです。',
    '今日は良い天気ですね。'
  ]
  return getRandom(texts)
}

const generateURL = (): string => {
  const domains = ['example.com', 'test.jp', 'sample.net', 'demo.org']
  const paths = ['/', '/about', '/contact', '/products', '/services']
  return `https://${getRandom(domains)}${getRandom(paths)}`
}

const generateGender = (): string => {
  return getRandom(['男性', '女性', 'その他'])
}

const generateBloodType = (): string => {
  return getRandom(['A', 'B', 'AB', 'O'])
}

const generateStatus = (): string => {
  return getRandom(['アクティブ', '非アクティブ', '保留中', '完了'])
}

// フィールド操作
const addField = () => {
  const id = Date.now().toString()
  fields.value.push({
    id,
    name: `field_${fields.value.length + 1}`,
    type: 'text'
  })
}

const removeField = (id: string) => {
  fields.value = fields.value.filter(field => field.id !== id)
}

const moveField = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex >= 0 && newIndex < fields.value.length) {
    const temp = fields.value[index]
    fields.value[index] = fields.value[newIndex]
    fields.value[newIndex] = temp
  }
}

// シード付きランダム生成器
let seed = Math.random()

const seededRandom = () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}

const setSeed = (value: string) => {
  if (value) {
    // 文字列をハッシュ化してシード値に変換
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 32bit整数に変換
    }
    seed = Math.abs(hash) % 233280
  } else {
    seed = Math.random() * 233280
  }
}

// データ生成
const generateData = () => {
  error.value = ''
  generatedData.value = ''

  if (fields.value.length === 0) {
    error.value = 'フィールドを追加してください'
    return
  }

  try {
    // シード値設定
    setSeed(seedValue.value)

    const count = recordCount.value[0]
    const records: any[] = []

    for (let i = 0; i < count; i++) {
      const record: any = {}
      
      fields.value.forEach(field => {
        const type = dataTypes[field.type]
        if (type) {
          record[field.name] = type.generate(i)
        }
      })
      
      records.push(record)
    }

    // フォーマット別出力
    switch (outputFormat.value) {
      case 'json':
        generatedData.value = JSON.stringify(records, null, 2)
        break

      case 'csv':
        const headers = fields.value.map(f => f.name)
        const csvRows = records.map(record => 
          headers.map(header => {
            const value = record[header]
            // CSV用にエスケープ
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
        generatedData.value = [headers.join(','), ...csvRows].join('\n')
        break

      case 'sql':
        const tableCols = fields.value.map(f => f.name).join(', ')
        const values = records.map(record => {
          const vals = fields.value.map(field => {
            const value = record[field.name]
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`
            }
            return value
          }).join(', ')
          return `(${vals})`
        }).join(',\n  ')
        
        generatedData.value = `INSERT INTO ${tableName.value} (${tableCols}) VALUES\n  ${values};`
        break
    }

    toast({
      description: `${count}件のダミーデータを生成しました`,
    })
  } catch (e) {
    error.value = 'データ生成中にエラーが発生しました'
    console.error('Data generation error:', e)
  }
}

// プリセット
const presets = {
  user: {
    name: 'ユーザー情報',
    fields: [
      { id: '1', name: 'id', type: 'id' },
      { id: '2', name: 'name', type: 'fullName' },
      { id: '3', name: 'email', type: 'email' },
      { id: '4', name: 'phone', type: 'phone' },
      { id: '5', name: 'age', type: 'age' },
      { id: '6', name: 'gender', type: 'gender' },
      { id: '7', name: 'address', type: 'address' },
      { id: '8', name: 'created_at', type: 'datetime' }
    ]
  },
  product: {
    name: '商品情報',
    fields: [
      { id: '1', name: 'id', type: 'id' },
      { id: '2', name: 'name', type: 'productName' },
      { id: '3', name: 'category', type: 'category' },
      { id: '4', name: 'price', type: 'price' },
      { id: '5', name: 'description', type: 'text' },
      { id: '6', name: 'created_at', type: 'datetime' }
    ]
  },
  employee: {
    name: '従業員情報',
    fields: [
      { id: '1', name: 'id', type: 'id' },
      { id: '2', name: 'name', type: 'fullName' },
      { id: '3', name: 'email', type: 'email' },
      { id: '4', name: 'company', type: 'company' },
      { id: '5', name: 'department', type: 'department' },
      { id: '6', name: 'job_title', type: 'jobTitle' },
      { id: '7', name: 'hire_date', type: 'date' }
    ]
  }
}

const loadPreset = (presetName: keyof typeof presets) => {
  const preset = presets[presetName]
  fields.value = [...preset.fields]
  tableName.value = presetName
}

// ダウンロード
const downloadData = () => {
  if (!generatedData.value) return

  const extensions = { json: 'json', csv: 'csv', sql: 'sql' }
  const mimeTypes = {
    json: 'application/json',
    csv: 'text/csv',
    sql: 'text/plain'
  }

  const blob = new Blob([generatedData.value], { type: mimeTypes[outputFormat.value] })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `dummy-data.${extensions[outputFormat.value]}`
  link.click()
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

// 初期データ生成
onMounted(() => {
  generateData()
})

// SEO設定
useSeoMeta({
  title: 'データダミー生成 | Web開発ツール',
  description: 'テスト用の大量ダミーデータを生成。JSON、CSV、SQL形式対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        データダミー生成
      </h1>
      <p class="text-muted-foreground">
        テスト・開発用の大量ダミーデータを生成します。日本語データに対応。
      </p>
    </div>

    <!-- プリセット -->
    <Card>
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            v-for="(preset, key) in presets"
            :key="key"
            variant="outline"
            @click="loadPreset(key)">
            {{ preset.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- スキーマ設定 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>フィールド設定</CardTitle>
            <Button size="sm" @click="addField">
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              フィールド追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(field, index) in fields" :key="field.id" class="p-3 border rounded-md">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <Input
                  v-model="field.name"
                  placeholder="フィールド名"
                  class="text-sm" />
                <select
                  v-model="field.type"
                  class="w-full px-3 py-2 text-sm border rounded-md bg-background">
                  <optgroup v-for="(group, groupName) in {
                    'ID系': ['id', 'uuid'],
                    '人物系': ['fullName', 'firstName', 'lastName', 'email', 'phone', 'age', 'gender'],
                    '住所系': ['address', 'city', 'prefecture', 'zipCode', 'country'],
                    '会社系': ['company', 'jobTitle', 'department'],
                    '商品系': ['productName', 'price', 'category'],
                    '日時系': ['date', 'datetime', 'timestamp'],
                    '基本型': ['boolean', 'number', 'text', 'url'],
                    'その他': ['bloodType', 'status']
                  }" :key="groupName" :label="groupName">
                    <option v-for="type in group" :key="type" :value="type">
                      {{ dataTypes[type]?.name }}
                    </option>
                  </optgroup>
                </select>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    :disabled="index === 0"
                    @click="moveField(index, 'up')">
                    <Icon name="heroicons:arrow-up" class="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    :disabled="index === fields.length - 1"
                    @click="moveField(index, 'down')">
                    <Icon name="heroicons:arrow-down" class="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="removeField(field.id)">
                  <Icon name="heroicons:trash" class="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 生成設定 -->
      <Card>
        <CardHeader>
          <CardTitle>生成設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">
                生成件数: {{ recordCount[0] }}件
              </label>
              <Slider
                v-model="recordCount"
                :min="1"
                :max="1000"
                :step="1"
                class="w-full" />
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">出力形式</label>
              <div class="grid grid-cols-3 gap-2">
                <Button
                  v-for="format in ['json', 'csv', 'sql']"
                  :key="format"
                  :variant="outputFormat === format ? 'default' : 'outline'"
                  size="sm"
                  @click="outputFormat = format">
                  {{ format.toUpperCase() }}
                </Button>
              </div>
            </div>

            <div v-if="outputFormat === 'sql'">
              <label class="text-sm font-medium mb-2 block">テーブル名</label>
              <Input
                v-model="tableName"
                placeholder="table_name" />
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">シード値（再現性のため）</label>
              <Input
                v-model="seedValue"
                placeholder="空の場合はランダム" />
            </div>

            <Alert v-if="error" variant="destructive">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <Button
              class="w-full"
              :disabled="fields.length === 0"
              @click="generateData">
              <Icon name="heroicons:sparkles" class="w-4 h-4 mr-2" />
              データ生成
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 生成結果 -->
    <Card v-if="generatedData">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>生成データ</CardTitle>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              @click="copyToClipboard(generatedData)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              @click="downloadData">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre class="p-4 bg-muted rounded-md overflow-x-auto text-sm max-h-96"><code>{{ generatedData }}</code></pre>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>使い方とデータ型</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              主要データ型
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div v-for="(type, key) in dataTypes" :key="key">
                <code class="bg-muted px-1 rounded">{{ key }}</code>
                <span class="ml-1">{{ type.name }}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              特徴
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>日本語データに完全対応</li>
              <li>シード値による再現可能な生成</li>
              <li>JSON、CSV、SQL形式での出力</li>
              <li>カスタムフィールド定義</li>
              <li>最大1000件まで生成可能</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              用途例
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>データベースのテストデータ作成</li>
              <li>APIのモックデータ生成</li>
              <li>UIコンポーネントのサンプルデータ</li>
              <li>パフォーマンステスト用データ</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>