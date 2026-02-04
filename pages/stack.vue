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
  totalTechCount,
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
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900' }">
      <template #title>
        Stack
      </template>
      <template #description>
        <p class="text-center text-white/50 text-xs tracking-[0.3em] uppercase mb-8">
          {{ techCount }} Technologies
        </p>

        <div class="max-w-sm mx-auto relative z-10">
          <Input
            v-model="searchQuery"
            placeholder="Search..."
            variant="outline"
            size="lg"
            class="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          <div class="flex items-center absolute right-3 top-1/2 -translate-y-1/2">
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin text-white/50" />
            <button
              v-if="searchQuery || selectedType"
              type="button"
              class="p-1 rounded-full hover:bg-white/10 transition-colors"
              @click="resetFilters">
              <Icon name="heroicons:x-mark" class="size-4 text-white/50" />
            </button>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="container mx-auto px-4 -mt-8 relative z-10">
      <!-- フィルター -->
      <Card class="mb-12 p-5">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            class="px-3 py-1 text-[11px] tracking-wider uppercase rounded-full border transition-all duration-200"
            :class="[
              selectedType === category.id
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground/60 border-transparent hover:text-foreground',
            ]"
            @click="handleSelectCategory(category.id)">
            {{ category.displayName }}
          </button>
        </div>
      </Card>

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
