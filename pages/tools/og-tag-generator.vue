<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const ogData = ref({
  // 基本情報
  title: '',
  description: '',
  url: '',
  siteName: '',
  locale: 'ja_JP',
  type: 'website',

  // 画像
  image: '',
  imageAlt: '',
  imageWidth: '',
  imageHeight: '',

  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterSite: '',
  twitterCreator: '',

  // 追加情報
  author: '',
  keywords: '',
  themeColor: '#000000',

  // Article用
  publishedTime: '',
  modifiedTime: '',
  section: '',
  tags: '',
})

// プリセット
const presets = [
  {
    name: 'ブログ記事',
    data: {
      type: 'article',
      twitterCard: 'summary_large_image',
      imageWidth: '1200',
      imageHeight: '630',
    },
  },
  {
    name: '企業サイト',
    data: {
      type: 'website',
      twitterCard: 'summary',
      locale: 'ja_JP',
    },
  },
  {
    name: '製品ページ',
    data: {
      type: 'product',
      twitterCard: 'summary_large_image',
      imageWidth: '1200',
      imageHeight: '630',
    },
  },
]

// OGタイプオプション
const ogTypes = [
  { value: 'website', label: 'ウェブサイト' },
  { value: 'article', label: '記事' },
  { value: 'product', label: '製品' },
  { value: 'profile', label: 'プロフィール' },
  { value: 'video', label: '動画' },
  { value: 'music', label: '音楽' },
]

// Twitter Cardタイプ
const twitterCardTypes = [
  { value: 'summary', label: 'Summary' },
  { value: 'summary_large_image', label: 'Summary Large Image' },
  { value: 'app', label: 'App' },
  { value: 'player', label: 'Player' },
]

// ロケールオプション
const locales = [
  { value: 'ja_JP', label: '日本語' },
  { value: 'en_US', label: '英語（米国）' },
  { value: 'en_GB', label: '英語（英国）' },
  { value: 'zh_CN', label: '中国語（簡体）' },
  { value: 'ko_KR', label: '韓国語' },
]

// 生成されたタグ
const generatedTags = computed(() => {
  const tags: string[] = []

  // 基本的なメタタグ
  if (ogData.value.title) {
    tags.push(`<title>${escapeHtml(ogData.value.title)}</title>`)
  }
  if (ogData.value.description) {
    tags.push(`<meta name="description" content="${escapeHtml(ogData.value.description)}">`)
  }
  if (ogData.value.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(ogData.value.keywords)}">`)
  }
  if (ogData.value.author) {
    tags.push(`<meta name="author" content="${escapeHtml(ogData.value.author)}">`)
  }
  if (ogData.value.themeColor) {
    tags.push(`<meta name="theme-color" content="${ogData.value.themeColor}">`)
  }

  // Open Graph タグ
  if (ogData.value.title) {
    tags.push(`<meta property="og:title" content="${escapeHtml(ogData.value.title)}">`)
  }
  if (ogData.value.description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(ogData.value.description)}">`)
  }
  if (ogData.value.url) {
    tags.push(`<meta property="og:url" content="${ogData.value.url}">`)
  }
  if (ogData.value.siteName) {
    tags.push(`<meta property="og:site_name" content="${escapeHtml(ogData.value.siteName)}">`)
  }
  if (ogData.value.locale) {
    tags.push(`<meta property="og:locale" content="${ogData.value.locale}">`)
  }
  if (ogData.value.type) {
    tags.push(`<meta property="og:type" content="${ogData.value.type}">`)
  }

  // 画像関連
  if (ogData.value.image) {
    tags.push(`<meta property="og:image" content="${ogData.value.image}">`)
    if (ogData.value.imageAlt) {
      tags.push(`<meta property="og:image:alt" content="${escapeHtml(ogData.value.imageAlt)}">`)
    }
    if (ogData.value.imageWidth) {
      tags.push(`<meta property="og:image:width" content="${ogData.value.imageWidth}">`)
    }
    if (ogData.value.imageHeight) {
      tags.push(`<meta property="og:image:height" content="${ogData.value.imageHeight}">`)
    }
  }

  // Twitter Card
  if (ogData.value.twitterCard) {
    tags.push(`<meta name="twitter:card" content="${ogData.value.twitterCard}">`)
  }
  if (ogData.value.twitterSite) {
    tags.push(`<meta name="twitter:site" content="${ogData.value.twitterSite}">`)
  }
  if (ogData.value.twitterCreator) {
    tags.push(`<meta name="twitter:creator" content="${ogData.value.twitterCreator}">`)
  }
  if (ogData.value.title) {
    tags.push(`<meta name="twitter:title" content="${escapeHtml(ogData.value.title)}">`)
  }
  if (ogData.value.description) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(ogData.value.description)}">`)
  }
  if (ogData.value.image) {
    tags.push(`<meta name="twitter:image" content="${ogData.value.image}">`)
    if (ogData.value.imageAlt) {
      tags.push(`<meta name="twitter:image:alt" content="${escapeHtml(ogData.value.imageAlt)}">`)
    }
  }

  // Article固有のタグ
  if (ogData.value.type === 'article') {
    if (ogData.value.publishedTime) {
      tags.push(`<meta property="article:published_time" content="${ogData.value.publishedTime}">`)
    }
    if (ogData.value.modifiedTime) {
      tags.push(`<meta property="article:modified_time" content="${ogData.value.modifiedTime}">`)
    }
    if (ogData.value.author) {
      tags.push(`<meta property="article:author" content="${escapeHtml(ogData.value.author)}">`)
    }
    if (ogData.value.section) {
      tags.push(`<meta property="article:section" content="${escapeHtml(ogData.value.section)}">`)
    }
    if (ogData.value.tags) {
      const tagList = ogData.value.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      tagList.forEach((tag) => {
        tags.push(`<meta property="article:tag" content="${escapeHtml(tag)}">`)
      })
    }
  }

  // その他の重要なタグ
  tags.push('<meta property="og:image:type" content="image/jpeg">')
  tags.push(`<meta property="og:image:secure_url" content="${ogData.value.image}">`)

  return tags
})

