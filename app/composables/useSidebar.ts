import { useMediaQuery } from '@vueuse/core'

const SIDEBAR_COOKIE_NAME = 'sidebar:state'
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '3rem'

export const useSidebar = () => {
  const cookie = useCookie(SIDEBAR_COOKIE_NAME, { default: () => 'true', maxAge: 60 * 60 * 24 * 7 })
  const open = useState('sidebar-open', () => cookie.value !== 'false')
  const openMobile = useState('sidebar-open-mobile', () => false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const state = computed(() => open.value ? 'expanded' : 'collapsed')

  function setOpen(value: boolean) {
    open.value = value
    cookie.value = String(value)
  }

  function toggleSidebar() {
    if (isMobile.value) {
      openMobile.value = !openMobile.value
    }
    else {
      setOpen(!open.value)
    }
  }

  return {
    open,
    openMobile,
    isMobile,
    state,
    setOpen,
    toggleSidebar,
    SIDEBAR_WIDTH,
    SIDEBAR_WIDTH_ICON,
  }
}
