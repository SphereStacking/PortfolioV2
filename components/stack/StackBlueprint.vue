<script setup lang="ts">
interface Technology {
  id: string
  name: string
  logo?: string
  category: string
  tags: string[]
  link?: string
  proficiency?: number
}

interface Category {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
}

const props = defineProps<{
  technologies: (Technology & { id: string })[]
  categories: Category[]
  selectedType: string | null
}>()

const emit = defineEmits<{
  (e: 'select-category', id: string): void
}>()

// カテゴリごとに技術をグループ化
const techByCategory = computed(() => {
  const grouped: Record<string, (Technology & { id: string })[]> = {}
  for (const cat of props.categories) {
    grouped[cat.id] = props.technologies.filter(t => t.category === cat.id)
  }
  return grouped
})

// フィルターされたカテゴリ
const visibleCategories = computed(() => {
  return props.categories.filter((cat) => {
    if (props.selectedType && props.selectedType !== cat.id) return false
    return techByCategory.value[cat.id]?.length > 0
  })
})
</script>

<template>
  <div class="space-y-16">
    <section
      v-for="(category, catIndex) in visibleCategories"
      :key="category.id"
      class="animate-fade-in"
      :style="{ animationDelay: `${catIndex * 100}ms` }">
      <!-- カテゴリ: 2カラムレイアウト -->
      <div class="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-8 items-start">
        <!-- 左: カテゴリ名 -->
        <button
          type="button"
          class="group text-left"
          @click="emit('select-category', category.id)">
          <span class="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
            {{ category.displayName }}
          </span>
        </button>

        <!-- 右: 技術リスト（インラインで流れるように） -->
        <div class="flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <a
            v-for="(tech, techIndex) in techByCategory[category.id]"
            :key="tech.id"
            :href="tech.link || undefined"
            :target="tech.link ? '_blank' : undefined"
            :rel="tech.link ? 'noopener noreferrer' : undefined"
            class="group/tech inline-flex items-center gap-2 transition-all duration-300 opacity-80 hover:opacity-100 animate-fade-in-up"
            :class="tech.link ? 'cursor-pointer' : 'cursor-default'"
            :style="{ animationDelay: `${catIndex * 80 + techIndex * 20}ms` }">
            <SkillIcon :stack="tech.id" class="size-4" />
            <span class="text-sm text-foreground/80 group-hover/tech:text-foreground transition-colors">
              {{ tech.name }}
            </span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out both;
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out both;
}
</style>
