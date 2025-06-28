---
title: Slack BoltでAPP開発を始めるためのローカル開発環境の構築ガイド"
description: Slack Boltを使用してローカル開発環境を構築する方法を説明します。Dockerを利用したセットアップ手順や、ngrokを用いた外部アクセスの設定をステップバイステップで進めていきます
navigation: true
draft: false
created: 2024-04-19
updated:
image:
tags:
  - "slack"
  - "bolt"
  - "local"
  - "dev"
icons:
  - "devicon:slack"
  - "fxemoji:bolt"
---

# slack Bolt ローカル開発環境

slack cliの時代のようですがそれを知らずににドッカーでローカル環境構築してしまいました..

ソースコードはこちらをcloneしてください。

https://github.com/SphereStacking/slack-app-template

## 初期セットアップ

### コンテナのbuildとmoduleのインストール

``` sh
docker-compose build
docker-compose run app npm init
docker-compose run app npm install @slack/bolt
```

## envの作成

1. .env.exampleをコピーして.envを作成

## ngrok.ymlの作成

1. ngrok.yml.exampleをコピーしてngrok.ymlを作成

## Slack Appのセットアップ

1. アプリの作成
   1. https://api.slack.com/apps
   2. Create New App を押下
   3. From scratch を押下
   4. App Nameの記入
   5. Pick a workspace to develop your app in: でセットアップ先のワークスペースを選択
   6. 画面下部のSAVEボタンを押下し保存
2. Slack Appの情報を控える
   1. Basic Information->App Credentialsに移動 
   2. Client Secretを控える
   3. Signing Secretを控える。
3. Slack Appの認証情報を控える
   1. OAuth & Permissions
   2. Bot User OAuth Tokenを控える
4. Slack Appのが操作可能な範囲を設定
   1. OAuth & Permissions->Scopes
   2. Add an OAuth Scope ボタンを押下して適宜追加
5. リポジトリのセットアップ
   1. 控えた値をenvに書き込む
      1. 2-1 SLACK_BOT_TOKEN
      2. 2-3 SLACK_SIGNING_SECRET
      3. 5-3 NGROK_AUTH_TOKEN

### ngrokのセットアップ

1. ngrokのAuthtokenを取得
   1. [ngrok](https://dashboard.ngrok.com/get-started/your-authtoken)にアクセス
   2. アカウントがない場合は作成
   3. Your Authtokenを控える
2. アクセス用のURLを固定する。
   1. https://dashboard.ngrok.com/cloud-edge/domains
   2. Create Domainを押下
   3. Start a Tunnel?
   4. セレクトボックスから[Start a tunnel from a config file]を選択
   5. 表示されたymlファイルからhostname部分を控える。
3. リポジトリのセットアップ
   1. 控えた値をngrok.ymlに書き込む

### 一度起動

``` sh
docker-compose up
```

### Slack Appのコマンド設定

1. ngrokのローカル環境ステータス画面をに移動
   1. `http://localhost:4040/status`
   2. Request URLを確認し控える。
      1. ngrokのセットアップの2-5の値と違っていたら何か間違ってるかも
2. コマンド設定
   1. `https://api.slack.com/apps/{your-app}/slash-commands`
   2. Create New Command
      1. Command: /kiminikimeta
      2. Request URL: 1-2で控えたurl + /slack/events
      - 残りの必要項目は適宜埋める。
   3. Saveを押下

### Slackのチャンネルにてコマンドの実行

1. チャンネルに作成したappをし追加
2. Slack Appのコマンド設定の2-2-1で設定したコマンドをチャット欄に記述し送信
3. 予定通り返信が来たら完了

## 参考

- [【Slack】OOOoO、キミにきめた！Bolt on Docker + Cloud Runでユーザーをランダムで選んでくれるSlash commandを作った話](https://qiita.com/at-946/items/e70cac96c03f911454ab)
