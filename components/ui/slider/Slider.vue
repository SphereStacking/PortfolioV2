<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  type SliderRootEmits,
  type SliderRootProps,
} from 'reka-ui'
import { cn } from '~/lib/utils'

interface Props extends SliderRootProps {
  class?: HTMLAttributes['class']
  modelValue?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [0],
})

const emits = defineEmits<SliderRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, modelValue: __, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits as any)
</script>

<template>
  <SliderRoot
    :class="cn(
      'relative flex w-full touch-none select-none items-center',
      props.class,
    )"
    v-bind="forwarded">
    <SliderTrack class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderRange class="absolute h-full bg-primary" />
    </SliderTrack>
    <SliderThumb
      v-for="(_, key) in props.modelValue"
      :key="key"
      class="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderRoot>
</template>
