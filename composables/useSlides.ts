import { ref, computed, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import type { Slide } from '~/types/slide'

export const useSlides = (allSlidesData: Ref<Slide[] | null>) => {
  const route = useRoute()
  const router = useRouter()

  // フィルター状態
  const searchQuery = ref('')
  const selectedYear = ref<string | null>(null)

  // URLクエリパラメータから初期値を設定（マウント時に一度だけ）
  onMounted(() => {
    searchQuery.value = (route.query.q as string) || ''
    selectedYear.value = (route.query.year as string) || null
  })

  // VueUseのrefDebouncedを使用
  const debouncedSearch = refDebounced(searchQuery, 300)
  const isLoading = computed(() => searchQuery.value !== debouncedSearch.value)

  // デバウンス後の検索クエリ変更時にURLを更新
  watch(debouncedSearch, () => {
    updateUrlQuery()
  })

  // URLクエリパラメータを更新
  const updateUrlQuery = () => {
    const query: Record<string, string> = {}
    if (debouncedSearch.value) query.q = debouncedSearch.value
    if (selectedYear.value) query.year = selectedYear.value

    router.push({ query })
  }

  // データはページコンポーネントから受け取る
  const allSlides = allSlidesData

  // フィルタリングされたスライド
  const filteredSlides = computed(() => {
    if (!allSlides.value) return []

    return allSlides.value
      .filter((slide) => {
        // 検索クエリによるフィルタリング
        const searchLower = debouncedSearch.value.toLowerCase()
        const matchesSearch = !searchLower
          || slide.title.toLowerCase().includes(searchLower)
          || slide.description?.toLowerCase().includes(searchLower)

        // 年によるフィルタリング
        const slideDate = new Date(slide.date)
        const slideYear = slideDate.getFullYear().toString()
        const matchesYear = !selectedYear.value || slideYear === selectedYear.value

        return matchesSearch && matchesYear
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // 利用可能な年のリスト
  const availableYears = computed(() => {
    if (!allSlides.value) return []
    const years = new Set(
      allSlides.value.map(slide => new Date(slide.date).getFullYear().toString()),
    )
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  })

  // カウント関連
  const slideCount = computed(() => filteredSlides.value.length)
  const totalSlideCount = computed(() => allSlides.value?.length || 0)

  // 年ごとのスライド数
  const slideCountByYear = computed(() => {
    const counts: Record<string, number> = {}
    availableYears.value.forEach((year) => {
      counts[year] = allSlides.value?.filter(
        slide => new Date(slide.date).getFullYear().toString() === year,
      ).length || 0
    })
    return counts
  })

  // フィルター操作
  const setYear = (year: string | null) => {
    selectedYear.value = selectedYear.value === year ? null : year
    updateUrlQuery()
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedYear.value = null
    router.push('/talk')
  }

  return {
    // データ
    allSlides,
    filteredSlides,
    availableYears,

    // フィルター状態
    searchQuery,
    debouncedSearch,
    selectedYear,
    isLoading,

    // カウント
    slideCount,
    totalSlideCount,
    slideCountByYear,

    // アクション
    setYear,
    resetFilters,
  }
}
