---
title: "GLSL勉強日記 #1 基本のき"
description: "GLSLを勉強し始めました。基本的な変数宣言、修飾子（uniform、varying、attribute）、データ型について学んだことをまとめました。"
navigation: true
draft: false
created: 2025-09-25
updated:
image:
tags:
  - "GLSL"
  - "WebGL"
  - "シェーダー"
  - "グラフィックス"
  - "学習記録"
icons:
  - "simple-icons:opengl"
  - "codicon:code"
  - "mdi:school"
---

## 🚀 はじめに

GLSLの勉強を始めたので個人的な備忘録として記録していく～

まずは実際に動くコードから始めて、その中で使われている基本的な要素を理解していこうと思います。

## 💻 最初のコード例

```glsl
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse; // Mouse position (normalized 0-1)
varying vec2 v_uv;

void main(){
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y); // 正規化
    float l = 0.1 / length(p);
    gl_FragColor = vec4(vec3(l), 1.0);
}
```

このコードは画面中央から放射状に広がる**光の輪**を描画する。

## 🎯 GLSLの変数修飾子

::callout{type="info"}
GLSLの変数には「修飾子」という役割を示すキーワードが付きます。

**uniform**（全ピクセル共通）
**varying**（頂点→フラグメント間の補間）
**attribute**（頂点ごとのデータ）

という3つの主要な修飾子があり、データの流れを制御します。
::

### 1. precision - 計算精度の指定

```glsl
precision mediump float;
```

浮動小数点数の計算精度を指定します。

| 精度 | 特徴 | 用途 |
|------|------|------|
| **lowp** | 低精度、高速 | 色の計算など |
| **mediump** | 中精度、バランス良い | **通常はこれを使用** |
| **highp** | 高精度、低速 | 正確な計算が必要な場合 |

::callout{type="warning"}
モバイルGPUなど、デバイスによって処理能力が違うため、適切な精度を選択することでパフォーマンスを調整できます。
::

### 2. uniform変数 - CPU側からの共通データ

JavaScript（CPU側）から送られてくる、**全ピクセルで同じ値を持つ変数**です。

```glsl
uniform float u_time;        // 時間（秒単位など）
uniform vec2 u_resolution;   // 画面の解像度（幅, 高さ）
uniform vec2 u_mouse;        // マウス位置（0〜1に正規化）
```

- **uniform** = 「一様な」という意味
- 画面上のどのピクセルを計算していても、同じ値

#### データの流れ

```
CPU側（JavaScript）
    ↓
uniform変数（GPU側）
    ↓
全ピクセルに同じ値をブロードキャスト
```

### 3. varying変数 - 頂点間で補間される値

頂点シェーダーからフラグメントシェーダーに渡される、**補間される変数**です。

```glsl
varying vec2 v_uv;  // テクスチャ座標
```

- 頂点間で自動的に補間（グラデーション）される
- 例：三角形の3つの頂点で違う値 → 内部は滑らかに変化

::callout{type="important"}
varying変数は**必ず頂点シェーダーで設定する必要があります**：

```
// 頂点シェーダー側
varying vec2 v_uv;
void main() {
    v_uv = uv;  // attributeから受け取ってvaryingに渡す
    // ...
}
```
::

#### データの流れ

```
頂点シェーダー（各頂点で異なる値）
    ↓
varying変数（自動補間処理）
    ↓
フラグメントシェーダー（補間された値）
```

### 4. attribute変数 - 頂点ごとのデータ

**頂点シェーダー専用**の修飾子です。

```
attribute vec3 position;  // 頂点ごとの位置
attribute vec2 uv;        // 頂点ごとのUV座標
```

::callout{type="note"}
現代のGLSL（ES 3.0+）では`in`キーワードを使うことも多いです。
::

## 📊 データ型の基本

| 型 | 説明 | 例 |
|----|----|-----|
| **float** | 小数値1つ | `3.14` |
| **vec2** | 小数値2つの組 | `vec2(x座標, y座標)` |
| **vec3** | 小数値3つの組 | `vec3(赤, 緑, 青)` |
| **vec4** | 小数値4つの組 | `vec4(赤, 緑, 青, 透明度)` |

### ベクトル型の便利な機能

```glsl
vec3 color = vec3(1.0, 0.5, 0.2);

// 成分アクセス
float red = color.r;    // または color.x
float green = color.g;  // または color.y
float blue = color.b;   // または color.z

// スウィズリング
vec2 rg = color.rg;     // 赤と緑だけ取得
vec3 bgr = color.bgr;   // 順序を入れ替え
```

## 🔍 コード例の詳細解説

最初のコード例を詳しく見てみましょう：

### 1. 座標の正規化

```glsl
vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
```

この計算の意味：
- `gl_FragCoord.xy`：現在のピクセル座標
- `* 2.0 - u_resolution`：中心を原点(0,0)にする
- `/ min(...)`：アスペクト比を保ちながら正規化

### 2. 距離の計算と光の表現

```glsl
float l = 0.1 / length(p);  // 中心からの距離の逆数
gl_FragColor = vec4(vec3(l), 1.0);  // 白い光の輪
```

- `length(p)`：中心からの距離
- `0.1 / length(p)`：距離の逆数→中心に近いほど明るく
- `vec3(l)`は`vec3(l, l, l)`の省略形

### 3. 結果

この計算により、画面中央から放射状に広がる美しい光の輪が描画されます！

## 🎨 データの流れ全体像

<Mermaid>
graph TD
    A[JavaScript/CPU] -->|uniform変数| B[GPU]
    B -->|時間、解像度、マウス位置| C[頂点シェーダー]
    C -->|varying変数| D[フラグメントシェーダー]
    D -->|gl_FragColor| E[最終ピクセル色]

    F[属性データ] -->|attribute変数| C
    G[UV座標] -.->|補間| D
    H[組み込み変数<br/>gl_FragCoord] -.-> D

    style A fill:#e1f5fe
    style E fill:#c8e6c9
    style D fill:#fff3e0
</Mermaid>

従来のテキスト表現：
```
1. JavaScript → uniform変数（時間、解像度、マウス位置）
2. 頂点シェーダー → varying変数（UV座標など）
3. フラグメントシェーダー：
   - uniform変数（全ピクセル共通）
   - varying変数（補間された値）
   - 組み込み変数（gl_FragCoordなど）
   ↓
   gl_FragColor（最終的なピクセル色）
```

## 📝 まとめ

GLSLの基本を学んで分かったこと：

1. **修飾子が重要**：uniform、varying、attributeの違いを理解する
2. **データの流れ**：CPU→GPU、頂点→フラグメントの流れを把握する
3. **ベクトル型**：vec2、vec3、vec4を使いこなす
4. **精度設定**：デバイスに応じた適切な精度を選択する

次回は、**組み込み変数**（gl_FragCoord、gl_FragColorなど）について詳しく学んでいきます！

## 🔗 参考リンク

- [WebGL Specification](https://www.khronos.org/registry/webgl/specs/latest/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy](https://www.shadertoy.com/) - シェーダーの実験に最適

## 💻 実験用コード

この記事で学んだ内容を試せるコードは、[GitHub リポジトリ](https://github.com/yourusername/yourrepo)の`assets/shaders/learning/basic_variables_study.glsl`にあります。
