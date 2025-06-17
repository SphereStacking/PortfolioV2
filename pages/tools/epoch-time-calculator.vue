<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const currentTime = ref(Date.now())
const epochInput = ref('')
const dateTimeInput = ref('')
const selectedTimezone = ref('Asia/Tokyo')
const showMilliseconds = ref(true)
const fromDate = ref('')
const toDate = ref('')

// 定期更新用のインターバル
let updateInterval: NodeJS.Timeout | null = null

// タイムゾーンリスト
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Tokyo', label: '東京 (JST)' },
  { value: 'America/New_York', label: 'ニューヨーク (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'ロサンゼルス (PST/PDT)' },
  { value: 'Europe/London', label: 'ロンドン (GMT/BST)' },
  { value: 'Europe/Paris', label: 'パリ (CET/CEST)' },
  { value: 'Asia/Shanghai', label: '上海 (CST)' },
  { value: 'Asia/Seoul', label: 'ソウル (KST)' },
  { value: 'Australia/Sydney', label: 'シドニー (AEST/AEDT)' },
  { value: 'Asia/Dubai', label: 'ドバイ (GST)' },
]

// 現在時刻の更新
const updateCurrentTime = () => {
  currentTime.value = Date.now()
}

// マウント時に定期更新開始
onMounted(() => {
  updateInterval = setInterval(updateCurrentTime, 100)

  // 現在の日時を初期値に設定
  const now = new Date()
  dateTimeInput.value = formatDateTimeLocal(now)
})

// アンマウント時にクリーンアップ
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// 日時フォーマット
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

// 現在のエポック時間
const currentEpochTime = computed(() => {
  if (showMilliseconds.value) {
    return currentTime.value
  }
  return Math.floor(currentTime.value / 1000)
})

// 現在時刻のフォーマット表示
const currentTimeFormatted = computed(() => {
  const date = new Date(currentTime.value)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: selectedTimezone.value,
    hour12: false,
  }

  if (showMilliseconds.value) {
    // ミリ秒を手動で追加
    const formatted = new Intl.DateTimeFormat('ja-JP', options).format(date)
    const ms = String(date.getMilliseconds()).padStart(3, '0')
    return `${formatted}.${ms}`
  }

  return new Intl.DateTimeFormat('ja-JP', options).format(date)
})

// エポック時間から日時への変換
const epochToDate = () => {
  if (!epochInput.value) {
    toast({
      title: 'エラー',
      description: 'エポック時間を入力してください',
      variant: 'destructive',
    })
    return
  }

  const epochValue = parseInt(epochInput.value)
  if (isNaN(epochValue)) {
    toast({
      title: 'エラー',
      description: '有効な数値を入力してください',
      variant: 'destructive',
    })
    return
  }

  // ミリ秒か秒かを自動判定（10桁以下なら秒として扱う）
  const timestamp = epochValue.toString().length <= 10 ? epochValue * 1000 : epochValue
  const date = new Date(timestamp)

  if (isNaN(date.getTime())) {
    toast({
      title: 'エラー',
      description: '無効な日時です',
      variant: 'destructive',
    })
    return
  }

  dateTimeInput.value = formatDateTimeLocal(date)
  toast({
    title: '変換完了',
    description: `エポック時間 ${epochValue} を日時に変換しました`,
  })
}

// 日時からエポック時間への変換
const dateToEpoch = () => {
  if (!dateTimeInput.value) {
    toast({
      title: 'エラー',
      description: '日時を入力してください',
      variant: 'destructive',
    })
    return
  }

  const date = new Date(dateTimeInput.value)
  if (isNaN(date.getTime())) {
    toast({
      title: 'エラー',
      description: '無効な日時形式です',
      variant: 'destructive',
    })
    return
  }

  const epochValue = showMilliseconds.value ? date.getTime() : Math.floor(date.getTime() / 1000)
  epochInput.value = epochValue.toString()

  toast({
    title: '変換完了',
    description: `日時をエポック時間 ${epochValue} に変換しました`,
  })
}

