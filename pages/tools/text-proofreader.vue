<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const inputText = ref('')
const checkedText = ref('')
const errors = ref<ProofreadError[]>([])
const processing = ref(false)
const activeErrorIndex = ref(-1)

// 設定
const checkOptions = ref({
  typo: true, // 誤字脱字
  consistency: true, // 表記ゆれ
  punctuation: true, // 句読点
  spacing: true, // スペース
  duplicate: true, // 重複表現
  style: true, // 文体統一
})

interface ProofreadError {
  id: string
  type: 'typo' | 'consistency' | 'punctuation' | 'spacing' | 'duplicate' | 'style'
  start: number
  end: number
  message: string
  suggestion?: string
  severity: 'error' | 'warning' | 'info'
}

// 校正ルール定義
const proofreadRules = {
  // 誤字脱字パターン
  typo: [
    { pattern: /取り合えず/g, suggestion: 'とりあえず', message: '「取り合えず」→「とりあえず」' },
    { pattern: /頂く/g, suggestion: 'いただく', message: '「頂く」→「いただく」（補助動詞はひらがな）' },
    { pattern: /下さい/g, suggestion: 'ください', message: '「下さい」→「ください」（補助動詞はひらがな）' },
    { pattern: /出来る/g, suggestion: 'できる', message: '「出来る」→「できる」' },
    { pattern: /分かる/g, suggestion: 'わかる', message: '「分かる」→「わかる」' },
    { pattern: /[こそあど]れ等/g, suggestion: 'これら', message: '「○○等」→「○○ら」' },
  ],

  // 表記ゆれパターン
  consistency: [
    { patterns: [/Web/g, /WEB/g, /web/g], standard: 'Web', message: 'Webの表記を統一' },
    { patterns: [/E-mail/g, /Email/g, /e-mail/g], standard: 'メール', message: 'メールの表記を統一' },
    { patterns: [/サーバー/g, /サーバ/g], standard: 'サーバー', message: 'サーバーの表記を統一' },
    { patterns: [/ユーザー/g, /ユーザ/g], standard: 'ユーザー', message: 'ユーザーの表記を統一' },
    { patterns: [/既に/g, /すでに/g], standard: 'すでに', message: '「既に/すでに」の表記を統一' },
  ],

  // 句読点ルール
  punctuation: [
    { pattern: /。。/g, suggestion: '。', message: '句点の重複' },
    { pattern: /、、/g, suggestion: '、', message: '読点の重複' },
    { pattern: /。\s*。/g, suggestion: '。', message: '句点の重複' },
    { pattern: /、\s*、/g, suggestion: '、', message: '読点の重複' },
    { pattern: /！！/g, suggestion: '！', message: '感嘆符の重複' },
    { pattern: /？？/g, suggestion: '？', message: '疑問符の重複' },
  ],

  // スペースルール
  spacing: [
    { pattern: /([ぁ-ん])\s+([ぁ-ん])/g, suggestion: '$1$2', message: 'ひらがな間の不要なスペース' },
    { pattern: /([ァ-ヶ])\s+([ァ-ヶ])/g, suggestion: '$1$2', message: 'カタカナ間の不要なスペース' },
    { pattern: /([一-龥])\s+([一-龥])/g, suggestion: '$1$2', message: '漢字間の不要なスペース' },
    { pattern: /\u3000/g, suggestion: ' ', message: '全角スペースを半角スペースに' },
  ],

  // 重複表現
  duplicate: [
    { pattern: /頭痛が痛/g, suggestion: '頭が痛い', message: '重複表現：「頭痛が痛い」' },
    { pattern: /違和感を感じ/g, suggestion: '違和感を覚え', message: '重複表現：「違和感を感じる」' },
    { pattern: /まず最初に/g, suggestion: 'まず', message: '重複表現：「まず最初に」' },
    { pattern: /一番最初/g, suggestion: '最初', message: '重複表現：「一番最初」' },
    { pattern: /各々/g, suggestion: 'それぞれ', message: '「各々」→「それぞれ」' },
  ],

  // 文体統一
  style: [
    { pattern: /です。.*?だ。/g, message: '文体の不統一（です・ます調とだ・である調の混在）', severity: 'warning' },
    { pattern: /ます。.*?である。/g, message: '文体の不統一（です・ます調とだ・である調の混在）', severity: 'warning' },
  ],
}

