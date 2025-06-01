<script setup lang="ts">
import { useDropZone, useFileDialog } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Slider } from '~/components/ui/slider'

definePageMeta({
  layout: 'tools',
})

const { toast } = useToast()

// 動画データ
const videoFile = ref<File>()
const videoUrl = ref('')
const videoElement = ref<HTMLVideoElement>()
const videoDuration = ref(0)
const currentTime = ref(0)
const isPlaying = ref(false)
const isProcessing = ref(false)

// 切り取り設定
const startTime = ref([0])
const endTime = ref([0])
const trimmedDuration = computed(() => endTime.value[0] - startTime.value[0])

// 圧縮設定
const compressionLevel = ref([50]) // 0-100
const outputFormat = ref<'mp4' | 'webm'>('mp4')
const targetSize = ref<'original' | 'small' | 'medium' | 'large'>('medium')

// サイズ設定
const sizeOptions = {
  original: { label: 'オリジナル', scale: 1 },
  large: { label: '大 (720p)', scale: 0.75 },
  medium: { label: '中 (480p)', scale: 0.5 },
  small: { label: '小 (360p)', scale: 0.375 },
}

// ファイル選択
const dropZoneRef = ref<HTMLDivElement>()
const { open: openFileDialog, reset, onChange } = useFileDialog({
  accept: 'video/*',
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
const handleFile = (file: File) => {
  if (!file.type.startsWith('video/')) {
    toast({
      title: 'エラー',
      description: '動画ファイルを選択してください',
      variant: 'destructive',
    })
    return
  }

  // ファイルサイズチェック（50MBまで）
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    toast({
      title: 'ファイルが大きすぎます',
      description: 'ファイルサイズは50MB以下にしてください',
      variant: 'destructive',
    })
    return
  }

  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)

  // 動画の長さをチェック
  const video = document.createElement('video')
  video.src = videoUrl.value
  video.onloadedmetadata = () => {
    if (video.duration > 120) { // 2分 = 120秒
      toast({
        title: '動画が長すぎます',
        description: '2分以内の動画を選択してください',
        variant: 'destructive',
      })
      clearVideo()
      return
    }

    videoDuration.value = video.duration
    endTime.value = [video.duration]
    startTime.value = [0]
  }
}

// 動画のクリア
const clearVideo = () => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  videoFile.value = undefined
  videoUrl.value = ''
  videoDuration.value = 0
  currentTime.value = 0
  isPlaying.value = false
  startTime.value = [0]
  endTime.value = [0]
  reset()
}

