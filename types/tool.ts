export interface Tool {
  id: string
  name: string
  description: string
  category: 'color' | 'css' | 'image' | 'text' | 'dev' | 'performance'
  icon: string // Lucide iconの名前
  route: string
  badge?: string // 例: "New", "Beta"
}

export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: string
}

export const toolCategories: Record<Tool['category'], ToolCategory> = {
  color: {
    id: 'color',
    name: 'カラー・デザイン',
    description: '配色、グラデーション、シャドウなどのデザインツール',
    icon: 'Palette',
  },
  css: {
    id: 'css',
    name: 'CSS・レイアウト',
    description: 'FlexboxやGrid、アニメーションなどのCSSツール',
    icon: 'Code2',
  },
  image: {
    id: 'image',
    name: '画像・メディア',
    description: '画像圧縮、変換、最適化ツール',
    icon: 'Image',
  },
  text: {
    id: 'text',
    name: 'テキスト・文字列',
    description: 'テキスト処理、生成、変換ツール',
    icon: 'Type',
  },
  dev: {
    id: 'dev',
    name: '開発補助',
    description: 'JSON、エンコード、デコードなどの開発ツール',
    icon: 'Terminal',
  },
  performance: {
    id: 'performance',
    name: 'パフォーマンス',
    description: 'Webサイトの最適化ツール',
    icon: 'Zap',
  },
}