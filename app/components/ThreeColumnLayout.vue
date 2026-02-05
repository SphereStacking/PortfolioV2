<script setup lang="ts">
interface ColumnConfig {
  class?: string
  visible: boolean
}

interface Props {
  left?: Partial<ColumnConfig> | boolean
  main?: Partial<ColumnConfig> | boolean
  right?: Partial<ColumnConfig> | boolean
}

const defaultConfig: Record<'left' | 'main' | 'right', ColumnConfig> = {
  left: { class: 'md:col-span-2', visible: true },
  main: { class: 'md:col-span-8', visible: true },
  right: { class: 'md:col-span-2', visible: true },
}

const props = withDefaults(defineProps<Props>(), {
  left: () => ({}),
  main: () => ({}),
  right: () => ({}),
})

const createColumnConfig = (prop: Partial<ColumnConfig> | boolean, defaultConfig: ColumnConfig): ColumnConfig => {
  if (typeof prop === 'boolean') {
    return { ...defaultConfig, visible: prop }
  }
  return { ...defaultConfig, ...prop }
}

const columns = computed(() => ({
  left: createColumnConfig(props.left, defaultConfig.left),
  main: createColumnConfig(props.main, defaultConfig.main),
  right: createColumnConfig(props.right, defaultConfig.right),
}))
</script>

<template>
  <div class="min-h-screen">
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <slot name="header"></slot>
      </div>
      <aside
        v-if="columns.left.visible"
        :class="[
          'p-4',
          columns.left.class,
        ]">
        <slot name="left"></slot>
      </aside>

      <main
        v-if="columns.main.visible"
        :class="[
          columns.main.class,
        ]">
        <slot></slot>
      </main>

      <aside
        v-if="columns.right.visible"
        :class="[
          columns.right.class,
        ]">
        <slot name="right"></slot>
      </aside>
      <div class="col-span-12">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>
