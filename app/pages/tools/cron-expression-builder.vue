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

// Cron式のパーツ
const minute = ref('*')
const hour = ref('*')
const dayOfMonth = ref('*')
const month = ref('*')
const dayOfWeek = ref('*')

// 詳細設定
const customExpression = ref('')

// Cron式
const cronExpression = computed(() => {
  if (customExpression.value) {
    return customExpression.value
  }

  return `${minute.value} ${hour.value} ${dayOfMonth.value} ${month.value} ${dayOfWeek.value}`
})

// 次回実行時刻の計算（簡易版）
const getNextExecutions = (expression: string, count = 5): string[] => {
  const parts = expression.split(' ')
  if (parts.length !== 5) return ['無効なCron式']

  const results: string[] = []
  const now = new Date()
  const [min, hour, day, month, dow] = parts

  // 簡易的な実行時刻計算
  if (expression === '* * * * *') {
    for (let i = 0; i < count; i++) {
      const next = new Date(now.getTime() + (i + 1) * 60000)
      results.push(next.toLocaleString('ja-JP'))
    }
  }
  else if (expression === '0 * * * *') {
    for (let i = 0; i < count; i++) {
      const next = new Date(now)
      next.setHours(now.getHours() + i + 1, 0, 0, 0)
      results.push(next.toLocaleString('ja-JP'))
    }
  }
  else if (min !== '*' && hour !== '*' && day === '*' && month === '*' && dow === '*') {
    // 毎日の特定時刻
    for (let i = 0; i < count; i++) {
      const next = new Date(now)
      next.setDate(now.getDate() + i)
      next.setHours(parseInt(hour), parseInt(min), 0, 0)
      if (next <= now && i === 0) {
        next.setDate(next.getDate() + 1)
      }
      results.push(next.toLocaleString('ja-JP'))
    }
  }
  else {
    results.push('複雑なCron式の解析は対応していません')
  }

  return results
}

const nextExecutions = computed(() => getNextExecutions(cronExpression.value))

// プリセット
const presets = [
  { label: '毎分', value: '* * * * *', description: '毎分実行' },
  { label: '毎時', value: '0 * * * *', description: '毎時0分に実行' },
  { label: '毎日', value: '0 0 * * *', description: '毎日0時0分に実行' },
  { label: '毎週月曜', value: '0 0 * * 1', description: '毎週月曜日の0時0分に実行' },
  { label: '毎月1日', value: '0 0 1 * *', description: '毎月1日の0時0分に実行' },
  { label: '平日9時', value: '0 9 * * 1-5', description: '平日（月-金）の9時0分に実行' },
  { label: '30分ごと', value: '*/30 * * * *', description: '30分ごとに実行' },
  { label: '3時間ごと', value: '0 */3 * * *', description: '3時間ごとの0分に実行' },
]

const applyPreset = (preset: typeof presets[0]) => {
  customExpression.value = preset.value
}

// フィールドの説明
const fieldDescriptions = [
  { field: '分', allowed: '0-59', special: '* , - /', example: '0,15,30,45' },
  { field: '時', allowed: '0-23', special: '* , - /', example: '9-17' },
  { field: '日', allowed: '1-31', special: '* , - / L W', example: 'L' },
  { field: '月', allowed: '1-12', special: '* , - /', example: '*/3' },
  { field: '曜日', allowed: '0-7', special: '* , - / L #', example: '1-5' },
]

// 特殊文字の説明
const specialCharacters = [
  { char: '*', description: 'すべての値に一致' },
  { char: ',', description: '複数の値を指定（例: 1,3,5）' },
  { char: '-', description: '範囲を指定（例: 1-5）' },
  { char: '/', description: 'ステップ値（例: */5 = 5ごと）' },
  { char: 'L', description: '最後（月末日、最終曜日）' },
  { char: 'W', description: '平日（月曜から金曜）' },
  { char: '#', description: '第N曜日（例: 2#3 = 第3火曜日）' },
]

// Cron式をコピー
const copyCron = async () => {
  await copy(cronExpression.value)
  toast({
    title: 'コピーしました',
    description: 'Cron式をクリップボードにコピーしました',
  })
}

