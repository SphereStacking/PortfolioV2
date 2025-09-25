---
title: "GLSL勉強日記 #2 GLSLの組み込み変数"
description: "GLSLの組み込み変数について学んだことをまとめました。gl_FragCoord、gl_FragColorなどの基本的な組み込み変数の使い方と、ピクセル中心の概念、0-1正規化の必要性について解説します。"
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
  - "codicon:symbol-color"
  - "mdi:gpu"
---

## 🎯 はじめに

今回は、**GPUが自動的に提供してくれる「組み込み変数」**について学んだことをまとめます。
これらの変数を理解することで、ピクセルの位置や深度、面の向きなど、描画に必要な基本情報を取得できるようになるらしいです。

## 💡 組み込み変数とは

::callout{type="info"}
組み込み変数は「GPUが自動的に提供する情報」です。
これらを活用することで、ピクセルの位置、深度、面の向きなど、描画に必要な基本情報を取得できます。
特にフラグメントシェーダーでは、これらの変数がエフェクト作成の出発点となります。
::

## 📋 フラグメントシェーダーの組み込み変数

### 入力変数（読み取り専用）

| 変数名 | 型 | 説明 | 用途例 |
|--------|----|----|-------|
| **gl_FragCoord** | vec4 | ピクセル座標(x,y,z,1/w) | 位置ベースエフェクト |
| **gl_FrontFacing** | bool | 表面を向いているか | 両面シェーディング |
| **gl_PointCoord** | vec2 | ポイントスプライト内座標 | パーティクル描画 |

### 出力変数（書き込み専用）

| 変数名 | 型 | 説明 | 必須度 |
|--------|----|----|-------|
| **gl_FragColor** | vec4 | 最終的なピクセル色(R,G,B,A) | **必須** |
| **gl_FragDepth** | float | 深度値の上書き | オプション |

## 📐 頂点シェーダーの組み込み変数

### 入力変数

| 変数名 | 型 | 説明 |
|--------|----|----|
| **gl_Vertex** | vec4 | 頂点座標 |
| **gl_Normal** | vec3 | 法線ベクトル |
| **gl_Color** | vec4 | 頂点色 |
| **gl_MultiTexCoord0~7** | vec4 | テクスチャ座標 |

### 出力変数

| 変数名 | 型 | 説明 | 必須度 |
|--------|----|----|-------|
| **gl_Position** | vec4 | 変換後の頂点座標 | **必須** |
| **gl_PointSize** | float | ポイントのサイズ | ポイント描画時 |

## 🔍 重要な組み込み変数の詳細解説

### 1. gl_FragCoord - ピクセル座標

最も頻繁に使用する組み込み変数です。現在処理しているピクセルの座標を取得できます。

```glsl
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;  // 0-1に正規化
    gl_FragColor = vec4(uv, 0.0, 1.0);  // UV座標を色として表示
}
```

#### ⚡ ピクセル中心の概念（0.5から始まる理由）

ここが私が最初につまづいたポイントです。**ピクセルは「点」ではなく「正方形の領域」**なんです。

```
ピクセルを「点」と考えた場合（❌ 間違い）
●─────●─────●
│     │     │
│     │     │
●─────●─────●

ピクセルを「正方形」と考えた場合（✅ 正しい）
┌─────┬─────┬─────┐
│  ●  │  ●  │  ●  │  ← ●がピクセルの中心
│(0.5,│(1.5,│(2.5,│
│ 0.5)│ 0.5)│ 0.5)│
├─────┼─────┼─────┤
│  ●  │  ●  │  ●  │
│(0.5,│(1.5,│(2.5,│
│ 1.5)│ 1.5)│ 1.5)│
└─────┴─────┴─────┘
```

`gl_FragCoord`はその正方形の**中心点**を表すため、整数ではなく0.5刻みの座標になります。

#### 実際の影響

```glsl
void main() {
    // 800x600の画面の場合
    // gl_FragCoord.x: 0.5 ~ 799.5
    // gl_FragCoord.y: 0.5 ~ 599.5

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    // uv.x: 0.5/800 ~ 799.5/800 = 0.000625 ~ 0.999375
    // uv.y: 0.5/600 ~ 599.5/600 = 0.000833 ~ 0.999167
}
```

