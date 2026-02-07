<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const selectedCategory = ref<'modern' | 'classic' | 'technical' | 'all'>('all')
const selectedPair = ref<number | null>(null)
const outputFormat = ref<'css' | 'tailwind' | 'scss' | 'css-vars'>('css-vars')
const previewText = ref({
  heading: 'Build Amazing Web Applications',
  subheading: 'Modern Typography for Modern Developers',
  body: 'Create beautiful, responsive web applications with carefully selected font pairs. Typography plays a crucial role in user experience, readability, and brand identity. Choose the right combination for your project.',
  code: 'const fontPair = { heading: "Inter", body: "Inter" };',
})
const fontSize = ref({
  heading: [32],
  body: [16],
})
const lineHeight = ref({
  heading: [1.4],
  body: [1.7],
})
const fontWeight = ref({
  heading: [700],
  body: [400],
})

// フォントペアリングデータ
const fontPairs = [
  {
    id: 1,
    category: 'modern',
    name: 'Inter System Stack',
    heading: { family: 'Inter', weight: [400, 500, 600, 700, 800, 900], variable: true },
    body: { family: 'Inter', weight: [400, 500, 600], variable: true },
    mono: { family: 'JetBrains Mono', weight: [400, 700] },
    description: 'The most popular choice for modern web apps. Variable font support for optimal performance.',
    tags: ['Performance', 'Variable Font', 'System UI'],
    cssFrameworks: ['Tailwind', 'Bootstrap 5'],
    popularity: 95,
  },
  {
    id: 2,
    category: 'modern',
    name: 'GitHub Engineering',
    heading: { family: 'SF Pro Display', weight: [500, 700], fallback: '-apple-system, BlinkMacSystemFont' },
    body: { family: 'SF Pro Text', weight: [400, 500], fallback: '-apple-system, BlinkMacSystemFont' },
    mono: { family: 'SF Mono', weight: [400, 500], fallback: 'Monaco, Consolas' },
    description: 'GitHub-inspired typography. Clean, readable, and professional.',
    tags: ['Developer', 'Documentation', 'Apple'],
    cssFrameworks: ['Primer CSS'],
    popularity: 88,
  },
  {
    id: 3,
    category: 'display',
    name: 'ポップ & フレンドリー',
    heading: { family: 'Poppins', weight: [600, 700] },
    body: { family: 'M PLUS Rounded 1c', weight: [400, 500] },
    description: '親しみやすく楽しい雰囲気。カジュアルなサイトに。',
    tags: ['カジュアル', '親しみやすい', '楽しい'],
  },
  {
    id: 4,
    category: 'serif',
    name: 'アカデミック & フォーマル',
    heading: { family: 'Playfair Display', weight: [700, 900] },
    body: { family: 'Noto Serif JP', weight: [400] },
    description: '格調高く知的な印象。論文や専門サイトに。',
    tags: ['フォーマル', 'アカデミック', '高級感'],
  },
  {
    id: 5,
    category: 'sans-serif',
    name: 'ミニマル & シンプル',
    heading: { family: 'Helvetica Neue', weight: [300, 500] },
    body: { family: 'Hiragino Sans', weight: [400] },
    description: '無駄を削ぎ落としたミニマルデザイン。',
    tags: ['ミニマル', 'シンプル', '洗練'],
  },
  {
    id: 6,
    category: 'display',
    name: 'クリエイティブ & アート',
    heading: { family: 'Bebas Neue', weight: [400] },
    body: { family: 'Open Sans', weight: [400, 600] },
    description: 'インパクトのあるデザイン。ポートフォリオサイトに。',
    tags: ['クリエイティブ', 'インパクト', 'アート'],
  },
  {
    id: 7,
    category: 'serif',
    name: '和風 & 伝統',
    heading: { family: 'Shippori Mincho', weight: [600, 800] },
    body: { family: 'Noto Sans JP', weight: [300, 400] },
    description: '日本の伝統美を表現。和風サイトに最適。',
    tags: ['和風', '伝統', '日本'],
  },
  {
    id: 8,
    category: 'sans-serif',
    name: 'ビジネス & プロフェッショナル',
    heading: { family: 'Roboto', weight: [500, 700] },
    body: { family: 'Noto Sans JP', weight: [400, 500] },
    description: '信頼感のあるビジネス向けデザイン。',
    tags: ['ビジネス', 'プロフェッショナル', '信頼'],
  },
  {
    id: 9,
    category: 'display',
    name: 'レトロ & ヴィンテージ',
    heading: { family: 'Oswald', weight: [500, 600] },
    body: { family: 'Lato', weight: [400] },
    description: 'ノスタルジックな雰囲気を演出。',
    tags: ['レトロ', 'ヴィンテージ', 'ノスタルジック'],
  },
  {
    id: 3,
    category: 'technical',
    name: 'VS Code Documentation',
    heading: { family: 'Segoe UI', weight: [400, 600, 700], fallback: 'system-ui' },
    body: { family: 'Segoe UI', weight: [400, 600], fallback: 'system-ui' },
    mono: { family: 'Cascadia Code', weight: [400], ligatures: true },
    description: 'Microsoft VS Code inspired. Perfect for technical documentation.',
    tags: ['Documentation', 'Microsoft', 'Code Ligatures'],
    cssFrameworks: ['Fluent UI'],
    popularity: 82,
  },
  {
    id: 4,
    category: 'technical',
    name: 'Mozilla Developer',
    heading: { family: 'Zilla Slab', weight: [400, 700] },
    body: { family: 'Inter', weight: [400, 500] },
    mono: { family: 'Fira Code', weight: [400, 500], ligatures: true },
    description: 'MDN Web Docs style. Great for developer documentation.',
    tags: ['MDN', 'Documentation', 'Open Source'],
    cssFrameworks: ['Protocol'],
    popularity: 75,
  },
  {
    id: 5,
    category: 'modern',
    name: 'Vercel Design System',
    heading: { family: 'Inter', weight: [500, 700, 800] },
    body: { family: 'Inter', weight: [400, 500] },
    mono: { family: 'JetBrains Mono', weight: [400] },
    description: 'Vercel & Next.js inspired. Modern and minimalist.',
    tags: ['Next.js', 'Vercel', 'Minimalist'],
    cssFrameworks: ['Geist UI'],
    popularity: 91,
  },
  {
    id: 6,
    category: 'classic',
    name: 'Medium Editorial',
    heading: { family: 'Charter', weight: [400, 700], fallback: 'Georgia, serif' },
    body: { family: 'SF Pro Text', weight: [400], fallback: '-apple-system, BlinkMacSystemFont' },
    mono: { family: 'Menlo', weight: [400] },
    description: 'Medium-style typography. Perfect for blogs and articles.',
    tags: ['Blog', 'Editorial', 'Reading'],
    cssFrameworks: [],
    popularity: 78,
  },
  {
    id: 7,
    category: 'modern',
    name: 'Stripe Dashboard',
    heading: { family: 'Camphor', weight: [400, 600], fallback: 'Inter, system-ui' },
    body: { family: 'Camphor', weight: [400, 500], fallback: 'Inter, system-ui' },
    mono: { family: 'Source Code Pro', weight: [400, 600] },
    description: 'Stripe-inspired clean typography. Great for SaaS dashboards.',
    tags: ['SaaS', 'Dashboard', 'Fintech'],
    cssFrameworks: [],
    popularity: 85,
  },
  {
    id: 8,
    category: 'technical',
    name: 'Tailwind UI',
    heading: { family: 'Inter', weight: [500, 600, 700, 800], variable: true },
    body: { family: 'Inter', weight: [400, 500], variable: true },
    mono: { family: 'Menlo', weight: [400], fallback: 'Monaco, Consolas' },
    description: 'Tailwind CSS recommended stack. Highly optimized.',
    tags: ['Tailwind', 'Utility-First', 'Performance'],
    cssFrameworks: ['Tailwind CSS'],
    popularity: 93,
  },
  {
    id: 9,
    category: 'classic',
    name: 'Google Material',
    heading: { family: 'Roboto', weight: [300, 400, 500, 700] },
    body: { family: 'Roboto', weight: [300, 400, 500] },
    mono: { family: 'Roboto Mono', weight: [400, 500] },
    description: 'Google Material Design typography system.',
    tags: ['Material Design', 'Google', 'Android'],
    cssFrameworks: ['Material UI', 'Vuetify'],
    popularity: 87,
  },
  {
    id: 10,
    category: 'technical',
    name: 'IBM Carbon Design',
    heading: { family: 'IBM Plex Sans', weight: [300, 400, 600] },
    body: { family: 'IBM Plex Sans', weight: [400, 500] },
    mono: { family: 'IBM Plex Mono', weight: [400, 600] },
    description: 'IBM Carbon Design System. Enterprise-ready typography.',
    tags: ['Enterprise', 'IBM', 'Design System'],
    cssFrameworks: ['Carbon Design System'],
    popularity: 72,
  },
]

