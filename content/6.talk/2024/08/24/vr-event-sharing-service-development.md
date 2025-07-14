---
title: 個人開発したVRイベント共有サービスについて
description: VR界隈向けのイベント共有サービス「Shelfie」の開発経験と学びを共有しました
event_name: 所属会社社内LT会
event_date: 2024-08-24
location: オンライン
type: meetup
slides_url: https://spherestacking.github.io/SlideCollection/2024-08-23
video_url: 
draft: false
tags:
  - 個人開発
  - Laravel
  - Vue.js
  - VR
  - Webサービス
  - MeiliSearch
icons:
  - logos:laravel
  - logos:vue
  - simple-icons:tailwindcss
---

## 概要

所属会社の社内LT会で、個人開発したVRイベント共有サービス「Shelfie」について発表しました。サービスの概要から開発の動機、技術スタック、そして約9ヶ月間の開発を通じて得た学びまで幅広く共有しました。

## カバーしたトピック

- **サービスコンセプト**: 「ポスター」と「人（主催者、演者）」を主軸に置いたイベント共有プラットフォーム
- **開発の動機**: VR界隈のイベント情報を効率的に収集・共有できるサービスの必要性
- **技術スタック**: Laravel 10、Vue 3、MeiliSearch、Tailwind CSSなどのモダンな技術構成
- **開発期間と工数**: 2023年11月から開始、平日4時間・週末8時間の開発ペース
- **ユーザー数の推移**: 2024年6月公開から約2ヶ月で登録ユーザー100人突破
- **工夫とこだわり**: UIデザイン、高度な検索フィルター、独自コンポーネントの実装
- **学びと課題**: マーケティングの重要性、個人開発の限界と可能性

## 技術的な詳細

### バックエンド
- Laravel 10.x（Jetstream、Scout、Socialite、Filament）
- MeiliSearchによる高速全文検索の実装
- カスタムフィルターロジックの構築

### フロントエンド
- Vue 3.xとInertia.jsによるSPA
- Tailwind CSS 3.xとDaisyUI 4でのスタイリング
- Tiptapを使用したWYSIWYGエディター
- Swiperによるスライダー実装

### インフラ・運用
- Laravel Forge + Digital Oceanでのホスティング
- Cloudflare R2での画像ストレージ
- Sentryによるエラー監視
- Google Analytics/APIの活用

## 成果

- **2024年6月9日**: サービス公開
- **2024年7月31日**: 登録ユーザー数100人突破
- **2024年8月14日**: メディア記事に掲載（metacul-frontier）
- 月額コスト: 約$42（Forge $15 + CodeRabbit $15 + Digital Ocean $12）

## 得られた教訓

### 技術面
- 最新技術スタックを使った実装スキルの向上
- 公式ドキュメントやGitHub Issuesを深く読み込む調査力
- 全文検索エンジンの日本語対応の難しさ
- SSR対応やタイムゾーン設定などの実装課題

### ビジネス面
- ユーザー投稿型サービスの初期ユーザー獲得の難しさ
- B2B2Cモデルのスケーラビリティの利点
- プロダクトマーケティングの重要性
- 個人開発におけるリソースの限界

## リソース

- [Shelfie](https://hollowshelfie.com/home) - サービス本体
- [GitHub](https://github.com/SphereStacking) - 開発者プロフィール
- [メディア掲載記事](https://metacul-frontier.com/?p=14478) - metacul-frontierによる紹介

---

この発表を通じて、技術的な挑戦と個人開発の現実、そして継続的な開発の重要性について共有できました。参加者からは技術選定や実装の工夫について多くの質問をいただき、活発な議論ができました。
