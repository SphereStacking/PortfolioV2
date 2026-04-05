---
title: 自分用 .claude/ ディレクトリ構成の指針
description: Claude Code の .claude/ ディレクトリをどう構成するか、morphink プロジェクトで試行錯誤して落ち着いた形をメモとして残す。
navigation: true
draft: true
created: 2026-04-05
updated:
image:
tags:
  - "Claude Code"
  - "AI"
  - "開発環境"
icons:
  - "tabler:folder-cog"
  - "tabler:robot"
---

# 自分用 .claude/ ディレクトリ構成の指針

morphink（デザインシステムmonorepo）で `.claude/` を整備していく中で、自分なりの構成指針が固まってきたのでメモ。

## 構成の全体像

```
.claude/
├── settings.json                          # hooks・permissions 等の設定
│
├── rules/                                 # 指定パスで自動ロードされるルール
│   ├── {{feature1}}-guide.md              #   ガイド（パターン・使い分け・選択基準）
│   ├── {{feature1}}-prohibit.md           #   禁止ルール（やってはいけないこと + 代替）
│   ├── {{feature2}}-guide.md              #   別の対象のガイド
│   ├── {{feature2}}-prohibit.md           #   別の対象の禁止ルール
│   └── {{feature3}}-prohibit.md           #   禁止だけで十分な対象もある
│
├── reference/                             # 必要なときだけ読ませるリファレンス
│   ├── {{feature}}-tokens.md              #   トークン値一覧など詳細データ
│   └── {{feature}}-pipeline.md            #   ビルドフローなど詳細仕様
│
├── hooks/                                 # 自動検証スクリプト
│   └── validate-{{scope}}-rules.sh        #   PostToolUse でルール検証
│
├── skills/                                # ドメイン特化スキル（/skill で呼び出し）
│   ├── {{project}}-{{skill1}}/
│   │   ├── SKILL.md                       #   スキル定義
│   │   └── references/                    #   スキル固有の参考資料（任意）
│   └── {{project}}-{{skill2}}/
│       └── SKILL.md
│
├── agents/                                # カスタムエージェント定義（任意）
│   └── {{agent-name}}.md                  #   Agent ツールから呼び出せるエージェント
│
├── commands/                              # カスタムスラッシュコマンド（任意）
│   └── {{command-name}}.md                #   /command-name で呼び出し
│
└── mcp.json                               # MCP サーバー設定（任意）
```

morphinkでの実例:

```
.claude/
├── settings.json
├── rules/
│   ├── component-guide.md         # コンポーネント設計（3層構造・CVA・Variant・Tone）
│   ├── component-prohibit.md      # コンポーネント構造・a11y の禁止ルール
│   ├── component-reka-ui.md       # Reka UI ラッパー必須パターン
│   ├── style-guide.md             # コードスタイル基本方針
│   ├── style-prohibit.md          # CSS 変数・スタイリングの禁止ルール
│   ├── token-prohibit.md          # トークン・カラーの禁止ルール
│   ├── figma-guide.md             # Figma ↔ Code 同期ルール
│   ├── motion-guide.md            # Motion ルール
│   └── build-readonly.md          # 生成物の編集禁止
├── reference/
│   ├── motion-tokens.md           # Motion トークン値一覧
│   └── token-pipeline.md          # Figma → Style Dictionary → CSS の変換フロー
├── hooks/
│   └── validate-component-rules.sh  # PostToolUse で .vue 編集時にルール検証
└── skills/
    ├── morphink-component-dev/
    │   ├── SKILL.md
    │   └── references/
    │       └── component-inventory.md
    ├── morphink-figma-sync/
    │   └── SKILL.md
    ├── morphink-story/
    │   └── SKILL.md
    ├── morphink-test/
    │   └── SKILL.md
    └── morphink-token/
        └── SKILL.md
```

大きく4つのディレクトリに分ける。ポイントは **rules/ と reference/ の分離**。

## rules/ と reference/ の使い分け

ここが一番大事。