// フィルタリングされたペア
const filteredPairs = computed(() => {
  if (selectedCategory.value === 'all') {
    return fontPairs
  }
  return fontPairs.filter(pair => pair.category === selectedCategory.value)
})

// 選択されたペア
const selectedPairData = computed(() => {
  if (selectedPair.value === null) return null
  return fontPairs.find(pair => pair.id === selectedPair.value)
})

// フォントロード最適化
const fontLoadingStrategy = ref<'swap' | 'block' | 'fallback' | 'optional'>('swap')

// Google Fontsのインポートリンク生成
const generateImportLink = computed(() => {
  if (!selectedPairData.value) return ''

  const fonts = []
  const heading = selectedPairData.value.heading
  const body = selectedPairData.value.body

  // Google Fontsで利用可能なフォントのみ対象
  const googleFonts = ['Inter', 'Poppins', 'Playfair Display', 'Bebas Neue', 'Oswald', 'Roboto', 'Lato', 'Space Mono', 'IBM Plex Sans', 'Open Sans', 'Noto Sans JP', 'Noto Serif JP', 'Shippori Mincho', 'M PLUS Rounded 1c']

  if (googleFonts.includes(heading.family)) {
    const weights = heading.weight.join(';')
    fonts.push(`family=${heading.family.replace(/ /g, '+')}:wght@${weights}`)
  }

  if (googleFonts.includes(body.family) && body.family !== heading.family) {
    const weights = body.weight.join(';')
    fonts.push(`family=${body.family.replace(/ /g, '+')}:wght@${weights}`)
  }

  if (fonts.length === 0) return ''

  return `<!-- Optimize font loading -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fonts.join('&')}&display=${fontLoadingStrategy.value}" rel="stylesheet">`
})

