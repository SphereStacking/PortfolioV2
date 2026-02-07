<script setup>
import { SpeedInsights } from '@vercel/speed-insights/nuxt'
import { Analytics } from '@vercel/analytics/nuxt'
</script>

<template>
  <TooltipProvider>
    <SpeedInsights />
    <Analytics />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </TooltipProvider>
</template>
