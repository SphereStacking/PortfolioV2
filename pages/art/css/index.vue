<script setup>
import UltimateGradients from '~/components/Art/UltimateGradients.vue'
import PerformanceMonitor from '~/components/Art/PerformanceMonitor.vue'
</script>

<template>
  <div class="min-h-screen pb-16">
    <PageHeader :ui="{ headerColor: 'bg-gradient-to-r from-teal-800/70 via-teal-500/70 to-teal-200/70' }">
      <template #title>
        CSS Art
      </template>
    </PageHeader>
    <div class="container mx-auto mb-16 mt-8">
      <PerformanceMonitor
        :enabled="true"
        position="bottom-right" />
      <UltimateGradients />
    </div>
  </div>
</template>
