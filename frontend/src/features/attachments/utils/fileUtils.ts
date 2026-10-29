export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getFileCategory(
  mimeType: string,
): 'image' | 'pdf' | 'doc' | 'sheet' | 'zip' | 'file' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml'))
    return 'doc'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheetml') || mimeType === 'text/csv') {
    return 'sheet'
  }
  if (mimeType.includes('zip')) return 'zip'
  return 'file'
}
