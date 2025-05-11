import { ref, computed, watch } from 'vue'
import technologies from '~/content/me/stack/technologies.json'
import categories from '~/content/me/stack/categories.json'
import tags from '~/content/me/stack/tags.json'

// UIカラーの型定義
type UiColor = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'error' | 'warning'

// タグの型定義
interface Tag {
  id: string
  name: string
  color: UiColor
  icon: string
}

interface Technology {
  name: string
  logo?: string
  category: string
  type: string // タイプを明示的に保持
  tags: string[] // タグ配列
  link?: string
  class?: string | null
  isLibrary?: boolean
  proficiency?: number // 1-5の熟練度
}

export const useMyStack = () => {
  // フィルターとソートのための状態
  const searchQuery = ref('')
  const selectedType = ref<string | null>(null)
  const isLoading = ref(false)

  // 検索入力時の遅延処理
  const debouncedSearch = ref(searchQuery.value)
  watch(searchQuery, (newValue) => {
    isLoading.value = true
    setTimeout(() => {
      debouncedSearch.value = newValue
      isLoading.value = false
    }, 300)
  })

  // データ取得関数
  const getStack = (key: string): Technology | undefined => {
    return technologies[key as keyof typeof technologies] as Technology | undefined
  }

  const getTag = (tagId: string): Tag | undefined => {
    return tags.find(tag => tag.id === tagId) as Tag | undefined
  }

  const getCategoryColor = (categoryId: string): UiColor => {
    return (categories[categoryId as keyof typeof categories]?.color || 'neutral') as UiColor
  }

  // 技術タイプの取得（JSONから直接取得）
  const getTechType = (tech: Technology): string => {
    return tech.type || tech.category
  }

  // カテゴリーを配列として取得
  const techTypes = computed(() => {
    return Object.entries(categories).map(([id, category]) => ({
      id,
      name: category.displayName || category.name,
      fullName: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    }))
  })

  // テクノロジーを全てのエントリとして取得
  const allTechnologies = computed(() => {
    return Object.entries(technologies).map(([id, tech]) => ({
      id,
      ...tech as Technology,
    }))
  })

  // 検索とフィルタリング
  const filteredTechnologies = computed(() => {
    return allTechnologies.value.filter((tech) => {
      // 検索クエリによるフィルタリング
      const matchesName = tech.name.toLowerCase().includes(debouncedSearch.value.toLowerCase())
      const matchesTagName = tech.tags && Array.isArray(tech.tags) && tech.tags.some((tagId) => {
        const tag = getTag(tagId)
        return tag?.name.toLowerCase().includes(debouncedSearch.value.toLowerCase())
      })
      const matchesSearch = matchesName || matchesTagName

      // タイプによるフィルタリング
      const techType = getTechType(tech)
      const matchesType = !selectedType.value || techType === selectedType.value

      return matchesSearch && matchesType
    })
  })

  // 技術数のカウント
  const techCount = computed(() => filteredTechnologies.value.length)
  const totalTechCount = computed(() => allTechnologies.value.length)

  // タイプごとの技術数
  const techCountByType = computed(() => {
    const counts: Record<string, number> = {}

    // 初期化
    techTypes.value.forEach((type) => {
      counts[type.id] = 0
    })

    allTechnologies.value.forEach((tech) => {
      const type = getTechType(tech)
      if (!counts[type]) {
        counts[type] = 0
      }
      counts[type]++
    })

    return counts
  })

  // タイプ切り替え
  const setTechType = (typeId: string | null) => {
    if (selectedType.value === typeId) {
      selectedType.value = null
    }
    else {
      selectedType.value = typeId
    }
  }

  // フィルターをリセット
  const resetFilters = () => {
    searchQuery.value = ''
    selectedType.value = null
  }

  return {
    // データソース
    tags,
    categories,

    // UI状態
    searchQuery,
    debouncedSearch,
    selectedType,
    isLoading,

    // 計算されたデータ
    techTypes,
    filteredTechnologies,
    techCount,
    totalTechCount,
    techCountByType,

    // ユーティリティ関数
    getStack,
    getTag,
    getCategoryColor,
    getTechType,

    // アクション
    setTechType,
    resetFilters,

  }
}