// 時間フォーマット
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 動画の再生/停止
const _togglePlay = () => {
  if (!videoElement.value) return

  if (isPlaying.value) {
    videoElement.value.pause()
  }
  else {
    videoElement.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// 動画の時間更新
const updateTime = () => {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime
  }
}

// 特定時間にシーク
const seekTo = (time: number) => {
  if (videoElement.value) {
    videoElement.value.currentTime = time
    currentTime.value = time
  }
}

// 開始時間を現在位置に設定
const setStartTime = () => {
  startTime.value = [currentTime.value]
  if (endTime.value[0] <= currentTime.value) {
    endTime.value = [Math.min(currentTime.value + 1, videoDuration.value)]
  }
}

// 終了時間を現在位置に設定
const setEndTime = () => {
  endTime.value = [currentTime.value]
  if (startTime.value[0] >= currentTime.value) {
    startTime.value = [Math.max(currentTime.value - 1, 0)]
  }
}

// 動画処理
const processVideo = async () => {
  if (!videoFile.value || !videoElement.value) return

  isProcessing.value = true

  try {
    // MediaRecorder APIを使用して動画を処理
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    // 動画のサイズを設定
    const scale = sizeOptions[targetSize.value].scale
    canvas.width = videoElement.value.videoWidth * scale
    canvas.height = videoElement.value.videoHeight * scale

    // MediaStreamを作成
    const stream = canvas.captureStream(30) // 30fps
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: outputFormat.value === 'mp4' ? 'video/mp4' : 'video/webm',
      videoBitsPerSecond: (1000000 * compressionLevel.value[0]) / 100, // 圧縮レベルに応じたビットレート
    })

    const chunks: BlobPart[] = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
      const url = URL.createObjectURL(blob)

      // ダウンロード
      const link = document.createElement('a')
      link.href = url
      link.download = `edited_video.${outputFormat.value}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: '処理完了',
        description: '編集された動画をダウンロードしました',
      })
      isProcessing.value = false
    }

    // 録画開始
    mediaRecorder.start()

    // 開始時間にシークして録画
    videoElement.value.currentTime = startTime.value[0]
    videoElement.value.play()

    const recordFrame = () => {
      if (videoElement.value && videoElement.value.currentTime <= endTime.value[0]) {
        ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)
        requestAnimationFrame(recordFrame)
      }
      else {
        videoElement.value?.pause()
        mediaRecorder.stop()
      }
    }

    videoElement.value.onplaying = () => {
      recordFrame()
    }
  }
  catch {
    toast({
      title: 'エラー',
      description: '動画の処理に失敗しました',
      variant: 'destructive',
    })
    isProcessing.value = false
  }
}

// SEO設定
useSeoMeta({
  title: '動画編集（切り取り・圧縮） | Web開発ツール',
  description: '動画のトリミングと圧縮。2分以内の短い動画に対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        動画編集（切り取り・圧縮）
      </h1>
      <p class="text-muted-foreground">
        動画のトリミングと圧縮。2分以内・50MB以下の動画に対応。
      </p>
    </div>

    <div class="grid lg:grid-cols-2 gap-6 col-span-full">
      <!-- 入力エリア -->
      <Card class="col-span-full">
        <CardHeader>
          <CardTitle>動画選択</CardTitle>
          <CardDescription>
            編集したい動画をアップロード（2分以内・50MB以下）
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
            <div v-if="!videoUrl">
              <Icon name="heroicons:video-camera" class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p class="text-sm text-muted-foreground mb-2">
                クリックまたはドロップで動画を選択
              </p>
              <p class="text-xs text-muted-foreground">
                MP4, WebM, MOV対応
              </p>
            </div>
            <div v-else class="space-y-4">
              <video
                ref="videoElement"
                :src="videoUrl"
                class="max-w-full max-h-[200px] mx-auto rounded"
                controls
                @timeupdate="updateTime">
              </video>
              <div class="text-sm text-muted-foreground">
                <p>長さ: {{ formatTime(videoDuration) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <template v-if="videoUrl">
          <CardContent>
            <div class="space-y-4">
              <!-- タイムライン表示 -->
              <div class="relative h-8 bg-muted rounded">
                <!-- 全体のバー -->
                <div class="absolute inset-0 bg-muted-foreground/20 rounded"></div>
                <!-- 選択範囲 -->
                <div
                  class="absolute h-full bg-primary rounded"
                  :style="{
                    left: `${(startTime[0] / videoDuration) * 100}%`,
                    width: `${(trimmedDuration / videoDuration) * 100}%`,
                  }"></div>
                <!-- 現在位置 -->
                <div
                  class="absolute top-0 bottom-0 w-1 bg-red-500"
                  :style="{ left: `${(currentTime / videoDuration) * 100}%` }"></div>
              </div>

              <!-- 統計情報 -->
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">
                    元の長さ
                  </p>
                  <p class="font-mono">
                    {{ formatTime(videoDuration) }}
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground">
                    切り取り後
                  </p>
                  <p class="font-mono">
                    {{ formatTime(trimmedDuration) }}
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground">
                    解像度
                  </p>
                  <p>{{ sizeOptions[targetSize].label }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">
                    品質
                  </p>
                  <p>{{ compressionLevel[0] }}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </template>
      </Card>
      <!-- トリミング設定 -->
      <Card v-if="videoUrl">
        <CardHeader>
          <CardTitle>トリミング設定</CardTitle>
          <CardDescription>
            切り取りたい開始・終了時間を設定
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-2 text-sm">
            <span>現在時間:</span>
            <span class="font-mono">{{ formatTime(currentTime) }}</span>
            <Button size="sm" variant="outline" @click="setStartTime">
              開始点に設定
            </Button>
            <Button size="sm" variant="outline" @click="setEndTime">
              終了点に設定
            </Button>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              開始時間: {{ formatTime(startTime[0]) }}
            </label>
            <Slider
              v-model="startTime"
              :max="videoDuration"
              :min="0"
              :step="0.1"
              @update:model-value="() => seekTo(startTime[0])" />
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">
              終了時間: {{ formatTime(endTime[0]) }}
            </label>
            <Slider
              v-model="endTime"
              :max="videoDuration"
              :min="startTime[0]"
              :step="0.1"
              @update:model-value="() => seekTo(endTime[0])" />
          </div>

          <div class="p-3 bg-muted rounded-md">
            <p class="text-sm">
              <strong>切り取り後の長さ:</strong> {{ formatTime(trimmedDuration) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- 圧縮設定 -->
      <Card v-if="videoUrl">
        <CardHeader>
          <CardTitle>圧縮設定</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">
              品質: {{ compressionLevel[0] }}%
            </label>
            <Slider
              v-model="compressionLevel"
              :max="100"
              :min="10"
              :step="5" />
            <p class="text-xs text-muted-foreground mt-2">
              値が低いほどファイルサイズが小さくなります
            </p>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">解像度</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="(option, key) in sizeOptions"
                :key="key"
                :class="[
                  'p-2 rounded-md border text-sm transition-colors',
                  targetSize === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted',
                ]"
                @click="targetSize = key">
                {{ option.label }}
              </button>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">出力形式</label>
            <div class="flex gap-2">
              <Button
                :variant="outputFormat === 'mp4' ? 'default' : 'outline'"
                size="sm"
                @click="outputFormat = 'mp4'">
                MP4
              </Button>
              <Button
                :variant="outputFormat === 'webm' ? 'default' : 'outline'"
                size="sm"
                @click="outputFormat = 'webm'">
                WebM
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <!-- 実行ボタン -->
    <Card v-if="videoUrl" class="col-span-full">
      <CardHeader>
        <CardTitle>動画処理</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-if="isProcessing" class="text-center py-8">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p class="text-sm text-muted-foreground">
              動画を処理中...
            </p>
            <p class="text-xs text-muted-foreground mt-2">
              しばらくお待ちください
            </p>
          </div>
          <div v-else class="flex gap-2">
            <Button
              :disabled="trimmedDuration <= 0"
              class="flex-1"
              @click="processVideo">
              <Icon name="heroicons:scissors" class="w-4 h-4 mr-1" />
              動画を処理してダウンロード
            </Button>
            <Button
              variant="outline"
              @click="clearVideo">
              クリア
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- 使い方 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>使い方</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <div>
          <h4 class="font-semibold mb-1 text-foreground">
            対応ファイル
          </h4>
          <ul class="space-y-1">
            <li>• 動画形式: MP4, WebM, MOV</li>
            <li>• 最大長さ: 2分（120秒）</li>
            <li>• 最大サイズ: 50MB</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-1 text-foreground">
            機能
          </h4>
          <ul class="space-y-1">
            <li>• 動画のトリミング（切り取り）</li>
            <li>• 解像度変更（360p〜720p）</li>
            <li>• 品質調整による圧縮</li>
            <li>• MP4/WebM形式での出力</li>
          </ul>
        </div>
      </CardContent>
    </Card>
    <!-- 注意事項 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>注意事項</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <div class="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
          <ul class="space-y-2">
            <li>• ブラウザベースの処理のため、大きなファイルや長時間の動画は処理できません</li>
            <li>• 処理時間は動画の長さと圧縮設定によって変わります</li>
            <li>• ファイルはブラウザ内で処理され、サーバーにアップロードされません</li>
            <li>• 一部のブラウザでは正常に動作しない場合があります</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
