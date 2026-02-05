export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client) {
    try {
      const { saveRecord } = useEncounterRecord()
      const at = to.query.at as string | undefined
      saveRecord(at)
      console.log(`[Sphere Stacking] Encounter recorded from: ${at}`)
    }
    catch (error) {
      console.error('[Sphere Stacking] Failed to record encounter:', error)
    }
  }
})