// 構造化データ (JSON-LD)
const structuredData = computed(() => {
  const data: any = {
    '@context': 'https://schema.org',
  }

  switch (ogData.value.type) {
    case 'website':
      data['@type'] = 'WebSite'
      data.name = ogData.value.siteName || ogData.value.title
      data.url = ogData.value.url
      if (ogData.value.description) {
        data.description = ogData.value.description
      }
      break

    case 'article':
      data['@type'] = 'Article'
      data.headline = ogData.value.title
      if (ogData.value.description) {
        data.description = ogData.value.description
      }
      if (ogData.value.author) {
        data.author = {
          '@type': 'Person',
          'name': ogData.value.author,
        }
      }
      if (ogData.value.publishedTime) {
        data.datePublished = ogData.value.publishedTime
      }
      if (ogData.value.modifiedTime) {
        data.dateModified = ogData.value.modifiedTime
      }
      if (ogData.value.image) {
        data.image = ogData.value.image
      }
      break

    case 'product':
      data['@type'] = 'Product'
      data.name = ogData.value.title
      if (ogData.value.description) {
        data.description = ogData.value.description
      }
      if (ogData.value.image) {
        data.image = ogData.value.image
      }
      break
  }

  return JSON.stringify(data, null, 2)
})

// 完全なHTMLヘッド
const fullHtmlHead = computed(() => {
  const parts = [
    '<!DOCTYPE html>',
    '<html lang="ja">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '',
    '  <!-- Primary Meta Tags -->',
  ]

  // 生成されたタグを追加
  generatedTags.value.forEach((tag) => {
    parts.push(`  ${tag}`)
  })

  parts.push('')
  parts.push('  <!-- Structured Data -->')
  parts.push('  <script type="application/ld+json">')

  // 構造化データを追加
  const structuredLines = structuredData.value.split('\n')
  structuredLines.forEach((line) => {
    parts.push(`  ${line}`)
  })

  parts.push('  </' + 'script>')
  parts.push('</head>')
  parts.push('<body>')
  parts.push('  <!-- Your content here -->')
  parts.push('</body>')
  parts.push('</html>')

  return parts.join('\n')
})

// プレビュー画像のアスペクト比
const imageAspectRatio = computed(() => {
  const width = parseInt(ogData.value.imageWidth) || 1200
  const height = parseInt(ogData.value.imageHeight) || 630
  return `${width}:${height}`
})

