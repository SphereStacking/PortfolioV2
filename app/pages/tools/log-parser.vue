<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const logData = ref('')
const logFormat = ref<'apache' | 'nginx' | 'common' | 'combined'>('combined')
const parsedLogs = ref<LogEntry[]>([])
const error = ref('')
const stats = ref<LogStats | null>(null)

// ログエントリーの型定義
interface LogEntry {
  ip: string
  timestamp: Date
  method: string
  url: string
  status: number
  size: number
  referer?: string
  userAgent?: string
  responseTime?: number
}

// 統計情報の型定義
interface LogStats {
  totalRequests: number
  uniqueIPs: number
  statusCodes: Record<string, number>
  methods: Record<string, number>
  topPages: Array<{ url: string, count: number }>
  topIPs: Array<{ ip: string, count: number }>
  errors: LogEntry[]
  avgResponseSize: number
  timeRange: { start: Date, end: Date }
}

// ログフォーマット定義
const logFormats = {
  common: {
    name: 'Common Log Format',
    pattern: /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) \S+" (\d+) (\d+|-)/,
    fields: ['ip', 'timestamp', 'method', 'url', 'status', 'size'],
  },
  combined: {
    name: 'Combined Log Format',
    pattern: /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) \S+" (\d+) (\d+|-) "([^"]*)" "([^"]*)"/,
    fields: ['ip', 'timestamp', 'method', 'url', 'status', 'size', 'referer', 'userAgent'],
  },
  apache: {
    name: 'Apache Access Log',
    pattern: /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) \S+" (\d+) (\d+|-) "([^"]*)" "([^"]*)" (\d+)/,
    fields: ['ip', 'timestamp', 'method', 'url', 'status', 'size', 'referer', 'userAgent', 'responseTime'],
  },
  nginx: {
    name: 'Nginx Access Log',
    pattern: /^(\S+) - - \[([^\]]+)\] "(\S+) (\S+) \S+" (\d+) (\d+) "([^"]*)" "([^"]*)" rt=([0-9.]+)/,
    fields: ['ip', 'timestamp', 'method', 'url', 'status', 'size', 'referer', 'userAgent', 'responseTime'],
  },
}

// 日付パーサー
const parseLogTimestamp = (timestamp: string): Date => {
  try {
    // Apache/Nginx format: [dd/MMM/yyyy:HH:mm:ss +0000]
    const match = timestamp.match(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-]\d{4})/)
    if (match) {
      const [, day, monthStr, year, hour, minute, second, _timezone] = match
      const monthMap: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      }
      const month = monthMap[monthStr]
      return new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second))
    }
  }
  catch {
    console.warn('Failed to parse timestamp:', timestamp)
  }
  return new Date()
}

// ログ解析
const parseLogs = () => {
  error.value = ''
  parsedLogs.value = []
  stats.value = null

  if (!logData.value.trim()) {
    error.value = 'ログデータを入力してください'
    return
  }

  try {
    const lines = logData.value.trim().split('\n')
    const format = logFormats[logFormat.value]
    const entries: LogEntry[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const match = line.match(format.pattern)
      if (match) {
        const entry: LogEntry = {
          ip: match[1],
          timestamp: parseLogTimestamp(match[2]),
          method: match[3],
          url: match[4],
          status: parseInt(match[5]),
          size: match[6] === '-' ? 0 : parseInt(match[6]),
        }

        // 追加フィールド
        if (format.fields.includes('referer') && match[7]) {
          entry.referer = match[7] === '-' ? undefined : match[7]
        }
        if (format.fields.includes('userAgent') && match[8]) {
          entry.userAgent = match[8]
        }
        if (format.fields.includes('responseTime') && match[9]) {
          entry.responseTime = parseFloat(match[9])
        }

        entries.push(entry)
      }
    }

    if (entries.length === 0) {
      error.value = '解析できるログエントリーが見つかりませんでした。フォーマットを確認してください。'
      return
    }

    parsedLogs.value = entries
    calculateStats(entries)

    toast({
      description: `${entries.length}件のログエントリーを解析しました`,
    })
  }
  catch (e) {
    error.value = 'ログ解析中にエラーが発生しました'
    console.error('Log parsing error:', e)
  }
}