// CSSコード生成
const generateCSS = computed(() => {
  if (!selectedPairData.value) return ''

  const pair = selectedPairData.value
  const headingFallback = pair.heading.fallback || 'system-ui, sans-serif'
  const bodyFallback = pair.body.fallback || 'system-ui, sans-serif'
  const monoFallback = pair.mono?.fallback || 'monospace'

  if (outputFormat.value === 'css-vars') {
    return `:root {
  /* Font Families */
  --font-heading: '${pair.heading.family}', ${headingFallback};
  --font-body: '${pair.body.family}', ${bodyFallback};
  --font-mono: '${pair.mono?.family || 'Consolas'}', ${monoFallback};
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  --leading-loose: 2;
}

/* Typography Scale */
.h1 { font: var(--font-bold) var(--text-5xl)/var(--leading-tight) var(--font-heading); }
.h2 { font: var(--font-bold) var(--text-4xl)/var(--leading-tight) var(--font-heading); }
.h3 { font: var(--font-semibold) var(--text-3xl)/var(--leading-normal) var(--font-heading); }
.h4 { font: var(--font-semibold) var(--text-2xl)/var(--leading-normal) var(--font-heading); }
.h5 { font: var(--font-medium) var(--text-xl)/var(--leading-normal) var(--font-heading); }
.h6 { font: var(--font-medium) var(--text-lg)/var(--leading-normal) var(--font-heading); }

.body { font: var(--font-normal) var(--text-base)/var(--leading-relaxed) var(--font-body); }
.body-sm { font: var(--font-normal) var(--text-sm)/var(--leading-normal) var(--font-body); }
.body-lg { font: var(--font-normal) var(--text-lg)/var(--leading-relaxed) var(--font-body); }

.code { font: var(--font-normal) var(--text-sm)/var(--leading-normal) var(--font-mono); }

/* Responsive Typography */
@media (max-width: 640px) {
  :root {
    --text-3xl: 1.5rem;
    --text-4xl: 1.875rem;
    --text-5xl: 2.25rem;
  }
}`
  }
  else if (outputFormat.value === 'tailwind') {
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'heading': ['${pair.heading.family}', '${headingFallback}'],
        'body': ['${pair.body.family}', '${bodyFallback}'],
        'mono': ['${pair.mono?.family || 'Consolas'}', '${monoFallback}'],
      },
    },
  },
}

