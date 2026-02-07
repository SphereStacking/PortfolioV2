<script setup lang="ts">
import { useDropZone, useFileDialog } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Slider } from '~/components/ui/slider'

definePageMeta({
  layout: 'tools',
})

const { toast } = useToast()

// 画像データ
const leftImage = ref<string>('')
const rightImage = ref<string>('')
const leftFileName = ref('')
const rightFileName = ref('')

// 比較モード
const compareMode = ref<'slider' | 'side-by-side' | 'difference' | 'onion-skin'>('slider')
const sliderPosition = ref(50)
const onionSkinOpacity = ref(50)
const isComparing = ref(false)

// ファイル選択（左側）
const leftDropZoneRef = ref<HTMLDivElement>()
const { open: openLeftFileDialog, onChange: onLeftChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
})

onLeftChange((files) => {
  if (files && files.length > 0) {
    handleLeftFile(files[0])
  }
})

// ファイル選択（右側）
const rightDropZoneRef = ref<HTMLDivElement>()
const { open: openRightFileDialog, onChange: onRightChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
})

onRightChange((files) => {
  if (files && files.length > 0) {
    handleRightFile(files[0])
  }
})

// ドロップゾーン（左側）
const { isOverDropZone: isOverLeftDropZone } = useDropZone(leftDropZoneRef, {
  onDrop: (files) => {
    if (files && files.length > 0) {
      handleLeftFile(files[0])
    }
  },
})

// ドロップゾーン（右側）
const { isOverDropZone: isOverRightDropZone } = useDropZone(rightDropZoneRef, {
  onDrop: (files) => {
    if (files && files.length > 0) {
      handleRightFile(files[0])
    }
  },
})