// HTMLエスケープ
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// プリセット適用
const applyPreset = (preset: typeof presets[0]) => {
  Object.assign(ogData.value, preset.data)
  toast({
    title: 'プリセット適用',
    description: `「${preset.name}」の設定を適用しました`,
  })
}

// 画像アップロード
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 実際のアップロード処理の代わりに、ローカルURLを生成
  const url = URL.createObjectURL(file)
  ogData.value.image = url

  // 画像サイズを取得
  const img = new Image()
  img.onload = () => {
    ogData.value.imageWidth = img.width.toString()
    ogData.value.imageHeight = img.height.toString()
  }
  img.src = url
}

// バリデーション
const validateOgData = () => {
  const warnings: string[] = []

  if (!ogData.value.title) {
    warnings.push('タイトルは必須です')
  }
  else if (ogData.value.title.length > 60) {
    warnings.push('タイトルは60文字以内が推奨されます')
  }

  if (!ogData.value.description) {
    warnings.push('説明文は必須です')
  }
  else if (ogData.value.description.length > 160) {
    warnings.push('説明文は160文字以内が推奨されます')
  }

  if (!ogData.value.image) {
    warnings.push('画像はSNSシェアで重要です')
  }

  if (ogData.value.image && (!ogData.value.imageWidth || !ogData.value.imageHeight)) {
    warnings.push('画像サイズの指定を推奨します')
  }

  if (ogData.value.twitterCard === 'summary_large_image' && ogData.value.image) {
    const width = parseInt(ogData.value.imageWidth) || 0
    const height = parseInt(ogData.value.imageHeight) || 0
    if (width < 300 || height < 157) {
      warnings.push('Twitter用の大きい画像は最小300x157px必要です')
    }
  }

  return warnings
}

// 検証結果
const validationWarnings = computed(() => validateOgData())

