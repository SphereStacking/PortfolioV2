<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Slider } from '~/components/ui/slider'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

const inputText = ref('')
const qrSize = ref([300])
const errorCorrectionLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const qrColor = ref('#000000')
const qrBackground = ref('#ffffff')
const margin = ref([4])
const qrDataUrl = ref('')
const downloading = ref(false)

// QRコード生成APIのURL構築
const generateQrCode = () => {
  if (!inputText.value.trim()) {
    toast({
      title: 'エラー',
      description: 'テキストを入力してください',
      variant: 'destructive',
    })
    return
  }

  // Google Charts APIを使用（実際のプロダクションでは、qrcode.jsなどのライブラリを使用推奨）
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/'
  const params = new URLSearchParams({
    data: inputText.value,
    size: `${qrSize.value[0]}x${qrSize.value[0]}`,
    ecc: errorCorrectionLevel.value,
    color: qrColor.value.substring(1), // #を除去
    bgcolor: qrBackground.value.substring(1), // #を除去
    margin: margin.value[0].toString(),
    format: 'png',
  })

  qrDataUrl.value = `${baseUrl}?${params.toString()}`
}

// サンプルデータ
const sampleData = [
  {
    name: 'URL',
    value: 'https://example.com',
    icon: 'heroicons:globe-alt',
  },
  {
    name: 'メール',
    value: 'mailto:contact@example.com',
    icon: 'heroicons:envelope',
  },
  {
    name: '電話番号',
    value: 'tel:+81-90-1234-5678',
    icon: 'heroicons:phone',
  },
  {
    name: 'WiFi',
    value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;',
    icon: 'heroicons:wifi',
  },
  {
    name: 'テキスト',
    value: 'こんにちは、世界！\nHello, World!',
    icon: 'heroicons:document-text',
  },
  {
    name: 'vCard',
    value: `BEGIN:VCARD
VERSION:3.0
FN:山田太郎
TEL:090-1234-5678
EMAIL:yamada@example.com
END:VCARD`,
    icon: 'heroicons:user',
  },
]

const loadSample = (sample: typeof sampleData[0]) => {
  inputText.value = sample.value
  generateQrCode()
}

// QRコードをダウンロード
const downloadQrCode = async () => {
  if (!qrDataUrl.value) return

  downloading.value = true
  try {
    const response = await fetch(qrDataUrl.value)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qrcode.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'ダウンロード完了',
      description: 'QRコードをダウンロードしました',
    })
  }
  catch {
    toast({
      title: 'エラー',
      description: 'ダウンロードに失敗しました',
      variant: 'destructive',
    })
  }
  finally {
    downloading.value = false
  }
}

// QRコードのデータURLをコピー
const copyQrCode = async () => {
  if (!qrDataUrl.value) return

  await copy(qrDataUrl.value)
  toast({
    title: 'コピーしました',
    description: 'QRコードのURLをクリップボードにコピーしました',
  })
}

// エラー訂正レベルの説明
const errorCorrectionLevels = [
  { value: 'L', label: '低 (7%)', description: '約7%の破損まで復元可能' },
  { value: 'M', label: '中 (15%)', description: '約15%の破損まで復元可能' },
  { value: 'Q', label: '高 (25%)', description: '約25%の破損まで復元可能' },
  { value: 'H', label: '最高 (30%)', description: '約30%の破損まで復元可能' },
]

// 自動生成の監視
watch([inputText, qrSize, errorCorrectionLevel, qrColor, qrBackground, margin], () => {
  if (inputText.value) {
    generateQrCode()
  }
})

