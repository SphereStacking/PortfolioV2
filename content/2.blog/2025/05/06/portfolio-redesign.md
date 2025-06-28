---
title: "VitePressからNuxt Contentポートフォリオを段階的に進化させた話"
description: "VitePressで構築したポートフォリオサイトをNuxt Contentでリビルドし、さらにshadcn-vueでモダンなUIに刷新した開発記録。技術選定の理由と実装のポイントを解説。"
navigation: true
draft: false
created: 2025-05-06
updated: 
image: null
tags:
  - Nuxt
  - shadcn-vue
  - NuxtContent
  - ポートフォリオ
icons:
  - logos:nuxt-icon
  - simple-icons:shadcnui
---

## 🚀 はじめに

最初はVitePressで構築したポートフォリオサイトでしたが、コンテンツ管理の課題から、Nuxt Contentへ移行し、最終的にはshadcn-vueでUIを全面刷新しました。

この記事では、ポートフォリオサイトの変更の過程と、各段階での技術選定の理由、実装で工夫した点を共有します。

## 🎯 VitePressからの脱却

### VitePressの良かった点

実は、[VitePressベースのポートフォリオ](https://github.com/SphereStacking/Portfolio)にも多くの利点がありました：

- **シンプルな構築**: 決まったルールでマークダウンを書くだけで、美しい静的サイトが生成される
- **Vueコンポーネントの活用**: `.md`ファイル内でVueコンポーネントを使えるため、インタラクティブな要素も実装可能
- **高速なビルド**: Viteベースの高速なビルドシステム
- **軽量な成果物**: 静的サイトなので配信も高速

### 💡 移行を決意した理由

しかし、ポートフォリオサイトとして運用していく中で、以下のような要望が生まれました：

- **デザインの自由度**: VitePressのテーマシステムは素晴らしいが、ポートフォリオサイトとして独自のデザインを追求したくなった
- **Webアプリケーション機能**: 単なる静的サイトではなく、インタラクティブなツールや機能を組み込みたい
- **柔軟なページ構成**: ドキュメントサイトの枠を超えて、自由にページを設計したい
- **動的なコンテンツ管理**: ブログ記事やプロジェクトの管理をより柔軟に行いたい

### Nuxt Contentへの移行決定

これらの課題を解決するため、Nuxt Contentをベースにした新しいポートフォリオサイトの構築を決定しました。Nuxt Contentを選んだ理由は：

1. **CMS的なコンテンツ管理**: フロントマターでメタデータを管理し、マークダウンで本文を記述
2. **型安全なコンテンツクエリ**: TypeScriptとの親和性が高く、コンテンツの型定義が可能
3. **柔軟なルーティング**: 動的ルーティングとコンテンツの紐付けが簡単
4. **Vue 3エコシステム**: Nuxt 3の豊富なエコシステムを活用可能

## 🔧 第一段階：Nuxt Content + NuxtUIでの実装

### 初期実装の技術スタック

2025年5月上旬、以下の技術スタックで新しいポートフォリオサイトを構築しました：

- **フレームワーク**: Nuxt 3
- **コンテンツ管理**: @nuxt/content
- **UIライブラリ**: NuxtUI
- **スタイリング**: Tailwind CSS v3

### コンテンツ構造の設計

Nuxt Contentの機能を最大限活用するため、以下のようなコンテンツ構造を設計しました：

```
content/
├── 1.project/     # ポートフォリオプロジェクト
├── 2.blog/        # ブログ記事（年/月/日の階層構造）
├── 3.career/      # 職歴
└── 4.me/          # 個人情報（スキルセットなど）
```

### Nuxt Content v3のCollection APIを活用

従来の`queryContent()`ではなく、新しい`queryCollection()`を使用することで、より型安全なコンテンツ管理を実現しました。

```typescript
// ブログ記事一覧の取得
const { data } = await useAsyncData(() => 
  queryCollection('blog')
    .where('draft', '=', false)
    .order('created', 'DESC')
    .all()
)

// 個別記事の取得（パスベース）
const article = await queryCollection('blog')
  .path(articlePath)
  .first()

// プロジェクト一覧（条件付き）
const pinnedProjects = await queryCollection('project')
  .where('career_unique_code', 'IS NULL')
  .order('period_start', 'DESC')
  .all()
```

各コンテンツタイプには、`content.config.ts`で型定義を行い、フロントマターの構造を厳密に管理：

```markdown
---
title: "プロジェクトタイトル"
description: "プロジェクトの説明"
date: 2025-05-01
company: "会社名"
role: "担当役割"
stack:
  - Vue.js
  - TypeScript
  - Tailwind CSS
---
```

### NuxtUIでの初期UI実装

NuxtUIは、Tailwind CSSベースのコンポーネントライブラリで、以下の利点がありました：

- 豊富なプリセットコンポーネント
- ダークモード対応
- アクセシビリティへの配慮

しかし、実際に使ってみると、カスタマイズ性に課題を感じることになりました。

## ✨ 第二段階：shadcn-vueへの移行

### 🔒 UIライブラリのブラックボックス問題

業務でVuetifyを使用していて、常に感じていた課題がありました：

- **コンポーネントの挙動が不透明**: 内部実装がブラックボックスで、予期しない動作に遭遇することがある
- **カスタマイズの困難さ**: ドキュメントを何度も参照しないと、細かいUIカスタマイズができない
- **デバッグの難しさ**: 問題が発生した時、ライブラリ内部を調査するのが困難

NuxtUIはVuetifyよりもカスタマイズしやすかったものの、同じような制約を感じ始めていました。

### 💡 shadcn-vueとの出会い

そんな時に知ったのがshadcn-vueでした。このライブラリのアプローチにびっくりしました！

- **npm installしない**: コンポーネントを直接プロジェクトにコピーして使用
- **完全な可視性**: すべてのコンポーネントのソースコードが手元にある
- **自由なカスタマイズ**: 必要に応じてコンポーネントを直接編集できる

### スムーズな移行が可能だった理由

移行作業が比較的スムーズに進んだのには理由がありました：

1. **共通の基盤**: NuxtUIもshadcn-vueも内部でRadix UI（Vue版はReka UI）を使用
2. **Tailwind CSS**: 両方ともTailwind CSSベースなので、スタイリングの考え方が共通
3. **コンポーネントの類似性**: 基本的なコンポーネント構造が似ているため、置き換えが容易

### 移行の実施

```bash
# shadcn-vueの初期設定
npx shadcn-vue@latest init

# 必要なコンポーネントを順次追加
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
npx shadcn-vue@latest add navigation-menu
# ... 合計51個のコンポーネントを追加
```

各コンポーネントは`/components/ui/`ディレクトリに配置され、プロジェクトの一部として管理できるようになりました。

### Tailwind CSS v4への同時アップグレード

shadcn-vue移行と同時に、Tailwind CSS v4へのアップグレードも実施しました。

### コンポーネント移行の実装例

既存のNuxtUIコンポーネントをshadcn-vueへ移行した例：

```vue
<!-- Before: NuxtUI -->
<UButton color="primary" size="lg">
  Click me
</UButton>

<!-- After: shadcn-vue -->
<Button variant="default" size="lg">
  Click me
</Button>
```

カラーモードの切り替えも、カスタムcomposableで実装：

```typescript
// composables/useColorMode.ts
export const useColorMode = () => {
  const colorMode = useState<'light' | 'dark'>('color-mode', () => 'light')
  
  const toggleColorMode = () => {
    colorMode.value = colorMode.value === 'light' ? 'dark' : 'light'
  }
  
  return { colorMode: readonly(colorMode), toggleColorMode }
}
```



## 📊 ビフォーアフターの比較

### デザインの自由度

VitePressからの移行で最も大きく変わったのは、デザインの自由度でした：

### Before (VitePress)
- VitePressの標準的なドキュメントサイトデザイン
- 誰が見ても「VitePressで作られたサイト」とわかる見た目
- テーマのカスタマイズに制限があり、独自性を出しにくい

### After (Nuxt + shadcn-vue)
- 完全にオリジナルなデザインを実現
- ポートフォリオサイトとしての独自性を表現
- 細部まで自分好みにカスタマイズ可能

### 機能面での進化

静的サイトからWebアプリケーションへの移行により、以下が可能になりました：

- **動的なコンテンツ表示**: フィルタリングやソート機能の実装
- **インタラクティブな要素**: アニメーションや動的なUI要素
- **リアルタイムプレビュー**: 開発中の変更が即座に反映
- **柔軟なルーティング**: 複雑なページ構造にも対応

## 🚀 今後の展望

現在のポートフォリオサイトは、当初の目標であった「CMSライクなコンテンツ管理」を実現できました。

今後は以下の機能追加を予定：

1. **国際化対応**: 英語版の追加
2. **検索機能**: コンテンツ全文検索
3. **アナリティクス**: プライバシーに配慮した訪問者分析

## 📝 まとめ

VitePressからNuxt Content、そしてshadcn-vueへと段階的に進化させたポートフォリオサイト。各段階での課題を解決しながら、最終的に以下を実現しました：

- **柔軟なコンテンツ管理**: Nuxt Contentによる型安全なCMS機能
- **モダンなUI**: shadcn-vueによる完全カスタマイズ可能なコンポーネント
- **Webアプリケーション化**: 静的サイトからインタラクティブなWebアプリへ進化
- **優れたパフォーマンス**: コード分割と最適化による高速な読み込み

技術選定に正解はありませんが、要件に応じて適切な技術を選び、段階的に改善していくことの重要性を実感しました。

ソースコードは[GitHub](https://github.com/SphereStacking/PortfolioV2)で公開していますので、参考にしていただければ幸いです。

## 🔗 参考リンク

- [Nuxt Content 公式ドキュメント](https://content.nuxt.com/)
- [shadcn-vue 公式サイト](https://www.shadcn-vue.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [VitePress](https://vitepress.dev/)