// 日時差分計算
const calculateDifference = () => {
  if (!fromDate.value || !toDate.value) {
    toast({
      title: 'エラー',
      description: '開始日時と終了日時を入力してください',
      variant: 'destructive',
    })
    return
  }

  const from = new Date(fromDate.value)
  const to = new Date(toDate.value)

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    toast({
      title: 'エラー',
      description: '無効な日時形式です',
      variant: 'destructive',
    })
    return
  }

  const diff = to.getTime() - from.getTime()
  return diff
}

// 差分の詳細表示
const differenceDetails = computed(() => {
  const diff = calculateDifference()
  if (diff === undefined) return null

  const absDiff = Math.abs(diff)
  const sign = diff >= 0 ? '' : '-'

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30.44) // 平均月日数
  const years = Math.floor(days / 365.25) // うるう年考慮

  return {
    milliseconds: `${sign}${absDiff}`,
    seconds: `${sign}${seconds}`,
    minutes: `${sign}${minutes}`,
    hours: `${sign}${hours}`,
    days: `${sign}${days}`,
    weeks: `${sign}${weeks}`,
    months: `${sign}${months}`,
    years: `${sign}${years}`,
    formatted: formatDuration(absDiff),
  }
})

// 期間のフォーマット
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const parts = []
  if (days > 0) parts.push(`${days}日`)
  if (hours % 24 > 0) parts.push(`${hours % 24}時間`)
  if (minutes % 60 > 0) parts.push(`${minutes % 60}分`)
  if (seconds % 60 > 0) parts.push(`${seconds % 60}秒`)

  return parts.join(' ') || '0秒'
}

// 相対時間の表示
const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const absDiff = Math.abs(diff)

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  let relativeTime = ''
  if (days > 0) {
    relativeTime = `${days}日`
  }
  else if (hours > 0) {
    relativeTime = `${hours}時間`
  }
  else if (minutes > 0) {
    relativeTime = `${minutes}分`
  }
  else {
    relativeTime = `${seconds}秒`
  }

  return diff > 0 ? `${relativeTime}前` : `${relativeTime}後`
}

