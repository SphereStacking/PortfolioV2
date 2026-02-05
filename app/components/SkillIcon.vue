<script setup lang="ts">
import { computed } from 'vue'
import { useMyStack } from '~/composables/useMyStack'

const props = defineProps<{
  stack: string
}>()

const { getStack } = useMyStack()

const stackData = computed(() => getStack(props.stack))

const component = computed(() => {
  return stackData.value?.link ? 'NuxtLink' : 'div'
})
</script>

<template>
  <Tooltip v-if="stackData?.logo" :text="stackData?.name">
    <component :is="component" :to="stackData?.link" target="_blank">
      <img
        v-bind="$attrs"
        :src="stackData?.logo"
        :class="stackData?.class">
    </component>
  </Tooltip>
</template>