// 統計計算
const calculateStats = (entries: LogEntry[]) => {
  const ipCounts: Record<string, number> = {}
  const statusCounts: Record<string, number> = {}
  const methodCounts: Record<string, number> = {}
  const urlCounts: Record<string, number> = {}
  const errors: LogEntry[] = []

  let totalSize = 0
  let minTime = entries[0]?.timestamp
  let maxTime = entries[0]?.timestamp

  entries.forEach((entry) => {
    // IP集計
    ipCounts[entry.ip] = (ipCounts[entry.ip] || 0) + 1

    // ステータスコード集計
    statusCounts[entry.status.toString()] = (statusCounts[entry.status.toString()] || 0) + 1

    // メソッド集計
    methodCounts[entry.method] = (methodCounts[entry.method] || 0) + 1

    // URL集計
    urlCounts[entry.url] = (urlCounts[entry.url] || 0) + 1

    // サイズ集計
    totalSize += entry.size

    // エラー収集（4xx, 5xx）
    if (entry.status >= 400) {
      errors.push(entry)
    }

    // 時間範囲
    if (entry.timestamp < minTime) minTime = entry.timestamp
    if (entry.timestamp > maxTime) maxTime = entry.timestamp
  })

  // トップ10の算出
  const topPages = Object.entries(urlCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([url, count]) => ({ url, count }))

  const topIPs = Object.entries(ipCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }))

  stats.value = {
    totalRequests: entries.length,
    uniqueIPs: Object.keys(ipCounts).length,
    statusCodes: statusCounts,
    methods: methodCounts,
    topPages,
    topIPs,
    errors: errors.slice(0, 100), // 最大100件
    avgResponseSize: Math.round(totalSize / entries.length),
    timeRange: { start: minTime, end: maxTime },
  }
}

// フィルタリング
const filterBy = ref<'all' | 'errors' | 'success'>('all')
const searchTerm = ref('')

const filteredLogs = computed(() => {
  let filtered = parsedLogs.value

  // ステータスフィルター
  if (filterBy.value === 'errors') {
    filtered = filtered.filter(log => log.status >= 400)
  }
  else if (filterBy.value === 'success') {
    filtered = filtered.filter(log => log.status < 400)
  }

  // 検索フィルター
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(log =>
      log.ip.includes(term)
      || log.url.toLowerCase().includes(term)
      || log.method.toLowerCase().includes(term),
    )
  }

  return filtered.slice(0, 1000) // 表示は最大1000件
})

// サンプルログ
const sampleLogs = {
  combined: `192.168.1.100 - - [25/Dec/2023:10:00:23 +0000] "GET /index.html HTTP/1.1" 200 1043 "https://example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.101 - - [25/Dec/2023:10:00:24 +0000] "POST /api/login HTTP/1.1" 401 512 "-" "curl/7.68.0"
192.168.1.102 - - [25/Dec/2023:10:00:25 +0000] "GET /images/logo.png HTTP/1.1" 200 2048 "https://example.com/index.html" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
192.168.1.100 - - [25/Dec/2023:10:00:26 +0000] "GET /api/users HTTP/1.1" 200 1536 "-" "Mozilla/5.0 (X11; Linux x86_64)"
192.168.1.103 - - [25/Dec/2023:10:00:27 +0000] "GET /nonexistent HTTP/1.1" 404 196 "-" "Python-requests/2.25.1"`,
  apache: `127.0.0.1 - - [25/Dec/2023:10:00:23 +0000] "GET / HTTP/1.1" 200 1043 "https://google.com" "Mozilla/5.0" 150
10.0.0.5 - - [25/Dec/2023:10:00:24 +0000] "POST /contact HTTP/1.1" 500 512 "-" "curl/7.68.0" 2500
192.168.1.1 - - [25/Dec/2023:10:00:25 +0000] "GET /about HTTP/1.1" 200 2048 "https://example.com/" "Safari/14.0" 300`,
}