// 文章校正実行
const checkText = () => {
  if (!inputText.value) {
    errors.value = []
    checkedText.value = ''
    return
  }

  processing.value = true
  errors.value = []
  checkedText.value = inputText.value
  let errorId = 0

  try {
    // 誤字脱字チェック
    if (checkOptions.value.typo) {
      proofreadRules.typo.forEach((rule) => {
        const matches = [...inputText.value.matchAll(rule.pattern)]
        matches.forEach((match) => {
          if (match.index !== undefined) {
            errors.value.push({
              id: `error-${errorId++}`,
              type: 'typo',
              start: match.index,
              end: match.index + match[0].length,
              message: rule.message,
              suggestion: rule.suggestion,
              severity: 'error',
            })
          }
        })
      })
    }

    // 表記ゆれチェック
    if (checkOptions.value.consistency) {
      proofreadRules.consistency.forEach((rule) => {
        const foundVariants: string[] = []
        rule.patterns.forEach((pattern) => {
          if (pattern.test(inputText.value)) {
            const match = inputText.value.match(pattern)
            if (match) foundVariants.push(match[0])
          }
        })

        if (foundVariants.length > 1) {
          rule.patterns.forEach((pattern) => {
            const matches = [...inputText.value.matchAll(pattern)]
            matches.forEach((match) => {
              if (match.index !== undefined && match[0] !== rule.standard) {
                errors.value.push({
                  id: `error-${errorId++}`,
                  type: 'consistency',
                  start: match.index,
                  end: match.index + match[0].length,
                  message: rule.message,
                  suggestion: rule.standard,
                  severity: 'warning',
                })
              }
            })
          })
        }
      })
    }

    // 句読点チェック
    if (checkOptions.value.punctuation) {
      proofreadRules.punctuation.forEach((rule) => {
        const matches = [...inputText.value.matchAll(rule.pattern)]
        matches.forEach((match) => {
          if (match.index !== undefined) {
            errors.value.push({
              id: `error-${errorId++}`,
              type: 'punctuation',
              start: match.index,
              end: match.index + match[0].length,
              message: rule.message,
              suggestion: rule.suggestion,
              severity: 'error',
            })
          }
        })
      })
    }

    // スペースチェック
    if (checkOptions.value.spacing) {
      proofreadRules.spacing.forEach((rule) => {
        const matches = [...inputText.value.matchAll(rule.pattern)]
        matches.forEach((match) => {
          if (match.index !== undefined) {
            errors.value.push({
              id: `error-${errorId++}`,
              type: 'spacing',
              start: match.index,
              end: match.index + match[0].length,
              message: rule.message,
              suggestion: match[0].replace(rule.pattern, rule.suggestion!),
              severity: 'info',
            })
          }
        })
      })
    }

    // 重複表現チェック
    if (checkOptions.value.duplicate) {
      proofreadRules.duplicate.forEach((rule) => {
        const matches = [...inputText.value.matchAll(rule.pattern)]
        matches.forEach((match) => {
          if (match.index !== undefined) {
            errors.value.push({
              id: `error-${errorId++}`,
              type: 'duplicate',
              start: match.index,
              end: match.index + match[0].length,
              message: rule.message,
              suggestion: rule.suggestion,
              severity: 'warning',
            })
          }
        })
      })
    }

    // 文体チェック
    if (checkOptions.value.style) {
      proofreadRules.style.forEach((rule) => {
        const matches = [...inputText.value.matchAll(rule.pattern)]
        matches.forEach((match) => {
          if (match.index !== undefined) {
            errors.value.push({
              id: `error-${errorId++}`,
              type: 'style',
              start: match.index,
              end: match.index + match[0].length,
              message: rule.message,
              severity: rule.severity as 'warning',
            })
          }
        })
      })
    }

    // エラーをソート（位置順）
    errors.value.sort((a, b) => a.start - b.start)

    toast({
      title: '校正完了',
      description: `${errors.value.length}件の指摘事項が見つかりました`,
    })
  }
  catch (err) {
    console.error('Proofreading error:', err)
    toast({
      title: 'エラー',
      description: '校正処理中にエラーが発生しました',
      variant: 'destructive',
    })
  }
  finally {
    processing.value = false
  }
}

