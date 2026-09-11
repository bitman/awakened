export function formatDate(iso: string) {
  const date = iso.includes('T') ? new Date(iso) : new Date(`${iso}T00:00:00`)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(iso: string) {
  const date = iso.includes('T') ? new Date(iso) : new Date(`${iso}T00:00:00`)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function paragraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'post'
}

export function isMissingTable(error: { message?: string } | null) {
  const message = error?.message ?? ''
  return /could not find the table/i.test(message) || /does not exist/i.test(message)
}
