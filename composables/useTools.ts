import type { Tool } from '~/types/tool'

export const useTools = () => {
  const tools: Tool[] = [
    // カラー・デザイン系
    {
      id: 'color-palette',
      name: 'カラーパレットジェネレーター',
      description: '美しい配色を自動生成し、アクセシビリティをチェック',
      category: 'color',
      icon: 'Palette',
      route: '/tools/color-palette',
      badge: 'New',
    },
    {
      id: 'gradient-maker',
      name: 'グラデーションメーカー',
      description: 'CSS/SVGグラデーションを視覚的に作成',
      category: 'color',
      icon: 'Brush',
      route: '/tools/gradient-maker',
    },
    {
      id: 'shadow-generator',
      name: 'シャドウジェネレーター',
      description: 'box-shadow/text-shadowを視覚的に調整',
      category: 'css',
      icon: 'Square',
      route: '/tools/shadow-generator',
    },

    // CSS・レイアウト系
    {
      id: 'flexbox-playground',
      name: 'Flexboxプレイグラウンド',
      description: 'Flexboxのプロパティを視覚的に学習',
      category: 'css',
      icon: 'LayoutGrid',
      route: '/tools/flexbox-playground',
    },
    {
      id: 'grid-generator',
      name: 'CSS Gridジェネレーター',
      description: 'CSS Gridレイアウトを視覚的に生成',
      category: 'css',
      icon: 'Grid3x3',
      route: '/tools/grid-generator',
    },

    // 画像・メディア系
    {
      id: 'image-compressor',
      name: '画像圧縮ツール',
      description: 'WebP/AVIF変換、画像の最適化',
      category: 'image',
      icon: 'ImageMinus',
      route: '/tools/image-compressor',
    },
    {
      id: 'base64-image',
      name: 'Base64画像エンコーダー',
      description: '画像をBase64形式に変換',
      category: 'image',
      icon: 'FileImage',
      route: '/tools/base64-image',
    },

    // テキスト・文字列系
    {
      id: 'lorem-ipsum',
      name: 'Lorem Ipsumジェネレーター',
      description: '日本語対応のダミーテキスト生成',
      category: 'text',
      icon: 'Text',
      route: '/tools/lorem-ipsum',
    },
    {
      id: 'character-counter',
      name: '文字数カウンター',
      description: '文字数、バイト数、改行数をカウント',
      category: 'text',
      icon: 'Calculator',
      route: '/tools/character-counter',
    },
    {
      id: 'regex-tester',
      name: '正規表現テスター',
      description: 'リアルタイムで正規表現をテスト',
      category: 'text',
      icon: 'Regex',
      route: '/tools/regex-tester',
    },

    // 開発補助系
    {
      id: 'json-formatter',
      name: 'JSON整形・検証',
      description: 'JSONのフォーマットとバリデーション',
      category: 'dev',
      icon: 'Braces',
      route: '/tools/json-formatter',
      badge: 'Popular',
    },
    {
      id: 'base64-encoder',
      name: 'Base64エンコード/デコード',
      description: 'テキストのBase64変換',
      category: 'dev',
      icon: 'Binary',
      route: '/tools/base64-encoder',
    },
    {
      id: 'jwt-decoder',
      name: 'JWT解析ツール',
      description: 'JWTトークンのデコードと検証',
      category: 'dev',
      icon: 'Key',
      route: '/tools/jwt-decoder',
    },
    {
      id: 'uuid-generator',
      name: 'UUID/ID生成',
      description: '各種フォーマットのID生成',
      category: 'dev',
      icon: 'Hash',
      route: '/tools/uuid-generator',
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