// サンプルデータ
const loadSampleData = () => {
  ogData.value = {
    title: 'OGタグ生成ツール - SNSシェアを最適化',
    description: 'Open GraphタグとTwitter Cardを簡単に生成。プレビュー機能付きで、SNSでのシェア時の見た目を最適化できます。',
    url: 'https://example.com/tools/og-tag-generator',
    siteName: 'Web開発ツール',
    locale: 'ja_JP',
    type: 'website',
    image: 'https://example.com/images/og-image.jpg',
    imageAlt: 'OGタグ生成ツールのスクリーンショット',
    imageWidth: '1200',
    imageHeight: '630',
    twitterCard: 'summary_large_image',
    twitterSite: '@example',
    twitterCreator: '@developer',
    author: 'Web Developer',
    keywords: 'OGタグ, Open Graph, Twitter Card, SNS, シェア',
    themeColor: '#1DA1F2',
    publishedTime: '',
    modifiedTime: '',
    section: '',
    tags: '',
  }
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

// ダウンロード
const downloadHtml = () => {
  const blob = new Blob([fullHtmlHead.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'index.html'
  link.click()

  URL.revokeObjectURL(url)
}

// リセット
const reset = () => {
  ogData.value = {
    title: '',
    description: '',
    url: '',
    siteName: '',
    locale: 'ja_JP',
    type: 'website',
    image: '',
    imageAlt: '',
    imageWidth: '',
    imageHeight: '',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    twitterCreator: '',
    author: '',
    keywords: '',
    themeColor: '#000000',
    publishedTime: '',
    modifiedTime: '',
    section: '',
    tags: '',
  }
}

// SEO設定
useSeoMeta({
  title: 'OGタグ生成 | Web開発ツール',
  description: 'Open GraphタグとTwitter Cardの自動生成。SNSシェア最適化。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        OGタグ生成
      </h1>
      <p class="text-muted-foreground">
        SNSシェア用のOpen GraphタグとTwitter Cardを生成します。
      </p>
    </div>

    <!-- プリセット -->
    <Card>
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in presets"
            :key="preset.name"
            variant="outline"
            size="sm"
            @click="applyPreset(preset)">
            {{ preset.name }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="loadSampleData">
            サンプルデータ
          </Button>
          <Button
            variant="ghost"
            size="sm"
            @click="reset">
            リセット
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 入力フォーム -->
      <div class="space-y-6">
        <!-- 基本情報 -->
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">
                タイトル <span class="text-red-500">*</span>
              </label>
              <Input
                v-model="ogData.title"
                placeholder="ページのタイトル"
                maxlength="60" />
              <p class="text-xs text-muted-foreground mt-1">
                {{ ogData.title.length }}/60文字
              </p>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">
                説明文 <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="ogData.description"
                placeholder="ページの説明文"
                class="w-full min-h-[80px] p-3 text-sm border rounded-md bg-background resize-none"
                maxlength="160"></textarea>
              <p class="text-xs text-muted-foreground mt-1">
                {{ ogData.description.length }}/160文字
              </p>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">URL</label>
              <Input
                v-model="ogData.url"
                type="url"
                placeholder="https://example.com/page" />
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">サイト名</label>
              <Input
                v-model="ogData.siteName"
                placeholder="サイトの名前" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">タイプ</label>
                <select
                  v-model="ogData.type"
                  class="w-full px-3 py-2 border rounded-md bg-background">
                  <option v-for="type in ogTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">言語</label>
                <select
                  v-model="ogData.locale"
                  class="w-full px-3 py-2 border rounded-md bg-background">
                  <option v-for="locale in locales" :key="locale.value" :value="locale.value">
                    {{ locale.label }}
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 画像設定 -->
        <Card>
          <CardHeader>
            <CardTitle>画像設定</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">画像URL</label>
              <div class="space-y-2">
                <Input
                  v-model="ogData.image"
                  placeholder="https://example.com/image.jpg" />
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageUpload">
                  <Button variant="outline" size="sm" as="span">
                    <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
                    画像をアップロード
                  </Button>
                </label>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">画像の代替テキスト</label>
              <Input
                v-model="ogData.imageAlt"
                placeholder="画像の説明" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">幅 (px)</label>
                <Input
                  v-model="ogData.imageWidth"
                  type="number"
                  placeholder="1200" />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">高さ (px)</label>
                <Input
                  v-model="ogData.imageHeight"
                  type="number"
                  placeholder="630" />
              </div>
            </div>

            <Alert>
              <Icon name="heroicons:information-circle" class="w-4 h-4" />
              <AlertDescription>
                推奨サイズ: 1200×630px（1.91:1）
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <!-- Twitter Card -->
        <Card>
          <CardHeader>
            <CardTitle>Twitter Card設定</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">カードタイプ</label>
              <select
                v-model="ogData.twitterCard"
                class="w-full px-3 py-2 border rounded-md bg-background">
                <option v-for="type in twitterCardTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">サイトのTwitterアカウント</label>
              <Input
                v-model="ogData.twitterSite"
                placeholder="@username" />
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">作者のTwitterアカウント</label>
              <Input
                v-model="ogData.twitterCreator"
                placeholder="@username" />
            </div>
          </CardContent>
        </Card>

        <!-- 追加設定 -->
        <Card>
          <CardHeader>
            <CardTitle>追加設定</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">作者名</label>
              <Input
                v-model="ogData.author"
                placeholder="記事の作者" />
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">キーワード</label>
              <Input
                v-model="ogData.keywords"
                placeholder="キーワード1, キーワード2, ..." />
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">テーマカラー</label>
              <div class="flex gap-2">
                <input
                  v-model="ogData.themeColor"
                  type="color"
                  class="w-10 h-10 rounded cursor-pointer">
                <Input
                  v-model="ogData.themeColor"
                  type="text"
                  class="font-mono" />
              </div>
            </div>

            <!-- Article固有の設定 -->
            <template v-if="ogData.type === 'article'">
              <div>
                <label class="text-sm font-medium mb-2 block">公開日時</label>
                <Input
                  v-model="ogData.publishedTime"
                  type="datetime-local" />
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">更新日時</label>
                <Input
                  v-model="ogData.modifiedTime"
                  type="datetime-local" />
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">セクション</label>
                <Input
                  v-model="ogData.section"
                  placeholder="Technology" />
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">タグ（カンマ区切り）</label>
                <Input
                  v-model="ogData.tags"
                  placeholder="タグ1, タグ2, ..." />
              </div>
            </template>
          </CardContent>
        </Card>
      </div>

      <!-- プレビューと出力 -->
      <div class="space-y-6">
        <!-- 検証結果 -->
        <Alert v-if="validationWarnings.length > 0" variant="destructive">
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
          <AlertTitle>検証結果</AlertTitle>
          <AlertDescription>
            <ul class="list-disc list-inside mt-2">
              <li v-for="warning in validationWarnings" :key="warning">
                {{ warning }}
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <!-- プレビュー -->
        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <!-- OGプレビュー -->
              <div>
                <p class="text-sm font-medium mb-2">
                  Facebook / 一般的なSNS
                </p>
                <div class="border rounded-md overflow-hidden max-w-md">
                  <div
                    v-if="ogData.image"
                    class="aspect-video bg-muted flex items-center justify-center">
                    <img
                      :src="ogData.image"
                      :alt="ogData.imageAlt"
                      class="w-full h-full object-cover">
                  </div>
                  <div v-else class="aspect-video bg-muted flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div class="p-3 space-y-1">
                    <p class="text-xs text-muted-foreground uppercase">
                      {{ ogData.siteName || 'example.com' }}
                    </p>
                    <h3 class="font-semibold line-clamp-2">
                      {{ ogData.title || 'ページタイトル' }}
                    </h3>
                    <p class="text-sm text-muted-foreground line-clamp-2">
                      {{ ogData.description || 'ページの説明文がここに表示されます' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Twitterプレビュー -->
              <div>
                <p class="text-sm font-medium mb-2">
                  Twitter
                </p>
                <div
                  class="border rounded-2xl overflow-hidden max-w-md"
                  :class="{
                    flex: ogData.twitterCard === 'summary',
                  }">
                  <div
                    v-if="ogData.image"
                    :class="{
                      'aspect-video': ogData.twitterCard === 'summary_large_image',
                      'w-32 h-32 flex-shrink-0': ogData.twitterCard === 'summary',
                    }"
                    class="bg-muted flex items-center justify-center">
                    <img
                      :src="ogData.image"
                      :alt="ogData.imageAlt"
                      class="w-full h-full object-cover">
                  </div>
                  <div
                    v-else
                    :class="{
                      'aspect-video': ogData.twitterCard === 'summary_large_image',
                      'w-32 h-32 flex-shrink-0': ogData.twitterCard === 'summary',
                    }"
                    class="bg-muted flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div class="p-3 space-y-1">
                    <h3 class="font-semibold line-clamp-2">
                      {{ ogData.title || 'ページタイトル' }}
                    </h3>
                    <p class="text-sm text-muted-foreground line-clamp-2">
                      {{ ogData.description || 'ページの説明文' }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ ogData.url || 'example.com' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 生成されたタグ -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>生成されたタグ</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(generatedTags.join('\n'))">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ generatedTags.join('\n') }}</code></pre>
          </CardContent>
        </Card>

        <!-- 構造化データ -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>構造化データ (JSON-LD)</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(structuredData)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ structuredData }}</code></pre>
          </CardContent>
        </Card>

        <!-- 完全なHTML -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>完全なHTML</CardTitle>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  @click="copyToClipboard(fullHtmlHead)">
                  <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="downloadHtml">
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm max-h-96"><code>{{ fullHtmlHead }}</code></pre>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>OGタグについて</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Open Graphとは
            </h3>
            <p>
              Open Graph Protocol（OGP）は、ウェブページがSNSでシェアされた際の表示を制御するメタデータです。
              Facebook、LinkedIn、Slackなど多くのサービスで利用されています。
            </p>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              推奨事項
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>画像は1200×630pxが最適（最小600×315px）</li>
              <li>タイトルは60文字以内</li>
              <li>説明文は160文字以内</li>
              <li>画像ファイルサイズは8MB以下</li>
              <li>HTTPSのURLを使用</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              デバッグツール
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><a href="https://developers.facebook.com/tools/debug/" target="_blank" class="text-primary hover:underline">Facebook Sharing Debugger</a></li>
              <li><a href="https://cards-dev.twitter.com/validator" target="_blank" class="text-primary hover:underline">Twitter Card Validator</a></li>
              <li><a href="https://www.linkedin.com/post-inspector/" target="_blank" class="text-primary hover:underline">LinkedIn Post Inspector</a></li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
