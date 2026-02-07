import { ref, computed, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import { refDebounced } from '@vueuse/core'

export interface CareerProject {
  id: string
  title: string
  description: string
  status: string
  tags: string[]
  icon: string
  period_start: string
  period_end?: string
  pinned: boolean
  stacks: string[]
  overview: string[]
  tasks: string[]
  team: string
  role: string
  links?: {
    label: string
    url: string
  }[]
}

export interface Career {
  id: string
  unique_code: string
  title: string
  description: string
  date_start: string
  date_end?: string
  tags: string[]
  projects: CareerProject[]
}

export interface TimelineItem {
  year: string
  careers: Career[]
}

export const useCareers = (
  careersData: Ref<Career[] | null>,
) => {
  const route = useRoute()
  const router = useRouter()

  // フィルター状態
  const searchQuery = ref('')
  const selectedYear = ref<string | null>(null)
  const selectedSkill = ref<string | null>(null)

  // URLクエリパラメータから初期値を設定（マウント時に一度だけ）
  onMounted(() => {
    searchQuery.value = (route.query.q as string) || ''
    selectedYear.value = (route.query.year as string) || null
    selectedSkill.value = (route.query.skill as string) || null
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
    if (selectedSkill.value) query.skill = selectedSkill.value

    router.push({ query })
  }

  // 全キャリア
  const allCareers = careersData

  // フィルタリングされたキャリア
  const filteredCareers = computed(() => {
    if (!allCareers.value) return []

    return allCareers.value
      .filter((career) => {
        // 検索クエリによるフィルタリング
        const searchLower = debouncedSearch.value.toLowerCase()
        const matchesSearch = !searchLower
          || career.title.toLowerCase().includes(searchLower)
          || career.description?.toLowerCase().includes(searchLower)
          || career.projects.some(p =>
            p.title.toLowerCase().includes(searchLower)
            || p.description?.toLowerCase().includes(searchLower),
          )

        // 年によるフィルタリング（開始年）
        const startYear = career.date_start.split('/')[0]
        const matchesYear = !selectedYear.value || startYear === selectedYear.value

        // スキルによるフィルタリング
        const careerStacks = career.projects.flatMap(p => p.stacks)
        const matchesSkill = !selectedSkill.value || careerStacks.includes(selectedSkill.value)

        return matchesSearch && matchesYear && matchesSkill
      })
      .sort((a, b) => {
        // 開始日でソート（新しい順）
        const dateA = new Date(a.date_start.replace('/', '-'))
        const dateB = new Date(b.date_start.replace('/', '-'))
        return dateB.getTime() - dateA.getTime()
      })
  })

  // タイムライン形式に整形（年ごとにグループ化）
  const timelineItems = computed<TimelineItem[]>(() => {
    if (!filteredCareers.value.length) return []

    const grouped: Record<string, Career[]> = {}

    filteredCareers.value.forEach((career) => {
      const year = career.date_start.split('/')[0]
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(career)
    })

    return Object.entries(grouped)
      .map(([year, careers]) => ({ year, careers }))
      .sort((a, b) => Number(b.year) - Number(a.year))
  })

  // 利用可能な年のリスト
  const availableYears = computed(() => {
    if (!allCareers.value) return []
    const years = new Set(
      allCareers.value.map(career => career.date_start.split('/')[0]),
    )
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  })

  // 利用可能なスキルのリスト
  const availableSkills = computed(() => {
    if (!allCareers.value) return []
    const skills = new Set(
      allCareers.value.flatMap(career =>
        career.projects.flatMap(p => p.stacks),
      ),
    )
    return Array.from(skills).sort()
  })

  // カウント関連
  const careerCount = computed(() => filteredCareers.value.length)
  const totalCareerCount = computed(() => allCareers.value?.length || 0)
  const projectCount = computed(() =>
    filteredCareers.value.reduce((sum, c) => sum + c.projects.length, 0),
  )
  const totalProjectCount = computed(() =>
    allCareers.value?.reduce((sum, c) => sum + c.projects.length, 0) || 0,
  )

  // フィルター操作
  const setYear = (year: string | null) => {
    selectedYear.value = selectedYear.value === year ? null : year
    updateUrlQuery()
  }

  const setSkill = (skill: string | null) => {
    selectedSkill.value = selectedSkill.value === skill ? null : skill
    updateUrlQuery()
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedYear.value = null
    selectedSkill.value = null
    router.push('/career')
  }

  const hasActiveFilters = computed(() => {
    return !!debouncedSearch.value || !!selectedYear.value || !!selectedSkill.value
  })

  return {
    // データ
    allCareers,
    filteredCareers,
    timelineItems,
    availableYears,
    availableSkills,

    // フィルター状態
    searchQuery,
    debouncedSearch,
    selectedYear,
    selectedSkill,
    isLoading,
    hasActiveFilters,

    // カウント
    careerCount,
    totalCareerCount,
    projectCount,
    totalProjectCount,

    // アクション
    setYear,
    setSkill,
    resetFilters,
  }
}