// サンプル読み込み
const loadSample = (format: keyof typeof sampleLogs) => {
  logFormat.value = format
  logData.value = sampleLogs[format]
  parseLogs()
}

// ファイル読み込み
const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    logData.value = e.target?.result as string
    parseLogs()
  }
  reader.readAsText(file, 'UTF-8')
}

// エクスポート
const exportStats = () => {
  if (!stats.value) return

  const exportData = {
    summary: {
      totalRequests: stats.value.totalRequests,
      uniqueIPs: stats.value.uniqueIPs,
      avgResponseSize: stats.value.avgResponseSize,
      timeRange: stats.value.timeRange,
    },
    statusCodes: stats.value.statusCodes,
    methods: stats.value.methods,
    topPages: stats.value.topPages,
    topIPs: stats.value.topIPs,
    errorCount: stats.value.errors.length,
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'log-analysis.json'
  link.click()
  URL.revokeObjectURL(url)
}

// ステータスコードの説明
const getStatusDescription = (status: number): string => {
  if (status >= 200 && status < 300) return '成功'
  if (status >= 300 && status < 400) return 'リダイレクト'
  if (status >= 400 && status < 500) return 'クライアントエラー'
  if (status >= 500) return 'サーバーエラー'
  return '不明'
}

// 日時フォーマット
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const _copyToClipboard = async (text: string) => {
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
  title: 'ログパーサー | Web開発ツール',
  description: 'アクセスログの解析・可視化。Apache、Nginxログフォーマット対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        ログパーサー
      </h1>
      <p class="text-muted-foreground">
        Webサーバーのアクセスログを解析して統計情報を表示します。
      </p>
    </div>

    <!-- ログフォーマット選択 -->
    <Card>
      <CardHeader>
        <CardTitle>ログフォーマット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <Button
            v-for="(format, key) in logFormats"
            :key="key"
            :variant="logFormat === key ? 'default' : 'outline'"
            size="sm"
            @click="logFormat = key">
            {{ format.name }}
          </Button>
        </div>

        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="loadSample('combined')">
            Combinedサンプル
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="loadSample('apache')">
            Apacheサンプル
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- ログ入力 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>ログデータ</CardTitle>
          <label>
            <input
              type="file"
              accept=".log,.txt"
              class="hidden"
              @change="handleFileUpload">
            <Button variant="outline" size="sm" as="span">
              <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
              ファイル選択
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <textarea
            v-model="logData"
            placeholder="ログデータを貼り付けるか、ファイルを選択してください&#10;例：&#10;192.168.1.1 - - [25/Dec/2023:10:00:23 +0000] &quot;GET /index.html HTTP/1.1&quot; 200 1043"
            class="w-full h-48 p-3 font-mono text-sm border rounded-md bg-background resize-none"
            spellcheck="false"></textarea>

          <Alert v-if="error" variant="destructive">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Button
            class="w-full"
            :disabled="!logData.trim()"
            @click="parseLogs">
            <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-2" />
            ログを解析
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 統計情報 -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="text-2xl font-bold">
            {{ stats.totalRequests.toLocaleString() }}
          </div>
          <p class="text-muted-foreground">
            総リクエスト数
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="text-2xl font-bold">
            {{ stats.uniqueIPs.toLocaleString() }}
          </div>
          <p class="text-muted-foreground">
            ユニークIP数
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="text-2xl font-bold">
            {{ stats.errors.length.toLocaleString() }}
          </div>
          <p class="text-muted-foreground">
            エラー数
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="text-2xl font-bold">
            {{ (stats.avgResponseSize / 1024).toFixed(1) }}KB
          </div>
          <p class="text-muted-foreground">
            平均レスポンスサイズ
          </p>
        </CardContent>
      </Card>
    </div>

    <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- ステータスコード分析 -->
      <Card>
        <CardHeader>
          <CardTitle>ステータスコード分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="(count, status) in stats.statusCodes" :key="status" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Badge
                  :variant="parseInt(status) >= 400 ? 'destructive' : parseInt(status) >= 300 ? 'secondary' : 'default'"
                  class="w-12 justify-center">
                  {{ status }}
                </Badge>
                <span class="text-sm">{{ getStatusDescription(parseInt(status)) }}</span>
              </div>
              <div class="text-sm font-medium">
                {{ count.toLocaleString() }}
                <span class="text-muted-foreground ml-1">
                  ({{ ((count / stats.totalRequests) * 100).toFixed(1) }}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- HTTPメソッド分析 -->
      <Card>
        <CardHeader>
          <CardTitle>HTTPメソッド分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="(count, method) in stats.methods" :key="method" class="flex items-center justify-between">
              <Badge variant="outline" class="w-16 justify-center">
                {{ method }}
              </Badge>
              <div class="text-sm font-medium">
                {{ count.toLocaleString() }}
                <span class="text-muted-foreground ml-1">
                  ({{ ((count / stats.totalRequests) * 100).toFixed(1) }}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 人気ページ -->
      <Card>
        <CardHeader>
          <CardTitle>アクセス上位ページ</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div v-for="(page, index) in stats.topPages" :key="page.url" class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                {{ index + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{ page.url }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ page.count.toLocaleString() }}回
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- アクセス上位IP -->
      <Card>
        <CardHeader>
          <CardTitle>アクセス上位IP</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div v-for="(ip, index) in stats.topIPs" :key="ip.ip" class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium font-mono">
                  {{ ip.ip }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ ip.count.toLocaleString() }}回
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ログエントリー表示 -->
    <Card v-if="parsedLogs.length > 0">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>ログエントリー</CardTitle>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              @click="exportStats">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              統計エクスポート
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- フィルター -->
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="filter in [
                { key: 'all', label: '全て' },
                { key: 'success', label: '成功のみ' },
                { key: 'errors', label: 'エラーのみ' },
              ]"
              :key="filter.key"
              :variant="filterBy === filter.key ? 'default' : 'outline'"
              size="sm"
              @click="filterBy = filter.key">
              {{ filter.label }}
            </Button>

            <Input
              v-model="searchTerm"
              placeholder="IP、URL、メソッドで検索..."
              class="w-64" />
          </div>

          <!-- ログテーブル -->
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時刻</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>メソッド</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>サイズ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(log, index) in filteredLogs" :key="index">
                  <TableCell class="font-mono text-xs">
                    {{ formatDate(log.timestamp) }}
                  </TableCell>
                  <TableCell class="font-mono text-sm">
                    {{ log.ip }}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" size="sm">
                      {{ log.method }}
                    </Badge>
                  </TableCell>
                  <TableCell class="max-w-96 truncate">
                    {{ log.url }}
                  </TableCell>
                  <TableCell>
                    <Badge
                      :variant="log.status >= 400 ? 'destructive' : log.status >= 300 ? 'secondary' : 'default'"
                      size="sm">
                      {{ log.status }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    {{ log.size.toLocaleString() }}B
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div v-if="filteredLogs.length === 1000" class="text-sm text-muted-foreground text-center">
            表示は1000件までです。フィルターを使用して絞り込んでください。
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>対応ログフォーマット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Common Log Format
            </h3>
            <code class="text-xs bg-muted p-2 rounded block">
              host ident authuser [date] "request" status size
            </code>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Combined Log Format
            </h3>
            <code class="text-xs bg-muted p-2 rounded block">
              host ident authuser [date] "request" status size "referer" "user-agent"
            </code>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              機能
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>リクエスト数・ユニークIP数の集計</li>
              <li>ステータスコード・HTTPメソッドの分析</li>
              <li>人気ページ・アクセス元IPのランキング</li>
              <li>エラーログの抽出</li>
              <li>統計データのJSONエクスポート</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