/* Usage in Tailwind CSS */
// <h1 class="font-heading font-bold text-5xl">Heading</h1>
// <p class="font-body text-base leading-relaxed">Body text</p>
// <code class="font-mono text-sm">Code snippet</code>`
  }
  else if (outputFormat.value === 'scss') {
    return `// Font Variables
$font-heading: '${pair.heading.family}', ${headingFallback};
$font-body: '${pair.body.family}', ${bodyFallback};
$font-mono: '${pair.mono?.family || 'Consolas'}', ${monoFallback};

// Font Weights
$font-weights: (
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
);

// Type Scale
$type-scale: (
  xs: 0.75rem,
  sm: 0.875rem,
  base: 1rem,
  lg: 1.125rem,
  xl: 1.25rem,
  2xl: 1.5rem,
  3xl: 1.875rem,
  4xl: 2.25rem,
  5xl: 3rem,
);

// Typography Mixins
@mixin heading($size: 2xl, $weight: bold) {
  font-family: $font-heading;
  font-size: map-get($type-scale, $size);
  font-weight: map-get($font-weights, $weight);
  line-height: 1.25;
}

@mixin body($size: base, $weight: normal) {
  font-family: $font-body;
  font-size: map-get($type-scale, $size);
  font-weight: map-get($font-weights, $weight);
  line-height: 1.75;
}

// Usage
h1 { @include heading(5xl, bold); }
h2 { @include heading(4xl, bold); }
h3 { @include heading(3xl, semibold); }

p { @include body(base, normal); }
code { font-family: $font-mono; }`
  }
  else {
    return `/* Basic CSS */
h1, h2, h3, h4, h5, h6 {
  font-family: '${pair.heading.family}', ${headingFallback};
  font-weight: ${fontWeight.value.heading[0]};
  line-height: ${lineHeight.value.heading[0]};
}

body, p {
  font-family: '${pair.body.family}', ${bodyFallback};
  font-weight: ${fontWeight.value.body[0]};
  font-size: ${fontSize.value.body[0]}px;
  line-height: ${lineHeight.value.body[0]};
}

code, pre {
  font-family: '${pair.mono?.family || 'Consolas'}', ${monoFallback};
}`
  }
})

