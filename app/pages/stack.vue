<script setup lang="ts">
import { useMyStack } from '~/composables/useMyStack'

const {
  techTypes,
  searchQuery,
  debouncedSearch,
  selectedType,
  isLoading,
  filteredTechnologies,
  techCount,
  totalTechCount: _totalTechCount,
  setTechType,
  resetFilters,
} = useMyStack()

const categories = computed(() => {
  return techTypes.value.map(type => ({
    id: type.id,
    name: type.fullName,
    displayName: type.name,
    icon: type.icon,
    color: type.color,
  }))
})

const handleSelectCategory = (categoryId: string) => {
  setTechType(categoryId)
}
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader theme="stack">
      <template #title>
        Stack
      </template>
      <template #description>
        <p class="text-center text-white/50 text-xs tracking-[0.3em] uppercase mb-8">
          {{ techCount }} Technologies
        </p>

        <div class="max-w-2xl mx-auto relative z-10">
          <Input
            v-model="searchQuery"
            placeholder="技術名で検索..."
            variant="outline"
            size="lg" />
          <div class="flex items-center absolute right-2 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin mr-2" />
            <Button
              v-if="searchQuery || selectedType"
              variant="outline"
              size="xs"
              rounded="full"
              @click="resetFilters">
              <Icon name="heroicons:x-mark" />
            </Button>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="container mx-auto px-4 mt-8 relative z-10">
      <!-- 技術スタック -->
      <StackBlueprint
        v-if="filteredTechnologies.length > 0"
        :technologies="filteredTechnologies"
        :categories="categories"
        :selected-type="selectedType"
        @select-category="handleSelectCategory" />

      <!-- 該当なし -->
      <div v-else class="text-center py-24">
        <p class="text-xs text-muted-foreground/40 tracking-wide">
          No results for "{{ debouncedSearch }}"
        </p>
        <button
          type="button"
          class="mt-4 text-[11px] tracking-wider uppercase text-muted-foreground/60 hover:text-foreground transition-colors"
          @click="resetFilters">
          Reset
        </button>
      </div>
    </div>
  </div>
</template>
