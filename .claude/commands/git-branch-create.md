---
description: "対話的にGitブランチを作成する"
---

# create-branch

現在の変更内容を確認し、適切なブランチを対話的に作成します。

## 動作フロー

1. **現在の状態確認**
   - ステージングされたファイルの確認 (`git status`)
   - 未コミットの変更の確認
   - 現在のブランチ名の確認

2. **変更内容のヒアリング**
   - ステージングされていない場合、何を修正/開発したかを質問
   - 変更の種類（機能追加、バグ修正、リファクタリング等）を確認
   - 関連するIssue番号があるか確認

3. **ブランチ名の提案と作成**
   - ブランチ戦略に基づいて適切な名前を提案
   - ユーザーの承認を得てブランチを作成
   - 必要に応じて現在の変更をスタッシュ

## ブランチ戦略

### ブランチの種類と命名規則

| ブランチタイプ | 命名規則 | 用途 | 例 |
|------------|---------|------|-----|
| **メインブランチ** | `main` | 本番環境にデプロイ可能な状態 | `main` |
| **開発ブランチ** | `develop` | 開発中の統合ブランチ（任意） | `develop` |
| **機能ブランチ** | `feature/機能名` | 新機能開発 | `feature/user-authentication` |
| **修正ブランチ** | `fix/修正内容` | バグ修正 | `fix/login-error` |
| **ホットフィックス** | `hotfix/修正内容` | 緊急のバグ修正 | `hotfix/security-patch` |
| **リファクタリング** | `refactor/対象` | コードの改善 | `refactor/database-queries` |
| **ドキュメント** | `docs/内容` | ドキュメントの更新 | `docs/api-reference` |
| **テスト** | `test/内容` | テストの追加・修正 | `test/unit-tests` |
| **Claude対応** | `claude/issue-番号` | Claude Codeで作業するIssue | `claude/issue-123` |

### ブランチ名のベストプラクティス

- **小文字とハイフン**: すべて小文字で、単語はハイフンで区切る
- **簡潔で説明的**: 何をするブランチか一目でわかる名前
- **Issue番号の活用**: 可能な限りIssue番号を含める
- **日本語を避ける**: ASCII文字のみを使用

## 実行例

```bash
# コマンド実行
$ claude create-branch

# Claude Codeの応答例
現在の状態を確認します...

📊 Git Status:
- 現在のブランチ: main
- ステージングされたファイル: なし
- 変更されたファイル: 
  - src/components/Header.tsx
  - src/styles/main.css

どのような変更を行いましたか？
1. 新機能の追加
2. バグの修正
3. リファクタリング
4. ドキュメントの更新
5. その他

> 1

どのような機能を追加しましたか？簡潔に説明してください：
> ユーザープロフィール画面を追加

関連するIssue番号はありますか？（なければEnter）：
> 45

以下のブランチ名を提案します：
- feature/user-profile
- feature/issue-45-user-profile
- claude/issue-45

どれを使用しますか？（1-3、または独自の名前を入力）：
> 2

ブランチ 'feature/issue-45-user-profile' を作成します。
現在の変更を新しいブランチに持っていきますか？ (y/n): y

✅ ブランチを作成し、切り替えました！
```

## オプション

```bash
# 直接ブランチタイプを指定
claude create-branch --type feature

# Issue番号を指定
claude create-branch --issue 123

# ブランチ名を直接指定
claude create-branch --name feature/new-feature

# 変更をスタッシュしてからブランチ作成
claude create-branch --stash

# ドライラン（実際には作成しない）
claude create-branch --dry-run
```

## エラーハンドリング

- **未コミットの変更がある場合**: スタッシュするか、現在のブランチに持っていくか選択
- **ブランチ名の重複**: 別の名前を提案
- **リモートとの競合**: リモートブランチの存在を確認し、警告を表示
