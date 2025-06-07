import type { Tool } from '~/types/tool'

export const useTools = () => {
  const tools: Tool[] = [
    // 🎨 デザイン・UI
    {
      id: 'color-palette',
      name: 'カラーパレット生成',
      description: '美しい配色を自動生成・アクセシビリティチェック',
      category: 'design',
      icon: 'heroicons:swatch',
      route: '/tools/color-palette',
    },
    {
      id: 'gradient-maker',
      name: 'グラデーション作成',
      description: 'CSS/SVGグラデーションをビジュアル作成',
      category: 'design',
      icon: 'heroicons:paint-brush',
      route: '/tools/gradient-maker',
    },
    {
      id: 'shadow-generator',
      name: 'シャドウ生成',
      description: 'box-shadow/text-shadowをリアルタイム調整',
      category: 'design',
      icon: 'heroicons:square-3-stack-3d',
      route: '/tools/shadow-generator',
    },
    {
      id: 'flexbox-playground',
      name: 'Flexbox プレイグラウンド',
      description: 'Flexboxレイアウトをインタラクティブ学習',
      category: 'design',
      icon: 'heroicons:view-columns',
      route: '/tools/flexbox-playground',
    },
    {
      id: 'grid-generator',
      name: 'CSS Grid 生成',
      description: 'グリッドレイアウトをビジュアル作成',
      category: 'design',
      icon: 'heroicons:squares-2x2',
      route: '/tools/grid-generator',
    },

    // 🖼️ 画像・メディア
    {
      id: 'image-format-converter',
      name: '画像編集ツール',
      description: 'フォーマット変換・リサイズ・フィルター一括処理',
      category: 'image',
      icon: 'heroicons:photo',
      route: '/tools/image-format-converter',
    },
    {
      id: 'image-compressor',
      name: '画像圧縮・最適化',
      description: 'ファイルサイズを削減して読み込み高速化',
      category: 'image',
      icon: 'heroicons:archive-box-arrow-down',
      route: '/tools/image-compressor',
    },
    {
      id: 'image-compare',
      name: '画像比較・差分確認',
      description: '2つの画像を並べて詳細比較',
      category: 'image',
      icon: 'heroicons:eye',
      route: '/tools/image-compare',
    },
    {
      id: 'image-metadata-viewer',
      name: '画像メタデータ確認',
      description: 'Exif情報表示・プライバシー保護削除',
      category: 'image',
      icon: 'heroicons:information-circle',
      route: '/tools/image-metadata-viewer',
    },
    {
      id: 'sprite-sheet-generator',
      name: 'スプライトシート作成',
      description: '複数画像を1つにまとめてCSS生成',
      category: 'image',
      icon: 'heroicons:squares-plus',
      route: '/tools/sprite-sheet-generator',
    },
    {
      id: 'favicon-generator',
      name: 'ファビコン生成',
      description: '各種サイズのファビコンを一括作成',
      category: 'image',
      icon: 'heroicons:star',
      route: '/tools/favicon-generator',
    },
    {
      id: 'color-palette-extractor',
      name: 'カラーパレット抽出',
      description: '画像から主要色を自動抽出',
      category: 'image',
      icon: 'heroicons:eye-dropper',
      route: '/tools/color-palette-extractor',
    },
    {
      id: 'base64-image',
      name: 'Base64画像変換',
      description: '画像をBase64データURIに変換',
      category: 'image',
      icon: 'heroicons:photo',
      route: '/tools/base64-image',
    },
    {
      id: 'video-editor',
      name: '動画編集・圧縮',
      description: '2分以内の動画トリミング・圧縮',
      category: 'image',
      icon: 'heroicons:video-camera',
      route: '/tools/video-editor',
    },

    // 📝 テキスト・文書
    {
      id: 'lorem-ipsum',
      name: 'ダミーテキスト生成',
      description: '日本語・英語対応のLorem Ipsum作成',
      category: 'text',
      icon: 'heroicons:document-duplicate',
      route: '/tools/lorem-ipsum',
    },
    {
      id: 'character-counter',
      name: '文字数・バイト数計測',
      description: '文字数・バイト数・行数をリアルタイム集計',
      category: 'text',
      icon: 'heroicons:calculator',
      route: '/tools/character-counter',
    },
    {
      id: 'regex-tester',
      name: '正規表現テスター',
      description: 'パターンマッチをリアルタイム検証',
      category: 'text',
      icon: 'heroicons:magnifying-glass',
      route: '/tools/regex-tester',
    },
    {
      id: 'diff-viewer',
      name: 'テキスト差分比較',
      description: '2つのテキストの違いを視覚的に表示',
      category: 'text',
      icon: 'heroicons:document-minus',
      route: '/tools/diff-viewer',
    },

    // 🔄 変換・コンバーター
    {
      id: 'csv-json-converter',
      name: 'CSV ↔ JSON 変換',
      description: 'CSVとJSONの双方向データ変換',
      category: 'converter',
      icon: 'heroicons:arrow-path-rounded-square',
      route: '/tools/csv-json-converter',
    },
    {
      id: 'markdown-to-html',
      name: 'Markdown → HTML',
      description: 'Markdownをリアルタイム変換・プレビュー',
      category: 'converter',
      icon: 'heroicons:document-text',
      route: '/tools/markdown-to-html',
    },
    {
      id: 'json-to-typescript',
      name: 'JSON → TypeScript型',
      description: 'JSONから型定義を自動生成',
      category: 'converter',
      icon: 'heroicons:code-bracket',
      route: '/tools/json-to-typescript',
    },
    {
      id: 'base64-encoder',
      name: 'Base64 エンコード',
      description: 'テキストをBase64形式に相互変換',
      category: 'converter',
      icon: 'heroicons:arrows-right-left',
      route: '/tools/base64-encoder',
    },
    {
      id: 'url-encoder',
      name: 'URL エンコード',
      description: 'URLパラメータの文字列変換',
      category: 'converter',
      icon: 'heroicons:link',
      route: '/tools/url-encoder',
    },
    {
      id: 'timestamp-converter',
      name: 'タイムスタンプ変換',
      description: 'Unix時間と日時の相互変換',
      category: 'converter',
      icon: 'heroicons:clock',
      route: '/tools/timestamp-converter',
    },

    // ⚡ 開発・セキュリティ
    {
      id: 'json-formatter',
      name: 'JSON 整形・検証',
      description: 'JSONの構文チェックと美化',
      category: 'dev',
      icon: 'heroicons:code-bracket-square',
      route: '/tools/json-formatter',
    },
    {
      id: 'jwt-decoder',
      name: 'JWT 解析・検証',
      description: 'JWTトークンのデコードと署名確認',
      category: 'dev',
      icon: 'heroicons:key',
      route: '/tools/jwt-decoder',
    },
    {
      id: 'uuid-generator',
      name: 'UUID・ID生成',
      description: '各種形式のユニークID作成',
      category: 'dev',
      icon: 'heroicons:hashtag',
      route: '/tools/uuid-generator',
    },
    {
      id: 'password-generator',
      name: 'パスワード生成',
      description: 'セキュアで強力なパスワード作成',
      category: 'dev',
      icon: 'heroicons:lock-closed',
      route: '/tools/password-generator',
    },
    {
      id: 'qr-code-generator',
      name: 'QRコード生成',
      description: 'テキスト・URLからQRコード作成',
      category: 'dev',
      icon: 'heroicons:qr-code',
      route: '/tools/qr-code-generator',
    },
    {
      id: 'cron-expression-builder',
      name: 'Cron式ビルダー',
      description: 'スケジュール実行設定を視覚的作成',
      category: 'dev',
      icon: 'heroicons:cog-6-tooth',
      route: '/tools/cron-expression-builder',
    },
    {
      id: 'hash-generator',
      name: 'ハッシュ生成',
      description: 'MD5/SHA256/SHA512等のハッシュ値生成',
      category: 'dev',
      icon: 'heroicons:finger-print',
      route: '/tools/hash-generator',
      badge: 'New',
    },

    // 🔄 変換・コンバーター（追加）
    {
      id: 'yaml-json-converter',
      name: 'YAML ↔ JSON変換',
      description: 'YAMLとJSONの相互変換',
      category: 'converter',
      icon: 'heroicons:arrows-right-left',
      route: '/tools/yaml-json-converter',
      badge: 'New',
    },

    // 🎨 デザイン・UI（追加）
    {
      id: 'color-contrast-checker',
      name: 'カラーコントラストチェッカー',
      description: 'WCAG準拠のアクセシビリティチェック',
      category: 'design',
      icon: 'heroicons:eye',
      route: '/tools/color-contrast-checker',
      badge: 'New',
    },

    // 📝 テキスト・文書（追加）
    {
      id: 'markdown-table-generator',
      name: 'Markdownテーブル生成',
      description: 'GUIでMarkdownテーブルを作成',
      category: 'text',
      icon: 'heroicons:table-cells',
      route: '/tools/markdown-table-generator',
      badge: 'New',
    },

    // 🧮 計算・数学
    {
      id: 'number-base-converter',
      name: '進数変換計算機',
      description: '2進数/8進数/10進数/16進数の相互変換',
      category: 'math',
      icon: 'heroicons:calculator',
      route: '/tools/number-base-converter',
      badge: 'New',
    },
  ]

  const getToolsByCategory = (category: Tool['category']) => {
    return tools.filter(tool => tool.category === category)
  }

  const getToolById = (id: string) => {
    return tools.find(tool => tool.id === id)
  }

  return {
    tools,
    getToolsByCategory,
    getToolById,
  }
}