// SEO設定
useSeoMeta({
  title: 'QRコード生成 | Web開発ツール',
  description: 'テキストやURLからQRコードを生成。サイズ、色、エラー訂正レベルのカスタマイズ対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        QRコード生成
      </h1>
      <p class="text-muted-foreground">
        テキストやURLからQRコードを生成。名刺やチラシ、Webサイトへの掲載に便利。
      </p>
    </div>

    <!-- サンプルデータ -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>サンプルデータ</CardTitle>
        <CardDescription>
          よく使われるQRコードのパターンを選択できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Button
            v-for="sample in sampleData"
            :key="sample.name"
            variant="outline"
            size="sm"
            class="flex flex-col h-auto py-3"
            @click="loadSample(sample)">
            <Icon :name="sample.icon" class="w-5 h-5 mb-1" />
            <span class="text-xs">{{ sample.name }}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>データ入力</CardTitle>
        <CardDescription>
          QRコードに変換するデータを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="inputText"
          class="w-full h-32 p-3 rounded-md border bg-background text-sm resize-y"
          placeholder="URL、テキスト、電話番号など"></textarea>
      </CardContent>
      <CardHeader>
        <CardTitle>カスタマイズ</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- サイズ -->
        <div>
          <label class="text-sm font-medium mb-2 block">
            サイズ: {{ qrSize[0] }}px
          </label>
          <Slider
            v-model="qrSize"
            :max="600"
            :min="100"
            :step="10"
            class="mb-4" />
        </div>

        <!-- エラー訂正レベル -->
        <div>
          <label class="text-sm font-medium mb-2 block">エラー訂正レベル</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="level in errorCorrectionLevels"
              :key="level.value"
              :class="[
                'p-3 rounded-md border text-sm transition-colors',
                errorCorrectionLevel === level.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted',
              ]"
              @click="errorCorrectionLevel = level.value as 'L' | 'M' | 'Q' | 'H'">
              <div class="font-medium">
                {{ level.label }}
              </div>
              <div class="text-xs opacity-80 mt-0.5">
                {{ level.description }}
              </div>
            </button>
          </div>
        </div>

        <!-- 色設定 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">前景色</label>
            <div class="flex gap-2">
              <input
                v-model="qrColor"
                type="color"
                class="h-10 w-16 rounded border cursor-pointer">
              <Input
                v-model="qrColor"
                class="flex-1"
                placeholder="#000000" />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">背景色</label>
            <div class="flex gap-2">
              <input
                v-model="qrBackground"
                type="color"
                class="h-10 w-16 rounded border cursor-pointer">
              <Input
                v-model="qrBackground"
                class="flex-1"
                placeholder="#ffffff" />
            </div>
          </div>
        </div>

        <!-- マージン -->
        <div>
          <label class="text-sm font-medium mb-2 block">
            余白: {{ margin[0] }}モジュール
          </label>
          <Slider
            v-model="margin"
            :max="10"
            :min="0"
            :step="1" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>プレビュー</CardTitle>
            <CardDescription>
              生成されたQRコード
            </CardDescription>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="qrDataUrl"
              size="sm"
              variant="outline"
              @click="copyQrCode">
              <Icon name="heroicons:link" class="w-4 h-4" />
            </Button>
            <Button
              v-if="qrDataUrl"
              size="sm"
              :disabled="downloading"
              @click="downloadQrCode">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
              ダウンロード
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-center min-h-[400px]">
          <div v-if="qrDataUrl" class="text-center">
            <img
              :src="qrDataUrl"
              alt="QR Code"
              class="max-w-full shadow-lg rounded-lg"
              :style="{ backgroundColor: qrBackground }">
            <p class="text-sm text-muted-foreground mt-4">
              {{ qrSize[0] }} × {{ qrSize[0] }}px
            </p>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <Icon name="heroicons:qr-code" class="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p>データを入力するとQRコードが生成されます</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 使い方 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>使い方のヒント</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4 text-sm text-muted-foreground">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              QRコードの種類
            </h4>
            <ul class="space-y-2">
              <li><code class="text-xs bg-muted px-1 py-0.5 rounded">https://example.com</code> - WebサイトのURL</li>
              <li><code class="text-xs bg-muted px-1 py-0.5 rounded">mailto:email@example.com</code> - メールアドレス</li>
              <li><code class="text-xs bg-muted px-1 py-0.5 rounded">tel:+81-90-1234-5678</code> - 電話番号</li>
              <li><code class="text-xs bg-muted px-1 py-0.5 rounded">WIFI:T:WPA;S:SSID;P:password;;</code> - WiFi設定</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              エラー訂正レベル
            </h4>
            <p class="mb-2">
              QRコードが部分的に破損しても読み取れる冗長性のレベル：
            </p>
            <ul class="space-y-1 text-xs">
              <li><strong>L (低)</strong>: 最小限の冗長性、より多くのデータを格納可能</li>
              <li><strong>M (中)</strong>: バランスの取れた設定（推奨）</li>
              <li><strong>Q (高)</strong>: ロゴを重ねる場合に適している</li>
              <li><strong>H (最高)</strong>: 最大の冗長性、印刷物に最適</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
