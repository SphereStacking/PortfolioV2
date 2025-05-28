<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cardVariants, type CardVariants } from '.'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: CardVariants['variant']
  size?: CardVariants['size']
  rounded?: CardVariants['rounded']
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        cardVariants({ variant, size, rounded }),
        props.class,
      )
    ">
    <slot></slot>
  </div>
</template>
