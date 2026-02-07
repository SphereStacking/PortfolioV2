import { inject, type Ref } from 'vue'

interface SidebarContext {
  open: Ref<boolean>
  setOpen: (value: boolean) => void
  openMobile: Ref<boolean>
  setOpenMobile: (value: boolean) => void
  toggleSidebar: () => void
}

export const useSidebar = () => {
  const context = inject<SidebarContext>('sidebar')

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }

  return context
}

export const useIsMobile = () => {
  const isMobile = ref(false)

  onMounted(() => {
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 1024
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })
  })

  return { isMobile }
}
