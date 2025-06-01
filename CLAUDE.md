# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code)へのガイダンスを提供します。

## 開発コマンド

```bash
# HMR付き開発サーバー
npm run dev

# 本番ビルド
npm run build

# 静的サイト生成
npm run generate

# 本番ビルドのプレビュー
npm run preview

# コードのLint
npm run lint

# Lintの自動修正
npm run lint:fix
```

## アーキテクチャ概要

これはコンテンツ管理機能を備えたNuxt 3ポートフォリオウェブサイトです。現在、UIフレームワークをNuxtUIからshadcn-vueへ移行中です。

### 主要技術
- **フレームワーク**: TypeScript付きNuxt 3
- **UIコンポーネント**: shadcn-vue（NuxtUIから移行中）
- **スタイリング**: Tailwind CSS v4
- **3Dグラフィックス**: @tresjs/nuxt経由のThree.js
- **コンテンツ**: マークダウンベースの@nuxt/content
- **アニメーション**: motion-vとtweakpane

### コンテンツ構造
コンテンツは`/content/`以下のコレクションで整理されています：
- **blog**: フロントマター付き記事（title、description、date、published、tags、icons）
- **career**: 職歴エントリー
- **project**: 詳細なメタデータ付きポートフォリオプロジェクト（date、company、role、description、stack）
- **me**: 個人情報と技術スタック（JSONファイル）

### コンポーネント構成
- **UIコンポーネント**: shadcn-vueパターンに従った`/components/ui/`に配置
- **機能コンポーネント**: ドメイン別に整理（career/、project/、content/）
- **Composables**: `/composables/`内のカスタムVue composables
- **ストア**: `/stores/`内の状態管理（必要に応じて）

### 現在の移行状況
プロジェクトはNuxtUIからshadcn-vueへ移行中です。UIコンポーネントを扱う際は：
1. `/components/ui/`からshadcn-vueコンポーネントを使用
2. New Yorkスタイルテーマ設定に従う
3. CSS変数でZincを基本色として使用
4. 既存のshadcn-vueコンポーネントとの一貫性を保つ

### 重要なパターン
- カラーモードサポートは`/components/modules/colorMode/`のカスタムモジュールで実装
- OG画像は`/components/OgImage/`のコンポーネントを使用して生成
- 3Dアニメーションは`/components/Art/partial/`のカスタムcomposablesを使用
- コンテンツクエリは`content.config.ts`で定義された型付きコレクションを使用すべき

## 開発ガイドライン

### Composablesの実装方針
- **VueUseを優先的に使用**: カスタムcomposableを実装する前に、VueUseに同等の機能があるか確認すること
- VueUseで利用可能な主要なcomposables:
  - `useClipboard` - クリップボード操作（`useCopyToClipboard`の代替）
  - `useLocalStorage` / `useSessionStorage` - ストレージ操作
  - `useDark` - ダークモード管理
  - `useDebounce` / `useThrottle` - パフォーマンス最適化
  - `useFetch` - データフェッチング
  - その他多数のユーティリティ
- カスタム実装が必要な場合のみ、プロジェクト固有のcomposableを作成

## Gitコミットルール

このプロジェクトでは絵文字を使用した日本語コミットメッセージを採用しています：

### よく使う絵文字
- ✨ 新機能の追加
- 🎨 UI/スタイルの改善
- 📝 ドキュメントの追加・更新
- 🐛 バグ修正
- ♻️ リファクタリング
- 🔧 設定ファイルの変更
- ➕ 依存関係の追加
- ➖ 依存関係の削除
- 🚚 ファイルの移動・リネーム
- 🔥 コードやファイルの削除
- ⚡ パフォーマンス改善
- 🔒 セキュリティ修正
- 🚧 作業中
- ✅ テストの追加・修正

### コミットメッセージの例
```
✨ shadcn-vue の導入
🎨 レスポンシブデザインを改善
📝 Git ブランチ戦略のドキュメントを追加
```
