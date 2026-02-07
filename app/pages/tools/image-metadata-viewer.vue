<script setup lang="ts">
import { useDropZone, useFileDialog, useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  layout: 'tools',
})

const { toast } = useToast()

// 画像データ
const imageUrl = ref<string>('')
const fileName = ref('')
const fileSize = ref(0)
const metadata = ref<Record<string, unknown>>({})
const basicInfo = ref({
  width: 0,
  height: 0,
  type: '',
  lastModified: '',
})

// ファイル選択
const dropZoneRef = ref<HTMLDivElement>()
const { open: openFileDialog, reset, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
})

onChange((files) => {
  if (files && files.length > 0) {
    handleFile(files[0])
  }
})

// ドロップゾーン
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  },
})

// ファイル処理
const handleFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast({
      title: 'エラー',
      description: '画像ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  fileName.value = file.name
  fileSize.value = file.size
  basicInfo.value.type = file.type
  basicInfo.value.lastModified = new Date(file.lastModified).toLocaleString('ja-JP')

  // 画像を読み込んで表示
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string

    // 画像サイズを取得
    const img = new Image()
    img.onload = () => {
      basicInfo.value.width = img.width
      basicInfo.value.height = img.height
    }
    img.src = imageUrl.value
  }
  reader.readAsDataURL(file)

  // メタデータを抽出
  extractMetadata(file)
}

// メタデータ抽出（簡易版）
const extractMetadata = async (file: File) => {
  metadata.value = {}

  try {
    // ArrayBufferとして読み込み
    const buffer = await file.arrayBuffer()
    const dataView = new DataView(buffer)

    // JPEGの場合、簡易的なExif情報を抽出
    if (file.type === 'image/jpeg') {
      // Exifマーカーを探す
      let offset = 2 // JPEGのSOIマーカーをスキップ
      while (offset < dataView.byteLength) {
        if (dataView.getUint8(offset) === 0xFF) {
          const marker = dataView.getUint8(offset + 1)

          // APP1マーカー（Exif）
          if (marker === 0xE1) {
            const length = dataView.getUint16(offset + 2)
            const exifData = extractExifData(dataView, offset + 4, length - 2)
            Object.assign(metadata.value, exifData)
            break
          }

          // 他のマーカーはスキップ
          if (marker !== 0xD8 && marker !== 0xD9) {
            const segmentLength = dataView.getUint16(offset + 2)
            offset += segmentLength + 2
          }
          else {
            offset += 2
          }
        }
        else {
          offset++
        }
      }
    }

    // 基本的なメタデータを追加
    metadata.value['ファイル名'] = fileName.value
    metadata.value['ファイルサイズ'] = formatFileSize(fileSize.value)
    metadata.value['画像形式'] = basicInfo.value.type
    metadata.value['画像サイズ'] = `${basicInfo.value.width} × ${basicInfo.value.height}px`
    metadata.value['アスペクト比'] = calculateAspectRatio(basicInfo.value.width, basicInfo.value.height)
    metadata.value['総画素数'] = formatPixels(basicInfo.value.width * basicInfo.value.height)
    metadata.value['最終更新日'] = basicInfo.value.lastModified
  }
  catch (error) {
    console.error('メタデータの抽出に失敗:', error)
  }
}

// 簡易的なExifデータ抽出
const extractExifData = (dataView: DataView, offset: number, _length: number): Record<string, string> => {
  const exifData: Record<string, string> = {}

  // Exifヘッダーの確認
  const exifHeader = String.fromCharCode(
    dataView.getUint8(offset),
    dataView.getUint8(offset + 1),
    dataView.getUint8(offset + 2),
    dataView.getUint8(offset + 3),
  )

  if (exifHeader === 'Exif') {
    // 簡易的な実装のため、基本的な情報のみ
    exifData['Exif情報'] = 'あり'
  }

  return exifData
}

// ファイルサイズのフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}

// 画素数のフォーマット
const formatPixels = (pixels: number): string => {
  if (pixels < 1000000) return pixels.toLocaleString() + ' ピクセル'
  return (pixels / 1000000).toFixed(1) + ' MP (メガピクセル)'
}

// アスペクト比の計算
const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(width, height)
  const w = width / divisor
  const h = height / divisor

  // 一般的なアスペクト比
  const ratio = width / height
  if (Math.abs(ratio - 16 / 9) < 0.01) return '16:9 (ワイドスクリーン)'
  if (Math.abs(ratio - 4 / 3) < 0.01) return '4:3 (スタンダード)'
  if (Math.abs(ratio - 1) < 0.01) return '1:1 (正方形)'
  if (Math.abs(ratio - 3 / 2) < 0.01) return '3:2 (一眼レフ標準)'
  if (Math.abs(ratio - 21 / 9) < 0.01) return '21:9 (シネマスコープ)'

  return `${w}:${h}`
}

