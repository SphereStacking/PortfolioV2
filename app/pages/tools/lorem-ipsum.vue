<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// Lorem Ipsumテキスト
const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et',
  'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis',
  'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque', 'laudantium',
  'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo',
]

// 日本語のダミーテキスト
const japaneseWords = [
  'あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの',
  'はひふへほ', 'まみむめも', 'やゆよ', 'らりるれろ', 'わをん',
  'がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ',
  'テキスト', 'サンプル', 'ダミー', '文章', '日本語',
  '漢字', 'ひらがな', 'カタカナ', '文字', '言葉',
  'これは', 'それは', 'あれは', 'どれも', 'すべて',
  'です', 'ます', 'でした', 'ました', 'でしょう',
  'という', 'ために', 'について', 'による', 'において',
  'しかし', 'また', 'そして', 'つまり', 'ただし',
  'ここで', 'そこで', 'どこでも', 'いつでも', 'なぜなら',
]

// 状態管理
const textType = ref<'lorem' | 'japanese' | 'business' | 'tech'>('lorem')
const unitType = ref<'words' | 'sentences' | 'paragraphs'>('paragraphs')
const count = ref(3)
const startWithLorem = ref(true)
const includeHTML = ref(false)
const htmlTag = ref('p')
const generatedText = ref('')

// ビジネス用語
const businessWords = [
  'synergy', 'leverage', 'paradigm', 'strategy', 'innovation', 'disruption',
  'optimization', 'scalability', 'sustainability', 'transformation', 'integration',
  'collaboration', 'efficiency', 'productivity', 'performance', 'growth',
  'revenue', 'profit', 'market', 'customer', 'stakeholder', 'value',
  'solution', 'platform', 'ecosystem', 'analytics', 'insight', 'metric',
  'benchmark', 'milestone', 'roadmap', 'framework', 'methodology', 'process',
  'workflow', 'pipeline', 'funnel', 'conversion', 'retention', 'acquisition',
  'engagement', 'experience', 'journey', 'touchpoint', 'channel', 'omnichannel',
]

// 技術用語
const techWords = [
  'algorithm', 'database', 'framework', 'library', 'component', 'module',
  'function', 'variable', 'constant', 'parameter', 'argument', 'return',
  'array', 'object', 'string', 'number', 'boolean', 'interface',
  'class', 'method', 'property', 'inheritance', 'polymorphism', 'encapsulation',
  'abstraction', 'recursion', 'iteration', 'loop', 'condition', 'statement',
  'expression', 'operator', 'syntax', 'semantic', 'compile', 'runtime',
  'debug', 'test', 'deploy', 'server', 'client', 'request',
  'response', 'cache', 'session', 'cookie', 'token', 'authentication',
]

// 単語リストを取得
const getWordList = () => {
  switch (textType.value) {
    case 'japanese':
      return japaneseWords
    case 'business':
      return businessWords
    case 'tech':
      return techWords
    default:
      return loremWords
  }
}

// ランダムな単語を取得
const getRandomWord = (words: string[]) => {
  return words[Math.floor(Math.random() * words.length)]
}

// 文を生成
const generateSentence = (words: string[], minWords = 5, maxWords = 15) => {
  const length = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
  const sentence = []

  for (let i = 0; i < length; i++) {
    sentence.push(getRandomWord(words))
  }

  // 最初の単語を大文字に（英語の場合）
  if (textType.value !== 'japanese' && sentence.length > 0) {
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1)
  }

  // 日本語の場合は句読点を追加
  if (textType.value === 'japanese') {
    return sentence.join('') + '。'
  }

  return sentence.join(' ') + '.'
}

// 段落を生成
const generateParagraph = (words: string[], minSentences = 3, maxSentences = 7) => {
  const length = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences
  const sentences = []

  for (let i = 0; i < length; i++) {
    sentences.push(generateSentence(words))
  }

  return sentences.join(' ')
}

