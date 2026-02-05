/**
 * 日付を日本語フォーマットに変換
 * @param dateStr ISO形式の日付文字列
 * @returns 日本語フォーマットの日付文字列（例: 2024年1月15日）
 */
export const formatDateJa = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
