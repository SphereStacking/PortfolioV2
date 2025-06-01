<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})
// 状態管理
const pattern = ref('')
const flags = ref({
  g: true,
  i: false,
  m: false,
  s: false,
  u: false,
  y: false,
})
const testString = ref('')
const replacementString = ref('')
const error = ref('')

// フラグ文字列を生成
const flagString = computed(() => {
  return Object.entries(flags.value)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag)
    .join('')
})

// 正規表現オブジェクト
const regex = computed(() => {
  try {
    error.value = ''
    return pattern.value ? new RegExp(pattern.value, flagString.value) : null
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '無効な正規表現です'
    return null
  }
})

// マッチ結果
const matches = computed(() => {
  if (!regex.value || !testString.value) return []

  const results = []
  const globalRegex = new RegExp(pattern.value, flagString.value.includes('g') ? flagString.value : flagString.value + 'g')

  let match
  while ((match = globalRegex.exec(testString.value)) !== null) {
    results.push({
      match: match[0],
      index: match.index,
      groups: match.slice(1),
      namedGroups: match.groups || {},
    })

    // 無限ループ防止
    if (match.index === globalRegex.lastIndex) {
      globalRegex.lastIndex++
    }
  }

  return results
})

// 置換結果
const replacedString = computed(() => {
  if (!regex.value || !testString.value) return ''

  try {
    return testString.value.replace(regex.value, replacementString.value)
  }
  catch (e) {
    return ''
  }
})

// ハイライトされたテキスト
const highlightedText = computed(() => {
  if (!regex.value || !testString.value || matches.value.length === 0) {
    return testString.value
  }

  let result = ''
  let lastIndex = 0

  matches.value.forEach((match) => {
    result += escapeHtml(testString.value.slice(lastIndex, match.index))
    result += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5">${escapeHtml(match.match)}</mark>`
    lastIndex = match.index + match.match.length
  })

  result += escapeHtml(testString.value.slice(lastIndex))
  return result
})

