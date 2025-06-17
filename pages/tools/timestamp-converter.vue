<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard, useIntervalFn } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})
interface TimeFormat {
  id: string
  name: string
  value: string
  copyValue?: string
}

// 状態管理
const inputValue = ref('')
const inputType = ref<'timestamp' | 'datetime' | 'iso'>('timestamp')
const timestampUnit = ref<'seconds' | 'milliseconds'>('milliseconds')
const currentTime = ref(Date.now())

// 現在時刻の更新
const updateCurrentTime = () => {
  currentTime.value = Date.now()
}

// 1秒ごとに現在時刻を更新
useIntervalFn(updateCurrentTime, 1000)

// 入力値からDateオブジェクトを生成
const dateFromInput = computed(() => {
  if (!inputValue.value) return null

  try {
    switch (inputType.value) {
      case 'timestamp': {
        const ts = parseInt(inputValue.value)
        if (isNaN(ts)) return null
        // 10桁以下なら秒として扱う
        const timestamp = inputValue.value.length <= 10 || timestampUnit.value === 'seconds'
          ? ts * 1000
          : ts
        return new Date(timestamp)
      }
      case 'datetime': {
        const date = new Date(inputValue.value)
        return isNaN(date.getTime()) ? null : date
      }
      case 'iso': {
        const date = new Date(inputValue.value)
        return isNaN(date.getTime()) ? null : date
      }
      default:
        return null
    }
  }
  catch {
    return null
  }
})

// 変換結果
const formats = computed<TimeFormat[]>(() => {
  const date = dateFromInput.value || new Date(currentTime.value)
  if (!date || isNaN(date.getTime())) return []

  const timestamp = date.getTime()
  const timestampSeconds = Math.floor(timestamp / 1000)

  return [
    {
      id: 'timestamp-ms',
      name: 'Unix タイムスタンプ (ミリ秒)',
      value: timestamp.toString(),
      copyValue: timestamp.toString(),
    },
    {
      id: 'timestamp-s',
      name: 'Unix タイムスタンプ (秒)',
      value: timestampSeconds.toString(),
      copyValue: timestampSeconds.toString(),
    },
    {
      id: 'iso',
      name: 'ISO 8601',
      value: date.toISOString(),
      copyValue: date.toISOString(),
    },
    {
      id: 'utc',
      name: 'UTC',
      value: date.toUTCString(),
      copyValue: date.toUTCString(),
    },
    {
      id: 'local',
      name: 'ローカル時刻',
      value: date.toString(),
      copyValue: date.toString(),
    },
    {
      id: 'local-ja',
      name: '日本語表記',
      value: date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }),
      copyValue: date.toLocaleString('ja-JP'),
    },
    {
      id: 'rfc2822',
      name: 'RFC 2822',
      value: date.toUTCString().replace('GMT', '+0000'),
      copyValue: date.toUTCString().replace('GMT', '+0000'),
    },
    {
      id: 'year',
      name: '年',
      value: date.getFullYear().toString(),
    },
    {
      id: 'month',
      name: '月',
      value: (date.getMonth() + 1).toString().padStart(2, '0'),
    },
    {
      id: 'day',
      name: '日',
      value: date.getDate().toString().padStart(2, '0'),
    },
    {
      id: 'hours',
      name: '時',
      value: date.getHours().toString().padStart(2, '0'),
    },
    {
      id: 'minutes',
      name: '分',
      value: date.getMinutes().toString().padStart(2, '0'),
    },
    {
      id: 'seconds',
      name: '秒',
      value: date.getSeconds().toString().padStart(2, '0'),
    },
    {
      id: 'weekday',
      name: '曜日',
      value: ['日', '月', '火', '水', '木', '金', '土'][date.getDay()],
    },
    {
      id: 'relative',
      name: '相対時間',
      value: getRelativeTime(date),
    },
  ]
})

