import { ref, computed, watch } from 'vue'
import type { ParsedContent } from '@nuxt/content'
import type { Ref } from 'vue'

// ブログ記事の型定義
export interface BlogPost extends ParsedContent {
  title: string
  description?: string
  created: string
  updated?: string
  draft: boolean
  tags?: string[]
  icons?: string[]
  image?: string
}

export const useBlogs = (allBlogData: Ref<BlogPost[] | null>) => {
  const route = useRoute()
  const router = useRouter()

  // フィルター状態
  const searchQuery = ref('')
  const selectedYear = ref<string | null>(null)
  const selectedMonth = ref<string | null>(null)
  const selectedTag = ref<string | null>(null)
  const isLoading = ref(false)

  // URLクエリパラメータから初期値を設定
  watchEffect(() => {
    searchQuery.value = (route.query.q as string) || ''
    selectedYear.value = (route.query.year as string) || null
    selectedMonth.value = (route.query.month as string) || null
    selectedTag.value = (route.query.tag as string) || null
  })

  // 検索入力時の遅延処理
  const debouncedSearch = ref(searchQuery.value)
  watch(searchQuery, (newValue) => {
    isLoading.value = true
    setTimeout(() => {
      debouncedSearch.value = newValue
      isLoading.value = false
      updateUrlQuery()
    }, 300)
  })

  // URLクエリパラメータを更新
  const updateUrlQuery = () => {
    const query: Record<string, string> = {}
    if (debouncedSearch.value) query.q = debouncedSearch.value
    if (selectedYear.value) query.year = selectedYear.value
    if (selectedMonth.value) query.month = selectedMonth.value
    if (selectedTag.value) query.tag = selectedTag.value

    router.push({ query })
  }

  // データはページコンポーネントから受け取る
  const allPosts = allBlogData

  // フィルタリングされた記事
  const filteredPosts = computed(() => {
    if (!allPosts.value) return []

    return allPosts.value.filter((post) => {
      // 検索クエリによるフィルタリング
      const searchLower = debouncedSearch.value.toLowerCase()
      const matchesSearch = !searchLower
        || post.title.toLowerCase().includes(searchLower)
        || post.description?.toLowerCase().includes(searchLower)
        || post.tags?.some(tag => tag.toLowerCase().includes(searchLower))

      // 年によるフィルタリング
      const postDate = new Date(post.created)
      const postYear = postDate.getFullYear().toString()
      const matchesYear = !selectedYear.value || postYear === selectedYear.value

      // 月によるフィルタリング
      const postMonth = (postDate.getMonth() + 1).toString().padStart(2, '0')
      const matchesMonth = !selectedMonth.value || postMonth === selectedMonth.value

      // タグによるフィルタリング
      const matchesTag = !selectedTag.value || post.tags?.includes(selectedTag.value)

      return matchesSearch && matchesYear && matchesMonth && matchesTag
    })
  })

  // 利用可能な年のリスト
  const availableYears = computed(() => {
    if (!allPosts.value) return []
    const years = new Set(
      allPosts.value.map(post => new Date(post.created).getFullYear().toString()),
    )
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  })

  // 利用可能な月のリスト（選択された年に基づく）
  const availableMonths = computed(() => {
    if (!allPosts.value || !selectedYear.value) return []

    const months = new Set<string>()
    allPosts.value.forEach((post) => {
      const postDate = new Date(post.created)
      const postYear = postDate.getFullYear().toString()

      if (postYear === selectedYear.value) {
        const month = (postDate.getMonth() + 1).toString().padStart(2, '0')
        months.add(month)
      }
    })

    return Array.from(months).sort()
  })

  // 利用可能なタグのリスト
  const availableTags = computed(() => {
    if (!allPosts.value) return []
    const tags = new Set<string>()
    allPosts.value.forEach((post) => {
      post.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  })

  // カウント関連
  const postCount = computed(() => filteredPosts.value.length)
  const totalPostCount = computed(() => allPosts.value?.length || 0)

  // 年ごとの記事数
  const postCountByYear = computed(() => {
    const counts: Record<string, number> = {}
    availableYears.value.forEach((year) => {
      counts[year] = allPosts.value?.filter(
        post => new Date(post.created).getFullYear().toString() === year,
      ).length || 0
    })
    return counts
  })

  // タグごとの記事数
  const postCountByTag = computed(() => {
    const counts: Record<string, number> = {}
    availableTags.value.forEach((tag) => {
      counts[tag] = allPosts.value?.filter(post => post.tags?.includes(tag)).length || 0
    })
    return counts
  })

  // フィルター操作
  const setYear = (year: string | null) => {
    selectedYear.value = selectedYear.value === year ? null : year
    // 年が変更されたら月もリセット
    if (!year || selectedYear.value !== year) {
      selectedMonth.value = null
    }
    updateUrlQuery()
  }

  const setMonth = (month: string | null) => {
    selectedMonth.value = selectedMonth.value === month ? null : month
    updateUrlQuery()
  }

  const setTag = (tag: string | null) => {
    selectedTag.value = selectedTag.value === tag ? null : tag
    updateUrlQuery()
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedYear.value = null
    selectedMonth.value = null
    selectedTag.value = null
    router.push('/blog')
  }

  return {
    // データ
    allPosts,
    filteredPosts,
    availableYears,
    availableMonths,
    availableTags,

    // フィルター状態
    searchQuery,
    debouncedSearch,
    selectedYear,
    selectedMonth,
    selectedTag,
    isLoading,

    // カウント
    postCount,
    totalPostCount,
    postCountByYear,
    postCountByTag,

    // アクション
    setYear,
    setMonth,
    setTag,
    resetFilters,
  }
}
