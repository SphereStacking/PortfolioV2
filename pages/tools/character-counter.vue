<script setup lang="ts">
import { ref, computed } from 'vue'

// 状態管理
const text = ref('')
const includeSpaces = ref(true)
const includeNewlines = ref(true)

// 文字数カウント
const characterCount = computed(() => {
  let count = text.value.length
  
  if (!includeSpaces.value) {
    count = text.value.replace(/\s/g, '').length
  } else if (!includeNewlines.value) {
    count = text.value.replace(/\n/g, '').length
  }
  
  return count
})

// 文字数（スペース除外）
const characterCountWithoutSpaces = computed(() => {
  return text.value.replace(/\s/g, '').length
})

// 単語数
const wordCount = computed(() => {
  if (!text.value.trim()) return 0
  
  // 日本語と英語の混在に対応
  // 英語の単語
  const englishWords = text.value.match(/[a-zA-Z]+/g) || []
  // 日本語の文字（漢字、ひらがな、カタカナ）
  const japaneseChars = text.value.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]/g) || []
  
  return englishWords.length + japaneseChars.length
})

// 行数
const lineCount = computed(() => {
  if (!text.value) return 0
  return text.value.split('\n').length
})

// 段落数
const paragraphCount = computed(() => {
  if (!text.value.trim()) return 0
  return text.value.split(/\n\s*\n/).filter(p => p.trim()).length
})

// バイト数
const byteCount = computed(() => {
  return new Blob([text.value]).size
})

// 文字種別の統計
const characterStats = computed(() => {
  const stats = {
    hiragana: 0,
    katakana: 0,
    kanji: 0,
    alphabet: 0,
    number: 0,
    symbol: 0,
    space: 0,
    newline: 0,
  }
  
  for (const char of text.value) {
    if (/[\u3040-\u309f]/.test(char)) stats.hiragana++
    else if (/[\u30a0-\u30ff]/.test(char)) stats.katakana++
    else if (/[\u4e00-\u9faf]/.test(char)) stats.kanji++
    else if (/[a-zA-Z]/.test(char)) stats.alphabet++
    else if (/[0-9]/.test(char)) stats.number++
    else if (char === ' ' || char === '\u3000') stats.space++
    else if (char === '\n') stats.newline++
    else if (!/\s/.test(char)) stats.symbol++
  }
  
  return stats
})

// 読了時間の推定（日本語400文字/分、英語200単語/分）
const readingTime = computed(() => {
  const japaneseChars = (characterStats.value.hiragana + characterStats.value.katakana + characterStats.value.kanji)
  const englishWords = text.value.match(/[a-zA-Z]+/g)?.length || 0
  
  const japaneseMinutes = japaneseChars / 400
  const englishMinutes = englishWords / 200
  
  const totalMinutes = Math.ceil(japaneseMinutes + englishMinutes)
  
  return totalMinutes
})

// よく使われる文字のランキング
const characterFrequency = computed(() => {
  const frequency: Record<string, number> = {}
  
  for (const char of text.value) {
    if (!/\s/.test(char)) {
      frequency[char] = (frequency[char] || 0) + 1
    }
  }
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([char, count]) => ({ char, count }))
})

// クリア
const clearText = () => {
  text.value = ''
}

// クリップボード操作
const { toast } = useToast()

const copyStats = () => {
  const stats = `文字数: ${characterCount.value}
文字数（スペース除外）: ${characterCountWithoutSpaces.value}
単語数: ${wordCount.value}
行数: ${lineCount.value}
段落数: ${paragraphCount.value}
バイト数: ${byteCount.value}
読了時間: 約${readingTime.value}分`
  
  navigator.clipboard.writeText(stats)
  toast({
    title: 'コピーしました',
    description: '統計情報をクリップボードにコピーしました',
  })
}

// SEO設定
useSeoMeta({
  title: '文字数カウンター | Web開発ツール',
  description: '文字数、単語数、行数、バイト数をリアルタイムでカウント。日本語と英語に対応。',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="mb-8">
      <NuxtLink
        to="/tools"
        class="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <Icon name="ChevronLeft" class="w-4 h-4 mr-1" />
        ツール一覧に戻る
      </NuxtLink>
      
      <h1 class="text-3xl font-bold mb-2">文字数カウンター</h1>
      <p class="text-muted-foreground">
        文字数、単語数、行数などをリアルタイムでカウントします。
      </p>
    </div>

    <div class="grid lg:grid-cols-[1fr_300px] gap-8">
      <!-- テキストエリア -->
      <div>
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>テキスト入力</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="clearText">
                <Icon name="X" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              v-model="text"
              placeholder="テキストを入力またはペーストしてください..."
              class="w-full h-[500px] p-4 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              spellcheck="false">
            </textarea>
          </CardContent>
        </Card>
      </div>

      <!-- 統計情報 -->
      <div class="space-y-6">
        <!-- 基本統計 -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>基本統計</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyStats">
                <Icon name="Copy" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">文字数</span>
                <span class="text-2xl font-bold">{{ characterCount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">文字数（スペース除外）</span>
                <span class="text-lg font-semibold">{{ characterCountWithoutSpaces.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">単語数</span>
                <span class="text-lg font-semibold">{{ wordCount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">行数</span>
                <span class="text-lg font-semibold">{{ lineCount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">段落数</span>
                <span class="text-lg font-semibold">{{ paragraphCount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">バイト数</span>
                <span class="text-lg font-semibold">{{ byteCount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">読了時間</span>
                <span class="text-lg font-semibold">約{{ readingTime }}分</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 文字種別 -->
        <Card>
          <CardHeader>
            <CardTitle>文字種別</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div v-if="characterStats.hiragana > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">ひらがな</span>
                <span class="text-sm font-medium">{{ characterStats.hiragana }}</span>
              </div>
              <div v-if="characterStats.katakana > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">カタカナ</span>
                <span class="text-sm font-medium">{{ characterStats.katakana }}</span>
              </div>
              <div v-if="characterStats.kanji > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">漢字</span>
                <span class="text-sm font-medium">{{ characterStats.kanji }}</span>
              </div>
              <div v-if="characterStats.alphabet > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">アルファベット</span>
                <span class="text-sm font-medium">{{ characterStats.alphabet }}</span>
              </div>
              <div v-if="characterStats.number > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">数字</span>
                <span class="text-sm font-medium">{{ characterStats.number }}</span>
              </div>
              <div v-if="characterStats.symbol > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">記号</span>
                <span class="text-sm font-medium">{{ characterStats.symbol }}</span>
              </div>
              <div v-if="characterStats.space > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">スペース</span>
                <span class="text-sm font-medium">{{ characterStats.space }}</span>
              </div>
              <div v-if="characterStats.newline > 0" class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">改行</span>
                <span class="text-sm font-medium">{{ characterStats.newline }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 頻出文字 -->
        <Card v-if="characterFrequency.length > 0">
          <CardHeader>
            <CardTitle>頻出文字 TOP10</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div
                v-for="(item, index) in characterFrequency"
                :key="index"
                class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">{{ index + 1 }}.</span>
                  <code class="px-2 py-0.5 bg-muted rounded text-sm">{{ item.char }}</code>
                </div>
                <span class="text-sm font-medium">{{ item.count }}回</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>