- **rules/** — 指定パスにマッチすると自動ロードされる。Claudeが「毎回守るべきこと」をここに書く
- **reference/** — CLAUDE.mdのタスクベース読み込みガイドやスキルから誘導し、必要なときだけ読ませる。詳細な仕様データ、トークン一覧など

rules/ に全部入れるとコンテキストを圧迫する。でもreference/ だけだとClaudeが気づかずにルール違反する。
この切り分けが `.claude/` 構成の肝だと思っている。

### rules/ に入れるもの

- 禁止ルール（やってはいけないこと + 代替手段）
- アーキテクチャの骨格（3層構造、CVAパターン、Compound Componentなど）
- コードスタイルの基本方針
- 生成物の編集禁止マーカー

### reference/ に入れるもの

- トークンの具体的な値一覧
- ビルドパイプラインの詳細フロー
- コンポーネントの実装パターン集

## rules/ のファイル命名と記述方針

`{対象}-{種別}.md` を基本パターンにしている。

```
component-guide.md       # コンポーネントのガイド
component-prohibit.md    # コンポーネントの禁止ルール
style-guide.md           # スタイリングのガイド
style-prohibit.md        # スタイリングの禁止ルール
token-prohibit.md        # トークンの禁止ルール
```

同じ対象のguideとprohibitがファイル名でペアになるので探しやすい。

### globs フロントマターで同じパスにマッチさせる

guideとprohibitはペアなので、同じ `globs` を指定する。実装時はどちらも自動ロードされる。

```markdown
<!-- component-guide.md -->
---
globs:
  - packages/ui/src/**/*.vue
---
# コンポーネントガイド
...
```

```markdown
<!-- component-prohibit.md -->
---
globs:
  - packages/ui/src/**/*.vue
---
# 禁止: コンポーネント
...
```

こうしておけば `packages/ui/src/` 以下の `.vue` ファイルを触ったとき、guideもprohibitも両方ロードされる。

### guide と prohibit を分ける理由

同じ対象でもファイルを分けているのは、**ロードされる経路が違う**から。

rules/ のファイルはパスマッチで自動ロードされるが、実装フローの外（レビューやスキル経由の操作など）では自動ロードされない。
レビュー時にもルールを参照して欲しい場面は多い。

そこで `/review` のようなスキルを用意し、スキルの中からprohibitファイルを明示的に読むように定義しておく。
こうすればレビュー時にも禁止ルールが確実にロードされる。

```
実装時: rules/ のパスマッチ → guide + prohibit が自動ロード
レビュー時: /review スキル → prohibit を明示的に読み込み
```

このときguideとprohibitが1ファイルにまとまっていると、レビュー時に実装ガイド（パターン選択基準、コード例など）まで無駄にコンテキストに載ってしまう。レビューで必要なのは「何がダメで、代わりに何をすべきか」だけ。

だから明示的に分けておく。

|                | guide                            | prohibit                           |
| -------------- | -------------------------------- | ---------------------------------- |
| **役割**       | 実装を主目的とした判断基準       | レビュー時のチェックリスト         |
| **内容**       | パターン・使い分け・選択基準     | やってはいけないこと + 代替手段    |
| **ロード経路** | パスマッチで自動                 | パスマッチ + スキルから明示的に    |
| **書き方**     | 散文・テーブル・コード例など自由 | `禁止 → 代替` のテーブル形式に統一 |

guideは「どう作るか」、prohibitは「何をやってはいけないか」。
ファイルを分けることで、必要な場面に必要な情報だけロードできる。

### guide の書き方

形式は自由。対象に合わせてテーブル、コード例、散文を使い分ける。
ただし見出しで対象を明示する:

```markdown
# {{対象名}}ガイド

## 基本構造
...

## 選択基準
| パターン | 用途 |
| -------- | ---- |
| A        | ...  |
| B        | ...  |
```

### prohibit の書き方

テーブル形式で「禁止 → 代替」を並べる。これだけ。

```markdown
# 禁止: {{対象名}}

