<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  layout: 'tools',
})

const { copy } = useClipboard()
const { toast } = useToast()

const markdownInput = ref('')
const htmlOutput = ref('')
const previewMode = ref<'html' | 'preview'>('preview')
const includeStyles = ref(true)
const syntaxHighlight = ref(true)

// 簡易的なMarkdownパーサー（実際のプロジェクトではmarked.jsやmarkdown-itを使用推奨）
const parseMarkdown = (markdown: string): string => {
  let html = markdown

  // エスケープ処理
  const escapeHtml = (text: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
    }
    return text.replace(/[&<>"']/g, m => map[m])
  }

  // コードブロック
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>`
  })

  // インラインコード
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 見出し
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // 太字と斜体
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // リンク
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // 画像
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // リスト
  html = html.replace(/^\* (.+)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  html = html.replace(/^\d+\. (.+)/gm, '<li>$1</li>')

  // 引用
  html = html.replace(/^> (.+)/gm, '<blockquote>$1</blockquote>')

  // 水平線
  html = html.replace(/^---$/gm, '<hr>')

  // 段落
  html = html.replace(/\n\n/g, '</p><p>')
  html = '<p>' + html + '</p>'

  // 空の段落を削除
  html = html.replace(/<p>\s*<\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<pre>)/g, '$1')
  html = html.replace(/(<\/pre>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>)/g, '$1')
  html = html.replace(/(<\/ul>)<\/p>/g, '$1')
  html = html.replace(/<p>(<blockquote>)/g, '$1')
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1')
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1')

  // スタイルを追加
  if (includeStyles.value) {
    const styles = `<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
h3 { font-size: 1.25em; }
code {
  background-color: rgba(27,31,35,0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 85%;
}
pre {
  background-color: #f6f8fa;
  padding: 16px;
  overflow: auto;
  border-radius: 6px;
  line-height: 1.45;
}
pre code {
  background-color: transparent;
  padding: 0;
}
blockquote {
  border-left: 4px solid #dfe2e5;
  padding: 0 1em;
  color: #6a737d;
  margin: 16px 0;
}
ul, ol {
  padding-left: 2em;
  margin: 16px 0;
}
hr {
  border: 0;
  height: 1px;
  background: #e1e4e8;
  margin: 24px 0;
}
a {
  color: #0366d6;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
img {
  max-width: 100%;
  height: auto;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}
table th,
table td {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}
table th {
  background-color: #f6f8fa;
  font-weight: 600;
}
table tr:nth-child(2n) {
  background-color: #f6f8fa;
}
</style>
`
    html = styles + html
  }

  return html
}

// Markdownを変換
const convertMarkdown = () => {
  if (!markdownInput.value.trim()) {
    htmlOutput.value = ''
    return
  }

  htmlOutput.value = parseMarkdown(markdownInput.value)
}

// サンプルMarkdown
const sampleMarkdown = [
  {
    name: '基本的な書式',
    content: `# 見出し1
## 見出し2
### 見出し3

これは**太字**のテキストです。
これは*斜体*のテキストです。
これは***太字の斜体***のテキストです。

> これは引用文です。
> 複数行の引用も可能です。

---

[リンクのテキスト](https://example.com)
![画像の説明](https://via.placeholder.com/150)`,
  },
  {
    name: 'リスト',
    content: `## 順序なしリスト
* 項目1
* 項目2
  * ネストした項目
  * もう一つのネスト
* 項目3

## 順序付きリスト
1. 最初の項目
2. 次の項目
3. 最後の項目`,
  },
  {
    name: 'コードブロック',
    content: `## インラインコード
\`const greeting = "Hello, World!";\`のように書きます。

## コードブロック
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

\`\`\`python
def hello_world():
    print("Hello, World!")
    
hello_world()
\`\`\``,
  },
  {
    name: 'READMEサンプル',
    content: `# プロジェクト名

プロジェクトの簡単な説明をここに書きます。

## 機能

* 高速な処理
* 使いやすいインターフェース
* 豊富なカスタマイズオプション

## インストール

\`\`\`bash
npm install my-awesome-package
\`\`\`

## 使い方

\`\`\`javascript
import { awesomeFunction } from 'my-awesome-package';

const result = awesomeFunction('Hello');
console.log(result);
\`\`\`

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## ライセンス

[MIT](https://choosealicense.com/licenses/mit/)`,
  },
]

const loadSample = (sample: typeof sampleMarkdown[0]) => {
  markdownInput.value = sample.content
  convertMarkdown()
}

// HTMLをコピー
const copyHtml = async () => {
  if (!htmlOutput.value) return

  await copy(htmlOutput.value)
  toast({
    title: 'コピーしました',
    description: 'HTMLをクリップボードにコピーしました',
  })
}

// HTMLをダウンロード
const downloadHtml = () => {
  if (!htmlOutput.value) return

  const blob = new Blob([htmlOutput.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  toast({
    title: 'ダウンロード完了',
    description: 'HTMLファイルをダウンロードしました',
  })
}

// 自動変換
watch([markdownInput, includeStyles], () => {
  convertMarkdown()
})

// SEO設定
useSeoMeta({
  title: 'Markdown → HTML Converter | Web開発ツール',
  description: 'MarkdownをHTMLに変換・プレビュー。スタイル付きHTMLの生成も可能。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        Markdown → HTML Converter
      </h1>
      <p class="text-muted-foreground">
        MarkdownをHTMLに変換・プレビュー。ドキュメントやブログ記事の作成に便利。
      </p>
    </div>

    <!-- サンプル -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>サンプルMarkdown</CardTitle>
        <CardDescription>
          よく使われるMarkdownパターンを選択できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sample in sampleMarkdown"
            :key="sample.name"
            variant="outline"
            size="sm"
            @click="loadSample(sample)">
            {{ sample.name }}
          </Button>
        </div>
      </CardContent>
    </Card>
    <!-- Markdown入力 -->
    <Card>
      <CardHeader>
        <CardTitle>Markdown入力</CardTitle>
        <CardDescription>
          Markdown記法で記述してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <textarea
          v-model="markdownInput"
          class="w-full h-[500px] p-3 rounded-md border bg-background font-mono text-sm resize-y"
          placeholder="# 見出し&#10;&#10;**太字**のテキスト"></textarea>
      </CardContent>
    </Card>

    <!-- 出力 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>出力</CardTitle>
            <CardDescription>
              {{ previewMode === 'html' ? 'HTMLコード' : 'プレビュー' }}
            </CardDescription>
          </div>
          <div class="flex gap-2">
            <div class="flex rounded-md border">
              <button
                :class="[
                  'px-3 py-1 text-sm transition-colors',
                  previewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                ]"
                @click="previewMode = 'preview'">
                プレビュー
              </button>
              <button
                :class="[
                  'px-3 py-1 text-sm transition-colors',
                  previewMode === 'html' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                ]"
                @click="previewMode = 'html'">
                HTML
              </button>
            </div>
            <Button
              v-if="htmlOutput"
              size="sm"
              variant="outline"
              @click="copyHtml">
              <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
            </Button>
            <Button
              v-if="htmlOutput"
              size="sm"
              variant="outline"
              @click="downloadHtml">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2">
            <input
              v-model="includeStyles"
              type="checkbox"
              class="rounded">
            <span class="text-sm">スタイルシートを含める</span>
          </label>

          <label class="flex items-center gap-2">
            <input
              v-model="syntaxHighlight"
              type="checkbox"
              class="rounded"
              disabled>
            <span class="text-sm text-muted-foreground">シンタックスハイライト (開発中)</span>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-[500px] overflow-auto">
          <!-- HTMLコード表示 -->
          <div v-if="previewMode === 'html'" class="h-full">
            <pre class="p-3 bg-muted rounded-md text-sm h-full overflow-auto"><code>{{ htmlOutput || 'Markdownを入力するとHTMLが表示されます' }}</code></pre>
          </div>

          <!-- プレビュー表示 -->
          <div v-else class="prose prose-sm max-w-none dark:prose-invert">
            <div v-if="htmlOutput" v-html="htmlOutput"></div>
            <div v-else class="text-muted-foreground text-center py-12">
              Markdownを入力するとプレビューが表示されます
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Markdownチートシート -->
    <Card class="col-span-full">
      <CardHeader>
        <CardTitle>Markdownチートシート</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 class="font-semibold mb-2">
              見出し
            </h4>
            <pre class="bg-muted p-2 rounded text-xs">
# 見出し1
## 見出し2
### 見出し3</pre>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              強調
            </h4>
            <pre class="bg-muted p-2 rounded text-xs">
**太字**
*斜体*
***太字の斜体***</pre>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              リンクと画像
            </h4>
            <pre class="bg-muted p-2 rounded text-xs">
[リンクテキスト](URL)
![代替テキスト](画像URL)</pre>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              リスト
            </h4>
            <pre class="bg-muted p-2 rounded text-xs">
* 項目1
* 項目2

1. 番号付き
2. リスト</pre>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              引用とコード
            </h4>
            <pre class="bg-muted p-2 rounded text-xs">
> 引用文

`インラインコード`

```
コードブロック
```</pre>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              その他
            </h4>
            <pre class="bg-muted p-2 rounded text-xs">
---
(水平線)</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
