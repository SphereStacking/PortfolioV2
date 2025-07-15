export default {
  // Set the domain for the portfolio
  domain: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  title: 'SphereStacking Portfolio',
  description: 'エンジニアリングとクリエイティブな作品を展示するポートフォリオサイト',
  // Custom sections for the portfolio
  sections: [
    {
      title: 'Blog Articles',
      description: '技術ブログ、学習記録、プロジェクトの振り返り',
      links: [
        {
          title: 'All Articles',
          description: '全てのブログ記事一覧',
          href: '/blog',
        },
      ],
    },
    {
      title: 'Career History',
      description: '職歴とスキルセット',
      links: [
        {
          title: 'Career Timeline',
          description: 'これまでのキャリアと経験',
          href: '/career',
        },
      ],
    },
    {
      title: 'Projects',
      description: '開発プロジェクトの詳細',
      links: [
        {
          title: 'Project Gallery',
          description: '参画したプロジェクトの一覧',
          href: '/project',
        },
      ],
    },
    {
      title: 'Technical Stack',
      description: '技術スタックとスキル',
      links: [
        {
          title: 'Tech Stack',
          description: '使用技術とスキルレベル',
          href: '/stack',
        },
      ],
    },
    {
      title: 'Creative Works',
      description: '3DとCSSアートの実験',
      links: [
        {
          title: '3D Art',
          description: '3Dを使用したアート作品',
          href: '/art/3d',
        },
        {
          title: 'CSS Art',
          description: 'CSSを使用したアート作品',
          href: '/art/css',
        },
      ],
    },
  ],
}