// よく使う日時
const commonDates = [
  { label: '現在', getValue: () => new Date() },
  { label: '今日の0時', getValue: () => new Date(new Date().setHours(0, 0, 0, 0)) },
  { label: '明日の0時', getValue: () => new Date(new Date().setHours(24, 0, 0, 0)) },
  { label: '1週間前', getValue: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { label: '1ヶ月前', getValue: () => new Date(new Date().setMonth(new Date().getMonth() - 1)) },
  { label: '1年前', getValue: () => new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
  { label: 'Unix エポック', getValue: () => new Date(0) },
  { label: '2000年1月1日', getValue: () => new Date('2000-01-01T00:00:00') },
]

// 日時を設定
const setDateTime = (getValue: () => Date) => {
  const date = getValue()
  dateTimeInput.value = formatDateTimeLocal(date)
  dateToEpoch()
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
  title: 'エポック時間計算機 | Web開発ツール',
  description: 'Unix時間と日時の相互変換、タイムゾーン変換、期間計算。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        エポック時間計算機
      </h1>
      <p class="text-muted-foreground">
        Unix時間（エポック時間）と日時の相互変換、タイムゾーン変換、期間計算を行います。
      </p>
    </div>

    <!-- 現在時刻 -->
    <Card>
      <CardHeader>
        <CardTitle>現在時刻</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground mb-1">
                エポック時間
              </p>
              <div class="flex items-center gap-2">
                <p class="font-mono text-2xl">
                  {{ currentEpochTime }}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(currentEpochTime.toString())">
                  <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">
                日時 ({{ selectedTimezone }})
              </p>
              <p class="font-mono text-lg">
                {{ currentTimeFormatted }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="showMilliseconds"
                type="checkbox"
                class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
              ミリ秒表示
            </label>

            <div class="flex items-center gap-2">
              <label class="text-sm">タイムゾーン:</label>
              <select
                v-model="selectedTimezone"
                class="px-3 py-1 text-sm border rounded-md bg-background">
                <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 相互変換 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- エポック時間 → 日時 -->
      <Card>
        <CardHeader>
          <CardTitle>エポック時間 → 日時</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">
                エポック時間
              </label>
              <Input
                v-model="epochInput"
                type="text"
                placeholder="1234567890 または 1234567890000"
                class="font-mono" />
              <p class="text-xs text-muted-foreground mt-1">
                10桁以下は秒、11桁以上はミリ秒として扱います
              </p>
            </div>
            <Button class="w-full" @click="epochToDate">
              <Icon name="heroicons:arrow-down" class="w-4 h-4 mr-2" />
              日時に変換
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 日時 → エポック時間 -->
      <Card>
        <CardHeader>
          <CardTitle>日時 → エポック時間</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">
                日時（ローカルタイム）
              </label>
              <input
                v-model="dateTimeInput"
                type="datetime-local"
                step="1"
                class="w-full px-3 py-2 border rounded-md bg-background">
            </div>

            <div class="grid grid-cols-3 gap-2">
              <Button
                v-for="date in commonDates.slice(0, 3)"
                :key="date.label"
                size="sm"
                variant="outline"
                @click="setDateTime(date.getValue)">
                {{ date.label }}
              </Button>
            </div>

            <Button class="w-full" @click="dateToEpoch">
              <Icon name="heroicons:arrow-up" class="w-4 h-4 mr-2" />
              エポック時間に変換
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- よく使う日時 -->
    <Card>
      <CardHeader>
        <CardTitle>よく使う日時</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="date in commonDates" :key="date.label">
            <Button
              variant="outline"
              size="sm"
              class="w-full"
              @click="setDateTime(date.getValue)">
              {{ date.label }}
            </Button>
            <p class="text-xs text-muted-foreground mt-1 text-center">
              {{ getRelativeTime(date.getValue()) }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 期間計算 -->
    <Card>
      <CardHeader>
        <CardTitle>期間計算</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium mb-2 block">
                開始日時
              </label>
              <input
                v-model="fromDate"
                type="datetime-local"
                step="1"
                class="w-full px-3 py-2 border rounded-md bg-background">
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">
                終了日時
              </label>
              <input
                v-model="toDate"
                type="datetime-local"
                step="1"
                class="w-full px-3 py-2 border rounded-md bg-background">
            </div>
          </div>

          <div v-if="differenceDetails" class="space-y-2 p-4 bg-muted rounded-md">
            <p class="font-medium">
              期間: {{ differenceDetails.formatted }}
            </p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span class="text-muted-foreground">ミリ秒:</span>
                <span class="font-mono ml-1">{{ differenceDetails.milliseconds }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">秒:</span>
                <span class="font-mono ml-1">{{ differenceDetails.seconds }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">分:</span>
                <span class="font-mono ml-1">{{ differenceDetails.minutes }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">時間:</span>
                <span class="font-mono ml-1">{{ differenceDetails.hours }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">日:</span>
                <span class="font-mono ml-1">{{ differenceDetails.days }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">週:</span>
                <span class="font-mono ml-1">{{ differenceDetails.weeks }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">月:</span>
                <span class="font-mono ml-1">{{ differenceDetails.months }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">年:</span>
                <span class="font-mono ml-1">{{ differenceDetails.years }}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>エポック時間について</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              エポック時間とは
            </h3>
            <p>
              Unix時間とも呼ばれ、1970年1月1日00:00:00 UTC（協定世界時）からの経過秒数です。
              コンピュータシステムで時刻を表現する標準的な方法として広く使用されています。
            </p>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              形式
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>秒単位:</strong> 10桁の数値（例: 1640995200）</li>
              <li><strong>ミリ秒単位:</strong> 13桁の数値（例: 1640995200000）</li>
              <li><strong>マイクロ秒単位:</strong> 16桁の数値（プログラミング言語による）</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              使用例
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>データベースのタイムスタンプ</li>
              <li>APIレスポンスの日時フィールド</li>
              <li>ログファイルの記録時刻</li>
              <li>キャッシュの有効期限管理</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
