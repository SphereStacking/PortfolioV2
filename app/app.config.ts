export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc',
    },
    input: {
      slots: {
        root: 'relative inline-flex items-center w-full',
      },
    },
    textarea: {
      slots: {
        root: 'relative inline-flex items-center w-full',
      },
    },
    select: {
      slots: {
        base: 'relative group rounded-md inline-flex items-center focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 w-full',
      },
    },
  },
})
