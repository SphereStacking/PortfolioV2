<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { NuxtLink } from '#components'

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes['class'] }>(), {
  as: 'a',
})

// as propが'NuxtLink'の場合はNuxtLinkコンポーネントを使用
const componentToUse = computed(() => {
  if (props.as === 'NuxtLink') {
    return NuxtLink
  }
  return props.as
})
</script>

<template>
  <Primitive
    data-slot="breadcrumb-link"
    :as="componentToUse"
    :as-child="asChild"
    :class="cn('hover:text-foreground transition-colors', props.class)">
    <slot></slot>
  </Primitive>
</template>