// ファイル処理（左側）
const handleLeftFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast({
      title: 'エラー',
      description: '画像ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  leftFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    leftImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// ファイル処理（右側）
const handleRightFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast({
      title: 'エラー',
      description: '画像ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  rightFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    rightImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 画像の入れ替え
const swapImages = () => {
  const tempImage = leftImage.value
  const tempFileName = leftFileName.value
  leftImage.value = rightImage.value
  leftFileName.value = rightFileName.value
  rightImage.value = tempImage
  rightFileName.value = tempFileName
}

// クリア
const clearAll = () => {
  leftImage.value = ''
  rightImage.value = ''
  leftFileName.value = ''
  rightFileName.value = ''
  isComparing.value = false
}

// 比較開始
const startComparison = () => {
  if (!leftImage.value || !rightImage.value) {
    toast({
      title: 'エラー',
      description: '2つの画像を選択してください',
      variant: 'destructive',
    })
    return
  }
  isComparing.value = true
}

// SEO設定
useSeoMeta({
  title: '画像比較ツール | Web開発ツール',
  description: '2つの画像を並べて比較・差分確認。スライダー、オニオンスキン、差分表示対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full mb-8">
      <h1 class="text-3xl font-bold mb-2">
        画像比較ツール
      </h1>
      <p class="text-muted-foreground">
        2つの画像を並べて比較・差分確認。デザインの変更確認やビフォーアフターの表示に便利。
      </p>
    </div>

    <!-- 画像選択エリア -->
    <div v-if="!isComparing" class="col-span-full space-y-6">
      <div class="grid grid-cols-2 gap-6">
        <!-- 左側画像 -->
        <Card>
          <CardHeader>
            <CardTitle>画像1（左側／ビフォー）</CardTitle>
            <CardDescription>
              比較元の画像をアップロード
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref="leftDropZoneRef"
              :class="[
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isOverLeftDropZone ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              ]"
              @click="openLeftFileDialog">
              <div v-if="!leftImage">
                <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">
                  クリックまたはドロップで選択
                </p>
              </div>
              <div v-else class="space-y-2">
                <img
                  :src="leftImage"
                  alt="Left"
                  class="max-w-full max-h-[200px] mx-auto rounded">
                <p class="text-sm text-muted-foreground">
                  {{ leftFileName }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 右側画像 -->
        <Card>
          <CardHeader>
            <CardTitle>画像2（右側／アフター）</CardTitle>
            <CardDescription>
              比較先の画像をアップロード
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref="rightDropZoneRef"
              :class="[
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isOverRightDropZone ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              ]"
              @click="openRightFileDialog">
              <div v-if="!rightImage">
                <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">
                  クリックまたはドロップで選択
                </p>
              </div>
              <div v-else class="space-y-2">
                <img
                  :src="rightImage"
                  alt="Right"
                  class="max-w-full max-h-[200px] mx-auto rounded">
                <p class="text-sm text-muted-foreground">
                  {{ rightFileName }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- アクションボタン -->
      <div class="flex justify-center gap-4">
        <Button
          variant="outline"
          :disabled="!leftImage || !rightImage"
          @click="swapImages">
          <Icon name="heroicons:arrows-right-left" class="w-4 h-4 mr-1" />
          画像を入れ替え
        </Button>
        <Button
          :disabled="!leftImage || !rightImage"
          @click="startComparison">
          <Icon name="heroicons:eye" class="w-4 h-4 mr-1" />
          比較開始
        </Button>
      </div>
    </div>

    <!-- 比較表示エリア -->
    <div v-else class="col-span-full space-y-6">
      <!-- 比較モード選択 -->
      <Card class="col-span-full">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>比較モード</CardTitle>
            <Button
              variant="outline"
              size="sm"
              @click="clearAll">
              <Icon name="heroicons:x-mark" class="w-4 h-4 mr-1" />
              終了
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="mode in [
                { value: 'slider', label: 'スライダー', icon: 'heroicons:adjustments-vertical' },
                { value: 'side-by-side', label: '並列表示', icon: 'heroicons:squares-2x2' },
                { value: 'difference', label: '差分表示', icon: 'heroicons:minus-circle' },
                { value: 'onion-skin', label: 'オニオンスキン', icon: 'heroicons:view-columns' },
              ]"
              :key="mode.value"
              :variant="compareMode === mode.value ? 'default' : 'outline'"
              size="sm"
              @click="compareMode = mode.value as typeof compareMode">
              <Icon :name="mode.icon" class="w-4 h-4 mr-1" />
              {{ mode.label }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 比較ビュー -->
      <Card class="col-span-full">
        <CardContent class="p-6">
          <!-- スライダーモード -->
          <div v-if="compareMode === 'slider'" class="space-y-4">
            <div class="relative overflow-hidden rounded-lg" style="max-height: 600px;">
              <img
                :src="rightImage"
                alt="Right"
                class="w-full">
              <div
                class="absolute inset-0 overflow-hidden"
                :style="{ width: `${sliderPosition}%` }">
                <img
                  :src="leftImage"
                  alt="Left"
                  class="w-full"
                  :style="{ width: `${100 * 100 / sliderPosition}%`, maxWidth: 'none' }">
              </div>
              <div
                class="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                :style="{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }">
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                  <Icon name="heroicons:arrows-right-left" class="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
            <Slider
              :model-value="[sliderPosition]"
              :max="100"
              :min="0"
              :step="1"
              @update:model-value="sliderPosition = $event[0]" />
          </div>

          <!-- 並列表示モード -->
          <div v-else-if="compareMode === 'side-by-side'" class="grid md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium mb-2">
                画像1
              </h4>
              <img
                :src="leftImage"
                alt="Left"
                class="w-full rounded">
            </div>
            <div>
              <h4 class="text-sm font-medium mb-2">
                画像2
              </h4>
              <img
                :src="rightImage"
                alt="Right"
                class="w-full rounded">
            </div>
          </div>

          <!-- 差分表示モード -->
          <div v-else-if="compareMode === 'difference'" class="text-center">
            <div class="relative inline-block">
              <img
                :src="leftImage"
                alt="Difference"
                class="w-full rounded mix-blend-difference">
              <img
                :src="rightImage"
                alt="Overlay"
                class="absolute inset-0 w-full rounded opacity-50">
            </div>
            <p class="text-sm text-muted-foreground mt-4">
              差分がある部分が強調表示されます
            </p>
          </div>

          <!-- オニオンスキンモード -->
          <div v-else-if="compareMode === 'onion-skin'" class="space-y-4">
            <div class="relative">
              <img
                :src="leftImage"
                alt="Base"
                class="w-full rounded">
              <img
                :src="rightImage"
                alt="Overlay"
                class="absolute inset-0 w-full rounded"
                :style="{ opacity: onionSkinOpacity / 100 }">
            </div>
            <div>
              <label class="text-sm font-medium mb-2 block">
                透明度: {{ onionSkinOpacity }}%
              </label>
              <Slider
                :model-value="[onionSkinOpacity]"
                :max="100"
                :min="0"
                :step="1"
                @update:model-value="onionSkinOpacity = $event[0]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 使い方 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>比較モードの説明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 class="font-semibold mb-2">
              スライダー
            </h4>
            <p class="text-muted-foreground">
              スライダーを左右に動かして、2つの画像を重ねて比較。細かい違いを確認するのに最適。
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-2">
              並列表示
            </h4>
            <p class="text-muted-foreground">
              2つの画像を横に並べて表示。全体的な違いを一目で確認できます。
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-2">
              差分表示
            </h4>
            <p class="text-muted-foreground">
              画像の差分を視覚化。変更があった部分が強調表示されます。
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-2">
              オニオンスキン
            </h4>
            <p class="text-muted-foreground">
              2つの画像を重ねて透明度を調整。アニメーションの動きなどを確認するのに便利。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