// SEO設定
useSeoMeta({
  title: 'Cron式ビルダー | Web開発ツール',
  description: 'Cron式を視覚的に作成・検証。次回実行時刻の確認も可能。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        Cron式ビルダー
      </h1>
      <p class="text-muted-foreground">
        Cron式を視覚的に作成・検証。定期実行タスクのスケジューリングに便利。
      </p>
    </div>

    <!-- プリセット -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
        <CardDescription>
          よく使われるCron式のパターン
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            v-for="preset in presets"
            :key="preset.value"
            class="p-3 rounded-md border hover:bg-muted transition-colors text-left"
            @click="applyPreset(preset)">
            <div class="font-medium text-sm">
              {{ preset.label }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ preset.value }}
            </div>
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- モード切り替え -->
    <Card class="row-start-3 row-end-5 ">
      <CardHeader>
        <CardTitle>詳細設定</CardTitle>
        <CardDescription>
          各フィールドを個別に設定するか、直接Cron式を入力
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">直接入力</label>
          <Input
            v-model="customExpression"
            placeholder="* * * * *"
            class="font-mono" />
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"></span>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">または</span>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-2">
          <div>
            <label class="text-xs font-medium mb-1 block">分</label>
            <Input
              v-model="minute"
              :disabled="!!customExpression"
              placeholder="*"
              class="font-mono text-center" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1 block">時</label>
            <Input
              v-model="hour"
              :disabled="!!customExpression"
              placeholder="*"
              class="font-mono text-center" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1 block">日</label>
            <Input
              v-model="dayOfMonth"
              :disabled="!!customExpression"
              placeholder="*"
              class="font-mono text-center" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1 block">月</label>
            <Input
              v-model="month"
              :disabled="!!customExpression"
              placeholder="*"
              class="font-mono text-center" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1 block">曜日</label>
            <Input
              v-model="dayOfWeek"
              :disabled="!!customExpression"
              placeholder="*"
              class="font-mono text-center" />
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- Cron式 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>生成されたCron式</CardTitle>
            <CardDescription>
              このCron式をスケジューラーに設定してください
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            @click="copyCron">
            <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="p-4 bg-muted rounded-md font-mono text-lg text-center">
          {{ cronExpression }}
        </div>
      </CardContent>
    </Card>
    <!-- 次回実行時刻 -->
    <Card>
      <CardHeader>
        <CardTitle>次回実行予定</CardTitle>
        <CardDescription>
          次の5回の実行予定時刻
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="(execution, index) in nextExecutions"
            :key="index"
            class="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
            <Icon name="heroicons:clock" class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm">{{ execution }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="col-span-full grid grid-cols-2 gap-6">
      <!-- フィールドの説明 -->
      <div class="col-span-full">
        <CardHeader>
          <CardTitle>フィールドの説明</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2 text-sm">
            <div v-for="field in fieldDescriptions" :key="field.field" class="grid grid-cols-4 gap-2 py-1 border-b last:border-0">
              <div class="font-medium">
                {{ field.field }}
              </div>
              <div class="text-muted-foreground">
                {{ field.allowed }}
              </div>
              <div class="text-muted-foreground">
                {{ field.special }}
              </div>
              <div class="text-xs font-mono">
                {{ field.example }}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
      <!-- 使用例 -->
      <div>
        <CardHeader>
          <CardTitle>Cron式の例</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-2">
            <code class="bg-muted px-2 py-1 rounded">0 0 * * *</code>
            <p class="text-muted-foreground mt-1">
              毎日午前0時に実行
            </p>
            <code class="bg-muted px-2 py-1 rounded">*/15 * * * *</code>
            <p class="text-muted-foreground mt-1">
              15分ごとに実行
            </p>
            <code class="bg-muted px-2 py-1 rounded">0 9-17 * * 1-5</code>
            <p class="text-muted-foreground mt-1">
              平日の9時から17時まで毎時実行
            </p>
            <code class="bg-muted px-2 py-1 rounded">0 0 L * *</code>
            <p class="text-muted-foreground mt-1">
              毎月最終日の午前0時に実行
            </p>
          </div>
        </CardContent>
      </div>
      <!-- 特殊文字の説明 -->
      <div>
        <CardHeader>
          <CardTitle>特殊文字</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div v-for="char in specialCharacters" :key="char.char" class="flex gap-3">
              <code class="w-8 text-center bg-muted px-1 py-0.5 rounded text-sm">{{ char.char }}</code>
              <span class="text-sm text-muted-foreground">{{ char.description }}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  </div>
</template>
