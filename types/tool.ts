export interface Tool {
  id: string
  name: string
  description: string
  category: 'design' | 'image' | 'text' | 'converter' | 'dev'
  icon: string // Heroicons iconの名前
  route: string
  badge?: string // 例: "New", "Beta"
}

export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: string
  emoji: string
}

export const toolCategories: Record<Tool['category'], ToolCategory> = {
  design: {
    id: 'design',
    name: 'デザイン・UI',
    description: 'カラー、レイアウト、シャドウなどのデザインツール',
    icon: 'heroicons:paint-brush',
    emoji: '🎨',
  },
  image: {
    id: 'image',
    name: '画像・メディア',
    description: '画像変換、圧縮、編集、メタデータ処理ツール',
    icon: 'heroicons:photo',
    emoji: '🖼️',
  },
  text: {
    id: 'text',
    name: 'テキスト・文書',
    description: 'テキスト処理、生成、比較、カウンターツール',
    icon: 'heroicons:document-text',
    emoji: '📝',
  },
  converter: {
    id: 'converter',
    name: '変換・コンバーター',
    description: 'データ形式の相互変換、エンコードツール',
    icon: 'heroicons:arrow-path',
    emoji: '🔄',
  },
  dev: {
    id: 'dev',
    name: '開発・セキュリティ',
    description: 'JSON処理、JWT解析、ID生成、パスワード生成ツール',
    icon: 'heroicons:code-bracket',
    emoji: '⚡',
  },
}