つまり、完全な黒(0,0,0)や完全な黄(1,1,0)は表示されないんです！微妙にずれた値になります。

### 2. gl_FrontFacing - 表裏判定

3Dモデルの表面と裏面を区別できます。

```glsl
void main() {
    if (gl_FrontFacing) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // 表面は赤
    } else {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);  // 裏面は青
    }
}
```

### 3. gl_PointCoord - パーティクル用座標

ポイントスプライト内での位置を取得できます。

```glsl
void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));  // 中心からの距離
    if (dist > 0.5) discard;  // 円形にクリップ
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0 - dist * 2.0);
}
```

### 4. gl_FragColor - 出力色（必須！）

**必ず設定する必要があります**。設定しないと何も描画されません。

```glsl
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    if (uv.x > 0.5) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // 右半分だけ赤
    }
    // 左半分はgl_FragColorが設定されない → 不定値（通常は透明/黒）
}
```

### 5. gl_FragCoord.z - 深度値

深度バッファの値を取得・操作できます。

```glsl
void main() {
    float depth = gl_FragCoord.z;
    // 0.0 = 最前面（nearプレーン）
    // 1.0 = 最奥面（farプレーン）

    // 深度を色として可視化
    gl_FragColor = vec4(vec3(depth), 1.0);
}
```

## 🎨 0-1正規化の必要性

### なぜ正規化するのか？

正規化しないと、**解像度によって見た目が変わってしまいます**。

#### 正規化しない場合の問題

```glsl
void main() {
    // ピクセル座標のまま使用（800x600想定）
    vec2 center = vec2(400.0, 300.0);  // 画面中央（固定値）
    float dist = distance(gl_FragCoord.xy, center);

    if (dist < 100.0) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // 赤い円
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);  // 黒
    }
}
```

**問題点：**
- 800x600では中央に円が描画される
- 1920x1080では左上寄りに小さな円になる
- 400x300では円が画面からはみ出る

#### 正規化した場合

```glsl
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;  // 0-1に正規化
    vec2 center = vec2(0.5, 0.5);  // どの解像度でも画面中央
    float dist = distance(uv, center);

    if (dist < 0.1) {  // 画面幅の10%の半径
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
```

### よく使われる正規化パターン

```glsl
// 1. UV座標（0-1）
vec2 uv = gl_FragCoord.xy / u_resolution.xy;
// 左下(0,0) → 右上(1,1)

// 2. 中心原点（-1 to 1）
vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.xy;
// 中央(0,0)、左下(-1,-1) → 右上(1,1)

// 3. アスペクト比補正
vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
// 正方形の座標系（縦長・横長画面でも歪まない）
```

## 🔄 Modern GLSLとの違い

新しいバージョンのGLSLでは文法が変わっています：

| 機能 | 古いGLSL（ES 1.0） | 新しいGLSL（ES 3.0+） |
|------|-------------------|---------------------|
| 頂点→フラグメント | `varying` | `in` |
| フラグメント出力 | `gl_FragColor` | `out vec4 fragColor` |
| テクスチャサンプリング | `texture2D()` | `texture()` |
| バージョン指定 | なし/暗黙 | `#version 300 es` |

```glsl
// 新しいGLSL（ES 3.0+）の例
#version 300 es
precision mediump float;

in vec2 v_uv;               // varying の代わり
uniform sampler2D u_texture;

out vec4 fragColor;         // gl_FragColor の代わり

void main() {
    fragColor = texture(u_texture, v_uv);  // texture2D → texture
}
```

## 📝 まとめ

組み込み変数を理解することで、シェーダープログラミングの幅が大きく広がりました。特に以下のポイントが重要です：

1. **ピクセルは点ではなく面**（だから0.5から始まる）
2. **0-1正規化は必須**（解像度に依存しないエフェクトのため）
3. **gl_FragColorは必ず設定**（設定しないと何も描画されない）
4. **座標系の理解が基礎**（UV座標、中心原点、アスペクト比補正）

次回は、これらの組み込み変数を使った実践的なエフェクトの実装に挑戦してみようと思います！

## 🔗 参考リンク

- [WebGL Specification](https://www.khronos.org/registry/webgl/specs/latest/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
