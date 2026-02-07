<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputSvg = ref('')
const outputSvg = ref('')
const files = ref<File[]>([])
const processing = ref(false)
const optimizationOptions = ref({
  removeComments: true,
  removeMetadata: true,
  removeTitle: true,
  removeDesc: true,
  removeUselessDefs: true,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  cleanupEnableBackground: true,
  minifyStyles: true,
  convertStyleToAttrs: true,
  convertColors: true,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIDs: true,
  cleanupNumericValues: true,
  cleanupListOfValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  removeRasterImages: false,
  mergePaths: true,
  convertShapeToPath: true,
  sortAttrs: true,
  removeDimensions: false,
})

// プリセット設定
const presets = [
  {
    name: '安全',
    description: '基本的な最適化のみ',
    options: {
      removeComments: true,
      removeMetadata: true,
      removeTitle: false,
      removeDesc: false,
      removeUselessDefs: true,
      removeEditorsNSData: true,
      removeEmptyAttrs: true,
      removeHiddenElems: false,
      removeEmptyText: true,
      removeEmptyContainers: true,
      cleanupEnableBackground: true,
      minifyStyles: true,
      convertStyleToAttrs: false,
      convertColors: false,
      convertPathData: false,
      convertTransform: false,
      removeUnknownsAndDefaults: false,
      removeNonInheritableGroupAttrs: true,
      removeUselessStrokeAndFill: true,
      removeUnusedNS: true,
      cleanupIDs: false,
      cleanupNumericValues: true,
      cleanupListOfValues: true,
      moveElemsAttrsToGroup: false,
      moveGroupAttrsToElems: false,
      collapseGroups: false,
      removeRasterImages: false,
      mergePaths: false,
      convertShapeToPath: false,
      sortAttrs: true,
      removeDimensions: false,
    },
  },
  {
    name: '標準',
    description: 'バランスの取れた最適化',
    options: {
      removeComments: true,
      removeMetadata: true,
      removeTitle: true,
      removeDesc: true,
      removeUselessDefs: true,
      removeEditorsNSData: true,
      removeEmptyAttrs: true,
      removeHiddenElems: true,
      removeEmptyText: true,
      removeEmptyContainers: true,
      cleanupEnableBackground: true,
      minifyStyles: true,
      convertStyleToAttrs: true,
      convertColors: true,
      convertPathData: true,
      convertTransform: true,
      removeUnknownsAndDefaults: true,
      removeNonInheritableGroupAttrs: true,
      removeUselessStrokeAndFill: true,
      removeUnusedNS: true,
      cleanupIDs: true,
      cleanupNumericValues: true,
      cleanupListOfValues: true,
      moveElemsAttrsToGroup: true,
      moveGroupAttrsToElems: true,
      collapseGroups: true,
      removeRasterImages: false,
      mergePaths: true,
      convertShapeToPath: true,
      sortAttrs: true,
      removeDimensions: false,
    },
  },
  {
    name: '積極的',
    description: '最大限の圧縮',
    options: {
      removeComments: true,
      removeMetadata: true,
      removeTitle: true,
      removeDesc: true,
      removeUselessDefs: true,
      removeEditorsNSData: true,
      removeEmptyAttrs: true,
      removeHiddenElems: true,
      removeEmptyText: true,
      removeEmptyContainers: true,
      cleanupEnableBackground: true,
      minifyStyles: true,
      convertStyleToAttrs: true,
      convertColors: true,
      convertPathData: true,
      convertTransform: true,
      removeUnknownsAndDefaults: true,
      removeNonInheritableGroupAttrs: true,
      removeUselessStrokeAndFill: true,
      removeUnusedNS: true,
      cleanupIDs: true,
      cleanupNumericValues: true,
      cleanupListOfValues: true,
      moveElemsAttrsToGroup: true,
      moveGroupAttrsToElems: true,
      collapseGroups: true,
      removeRasterImages: true,
      mergePaths: true,
      convertShapeToPath: true,
      sortAttrs: true,
      removeDimensions: true,
    },
  },
]

