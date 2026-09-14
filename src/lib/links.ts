export function firstHttpUrl(text: string) {
  const match = text.match(/https?:\/\/[^\s<>"']+/i)
  if (!match) return undefined
  return match[0].replace(/[),.;]+$/g, '')
}

const NAMED: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  middot: '·',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (match, hex: string) => {
      const code = Number.parseInt(hex, 16)
      try {
        return Number.isFinite(code) ? String.fromCodePoint(code) : match
      } catch {
        return match
      }
    })
    .replace(/&#(\d+);/g, (match, digits: string) => {
      const code = Number(digits)
      try {
        return Number.isFinite(code) ? String.fromCodePoint(code) : match
      } catch {
        return match
      }
    })
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED[name.toLowerCase()] ?? match)
}

export function tidyLinkTitle(raw: string) {
  let title = decodeHtmlEntities(raw).replace(/\s+/g, ' ').trim()
  title = title.replace(/^[\d.,]+\s*[KMB]?\s*views\b[^|]{0,60}\|\s*/i, '')
  if (title.length > 140) {
    const cut = title.slice(0, 140)
    const at = cut.lastIndexOf(' ')
    title = `${(at > 80 ? cut.slice(0, at) : cut).trim()}…`
  }
  return title
}

export function bodyIsOnlyUrl(body: string, url?: string) {
  const trimmed = body.trim()
  if (!trimmed) return false
  const found = url ?? firstHttpUrl(trimmed)
  return Boolean(found && trimmed === found)
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
