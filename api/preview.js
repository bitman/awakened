const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|::1|\[::1\])/i

export function firstHttpUrl(text) {
  const match = String(text ?? '').match(/https?:\/\/[^\s<>"']+/i)
  if (!match) return undefined
  return match[0].replace(/[),.;]+$/g, '')
}

function allowedUrl(raw) {
  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    return null
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
  if (PRIVATE_HOST.test(parsed.hostname)) return null
  return parsed
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const named = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
    'i',
  )
  const contentFirst = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["']`,
    'i',
  )
  return (html.match(named) || html.match(contentFirst) || [])[1]
}

const NAMED = {
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

function decode(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number(digits)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED[name.toLowerCase()] ?? match)
}

function tidyTitle(raw) {
  let title = decode(raw).replace(/\s+/g, ' ').trim()
  title = title.replace(/^[\d.,]+\s*[KMB]?\s*views\b[^|]{0,60}\|\s*/i, '')
  if (title.length > 140) {
    const cut = title.slice(0, 140)
    const at = cut.lastIndexOf(' ')
    title = `${(at > 80 ? cut.slice(0, at) : cut).trim()}…`
  }
  return title
}

function absolute(base, maybe) {
  try {
    return new URL(maybe, base).toString()
  } catch {
    return maybe
  }
}

export async function fetchPreview(rawUrl) {
  const parsed = allowedUrl(rawUrl)
  if (!parsed) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'the-awakened.uk link preview' },
    })
    if (!response.ok) return { url: parsed.toString(), title: parsed.hostname, image: null }

    const type = response.headers.get('content-type') ?? ''
    if (type.startsWith('image/')) {
      return { url: parsed.toString(), title: parsed.hostname, image: parsed.toString() }
    }

    const html = (await response.text()).slice(0, 200_000)
    const image =
      metaContent(html, 'og:image') ||
      metaContent(html, 'og:image:url') ||
      metaContent(html, 'twitter:image')
    const title =
      metaContent(html, 'og:title') ||
      metaContent(html, 'twitter:title') ||
      (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] ||
      parsed.hostname

    return {
      url: parsed.toString(),
      title: tidyTitle(title),
      image: image ? absolute(parsed.toString(), decode(image).trim()) : null,
    }
  } catch {
    return { url: parsed.toString(), title: parsed.hostname, image: null }
  } finally {
    clearTimeout(timer)
  }
}
