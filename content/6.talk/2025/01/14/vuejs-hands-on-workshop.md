---
title: Vue.js hands-on
description: Vue.js公式ドキュメントを読んで、初級者～中級者向けに抑えておくと良い機能をまとめました
event_name: Vue.js勉強会
event_date: 2025-01-14
location: オンライン
type: workshop
slides_url: https://spherestacking.github.io/SlideCollection/2025-01-vuejs-lecturer
video_url: 
draft: false
tags:
  - Vue.js
  - ハンズオン
  - ディレクティブ
  - コンポーネント
  - リアクティビティ
icons:
  - logos:vue
  - logos:javascript
---

## 概要

Vue.jsの公式ドキュメントを基に、初級者〜中級者向けに知っておくとハッピーになれる機能をまとめ、問題形式で考えながら学べるハンズオン形式で発表しました。

## カバーしたトピック

### ディレクティブ
- **v-bind**: HTML属性への動的データバインディング
- **v-on**: イベントハンドリング（修飾子、キー修飾子、システム修飾子、マウスボタン修飾子）
- **v-model**: 双方向バインディング（修飾子、コンポーネントでの使用）
- **v-if / v-show**: 条件付きレンダリング
- **v-for**: リストレンダリング

### 組み込み関数
- **ref / reactive**: リアクティビティの基礎
- **computed**: 算出プロパティ（キャッシュ機能、副作用の回避）
- **watch / watchEffect**: リアクティブデータの監視

### ライフサイクル
- マウント前後（onBeforeMount / onMounted）
- 更新前後（onBeforeUpdate / onUpdated）
- アンマウント前後（onBeforeUnmount / onUnmounted）
- エラー捕捉（onErrorCaptured）

### 組み込みコンポーネント
- **Transition / TransitionGroup**: アニメーション制御
- **component**: 動的コンポーネント
- **KeepAlive**: コンポーネントのキャッシュ
- **Teleport**: DOM要素の転送
- **Suspense**: 非同期コンポーネントの制御

### その他の重要な機能
- **nextTick**: DOM更新の待ち合わせ
- **フォールスルー属性**: $attrsを使った属性の転送

## デモ内容

各トピックで実際のコードを使ったインタラクティブなデモを実施：

### v-bindクイズ
baseStyleとdynamicStyleの競合時の挙動について

### v-onデモ
イベント修飾子、キー修飾子、システム修飾子の実践的な使用例

### v-modelデモ
双方向バインディングの内部的な仕組みと修飾子（.lazy、.number、.trim）の動作確認

### computedクイズ
computedとmethodの違いを1秒ごとのタイムスタンプ更新で比較

### ライフサイクル図解
Vueインスタンスの生成から破棄までのプロセスをビジュアルで解説

## 技術的な詳細

### ref vs reactive
- `reactive`の分割代入でリアクティブ性が失われる問題
- `toRefs`を使った解決方法
- 作者Evan You氏も推奨する`ref`の使用

### computedの注意点
- 副作用を持たないようにする
- 読み取り専用として扱う
- テンプレート内では関数ではなくcomputedを使用

### watch vs watchEffect
- 明示的な依存関係管理 vs 自動的な依存関係追跡
- `immediate`と`deep`オプションの活用

### nextTickの重要性
- データ更新とDOM更新の非同期性
- 動的コンテンツの高さ計測やフォーカス制御での活用

## フィードバック

参加者から以下のような学びがあったとの声をいただきました：
- 「v-ifとv-showの使い分けが明確になった」
- 「computedのキャッシュ機能について理解が深まった」
- 「フォールスルー属性の仕組みが便利だと知れた」
- 「ライフサイクルの図解がわかりやすかった」

## リソース

- [Vue.js公式ドキュメント](https://ja.vuejs.org/)
- [リアクティビティーの基礎](https://ja.vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [算出プロパティ](https://ja.vuejs.org/guide/essentials/computed.html)
- [条件付きレンダリング](https://ja.vuejs.org/guide/essentials/conditional.html)
- [リストレンダリング](https://ja.vuejs.org/guide/essentials/list.html)

---

このハンズオンを通じて、Vue.jsの基本的な機能を深く理解し、実践的な使い方を身につけることができました。問題形式で進めることで、参加者の理解度を確認しながら進められたのが特に効果的でした。