| #   | 禁止                              | 代替                            |
| --- | --------------------------------- | ------------------------------- |
| 1   | Public 層で reka-ui を直接 import | Base コンポーネント経由         |
| 2   | index.ts export 漏れ              | packages/ui/src/index.ts に追加 |
```

Claudeにとって「何がダメで、代わりに何をすべきか」が一行で完結するのが重要。
長い説明文より、このテーブル形式のほうがルール遵守率が明らかに高い。

### 例外は許容する

`component-reka-ui.md`（Reka UIラッパーの必須パターン）や`build-readonly.md`（生成物の編集禁止）はguide/prohibitのどちらにも該当しない。
無理にパターンに当てはめると逆にわかりにくくなるので、内容の性質が違うものは例外として許容している。

## hooks/ — ルールの自動検証

rules/ に書いてもClaudeが破ることはある。特に繰り返し起きるルール違反はhooksで自動検証する。

settings.jsonで `PostToolUse` の `Edit|Write` にフックを設定:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate-component-rules.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

フックの中で重要度を分ける:

- **重大違反（exit 2）** — Claudeの操作をブロックして修正を強制する
- **警告（additionalContext）** — Claudeに通知するだけ。判断は任せる

全部ブロックすると作業が止まりすぎるので、この段階分けが実用上大事。

## skills/ の命名と活用

`{プロジェクト名}-{スキル名}/` をベースにしている。

```
morphink-component-dev/
morphink-figma-sync/
morphink-story/
morphink-test/
morphink-token/
```

プロジェクト名プレフィックスを付けておくと、外部プラグインのスキルと区別がつく。

### スキルから prohibit を読む設計

前述の通り、レビュー時にprohibitを確実にロードするためにスキルを使う。
例えば `/review` スキルのSKILL.mdにこう書いておく:

```markdown
# レビュースキル

## 手順

1. 以下の禁止ルールファイルを読み込む:
   - `.claude/rules/component-prohibit.md`
   - `.claude/rules/style-prohibit.md`
   - `.claude/rules/token-prohibit.md`
2. 対象ファイルの差分を確認する
3. 禁止ルールに照らしてチェックする
```

こうすればスキル実行時にprohibitだけがロードされ、guideのコンテキスト消費を避けられる。

### スキルの責務を限定する

SKILL.mdの冒頭で「自分が何をカバーしないか」を明示しておく。

```markdown
> アーキテクチャの定義は `.claude/rules/component-guide.md` を参照。
> Reka UI ラッパーパターンは `.claude/rules/component-reka-ui.md` を参照。
>
> このスキルは **手順・テンプレート・デバッグ** に集中する。
```

スキルに詳細なアーキテクチャ説明まで書くとrules/ と重複して保守コストが増える。
「詳細はあっちを読め、自分はこれだけやる」と宣言することで、スキル自身の肥大化を防げる。

### reference/ と skills/references/ の使い分け

reference/ とは別に、スキル固有の参考資料を `skills/{{スキル名}}/references/` に置ける。

```
reference/                             # システム全体の仕様
│   └── token-pipeline.md             #   複数スキルから参照される
│
skills/morphink-component-dev/
    ├── SKILL.md
    └── references/
        └── component-inventory.md     # このスキル固有の参考資料
```

|              | reference/                        | skills/references/                 |
| ------------ | --------------------------------- | ---------------------------------- |
| **スコープ** | プロジェクト全体                  | そのスキル固有                     |
| **参照者**   | rules/、複数のスキル              | 当該スキルのみ                     |
| **例**       | トークンパイプライン、Motion 仕様 | コンポーネント一覧、テンプレート集 |

複数スキルから使われるならプロジェクトのreference/ へ、1つのスキルでしか使わないならそのスキルのreferences/ へ。

## CLAUDE.md の役割

CLAUDE.md自体には詳細を書かない。以下を簡潔に:

- プロジェクト概要（1-2行）
- コマンド一覧
- 主要依存
- **タスクベース読み込みガイド**（どのタスクでどのファイルを読むか）

特に「タスクベース読み込みガイド」がエントリーポイントとして機能する。Claudeが「トークン追加したい」と思ったら、このテーブルからreference/ の該当ファイルを読む流れ。

```markdown
| タスク             | 読むファイル                        |
| ------------------ | ----------------------------------- |
| トークン追加・変更 | .claude/reference/token-pipeline.md |
| アニメーション実装 | .claude/reference/motion-tokens.md  |
```

## コンテキスト消費の意識

rules/ は常時ロードされるので、ファイルサイズを意識する。
morphinkではrules/ 全体で約18KB、うち `component-guide.md` が11KBで最大。

もしコンテキスト効率を重視するなら、詳細テーブル（Variantの使い分けなど）をreference/ に移してrules/ にはサマリーだけ残す手もある。
ただ、ルール遵守率とのトレードオフなので、破られたくないルールはrules/ に残すべき。

## まとめ

- **rules/ 、reference/**。この分離が構成の核
- ファイル名は `{対象}-{種別}` で揃える。例外は内容の性質が違うなら許容
- prohibitは「禁止 → 代替」テーブル。一行完結が効く
- 繰り返す違反はhooksで自動検証。重大度で段階分け
- CLAUDE.mdはエントリーポイント。詳細は書かない