// メタデータをコピー
const copyMetadata = async () => {
  const text = Object.entries(metadata.value)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  const { copy } = useClipboard()
  await copy(text)

  toast({
    title: 'コピーしました',
    description: 'メタデータをクリップボードにコピーしました',
  })
}

// メタデータを削除した画像をダウンロード
const downloadWithoutMetadata = () => {
  if (!imageUrl.value) return

  // Canvas を使って画像を再描画（メタデータなし）
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(img, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'no_metadata_' + fileName.value
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'ダウンロード完了',
        description: 'メタデータを削除した画像をダウンロードしました',
      })
    }, basicInfo.value.type)
  }
  img.src = imageUrl.value
}

// クリア
const clearAll = () => {
  imageUrl.value = ''
  fileName.value = ''
  fileSize.value = 0
  metadata.value = {}
  basicInfo.value = {
    width: 0,
    height: 0,
    type: '',
    lastModified: '',
  }
  reset()
}

// SEO設定
useSeoMeta({
  title: '画像メタデータビューア | Web開発ツール',
  description: '画像の撮影情報やメタデータを表示。プライバシー保護のためのメタデータ削除も可能。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        画像メタデータビューア
      </h1>
      <p class="text-muted-foreground">
        画像の撮影情報やメタデータを表示。プライバシー保護のためのメタデータ削除も可能。
      </p>
    </div>
    <!-- 入力エリア -->
    <Card>
      <CardHeader>
        <CardTitle>画像選択</CardTitle>
        <CardDescription>
          メタデータを確認したい画像をアップロード
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref="dropZoneRef"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isOverDropZone ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          ]"
          @click="openFileDialog">
          <div v-if="!imageUrl">
            <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p class="text-sm text-muted-foreground mb-2">
              クリックまたはドロップで画像を選択
            </p>
            <p class="text-xs text-muted-foreground">
              JPEG, PNG, GIF, WebP, AVIF対応
            </p>
          </div>
          <div v-else class="space-y-4">
            <img
              :src="imageUrl"
              alt="Selected"
              class="max-w-full max-h-[300px] mx-auto rounded">
            <Button
              variant="outline"
              size="sm"
              @click.stop="clearAll">
              別の画像を選択
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- メタデータ表示 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>メタデータ</CardTitle>
            <CardDescription>
              画像に含まれる情報
            </CardDescription>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="Object.keys(metadata).length > 0"
              size="sm"
              variant="outline"
              @click="copyMetadata">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
            <Button
              v-if="imageUrl"
              size="sm"
              variant="outline"
              @click="downloadWithoutMetadata">
              <Icon name="heroicons:shield-check" class="w-4 h-4 mr-1" />
              メタデータ削除
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="Object.keys(metadata).length > 0" class="space-y-2">
          <div
            v-for="(value, key) in metadata"
            :key="key"
            class="grid grid-cols-2 gap-2 py-2 border-b last:border-0">
            <div class="text-sm font-medium">
              {{ key }}
            </div>
            <div class="text-sm text-muted-foreground">
              {{ value }}
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-muted-foreground">
          <Icon name="heroicons:information-circle" class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>画像を選択するとメタデータが表示されます</p>
        </div>
      </CardContent>
    </Card>
    <!-- 説明 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>メタデータについて</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4 text-sm text-muted-foreground">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              含まれる可能性のある情報
            </h4>
            <ul class="space-y-1">
              <li>• 撮影日時・撮影場所（GPS）</li>
              <li>• カメラのメーカー・機種</li>
              <li>• 撮影設定（ISO、シャッタースピード、絞り）</li>
              <li>• 使用したソフトウェア</li>
              <li>• 著作権情報</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-foreground">
              メタデータ削除の用途
            </h4>
            <ul class="space-y-1">
              <li>• プライバシー保護（位置情報の削除）</li>
              <li>• ファイルサイズの軽量化</li>
              <li>• SNS投稿前の個人情報削除</li>
              <li>• Web公開用画像の最適化</li>
            </ul>
          </div>
        </div>
        <div class="p-4 bg-muted rounded-lg">
          <p class="text-sm">
            <strong>注意:</strong> このツールは基本的なメタデータの表示と削除のみを行います。
            完全なExif情報の表示には対応していない場合があります。
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
