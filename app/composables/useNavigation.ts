// ナビゲーション項目の型定義
export interface NavigationItem {
  title: string
  href: string
  description: string
  icon?: string
}

export interface NavigationCategory {
  name: string
  icon: string
  items: NavigationItem[]
}

export const useNavigation = () => {
  // About - 自己紹介系
  const aboutComponents: NavigationItem[] = [
    {
      title: 'Stack',
      href: '/stack',
      description: '使用している技術スタックやツールの一覧',
      icon: 'heroicons:cpu-chip',
    },
  ]

  // Contents - コンテンツ系
  const contentsComponents: NavigationItem[] = [
    {
      title: 'Blog',
      href: '/blog',
      description: '技術記事や学習記録を共有',
      icon: 'heroicons:pencil-square',
    },
    {
      title: 'Talk',
      href: '/talk',
      description: 'これまでの発表資料',
      icon: 'heroicons:presentation-chart-bar',
    },
  ]

  // Works - 実務経験系
  const worksComponents: NavigationItem[] = [
    {
      title: 'Career',
      href: '/career',
      description: 'これまでの職歴や実務プロジェクト',
      icon: 'heroicons:briefcase',
    },
  ]

  // Creative - クリエイティブ系
  const creativeComponents: NavigationItem[] = [
    {
      title: 'Projects',
      href: '/project',
      description: '個人開発や趣味のプロジェクト',
      icon: 'heroicons:rocket-launch',
    },
    {
      title: 'CSS Art',
      href: '/art/css',
      description: 'CSSで作成したアート作品の展示',
      icon: 'heroicons:paint-brush',
    },
    {
      title: '3D Art',
      href: '/art/3d',
      description: '3Dモデリングやデジタルアート作品の展示',
      icon: 'heroicons:cube',
    },
    {
      title: 'Graphics',
      href: '/art/graphics',
      description: 'WebGLとWebGPUを使用したシェーダーデモ',
      icon: 'heroicons:sparkles',
    },
    {
      title: 'Tools',
      href: '/tools',
      description: '開発に役立つ便利なツール集',
      icon: 'heroicons:wrench-screwdriver',
    },
  ]

  // すべてのカテゴリをまとめた配列
  const navigationCategories: NavigationCategory[] = [
    { name: 'About', icon: 'heroicons:user', items: aboutComponents },
    { name: 'Contents', icon: 'heroicons:document-text', items: contentsComponents },
    { name: 'Works', icon: 'heroicons:folder', items: worksComponents },
    { name: 'Creative', icon: 'heroicons:beaker', items: creativeComponents },
  ]

  return {
    aboutComponents,
    contentsComponents,
    worksComponents,
    creativeComponents,
    navigationCategories,
  }
}