// HTMLエスケープ
const escapeHtml = (text: string) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast({
      title: 'コピーしました',
      description: '正常にコピーされました',
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

// よく使う正規表現パターン
const commonPatterns = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'メールアドレス' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', description: 'URL' },
  { name: '電話番号（日本）', pattern: '0\\d{1,4}-\\d{1,4}-\\d{4}', description: '日本の電話番号' },
  { name: '郵便番号', pattern: '\\d{3}-\\d{4}', description: '日本の郵便番号' },
  { name: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', description: 'IPv4アドレス' },
  { name: '日付 (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])', description: 'ISO 8601形式の日付' },
  { name: '時刻 (HH:MM)', pattern: '(?:[01]?[0-9]|2[0-3]):[0-5][0-9]', description: '24時間形式の時刻' },
  { name: '16進数カラーコード', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', description: 'CSSカラーコード' },
  { name: '全角ひらがな', pattern: '[ぁ-ん]+', description: 'ひらがなのみ' },
  { name: '全角カタカナ', pattern: '[ァ-ヴー]+', description: 'カタカナのみ' },
  { name: '漢字', pattern: '[一-龯]+', description: '漢字のみ' },
  { name: '英数字', pattern: '[a-zA-Z0-9]+', description: '英数字のみ' },
]

const loadPattern = (commonPattern: typeof commonPatterns[0]) => {
  pattern.value = commonPattern.pattern
}

// クイックリファレンス
const references = [
  { char: '.', desc: '任意の1文字（改行を除く）' },
  { char: '*', desc: '直前の文字の0回以上の繰り返し' },
  { char: '+', desc: '直前の文字の1回以上の繰り返し' },
  { char: '?', desc: '直前の文字の0回または1回' },
  { char: '^', desc: '行の先頭' },
  { char: '$', desc: '行の末尾' },
  { char: '\\d', desc: '数字 [0-9]' },
  { char: '\\w', desc: '英数字とアンダースコア [a-zA-Z0-9_]' },
  { char: '\\s', desc: '空白文字' },
  { char: '[abc]', desc: 'a, b, cのいずれか1文字' },
  { char: '[^abc]', desc: 'a, b, c以外の1文字' },
  { char: '(abc)', desc: 'グループ化' },
  { char: 'a|b', desc: 'aまたはb' },
  { char: '{n}', desc: '直前の文字のn回の繰り返し' },
  { char: '{n,m}', desc: '直前の文字のn回以上m回以下の繰り返し' },
]

// SEO設定
useSeoMeta({
  title: '正規表現テスター | Web開発ツール',
  description: 'リアルタイムで正規表現をテスト。マッチ結果のハイライト表示と置換機能。',
})
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        正規表現テスター
      </h1>
      <p class="text-muted-foreground">
        正規表現パターンをリアルタイムでテストできます。
      </p>
    </div>

    <!-- よく使うパターン -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>よく使うパターン</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="commonPattern in commonPatterns"
            :key="commonPattern.name"
            class="w-full text-left p-2 rounded hover:bg-muted transition-colors"
            @click="loadPattern(commonPattern)">
            <div class="font-medium text-sm">
              {{ commonPattern.name }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ commonPattern.description }}
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
    <div class="space-y-6 col-span-2">
      <!-- パターン入力 -->
      <Card>
        <CardHeader>
          <CardTitle>正規表現パターン</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <div class="flex gap-2">
              <span class="text-2xl text-muted-foreground">/</span>
              <Input
                v-model="pattern"
                placeholder="正規表現パターンを入力..."
                class="flex-1 font-mono"
                :class="{ 'border-destructive': error }" />
              <span class="text-2xl text-muted-foreground">/{{ flagString }}</span>
            </div>
            <div v-if="error" class="mt-2">
              <p class="text-sm text-destructive">
                {{ error }}
              </p>
            </div>
          </div>

          <!-- フラグ -->
          <div class="flex flex-wrap gap-4">
            <label v-for="(enabled, flag) in flags" :key="flag" class="flex items-center gap-2">
              <input
                v-model="flags[flag]"
                type="checkbox"
                class="rounded">
              <span class="text-sm">
                {{ flag }}
                <span class="text-muted-foreground">
                  {{
                    {
                      g: '(global)',
                      i: '(ignore case)',
                      m: '(multiline)',
                      s: '(dotAll)',
                      u: '(unicode)',
                      y: '(sticky)',
                    }[flag]
                  }}
                </span>
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      <!-- テスト文字列 -->
      <Card>
        <CardHeader>
          <CardTitle>テスト文字列</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="testString"
            placeholder="テストする文字列を入力..."
            class="w-full h-40 p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellcheck="false">
            </textarea>
        </CardContent>
      </Card>

      <!-- マッチ結果 -->
      <Card>
        <CardHeader>
          <CardTitle>
            マッチ結果
            <Badge v-if="matches.length > 0" class="ml-2">
              {{ matches.length }}件
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="testString && pattern">
            <!-- ハイライト表示 -->
            <div class="p-4 bg-muted rounded-md mb-4 font-mono text-sm whitespace-pre-wrap break-all" v-html="highlightedText"></div>

            <!-- マッチ詳細 -->
            <div v-if="matches.length > 0" class="space-y-3">
              <div
                v-for="(match, index) in matches"
                :key="index"
                class="p-3 border rounded-md space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">マッチ {{ index + 1 }}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="copyToClipboard(match.match)">
                    <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                  </Button>
                </div>
                <div class="space-y-1 text-sm">
                  <div>
                    <span class="text-muted-foreground">テキスト:</span>
                    <code class="ml-2 px-2 py-0.5 bg-muted rounded">{{ match.match }}</code>
                  </div>
                  <div>
                    <span class="text-muted-foreground">位置:</span>
                    <span class="ml-2">{{ match.index }}</span>
                  </div>
                  <div v-if="match.groups.length > 0">
                    <span class="text-muted-foreground">グループ:</span>
                    <span v-for="(group, gIndex) in match.groups" :key="gIndex" class="ml-2">
                      <code class="px-2 py-0.5 bg-muted rounded">{{ group || '(empty)' }}</code>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-muted-foreground">
              マッチする文字列が見つかりませんでした
            </div>
          </div>
          <div v-else class="text-center py-8 text-muted-foreground">
            パターンとテスト文字列を入力してください
          </div>
        </CardContent>
      </Card>

      <!-- 置換 -->
      <Card>
        <CardHeader>
          <CardTitle>置換</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">置換文字列</label>
            <Input
              v-model="replacementString"
              placeholder="置換する文字列 ($1, $2... でグループ参照)"
              class="font-mono" />
          </div>
          <div v-if="replacedString">
            <label class="text-sm font-medium mb-2 block">置換結果</label>
            <div class="p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap break-all">
              {{ replacedString }}
            </div>
            <Button
              class="mt-2"
              variant="outline"
              size="sm"
              @click="copyToClipboard(replacedString)">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
              コピー
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- クイックリファレンス -->
    <Card class="col-span-1">
      <CardHeader>
        <CardTitle>クイックリファレンス</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-1 text-sm">
          <div
            v-for="ref in references"
            :key="ref.char"
            class="flex justify-between py-1">
            <code class="font-mono">{{ ref.char }}</code>
            <span class="text-muted-foreground text-xs">{{ ref.desc }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
