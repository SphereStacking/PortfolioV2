---
title: "VSCode 拡張機能の個人的まとめ"
description: "個人的に使用頻度が高くおすすめのVSCode拡張機能をまとめました。"
navigation: true
draft: false
created: 2025-01-13
updated:
image:
tags:
  - "VSCode"
  - "開発効率"
  - "拡張機能"
icons:
  - "devicon:vscode"
  - "codicon:extensions"
---

## 全体

### 必須

- [Japanese Language Pack for VS Code](https://marketplace.visualstudio.com/items?itemName=MS-CEINTL.vscode-language-pack-ja)
  - UIが日本語になります。
  
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
  - タイポが検知できるようになります。
  
- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
  - ショートカットコマンドを使うことでDockerコンテナへのアクセスが可能になります。ぜひ覚えましょう。

### 推奨

- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)
  - 赤線などのエラー情報がホバーしなくても表示されるようになります。
  
- [GitHub Markdown Preview](https://marketplace.visualstudio.com/items?itemName=bierner.github-markdown-preview)
  - Markdown関連はこれを入れれば他の拡張機能は不要です。
  
- [Comment Translate](https://marketplace.visualstudio.com/items?itemName=intellsmi.comment-translate)
  - 翻訳が非常に楽になります。

## JavaScript, TypeScript, Vue 関連

### 必須

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  
- [Nuxtr](https://marketplace.visualstudio.com/items?itemName=Nuxtr.nuxtr-vscode)
  
- [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
  - `import hoge from '@/hoge'` などでパスを記述する際に補完が効くようになります。

### 推奨

- [Pretty TS Errors](https://marketplace.visualstudio.com/items?itemName=yoavbls.pretty-ts-errors)
  - 型エラーが見やすくなります。ただし、動作がやや重い場合があります。
  
- [DBCode](https://marketplace.visualstudio.com/items?itemName=DBCode.dbcode)
  - ローカルのDBクライアントとして、データを素早く確認できます。

## PHP 関連

### 必須

（特になし）

### 推奨

- [PHPStan Laravel](https://marketplace.visualstudio.com/items?itemName=ddarkonen.phpstan-larastan)
  - PHPStanをリアルタイムで解析し、エラーを表示してくれます。

## 必要に応じて

- [Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare)
  - ペアプログラミング時に便利です。
  
- [GitHub Pull Requests](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github)
  - VSCode上でプルリクエストをレビューし、コードの変更を確認できます。

## 個人的なおすすめ（ニッチなもの）

- [File Nesting](https://marketplace.visualstudio.com/items?itemName=antfu.file-nesting)
  - ファイルをカテゴリ毎にネストして表示できます。
  
- [Bookmarks](https://marketplace.visualstudio.com/items?itemName=alefragnani.Bookmarks)
  - 行にブックマークを設定できます。修正ファイルが多い時の移動に重宝します。
  
- [Conflict Squeezer](https://marketplace.visualstudio.com/items?itemName=angelomollame.conflict-squeezer)
  - コンフリクト時に対象箇所がハイライトされます。
  
- [Semantic Diff](https://marketplace.visualstudio.com/items?itemName=semanticdiff.semanticdiff)
  - Diffが見やすくなります。標準機能でも一部対応しています。
  
- [Iconify](https://marketplace.visualstudio.com/items?itemName=antfu.iconify)
  - アイコンライブラリの表示サポートです。Iconifyを使用している場合は導入を検討しましょう。

## テーマ設定

- [One Dark Theme](https://marketplace.visualstudio.com/items?itemName=akamud.vscode-theme-onedark)
  - メインのテーマとして。Night Owlもおすすめでしたが、最終的にはデフォルトのダークテーマに落ち着きました。
  
- [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)
  - 安定したアイコンテーマです。
  
- [Where Am I](https://marketplace.visualstudio.com/items?itemName=antfu.where-am-i)
  - 迷子防止に役立ちます。

## 非推奨

::: warning
個人的な意見です。
:::

- [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)
  - Vue公式のVolarに置き換わっています。Vue 2もVolarで動作するため不要です。
