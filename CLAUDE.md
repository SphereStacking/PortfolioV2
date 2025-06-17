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
3. CSS変数でZincを基本色として使用（`/assets/css/tailwind.css`参照）
4. 既存のshadcn-vueコンポーネントとの一貫性を保つ

### 重要なパターン
- カラーモードサポートは`/components/modules/colorMode/`のカスタムモジュールで実装
- OG画像は`/components/OgImage/`のコンポーネントを使用して生成
- 3Dアニメーションは`/components/Art/partial/`のカスタムcomposablesを使用
- コンテンツクエリは`content.config.ts`で定義された型付きコレクションを使用すべき

## 開発ガイドライン

### コード実装後の必須作業
- **Lintの実行**: コード実装完了後、必ず `npm run lint:fix` を実行してコードを整形する

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

### スタイリングガイドライン
- **Tailwind CSSの使用方法**:
  - `@apply`ディレクティブは使用しない
  - すべてのTailwindクラスはテンプレート内で直接使用する
  - 再利用可能なスタイルはVueコンポーネントとして抽出する
  - 動的なクラスの組み合わせにはcn()ユーティリティを使用する

- **スタイリングの優先順位**:
  1. **Tailwindクラスを最優先**: 基本的なスタイリングはすべてTailwindクラスで実装
  2. **CSSの使用は最小限に**: 以下の場合のみCSSを使用
     - 複雑なアニメーション（キーフレーム、トランジション）
     - 擬似要素（::before、::after）を使った装飾
     - Tailwindで表現できない特殊なスタイル
  3. **スタイルはコンポーネントに閉じ込める**: グローバルCSSは避け、scopedスタイルを使用

- **テーマ色の使用**:
  - **テーマ変数の参照**: `/assets/css/tailwind.css`に定義されているCSS変数を使用
  - **セマンティックな色を優先**: 直接的な色指定（例：`text-gray-500`）ではなく、テーマ変数を使用
    - `text-foreground` / `bg-background` - 基本的なテキストと背景
    - `text-muted-foreground` / `bg-muted` - 二次的なテキストと背景
    - `border` / `ring` - ボーダーとフォーカスリング
    - `bg-primary` / `text-primary-foreground` - プライマリアクション
    - `bg-secondary` / `text-secondary-foreground` - セカンダリ要素
    - `bg-destructive` / `text-destructive-foreground` - 削除・エラー
  - **Zinc色の使用**: グレースケールが必要な場合は`gray`ではなく`zinc`を使用
  - **ダークモード対応**: `dark:`プレフィックスは不要（CSS変数が自動対応）
  - **shadcn-vueのガイドライン**: [shadcn-vue](https://www.shadcn-vue.com/)のコンポーネント実装パターンに従う

## Git運用ルール

### ブランチ戦略
- **メインブランチ**: `main` - 常に本番環境にデプロイ可能な状態を保つ
- **機能ブランチ**: `feature/機能名` または `claude/issue-番号` - 新機能開発用
- **修正ブランチ**: `fix/修正内容` - バグ修正用

### mainブランチの取り込み方法
履歴をきれいに保つため、以下の手順で`rebase`を使用：

```bash
# 1. 現在の変更をコミット
git add .
git commit -m "作業内容"

# 2. mainブランチの最新を取得
git fetch origin main

# 3. rebaseでmainブランチの変更を取り込む
git rebase origin/main

# 4. コンフリクトがある場合は解決してcontinue
git add .
git rebase --continue

# 5. リモートにプッシュ（初回または履歴が変更された場合）
git push --force-with-lease origin ブランチ名
```

### プルリクエスト作成時の注意
- mainブランチに直接プッシュしない
- プルリクエスト作成前に必ずrebaseで最新のmainを取り込む
- コミット履歴は論理的な単位でまとめる（必要に応じて`git rebase -i`で整理）

### Gitコミットルール

このプロジェクトでは絵文字を使用した日本語コミットメッセージを採用しています：

#### よく使う絵文字
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

#### コミットメッセージの例
```
✨ shadcn-vue の導入
🎨 レスポンシブデザインを改善
📝 Git ブランチ戦略のドキュメントを追加
```