// SVG最適化（簡易実装）
const optimizeSvg = (svg: string): string => {
  let optimized = svg

  // コメントの削除
  if (optimizationOptions.value.removeComments) {
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')
  }

  // メタデータの削除
  if (optimizationOptions.value.removeMetadata) {
    optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
  }

  // タイトルの削除
  if (optimizationOptions.value.removeTitle) {
    optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '')
  }

  // 説明の削除
  if (optimizationOptions.value.removeDesc) {
    optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '')
  }

  // エディタ固有のデータ削除
  if (optimizationOptions.value.removeEditorsNSData) {
    optimized = optimized.replace(/\s*(sodipodi|inkscape|sketch|adobe|corel):[a-zA-Z-]+="[^"]*"/gi, '')
    optimized = optimized.replace(/\s*xmlns:(sodipodi|inkscape|sketch|adobe|corel)="[^"]*"/gi, '')
  }

  // 空の属性削除
  if (optimizationOptions.value.removeEmptyAttrs) {
    optimized = optimized.replace(/\s+[a-zA-Z-]+=""/g, '')
  }

  // 不要な名前空間削除
  if (optimizationOptions.value.removeUnusedNS) {
    const usedNamespaces = new Set(['svg', 'xlink'])
    const nsMatches = optimized.match(/xmlns:([a-zA-Z]+)=/g) || []

    nsMatches.forEach((match) => {
      const ns = match.match(/xmlns:([a-zA-Z]+)=/)?.[1]
      if (ns && !optimized.includes(`${ns}:`) && !usedNamespaces.has(ns)) {
        optimized = optimized.replace(new RegExp(`\\s*xmlns:${ns}="[^"]*"`, 'g'), '')
      }
    })
  }

  // 数値の最適化
  if (optimizationOptions.value.cleanupNumericValues) {
    // 小数点以下の不要な0を削除
    optimized = optimized.replace(/(\d+)\.0+(?=\D|$)/g, '$1')
    // 0.5 → .5
    optimized = optimized.replace(/\b0\.(\d+)/g, '.$1')
    // 長い小数を丸める
    optimized = optimized.replace(/(\d+\.\d{3})\d+/g, '$1')
  }

  // スタイルの最小化
  if (optimizationOptions.value.minifyStyles) {
    optimized = optimized.replace(/\s*:\s*/g, ':')
    optimized = optimized.replace(/\s*;\s*/g, ';')
    optimized = optimized.replace(/;\s*}/g, '}')
  }

  // 色の変換
  if (optimizationOptions.value.convertColors) {
    // rgb(255,255,255) → #fff
    optimized = optimized.replace(/rgb\(255,\s*255,\s*255\)/gi, '#fff')
    optimized = optimized.replace(/rgb\(0,\s*0,\s*0\)/gi, '#000')

    // #ffffff → #fff
    optimized = optimized.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
  }

  // ID のクリーンアップ
  if (optimizationOptions.value.cleanupIDs) {
    let idCounter = 0
    const idMap = new Map<string, string>()

    // 既存のIDを短いものに置換
    optimized = optimized.replace(/id="([^"]+)"/g, (match, id) => {
      if (!idMap.has(id)) {
        idMap.set(id, `a${idCounter++}`)
      }
      return `id="${idMap.get(id)}"`
    })

    // 参照も更新
    idMap.forEach((newId, oldId) => {
      optimized = optimized.replace(new RegExp(`#${oldId}\\b`, 'g'), `#${newId}`)
      optimized = optimized.replace(new RegExp(`url\\(#${oldId}\\)`, 'g'), `url(#${newId})`)
    })
  }

  // 空白の最適化
  optimized = optimized.replace(/\s+/g, ' ')
  optimized = optimized.replace(/>\s+</g, '><')
  optimized = optimized.trim()

  return optimized
}

// ファイル処理
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    files.value = Array.from(target.files).filter(file => file.type === 'image/svg+xml')
    if (files.value.length > 0) {
      processSvgFiles()
    }
  }
}

// SVGファイル処理
const processSvgFiles = async () => {
  if (files.value.length === 0) return

  processing.value = true

  try {
    const file = files.value[0]
    const text = await file.text()
    inputSvg.value = text
    outputSvg.value = optimizeSvg(text)
  }
  catch (error) {
    console.error('Error processing SVG:', error)
    toast({
      title: 'エラー',
      description: 'SVGファイルの処理に失敗しました',
      variant: 'destructive',
    })
  }
  finally {
    processing.value = false
  }
}

// テキスト入力からの最適化
const optimizeFromText = () => {
  if (!inputSvg.value.trim()) {
    toast({
      title: 'エラー',
      description: 'SVGコードを入力してください',
      variant: 'destructive',
    })
    return
  }

  processing.value = true

  try {
    outputSvg.value = optimizeSvg(inputSvg.value)
    toast({
      title: '最適化完了',
      description: `${compressionRatio.value}のサイズ削減を達成しました`,
    })
  }
  catch (error) {
    console.error('Error optimizing SVG:', error)
    toast({
      title: 'エラー',
      description: 'SVGの最適化に失敗しました',
      variant: 'destructive',
    })
  }
  finally {
    processing.value = false
  }
}

// プリセット適用
const applyPreset = (preset: typeof presets[0]) => {
  optimizationOptions.value = { ...preset.options }
  toast({
    title: 'プリセット適用',
    description: `${preset.name}プリセットを適用しました`,
  })
}

// サイズ計算
const originalSize = computed(() => new Blob([inputSvg.value]).size)
const optimizedSize = computed(() => new Blob([outputSvg.value]).size)
const compressionRatio = computed(() => {
  if (originalSize.value === 0) return '0%'
  const ratio = ((originalSize.value - optimizedSize.value) / originalSize.value) * 100
  return `${ratio.toFixed(1)}%`
})

// ファイルサイズフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ダウンロード
const downloadSvg = () => {
  if (!outputSvg.value) return

  const blob = new Blob([outputSvg.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'optimized.svg'
  link.click()

  URL.revokeObjectURL(url)
}

// クリップボード
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

// サンプルSVG
const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100" viewBox="0 0 100 100">
  <!-- This is a comment -->
  <title>Sample SVG</title>
  <desc>A simple example SVG file</desc>
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about="" />
    </rdf:RDF>
  </metadata>
  <rect x="10" y="10" width="80" height="80" fill="rgb(255, 0, 0)" stroke="#000000" stroke-width="2.0" opacity="1.0" />
  <circle cx="50" cy="50" r="30" fill="#0000ff" opacity="0.5" />
  <path d="M 20 20 L 80 80" stroke="rgb(0, 255, 0)" stroke-width="3" fill="none" />
</svg>`

const loadSample = () => {
  inputSvg.value = sampleSvg
  outputSvg.value = ''
}

// SEO設定
useSeoMeta({
  title: 'SVG最適化ツール | Web開発ツール',
  description: 'SVGファイルを最適化してサイズを削減。各種最適化オプション対応。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        SVG最適化ツール
      </h1>
      <p class="text-muted-foreground">
        SVGファイルを最適化してファイルサイズを削減します。
      </p>
    </div>

    <!-- 最適化設定 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>最適化設定</CardTitle>
          <div class="flex gap-2">
            <Button
              v-for="preset in presets"
              :key="preset.name"
              size="sm"
              variant="outline"
              @click="applyPreset(preset)">
              {{ preset.name }}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <label
            v-for="(value, key) in optimizationOptions"
            :key="key"
            class="flex items-center gap-2 text-sm">
            <input
              v-model="optimizationOptions[key]"
              type="checkbox"
              class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
            <span>{{ key.replace(/([A-Z])/g, ' $1').trim() }}</span>
          </label>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 入力 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>入力SVG</CardTitle>
            <div class="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                @click="loadSample">
                サンプル
              </Button>
              <label>
                <input
                  type="file"
                  accept=".svg"
                  class="hidden"
                  @change="handleFileSelect">
                <Button size="sm" variant="outline" as="span">
                  <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                  ファイル選択
                </Button>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <textarea
              v-model="inputSvg"
              placeholder="SVGコードを貼り付けるか、ファイルを選択してください"
              class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-background resize-none"
              spellcheck="false"></textarea>
            <div v-if="inputSvg" class="text-sm text-muted-foreground">
              サイズ: {{ formatFileSize(originalSize) }}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            class="w-full"
            :disabled="!inputSvg || processing"
            @click="optimizeFromText">
            <Icon v-if="processing" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
            最適化実行
          </Button>
        </CardFooter>
      </Card>

      <!-- 出力 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>最適化後のSVG</CardTitle>
            <div class="flex gap-2">
              <Button
                v-if="outputSvg"
                size="sm"
                variant="ghost"
                @click="copyToClipboard(outputSvg)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
              <Button
                v-if="outputSvg"
                size="sm"
                variant="outline"
                @click="downloadSvg">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <textarea
              v-model="outputSvg"
              readonly
              placeholder="最適化されたSVGがここに表示されます"
              class="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted resize-none"
              spellcheck="false"></textarea>
            <div v-if="outputSvg" class="space-y-1">
              <p class="text-sm text-muted-foreground">
                サイズ: {{ formatFileSize(optimizedSize) }}
                <span :class="optimizedSize < originalSize ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  ({{ compressionRatio }} 削減)
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ビジュアル比較 -->
    <Card v-if="inputSvg && outputSvg">
      <CardHeader>
        <CardTitle>ビジュアル比較</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-medium mb-2">
              元のSVG
            </h3>
            <div
              class="border rounded-md p-4 bg-background"
              v-html="inputSvg"></div>
          </div>
          <div>
            <h3 class="font-medium mb-2">
              最適化後
            </h3>
            <div
              class="border rounded-md p-4 bg-background"
              v-html="outputSvg"></div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>最適化オプションの説明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              主要な最適化
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>コメント削除:</strong> <!-- --> 形式のコメントを削除</li>
              <li><strong>メタデータ削除:</strong> 編集ソフトが追加した不要な情報を削除</li>
              <li><strong>数値最適化:</strong> 0.5→.5、1.000→1 など数値を簡潔に</li>
              <li><strong>色変換:</strong> rgb(255,255,255)→#fff など色表記を最適化</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              高度な最適化
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>パス最適化:</strong> パスデータを効率的な形式に変換</li>
              <li><strong>変換統合:</strong> 複数の変換を1つにまとめる</li>
              <li><strong>グループ最適化:</strong> 不要なグループを削除・統合</li>
              <li><strong>ID短縮:</strong> 長いIDを短い文字列に置換</li>
            </ul>
          </div>
          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              この最適化ツールは基本的な最適化のみ実装しています。
              より高度な最適化が必要な場合は、SVGOなどの専門ツールの使用を推奨します。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
