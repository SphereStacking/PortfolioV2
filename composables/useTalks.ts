import { ref, computed, watch } from 'vue'
import type { ParsedContent } from '@nuxt/content'
import type { Ref } from 'vue'

// トークの型定義
export interface Talk extends ParsedContent {
  title: string
  description: string
  event_name: string
  event_date: string
  location: string
  type: 'conference' | 'meetup' | 'webinar' | 'workshop' | 'other'
  draft: boolean
  slides_url?: string
  video_url?: string
  tags?: string[]
  icons?: string[]
}

// トークタイプの定義
const talkTypes = {
  conference: { name: 'カンファレンス', icon: 'heroicons:presentation-chart-line' },
  meetup: { name: 'ミートアップ', icon: 'heroicons:user-group' },
  webinar: { name: 'ウェビナー', icon: 'heroicons:video-camera' },
  workshop: { name: 'ワークショップ', icon: 'heroicons:academic-cap' },
  other: { name: 'その他', icon: 'heroicons:sparkles' },
}

export const useTalks = (allTalksData: Ref<Talk[] | null>) => {
  const route = useRoute()
  const router = useRouter()

  // フィルター状態
  const searchQuery = ref('')
  const selectedYear = ref<string | null>(null)
  const selectedType = ref<string | null>(null)
  const selectedTag = ref<string | null>(null)
  const isLoading = ref(false)

  // URLクエリパラメータから初期値を設定
  watchEffect(() => {
    searchQuery.value = (route.query.q as string) || ''
    selectedYear.value = (route.query.year as string) || null
    selectedType.value = (route.query.type as string) || null
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
    if (selectedType.value) query.type = selectedType.value
    if (selectedTag.value) query.tag = selectedTag.value

    router.push({ query })
  }

  // データはページコンポーネントから受け取る
  const allTalks = allTalksData

  // フィルタリングされたトーク
  const filteredTalks = computed(() => {
    if (!allTalks.value) return []

    return allTalks.value.filter((talk) => {
      // 検索クエリによるフィルタリング
      const searchLower = debouncedSearch.value.toLowerCase()
      const matchesSearch = !searchLower
        || talk.title.toLowerCase().includes(searchLower)
        || talk.description?.toLowerCase().includes(searchLower)
        || talk.event_name?.toLowerCase().includes(searchLower)
        || talk.tags?.some(tag => tag.toLowerCase().includes(searchLower))

      // 年によるフィルタリング
      const matchesYear = !selectedYear.value || talk.event_date?.startsWith(selectedYear.value)

      // タイプによるフィルタリング
      const matchesType = !selectedType.value || talk.type === selectedType.value

      // タグによるフィルタリング
      const matchesTag = !selectedTag.value || talk.tags?.includes(selectedTag.value)

      return matchesSearch && matchesYear && matchesType && matchesTag
    })
  })

  // 利用可能な年のリスト
  const availableYears = computed(() => {
    if (!allTalks.value) return []
    const years = new Set(allTalks.value.map(talk => talk.event_date?.substring(0, 4)).filter(Boolean))
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  })

  // 利用可能なタグのリスト
  const availableTags = computed(() => {
    if (!allTalks.value) return []
    const tags = new Set<string>()
    allTalks.value.forEach((talk) => {
      talk.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  })

  // カウント関連
  const talkCount = computed(() => filteredTalks.value.length)
  const totalTalkCount = computed(() => allTalks.value?.length || 0)

  // 年ごとのトーク数
  const talkCountByYear = computed(() => {
    const counts: Record<string, number> = {}
    availableYears.value.forEach((year) => {
      counts[year] = allTalks.value?.filter(talk => talk.event_date?.startsWith(year)).length || 0
    })
    return counts
  })

  // タイプごとのトーク数
  const talkCountByType = computed(() => {
    const counts: Record<string, number> = {}
    Object.keys(talkTypes).forEach((type) => {
      counts[type] = allTalks.value?.filter(talk => talk.type === type).length || 0
    })
    return counts
  })

  // タグごとのトーク数
  const talkCountByTag = computed(() => {
    const counts: Record<string, number> = {}
    availableTags.value.forEach((tag) => {
      counts[tag] = allTalks.value?.filter(talk => talk.tags?.includes(tag)).length || 0
    })
    return counts
  })

  // フィルター操作
  const setYear = (year: string | null) => {
    selectedYear.value = selectedYear.value === year ? null : year
    updateUrlQuery()
  }

  const setType = (type: string | null) => {
    selectedType.value = selectedType.value === type ? null : type
    updateUrlQuery()
  }

  const setTag = (tag: string | null) => {
    selectedTag.value = selectedTag.value === tag ? null : tag
    updateUrlQuery()
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedYear.value = null
    selectedType.value = null
    selectedTag.value = null
    router.push('/talk')
  }

  return {
    // データ
    talkTypes,
    allTalks,
    filteredTalks,
    availableYears,
    availableTags,

    // フィルター状態
    searchQuery,
    debouncedSearch,
    selectedYear,
    selectedType,
    selectedTag,
    isLoading,

    // カウント
    talkCount,
    totalTalkCount,
    talkCountByYear,
    talkCountByType,
    talkCountByTag,

    // アクション
    setYear,
    setType,
    setTag,
    resetFilters,
  }
}
