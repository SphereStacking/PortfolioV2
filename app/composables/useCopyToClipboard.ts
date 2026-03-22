export const useCopyToClipboard = () => {
  const { copy } = useClipboard()
  const toast = useToast()

  const copyToClipboard = async (text: string, label?: string) => {
    if (!text) return
    try {
      await copy(text)
      toast.add({
        description: label
          ? `${label}をクリップボードにコピーしました`
          : 'クリップボードにコピーしました',
      })
    }
    catch (err) {
      console.error('Failed to copy:', err)
      toast.add({ description: 'コピーに失敗しました', color: 'error' })
    }
  }

  return { copyToClipboard }
}
