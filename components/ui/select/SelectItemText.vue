<script setup lang="ts">
import { SelectItemText, type SelectItemTextProps } from 'reka-ui'

const props = defineProps<SelectItemTextProps>()
</script>

<template>
  <SelectItemText
    data-slot="select-item-text"
    v-bind="props">
    <slot></slot>
  </SelectItemText>
</template>
