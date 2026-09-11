export function firstHttpUrl(text: string) {
  const match = text.match(/https?:\/\/[^\s<>"']+/i)
  if (!match) return undefined
  return match[0].replace(/[),.;]+$/g, '')
}

export function linkParts(text: string) {
  const url = firstHttpUrl(text)
  if (!url) return [{ type: 'text' as const, value: text }]

  const index = text.indexOf(url)
  const parts: { type: 'text' | 'link'; value: string }[] = []
  if (index > 0) parts.push({ type: 'text', value: text.slice(0, index) })
  parts.push({ type: 'link', value: url })
  const rest = text.slice(index + url.length)
  if (rest) parts.push({ type: 'text', value: rest })
  return parts
}
