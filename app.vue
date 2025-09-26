<script setup>
import { SpeedInsights } from "@vercel/speed-insights/nuxt"
</script>
<template>
  <TooltipProvider>
    <SpeedInsights/> 
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </TooltipProvider>
</template>