// エラーハイライト付きテキスト生成
const highlightedText = computed(() => {
  if (!inputText.value || errors.value.length === 0) return inputText.value

  let html = ''
  let lastIndex = 0

  errors.value.forEach((error, index) => {
    // エラー前のテキスト
    html += escapeHtml(inputText.value.slice(lastIndex, error.start))

    // エラー部分
    const isActive = index === activeErrorIndex.value
    const className = `error-highlight error-${error.type} ${isActive ? 'active' : ''}`
    html += `<span class="${className}" data-index="${index}">${escapeHtml(inputText.value.slice(error.start, error.end))}</span>`

    lastIndex = error.end
  })

  // 残りのテキスト
  html += escapeHtml(inputText.value.slice(lastIndex))

  return html
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

// エラー修正
const fixError = (error: ProofreadError) => {
  if (!error.suggestion) return

  const before = inputText.value.slice(0, error.start)
  const after = inputText.value.slice(error.end)
  inputText.value = before + error.suggestion + after

  // 再校正
  checkText()
}

// 全エラー一括修正
const fixAllErrors = () => {
  let offset = 0
  const sortedErrors = [...errors.value].sort((a, b) => a.start - b.start)

  sortedErrors.forEach((error) => {
    if (error.suggestion) {
      const adjustedStart = error.start + offset
      const adjustedEnd = error.end + offset

      const before = inputText.value.slice(0, adjustedStart)
      const after = inputText.value.slice(adjustedEnd)
      inputText.value = before + error.suggestion + after

      offset += error.suggestion.length - (error.end - error.start)
    }
  })

  // 再校正
  checkText()
}

// エラータイプの日本語名
const errorTypeNames = {
  typo: '誤字脱字',
  consistency: '表記ゆれ',
  punctuation: '句読点',
  spacing: 'スペース',
  duplicate: '重複表現',
  style: '文体',
}

// エラー重要度のアイコン
const severityIcons = {
  error: 'heroicons:exclamation-circle',
  warning: 'heroicons:exclamation-triangle',
  info: 'heroicons:information-circle',
}

// エラー重要度の色
const severityColors = {
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

// サンプルテキスト
const sampleTexts = [
  {
    name: 'ビジネス文書',
    text: 'お世話になっております。先日は会議に参加頂き、有難うございました。取り合えず、資料を送付いたします。ご確認下さい。Web サイトの更新とサーバの設定について、既に対応済みです。違和感を感じる箇所がございましたら、ご連絡ください。',
  },
  {
    name: '技術文書',
    text: 'このシステムはWebアプリケーションです。サーバー側はNode.jsで構築されており、データベースにはMySQLを使用しています。ユーザはブラウザからアクセスできる。セキュリティ対策も万全である。まず最初に、ログイン画面が表示されます。',
  },
  {
    name: 'ブログ記事',
    text: '今日は頭痛が痛くて大変でした。。朝から違和感を感じていたのですが、、午後になって更に悪化しました！！薬を飲んだら少し楽になりました。明日は　元気に　なれると　いいです。皆様も体調には気を付けて下さい。',
  },
]

// 統計情報
const statistics = computed(() => {
  const stats = {
    total: errors.value.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
  }

  errors.value.forEach((error) => {
    stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
    stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
  })

  return stats
})

// テキスト変更時に自動校正（デバウンス付き）
const checkTimeoutId = ref<NodeJS.Timeout>()
watch(inputText, () => {
  if (checkTimeoutId.value) {
    clearTimeout(checkTimeoutId.value)
  }
  checkTimeoutId.value = setTimeout(() => {
    if (inputText.value) {
      checkText()
    }
  }, 1000)
})

// クリア
const clearAll = () => {
  inputText.value = ''
  checkedText.value = ''
  errors.value = []
  activeErrorIndex.value = -1
}

// Toast
const { toast } = useToast()

// SEO設定
useSeoMeta({
  title: '文章校正ツール | Web開発ツール',
  description: '日本語の誤字脱字・表記ゆれをチェック。文章の品質向上をサポート。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        文章校正ツール
      </h1>
      <p class="text-muted-foreground">
        日本語文章の誤字脱字・表記ゆれを自動チェックします。
      </p>
    </div>

    <!-- 校正オプション -->
    <Card>
      <CardHeader>
        <CardTitle>校正設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label
            v-for="(label, key) in errorTypeNames"
            :key="key"
            class="flex items-center gap-2">
            <input
              v-model="checkOptions[key]"
              type="checkbox"
              class="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary focus:ring-offset-0">
            <span class="text-sm">{{ label }}</span>
          </label>
        </div>
      </CardContent>
    </Card>

    <!-- サンプルテキスト -->
    <Card>
      <CardHeader>
        <CardTitle>サンプルテキスト</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleTexts"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="inputText = sample.text">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 入力エリア -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>入力テキスト</CardTitle>
            <Button
              v-if="inputText"
              size="sm"
              variant="ghost"
              @click="clearAll">
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="inputText"
            placeholder="校正したい文章を入力してください"
            class="w-full h-96 p-3 text-sm border rounded-md bg-background resize-none"
            spellcheck="false"></textarea>

          <div class="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{{ inputText.length }} 文字</span>
            <Button
              size="sm"
              :disabled="!inputText || processing"
              @click="checkText">
              <Icon v-if="processing" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
              校正実行
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 校正結果 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>校正結果</CardTitle>
            <Button
              v-if="errors.length > 0"
              size="sm"
              variant="outline"
              @click="fixAllErrors">
              <Icon name="heroicons:wrench" class="w-4 h-4 mr-2" />
              全て修正
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            class="prose-content h-96 p-3 text-sm border rounded-md bg-background overflow-auto"
            v-html="highlightedText"></div>

          <div class="mt-4">
            <p class="text-sm font-medium mb-2">
              統計情報
            </p>
            <div class="flex flex-wrap gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">合計:</span>
                <span class="ml-1 font-medium">{{ statistics.total }}件</span>
              </div>
              <div v-for="(count, severity) in statistics.bySeverity" :key="severity">
                <Icon :name="severityIcons[severity]" :class="`w-4 h-4 inline ${severityColors[severity]}`" />
                <span class="ml-1">{{ count }}件</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- エラー詳細 -->
    <Card v-if="errors.length > 0">
      <CardHeader>
        <CardTitle>指摘事項一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(error, index) in errors"
            :key="error.id"
            class="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            :class="{ 'bg-muted': index === activeErrorIndex }"
            @click="activeErrorIndex = index">
            <div class="flex items-start gap-3">
              <Icon
                :name="severityIcons[error.severity]"
                :class="`w-5 h-5 mt-0.5 flex-shrink-0 ${severityColors[error.severity]}`" />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Badge variant="outline" class="text-xs">
                    {{ errorTypeNames[error.type] }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    位置: {{ error.start }}
                  </span>
                </div>
                <p class="text-sm mb-1">
                  {{ error.message }}
                </p>
                <div class="flex items-center gap-2">
                  <code class="text-xs bg-muted px-1 py-0.5 rounded">
                    {{ inputText.slice(error.start, error.end) }}
                  </code>
                  <Icon v-if="error.suggestion" name="heroicons:arrow-right" class="w-3 h-3 text-muted-foreground" />
                  <code v-if="error.suggestion" class="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                    {{ error.suggestion }}
                  </code>
                </div>
                <Button
                  v-if="error.suggestion"
                  size="sm"
                  variant="ghost"
                  class="mt-2"
                  @click.stop="fixError(error)">
                  <Icon name="heroicons:check" class="w-3 h-3 mr-1" />
                  修正
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>校正ルールについて</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              チェック項目
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>誤字脱字:</strong> よくある誤字や不適切な漢字使用</li>
              <li><strong>表記ゆれ:</strong> 同じ意味の言葉の表記統一</li>
              <li><strong>句読点:</strong> 句読点の重複や誤用</li>
              <li><strong>スペース:</strong> 不要なスペースや全角スペース</li>
              <li><strong>重複表現:</strong> 意味が重複する冗長な表現</li>
              <li><strong>文体統一:</strong> です・ます調とだ・である調の混在</li>
            </ul>
          </div>
          <Alert>
            <Icon name="heroicons:information-circle" class="w-4 h-4" />
            <AlertDescription>
              このツールは基本的なルールベースの校正のみ行います。
              文脈を考慮した高度な校正には対応していません。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* エラーハイライト */
:deep(.error-highlight) {
  padding: 0 2px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.error-typo) {
  background-color: rgba(239, 68, 68, 0.2);
  border-bottom: 2px solid rgb(239, 68, 68);
}

:deep(.error-consistency) {
  background-color: rgba(245, 158, 11, 0.2);
  border-bottom: 2px solid rgb(245, 158, 11);
}

:deep(.error-punctuation) {
  background-color: rgba(239, 68, 68, 0.2);
  border-bottom: 2px solid rgb(239, 68, 68);
}

:deep(.error-spacing) {
  background-color: rgba(59, 130, 246, 0.2);
  border-bottom: 2px solid rgb(59, 130, 246);
}

:deep(.error-duplicate) {
  background-color: rgba(245, 158, 11, 0.2);
  border-bottom: 2px solid rgb(245, 158, 11);
}

:deep(.error-style) {
  background-color: rgba(245, 158, 11, 0.2);
  border-bottom: 2px solid rgb(245, 158, 11);
}

:deep(.error-highlight.active) {
  background-color: rgba(99, 102, 241, 0.3);
  border-color: rgb(99, 102, 241);
}

:deep(.error-highlight:hover) {
  background-color: rgba(99, 102, 241, 0.2);
}

.prose-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>
