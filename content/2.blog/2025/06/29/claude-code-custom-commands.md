---
title: Claude Codeカスタムコマンド完全ガイド - 定型作業を自動化して開発効率アップ
description: Claude Codeの隠れた機能「カスタムコマンド」を完全解説。プロジェクト固有の作業を自動化し、チーム全体の開発効率を向上させる実装方法を紹介します。
navigation: true
draft: false
created: 2025-06-29
updated:
image:
tags:
  - "Claude Code"
  - "カスタムコマンド"
  - "自動化"
  - "AI"
  - "開発効率"
icons:
  - " logos:claude-icon"
  - "codicon:terminal"
---

## 概要

Claude Codeで繰り返し実行する作業をカスタムコマンドとして登録できます。

### 使用例

- プロジェクトの初期設定
- コードレビュー
- コミットメッセージの作成

### メリット

- 定型作業の自動化
- チーム内での作業標準化
- 複雑な指示の簡略化

## セットアップ

### 必須

プロジェクトのルートディレクトリに `.claude/commands` フォルダを作成します。

```bash
mkdir .claude/commands
```

### フォルダ構造

```
プロジェクト/
├── .claude/
│   └── commands/
│       ├── hello.md      # /hello
│       ├── review.md     # /review
│       └── blog/
│           ├── new.md    # /blog:new
│           └── update.md # /blog:update
└── その他のファイル...
```

階層構造でコマンドを整理できます。サブフォルダ内のコマンドは `:` で区切って呼び出します。

## 基本的な作成方法

### シンプルなコマンドの例

`.claude/commands/hello.md` を作成します。

```markdown
---
description: "挨拶をするシンプルなコマンド"
---

こんにちは。Claude Code のカスタムコマンドです。
```

### 使用方法

1. ファイルを保存
2. Claude Codeで `/hello` と入力
3. メッセージが表示されます

### 仕組み

- ファイル名 `hello.md` がコマンド名 `/hello` になります
- `description` はコマンド一覧で表示される説明
- `---` 以降がClaudeへの指示内容

## 実用的なコマンド例

### 日付付きメモ作成

`.claude/commands/memo.md`

```markdown
---
description: "今日の日付でメモファイルを作成"
---

今日の日付（YYYY-MM-DD形式）でメモファイルを作成します。
ファイル名: `memo-YYYY-MM-DD.md`
ディレクトリ: `notes/`

テンプレート：
- 今日やったこと
- 明日やること
- メモ
```

### パラメータを使用するコマンド

`.claude/commands/create-component.md`

```markdown
---
description: "Vueコンポーネントを作成"
---

引数: $ARGUMENTS

引数で指定されたコンポーネントを作成します。
- ディレクトリ: `src/components/`
- 関数コンポーネント
- TypeScript使用

引数が未指定の場合はコンポーネント名を確認します。
```

使用例: `/create-component Button`

## トラブルシューティング

### よくあるエラー

**コマンドが認識されない**
- ファイルの場所を確認（`.claude/commands/` 内）
- ファイル名に空白や特殊文字が含まれていないか
- 作成後にclaude codeを再起動したか

**期待した動作をしない**
- 指示が明確か確認
- 必要なツールへのアクセス権限を確認

### 推奨事項

- シンプルなコマンドから始める
- 段階的に機能を追加
- エラーメッセージを確認

## 高度な使い方

### ツールの使用制限

```markdown
---
description: "ファイル読み取り専用コマンド"
allowed_tools: Read(*.md), List(docs/**)
---

ドキュメントフォルダ内のMarkdownファイルを読んで要約します。
```

### 条件分岐

```markdown
---
description: "ファイルまたはディレクトリの情報を表示"
---

引数: $ARGUMENTS

lsコマンドのように動作します：

- 引数なし: 現在のディレクトリの内容を表示
- 引数がファイルパス: そのファイルの詳細情報を表示
- 引数がディレクトリパス: そのディレクトリの内容を一覧表示
- 引数が存在しないパス: エラーメッセージを表示

※Claude Codeは自然言語で書かれた指示を理解して、適切に動作を分岐します。
```

## 次のステップ

### 推奨

**チーム用コマンドセット**
- コードレビュー用コマンド
- デプロイ手順コマンド
- ドキュメント生成コマンド

**複雑な自動化**
- 複数ツールの組み合わせ
- 外部APIとの連携
- 条件分岐処理

**コマンドの共有**
- GitHubでチーム共有
- コミュニティへの公開

## 参考リソース

- [Claude Code公式ドキュメント](https://docs.anthropic.com/ja/docs/claude-code)

## まとめ

カスタムコマンドはClaude Codeを効率的に使うための機能です。

- `.claude/commands/` にMarkdownファイルを配置
- ファイル名がコマンド名になる
- `$ARGUMENTS` で引数を受け取る
- 段階的に機能を追加
