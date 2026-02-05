<script setup lang="ts">
defineProps<{
  loading?: boolean
  error?: boolean
  fallback?: boolean
}>()
</script>

<template>
  <slot v-if="loading" name="loading">
  </slot>
  <slot v-else-if="error" name="error">
  </slot>
  <slot v-else-if="fallback" name="fallback">
  </slot>
  <slot v-else name="default">
  </slot>
</template>