// 相対時間を計算
const getRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const absDiff = Math.abs(diff)

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(absDiff / (1000 * 60))
  const hours = Math.floor(absDiff / (1000 * 60 * 60))
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
  const months = Math.floor(absDiff / (1000 * 60 * 60 * 24 * 30))
  const years = Math.floor(absDiff / (1000 * 60 * 60 * 24 * 365))

  let result = ''
  if (years > 0) result = `${years}年`
  else if (months > 0) result = `${months}ヶ月`
  else if (days > 0) result = `${days}日`
  else if (hours > 0) result = `${hours}時間`
  else if (minutes > 0) result = `${minutes}分`
  else if (seconds > 0) result = `${seconds}秒`
  else result = '今'

  if (result !== '今') {
    result += diff > 0 ? '前' : '後'
  }

  return result
}

// プリセット日時
const presets = [
  { name: '現在', getValue: () => new Date() },
  { name: '今日の開始', getValue: () => new Date(new Date().setHours(0, 0, 0, 0)) },
  { name: '今日の終了', getValue: () => new Date(new Date().setHours(23, 59, 59, 999)) },
  { name: '昨日', getValue: () => new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { name: '明日', getValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  { name: '1週間前', getValue: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { name: '1週間後', getValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  { name: '1ヶ月前', getValue: () => new Date(new Date().setMonth(new Date().getMonth() - 1)) },
  { name: '1ヶ月後', getValue: () => new Date(new Date().setMonth(new Date().getMonth() + 1)) },
  { name: 'Unix エポック', getValue: () => new Date(0) },
  { name: '2000年1月1日', getValue: () => new Date('2000-01-01T00:00:00') },
]

// プリセットを適用
const applyPreset = (preset: typeof presets[0]) => {
  const date = preset.getValue()
  if (inputType.value === 'timestamp') {
    inputValue.value = timestampUnit.value === 'seconds'
      ? Math.floor(date.getTime() / 1000).toString()
      : date.getTime().toString()
  }
  else if (inputType.value === 'iso') {
    inputValue.value = date.toISOString()
  }
  else {
    // datetime-local形式
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    inputValue.value = `${year}-${month}-${day}T${hours}:${minutes}`
  }
}

// 現在時刻を使用
const useCurrentTime = () => {
  applyPreset(presets[0])
}

// 入力をクリア
const clearInput = () => {
  inputValue.value = ''
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string, name: string) => {
  try {
    await copy(text)
    toast({
      title: 'コピーしました',
      description: `${name}をクリップボードにコピーしました`,
    })
  }
  catch (err) {
    console.error('Failed to copy:', err)
    toast({
      title: 'エラー',
      description: 'クリップボードへのコピーに失敗しました',
      variant: 'destructive',
    })
  }
}

// 入力タイプの切り替え時
watch(inputType, () => {
  inputValue.value = ''
})

// SEO設定
useSeoMeta({
  title: 'タイムスタンプ変換ツール | Web開発ツール',
  description: 'Unixタイムスタンプと日時を相互変換。各種フォーマットに対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        タイムスタンプ変換ツール
      </h1>
      <p class="text-muted-foreground">
        Unixタイムスタンプと日時を相互変換します。
      </p>
    </div>

    <!-- プリセットセクション -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
        <CardDescription>よく使う日時をすぐに選択できます</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in presets"
            :key="preset.name"
            size="sm"
            variant="outline"
            @click="applyPreset(preset)">
            {{ preset.name }}
          </Button>
        </div>
      </CardContent>
    </Card>
    <!-- 入力パネル -->
    <div class="space-y-6">
      <!-- 入力タイプ選択 -->
      <Card>
        <CardHeader>
          <CardTitle>入力形式</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <label class="flex items-center gap-3">
              <input
                v-model="inputType"
                value="timestamp"
                type="radio"
                class="text-primary">
              <div>
                <div class="font-medium">タイムスタンプ</div>
                <div class="text-sm text-muted-foreground">Unix時間（秒またはミリ秒）</div>
              </div>
            </label>
            <label class="flex items-center gap-3">
              <input
                v-model="inputType"
                value="datetime"
                type="radio"
                class="text-primary">
              <div>
                <div class="font-medium">日時</div>
                <div class="text-sm text-muted-foreground">年月日と時刻を入力</div>
              </div>
            </label>
            <label class="flex items-center gap-3">
              <input
                v-model="inputType"
                value="iso"
                type="radio"
                class="text-primary">
              <div>
                <div class="font-medium">ISO 8601</div>
                <div class="text-sm text-muted-foreground">国際標準フォーマット</div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <!-- 入力フィールド -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>値を入力</CardTitle>
            <div class="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                @click="useCurrentTime">
                <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                現在時刻
              </Button>
              <Button
                size="sm"
                variant="ghost"
                @click="clearInput">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <!-- タイムスタンプ入力 -->
          <div v-if="inputType === 'timestamp'" class="space-y-3">
            <Input
              v-model="inputValue"
              type="text"
              placeholder="例: 1640995200000"
              class="font-mono" />
            <div class="flex gap-2">
              <label class="flex items-center gap-2">
                <input
                  v-model="timestampUnit"
                  value="seconds"
                  type="radio"
                  class="text-primary">
                <span class="text-sm">秒</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="timestampUnit"
                  value="milliseconds"
                  type="radio"
                  class="text-primary">
                <span class="text-sm">ミリ秒</span>
              </label>
            </div>
          </div>

          <!-- 日時入力 -->
          <div v-else-if="inputType === 'datetime'">
            <input
              v-model="inputValue"
              type="datetime-local"
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
          </div>

          <!-- ISO入力 -->
          <div v-else-if="inputType === 'iso'">
            <Input
              v-model="inputValue"
              type="text"
              placeholder="例: 2024-01-01T00:00:00.000Z"
              class="font-mono" />
          </div>

          <div v-if="dateFromInput" class="mt-3 p-3 bg-muted rounded">
            <div class="text-sm text-muted-foreground">
              入力値の解釈:
            </div>
            <div class="font-medium">
              {{ dateFromInput.toString() }}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 変換結果 -->
    <Card>
      <CardHeader>
        <CardTitle>
          変換結果
          <span v-if="!inputValue" class="text-sm font-normal text-muted-foreground ml-2">
            (現在時刻を表示中)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="format in formats"
            :key="format.id"
            class="group flex items-center justify-between p-3 bg-muted rounded hover:bg-muted/80 transition-colors">
            <div>
              <div class="text-sm text-muted-foreground">
                {{ format.name }}
              </div>
              <div class="font-mono">
                {{ format.value }}
              </div>
            </div>
            <Button
              v-if="format.copyValue"
              size="sm"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click="copyToClipboard(format.copyValue, format.name)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- タイムスタンプについて -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>タイムスタンプについて</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <div>
          <h5 class="font-medium text-foreground mb-1">
            Unix タイムスタンプとは
          </h5>
          <p>
            1970年1月1日 00:00:00 UTC（Unix エポック）からの経過時間を表す数値です。
            秒単位またはミリ秒単位で表現されます。
          </p>
        </div>
        <div>
          <h5 class="font-medium text-foreground mb-1">
            使用例
          </h5>
          <ul class="list-disc list-inside space-y-1">
            <li>データベースでの日時保存</li>
            <li>APIでの日時データ交換</li>
            <li>ログファイルのタイムスタンプ</li>
            <li>異なるタイムゾーン間での時刻比較</li>
          </ul>
        </div>
        <div>
          <h5 class="font-medium text-foreground mb-1">
            注意点
          </h5>
          <ul class="list-disc list-inside space-y-1">
            <li>2038年問題: 32ビット整数では2038年1月19日までしか表現できません</li>
            <li>JavaScriptではミリ秒単位、多くのシステムでは秒単位を使用</li>
            <li>タイムゾーンの考慮が必要な場合があります</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