// 使用例のHTML
const _generateHTML = computed(() => {
  if (!selectedPairData.value) return ''

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>フォントペアリングサンプル</title>
  
  <!-- Google Fonts -->
${generateImportLink.value}
  
  <style>
${generateCSS.value}
  </style>
</head>
<body>
  <article>
    <h1>${previewText.value.heading}</h1>
    <p>${previewText.value.body}</p>
    <h2>セクション見出し</h2>
    <p>これは本文のサンプルです。<strong>強調されたテキスト</strong>や<a href="#">リンク</a>も含まれています。</p>
  </article>
</body>
</html>`
})

// Performance metrics
const performanceMetrics = computed(() => {
  if (!selectedPairData.value) return null

  const pair = selectedPairData.value
  const weights = [
    ...pair.heading.weight,
    ...pair.body.weight,
    ...(pair.mono?.weight || []),
  ]

  // Rough estimation of font file sizes
  const estimatedSize = weights.length * 15 // ~15KB per weight
  const loadTime = estimatedSize / 50 // Assuming 50KB/s

  return {
    weights: weights.length,
    estimatedSize,
    loadTime: loadTime.toFixed(1),
    variableFont: pair.heading.variable || pair.body.variable,
  }
})

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

// リセット
const reset = () => {
  selectedPair.value = null
  fontSize.value = { heading: [32], body: [16] }
  lineHeight.value = { heading: [1.4], body: [1.7] }
  fontWeight.value = { heading: [700], body: [400] }
}

// SEO設定
useSeoMeta({
  title: 'Developer Font Pairing Tool | Web開発ツール',
  description: 'Find the perfect font combinations for your web projects. Includes CSS frameworks integration, performance metrics, and code generation for CSS Variables, Tailwind, and SCSS.',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        Developer Font Pairing Tool
      </h1>
      <p class="text-muted-foreground">
        Discover perfect font combinations used by popular frameworks and tech companies. Generate production-ready CSS with performance optimization.
      </p>
    </div>

    <!-- カテゴリフィルター -->
    <Card>
      <CardHeader>
        <CardTitle>Filter by Style</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="category in [
              { value: 'all', label: 'All Styles', icon: 'heroicons:squares-2x2' },
              { value: 'modern', label: 'Modern', icon: 'heroicons:sparkles' },
              { value: 'technical', label: 'Technical', icon: 'heroicons:code-bracket' },
              { value: 'classic', label: 'Classic', icon: 'heroicons:bookmark' },
            ]"
            :key="category.value"
            :variant="selectedCategory === category.value ? 'default' : 'outline'"
            size="sm"
            @click="selectedCategory = category.value">
            <Icon :name="category.icon" class="w-4 h-4 mr-2" />
            {{ category.label }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- フォントペア一覧 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="pair in filteredPairs"
        :key="pair.id"
        class="cursor-pointer transition-colors"
        :class="selectedPair === pair.id ? 'border-primary' : 'hover:border-primary/50'"
        @click="selectedPair = pair.id">
        <CardHeader>
          <CardTitle class="text-lg">
            {{ pair.name }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                HEADINGS
              </p>
              <p :style="{ fontFamily: pair.heading.family }" class="text-lg font-bold">
                {{ pair.heading.family }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                BODY TEXT
              </p>
              <p :style="{ fontFamily: pair.body.family }" class="text-sm">
                {{ pair.body.family }}
              </p>
            </div>
            <div v-if="pair.mono">
              <p class="text-xs text-muted-foreground mb-1">
                CODE
              </p>
              <p :style="{ fontFamily: pair.mono.family }" class="text-sm font-mono">
                {{ pair.mono.family }}
              </p>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ pair.description }}
            </p>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="tag in pair.tags" :key="tag" variant="secondary"
                  class="text-xs">
                  {{ tag }}
                </Badge>
              </div>
              <div v-if="pair.cssFrameworks.length > 0" class="flex items-center gap-2">
                <Icon name="heroicons:cube" class="w-3 h-3 text-muted-foreground" />
                <span class="text-xs text-muted-foreground">
                  {{ pair.cssFrameworks.join(', ') }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <Icon name="heroicons:fire" class="w-3 h-3 text-orange-500" />
                  <span class="text-xs font-medium">{{ pair.popularity }}% popular</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 詳細設定とプレビュー -->
    <div v-if="selectedPairData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 設定 -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>フォント設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <h3 class="font-medium mb-3">
                  見出し設定
                </h3>
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium mb-2 block">
                      サイズ: {{ fontSize.heading[0] }}px
                    </label>
                    <Slider
                      :model-value="fontSize.heading"
                      :min="16"
                      :max="64"
                      :step="1"
                      class="w-full"
                      @update:model-value="fontSize.heading = $event" />
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">
                      太さ: {{ fontWeight.heading[0] }}
                    </label>
                    <Slider
                      :model-value="fontWeight.heading"
                      :min="100"
                      :max="900"
                      :step="100"
                      class="w-full"
                      @update:model-value="fontWeight.heading = $event" />
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">
                      行間: {{ lineHeight.heading[0] }}
                    </label>
                    <Slider
                      :model-value="lineHeight.heading"
                      :min="1"
                      :max="2"
                      :step="0.1"
                      class="w-full"
                      @update:model-value="lineHeight.heading = $event" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 class="font-medium mb-3">
                  本文設定
                </h3>
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium mb-2 block">
                      サイズ: {{ fontSize.body[0] }}px
                    </label>
                    <Slider
                      :model-value="fontSize.body"
                      :min="12"
                      :max="24"
                      :step="1"
                      class="w-full"
                      @update:model-value="fontSize.body = $event" />
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">
                      太さ: {{ fontWeight.body[0] }}
                    </label>
                    <Slider
                      :model-value="fontWeight.body"
                      :min="100"
                      :max="900"
                      :step="100"
                      class="w-full"
                      @update:model-value="fontWeight.body = $event" />
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">
                      行間: {{ lineHeight.body[0] }}
                    </label>
                    <Slider
                      :model-value="lineHeight.body"
                      :min="1"
                      :max="2.5"
                      :step="0.1"
                      class="w-full"
                      @update:model-value="lineHeight.body = $event" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" @click="reset">
              リセット
            </Button>
          </CardFooter>
        </Card>

        <!-- 出力設定 -->
        <Card>
          <CardHeader>
            <CardTitle>Output Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Code Format</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="format in [
                      { value: 'css-vars', label: 'CSS Variables' },
                      { value: 'tailwind', label: 'Tailwind' },
                      { value: 'scss', label: 'SCSS' },
                      { value: 'css', label: 'Basic CSS' },
                    ]"
                    :key="format.value"
                    :variant="outputFormat === format.value ? 'default' : 'outline'"
                    size="sm"
                    @click="outputFormat = format.value">
                    {{ format.label }}
                  </Button>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">Font Loading</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="strategy in [
                      { value: 'swap', label: 'Swap' },
                      { value: 'block', label: 'Block' },
                      { value: 'fallback', label: 'Fallback' },
                      { value: 'optional', label: 'Optional' },
                    ]"
                    :key="strategy.value"
                    :variant="fontLoadingStrategy === strategy.value ? 'default' : 'outline'"
                    size="sm"
                    @click="fontLoadingStrategy = strategy.value">
                    {{ strategy.label }}
                  </Button>
                </div>
                <p class="text-xs text-muted-foreground mt-2">
                  {{ fontLoadingStrategy === 'swap' ? 'Shows fallback immediately, swaps when loaded'
                    : fontLoadingStrategy === 'block' ? 'Blocks text rendering until font loads'
                      : fontLoadingStrategy === 'fallback' ? '100ms block period, then fallback'
                        : 'Minimal blocking, may use fallback permanently' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Performance Metrics -->
        <Card v-if="performanceMetrics">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Font Weights</span>
                <span class="text-sm font-medium">{{ performanceMetrics.weights }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Estimated Size</span>
                <span class="text-sm font-medium">~{{ performanceMetrics.estimatedSize }}KB</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Load Time (3G)</span>
                <span class="text-sm font-medium">~{{ performanceMetrics.loadTime }}s</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Variable Font</span>
                <Badge :variant="performanceMetrics.variableFont ? 'default' : 'secondary'">
                  {{ performanceMetrics.variableFont ? 'Yes' : 'No' }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- プレビューとコード -->
      <div class="space-y-6">
        <!-- ライブプレビュー -->
        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="p-6 bg-background rounded-md border">
              <h1
                :style="{
                  fontFamily: selectedPairData.heading.family,
                  fontSize: `${fontSize.heading[0]}px`,
                  fontWeight: fontWeight.heading[0],
                  lineHeight: lineHeight.heading[0],
                }"
                class="mb-4">
                {{ previewText.heading }}
              </h1>
              <h2
                :style="{
                  fontFamily: selectedPairData.heading.family,
                  fontSize: `${fontSize.heading[0] * 0.75}px`,
                  fontWeight: fontWeight.heading[0] - 100,
                  lineHeight: lineHeight.heading[0],
                }"
                class="my-3">
                {{ previewText.subheading }}
              </h2>
              <p
                :style="{
                  fontFamily: selectedPairData.body.family,
                  fontSize: `${fontSize.body[0]}px`,
                  fontWeight: fontWeight.body[0],
                  lineHeight: lineHeight.body[0],
                }"
                class="mb-3">
                {{ previewText.body }}
              </p>
              <pre
                v-if="selectedPairData.mono"
                :style="{
                  fontFamily: selectedPairData.mono.family,
                  fontSize: `${fontSize.body[0] * 0.875}px`,
                  fontWeight: 400,
                  lineHeight: 1.5,
                }"
                class="p-3 bg-muted rounded"><code>{{ previewText.code }}</code></pre>
            </div>
          </CardContent>
        </Card>

        <!-- インポートリンク -->
        <Card v-if="generateImportLink">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Google Fonts インポート</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(generateImportLink)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ generateImportLink }}</code></pre>
          </CardContent>
        </Card>

        <!-- CSSコード -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>CSS コード</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(generateCSS)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ generateCSS }}</code></pre>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Quick Start Guide -->
    <Card>
      <CardHeader>
        <CardTitle>Quick Implementation Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold mb-2">
              1. Add Font Links
            </h3>
            <p class="text-sm text-muted-foreground mb-2">
              Add the Google Fonts link to your HTML head or import in CSS
            </p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">
              2. Apply CSS Variables
            </h3>
            <p class="text-sm text-muted-foreground mb-2">
              Use the generated CSS variables for consistent typography
            </p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">
              3. Optimize Loading
            </h3>
            <p class="text-sm text-muted-foreground">
              Consider using font-display: swap and preloading critical fonts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Best Practices -->
    <Card>
      <CardHeader>
        <CardTitle>Developer Best Practices</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Performance Tips
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>Use variable fonts when available (single file, multiple weights)</li>
              <li>Limit font weights to only what you need</li>
              <li>Preload critical fonts with &lt;link rel="preload"&gt;</li>
              <li>Use font-display: swap for better perceived performance</li>
              <li>Consider system font stacks for optimal performance</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Accessibility
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>Maintain minimum 16px for body text</li>
              <li>Ensure sufficient line-height (1.5+ for body)</li>
              <li>Test contrast ratios with your color scheme</li>
              <li>Avoid fonts with ambiguous characters for code</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              Framework Integration
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>Use CSS custom properties for easy theming</li>
              <li>Define a consistent type scale</li>
              <li>Create utility classes for common text styles</li>
              <li>Document your typography system</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