// テキスト生成
const generateText = () => {
  const words = getWordList()
  const result = []

  switch (unitType.value) {
    case 'words':
      for (let i = 0; i < count.value; i++) {
        result.push(getRandomWord(words))
      }
      generatedText.value = result.join(textType.value === 'japanese' ? '' : ' ')
      break

    case 'sentences':
      for (let i = 0; i < count.value; i++) {
        result.push(generateSentence(words))
      }
      generatedText.value = result.join(' ')
      break

    case 'paragraphs':
      for (let i = 0; i < count.value; i++) {
        let paragraph = generateParagraph(words)

        // 最初の段落を"Lorem ipsum"で始める
        if (i === 0 && startWithLorem.value && textType.value === 'lorem') {
          paragraph = 'Lorem ipsum dolor sit amet, ' + paragraph.slice(0, 1).toLowerCase() + paragraph.slice(1)
        }

        result.push(paragraph)
      }

      if (includeHTML.value) {
        generatedText.value = result.map(p => `<${htmlTag.value}>${p}</${htmlTag.value}>`).join('\n\n')
      }
      else {
        generatedText.value = result.join('\n\n')
      }
      break
  }
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async () => {
  try {
    await copy(generatedText.value)
    toast({
      title: 'コピーしました',
      description: 'テキストをクリップボードにコピーしました',
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

// ダウンロード
const downloadText = () => {
  const blob = new Blob([generatedText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${textType.value}-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// バイト数を計算
const byteSize = computed(() => {
  return new Blob([generatedText.value]).size
})

// プリセット
const presets = [
  {
    name: '短いタイトル',
    config: {
      textType: 'lorem',
      unitType: 'words',
      count: 5,
      includeHTML: false,
    },
  },
  {
    name: '商品説明',
    config: {
      textType: 'business',
      unitType: 'sentences',
      count: 3,
      includeHTML: false,
    },
  },
  {
    name: 'ブログ記事',
    config: {
      textType: 'lorem',
      unitType: 'paragraphs',
      count: 5,
      includeHTML: true,
      htmlTag: 'p',
    },
  },
  {
    name: 'リスト項目',
    config: {
      textType: 'lorem',
      unitType: 'sentences',
      count: 5,
      includeHTML: true,
      htmlTag: 'li',
    },
  },
  {
    name: '日本語見出し',
    config: {
      textType: 'japanese',
      unitType: 'words',
      count: 8,
      includeHTML: false,
    },
  },
  {
    name: '技術ドキュメント',
    config: {
      textType: 'tech',
      unitType: 'paragraphs',
      count: 3,
      includeHTML: false,
    },
  },
]

const applyPreset = (preset: typeof presets[0]) => {
  const config = preset.config
  textType.value = config.textType as typeof textType.value
  unitType.value = config.unitType as typeof unitType.value
  count.value = config.count
  includeHTML.value = config.includeHTML
  if (config.htmlTag) htmlTag.value = config.htmlTag
  generateText()
}

// 初期生成
generateText()

// SEO設定
useSeoMeta({
  title: 'Lorem Ipsumジェネレーター | Web開発ツール',
  description: '日本語対応のダミーテキスト生成。Lorem Ipsum、日本語、ビジネス用語、技術用語に対応。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        Lorem Ipsumジェネレーター
      </h1>
      <p class="text-muted-foreground">
        ダミーテキストを生成します。日本語にも対応。
      </p>
    </div>

    <!-- プリセット -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-3 gap-2">
          <Button
            v-for="preset in presets"
            :key="preset.name"
            variant="outline"
            size="sm"
            @click="applyPreset(preset)">
            {{ preset.name }}
          </Button>
        </div>
      </CardContent>
    </Card>
    <!-- テキストタイプ -->
    <Card>
      <CardHeader class="flex items-center flex-row justify-between">
        <CardTitle>テキストタイプ</CardTitle>
        <Button
          @click="generateText">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
          生成
        </Button>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="textType"
              value="lorem"
              type="radio"
              class="text-primary">
            <div>
              <div class="font-medium">Lorem Ipsum</div>
              <div class="text-sm text-muted-foreground">標準的なラテン語のダミーテキスト</div>
            </div>
          </label>
          <label class="flex items-center gap-3">
            <input
              v-model="textType"
              value="japanese"
              type="radio"
              class="text-primary">
            <div>
              <div class="font-medium">日本語</div>
              <div class="text-sm text-muted-foreground">ひらがな、カタカナ、漢字を含む</div>
            </div>
          </label>
          <label class="flex items-center gap-3">
            <input
              v-model="textType"
              value="business"
              type="radio"
              class="text-primary">
            <div>
              <div class="font-medium">ビジネス</div>
              <div class="text-sm text-muted-foreground">ビジネス用語を使用</div>
            </div>
          </label>
          <label class="flex items-center gap-3">
            <input
              v-model="textType"
              value="tech"
              type="radio"
              class="text-primary">
            <div>
              <div class="font-medium">技術</div>
              <div class="text-sm text-muted-foreground">プログラミング・IT用語を使用</div>
            </div>
          </label>
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>生成設定</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 単位 -->
        <div>
          <label class="text-sm font-medium mb-2 block">単位</label>
          <select
            v-model="unitType"
            class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
            <option value="words">
              単語
            </option>
            <option value="sentences">
              文
            </option>
            <option value="paragraphs">
              段落
            </option>
          </select>
        </div>

        <!-- 数量 -->
        <div>
          <label class="text-sm font-medium mb-2 block">
            数量: {{ count }}{{ unitType === 'words' ? '単語' : unitType === 'sentences' ? '文' : '段落' }}
          </label>
          <Slider
            :model-value="[count]"
            :min="1"
            :max="unitType === 'words' ? 200 : unitType === 'sentences' ? 50 : 10"
            :step="1"
            class="w-full"
            @update:model-value="count = $event[0]" />
        </div>

        <!-- オプション -->
        <div class="space-y-2">
          <label v-if="textType === 'lorem' && unitType === 'paragraphs'" class="flex items-center gap-2">
            <input
              v-model="startWithLorem"
              type="checkbox"
              class="rounded">
            <span class="text-sm">"Lorem ipsum"で開始</span>
          </label>

          <label v-if="unitType === 'paragraphs'" class="flex items-center gap-2">
            <input
              v-model="includeHTML"
              type="checkbox"
              class="rounded">
            <span class="text-sm">HTMLタグを含める</span>
          </label>
        </div>

        <!-- HTMLタグ選択 -->
        <div v-if="includeHTML && unitType === 'paragraphs'">
          <label class="text-sm font-medium mb-2 block">HTMLタグ</label>
          <select
            v-model="htmlTag"
            class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
            <option value="p">
              &lt;p&gt;
            </option>
            <option value="div">
              &lt;div&gt;
            </option>
            <option value="span">
              &lt;span&gt;
            </option>
            <option value="h1">
              &lt;h1&gt;
            </option>
            <option value="h2">
              &lt;h2&gt;
            </option>
            <option value="h3">
              &lt;h3&gt;
            </option>
            <option value="li">
              &lt;li&gt;
            </option>
          </select>
        </div>
      </CardContent>
    </Card>

    <!-- 生成結果 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>生成されたテキスト</CardTitle>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              :disabled="!generatedText"
              @click="copyToClipboard">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-1" />
              コピー
            </Button>
            <Button
              size="sm"
              variant="outline"
              :disabled="!generatedText"
              @click="downloadText">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
              ダウンロード
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <!-- 統計情報 -->
        <div class="mb-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold">
              {{ generatedText.length }}
            </div>
            <div class="text-sm text-muted-foreground">
              文字数
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold">
              {{ generatedText.split(/\s+/).filter(w => w).length }}
            </div>
            <div class="text-sm text-muted-foreground">
              単語数
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold">
              {{ byteSize }}
            </div>
            <div class="text-sm text-muted-foreground">
              バイト数
            </div>
          </div>
        </div>
        <div class="min-h-[400px] p-4 bg-muted rounded-md">
          <pre class="whitespace-pre-wrap font-sans text-sm">{{ generatedText }}</pre>
        </div>
      </CardContent>
    </Card>

    <!-- 使い方 -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>使い方</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <p>
          Lorem Ipsumは、印刷やWebデザインでよく使われるダミーテキストです。
          意味のないテキストを使用することで、デザインに集中できます。
        </p>
        <ul class="list-disc list-inside space-y-1">
          <li>テキストタイプを選択して、用途に合ったダミーテキストを生成</li>
          <li>単語、文、段落の単位で必要な量を指定</li>
          <li>HTMLタグを含めることで、マークアップのテストにも使用可能</li>
          <li>日本語のダミーテキストは、Webサイトやアプリの日本語表示テストに最適</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
