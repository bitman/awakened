export interface IngestMessage {
  body: string
  author?: string
  waId?: string
  postedAt?: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function textFromMetaMessage(message: Record<string, unknown>) {
  const type = typeof message.type === 'string' ? message.type : 'text'
  const text = asRecord(message.text)
  if (type === 'text' && typeof text?.body === 'string') return text.body.trim()

  const image = asRecord(message.image)
  if (type === 'image') {
    return typeof image?.caption === 'string' && image.caption.trim()
      ? image.caption.trim()
      : '(image)'
  }

  const video = asRecord(message.video)
  if (type === 'video') {
    return typeof video?.caption === 'string' && video.caption.trim()
      ? video.caption.trim()
      : '(video)'
  }

  const document = asRecord(message.document)
  if (type === 'document') {
    return typeof document?.caption === 'string' && document.caption.trim()
      ? document.caption.trim()
      : '(document)'
  }

  if (type === 'audio') return '(audio)'
  if (type === 'sticker') return '(sticker)'
  if (type === 'location') return '(location)'

  const reaction = asRecord(message.reaction)
  if (type === 'reaction' && typeof reaction?.emoji === 'string') {
    return `reacted ${reaction.emoji}`
  }

  return ''
}

function fromSimple(payload: Record<string, unknown>): IngestMessage[] {
  if (typeof payload.body === 'string' && payload.body.trim()) {
    return [
      {
        body: payload.body.trim(),
        author: typeof payload.author === 'string' ? payload.author : undefined,
        waId: typeof payload.id === 'string' ? payload.id : undefined,
        postedAt: typeof payload.posted_at === 'string' ? payload.posted_at : undefined,
      },
    ]
  }

  if (!Array.isArray(payload.messages)) return []

  return payload.messages.flatMap((item) => {
    const row = asRecord(item)
    if (!row || typeof row.body !== 'string' || !row.body.trim()) return []
    return [
      {
        body: row.body.trim(),
        author: typeof row.author === 'string' ? row.author : undefined,
        waId: typeof row.id === 'string' ? row.id : undefined,
        postedAt: typeof row.posted_at === 'string' ? row.posted_at : undefined,
      },
    ]
  })
}

function fromMeta(payload: Record<string, unknown>): IngestMessage[] {
  if (payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
    return []
  }

  const out: IngestMessage[] = []

  for (const entry of payload.entry) {
    const entryRow = asRecord(entry)
    if (!Array.isArray(entryRow?.changes)) continue

    for (const change of entryRow.changes) {
      const changeRow = asRecord(change)
      const value = asRecord(changeRow?.value)
      if (!Array.isArray(value?.messages)) continue

      const contacts = Array.isArray(value.contacts) ? value.contacts : []
      const names = new Map<string, string>()
      for (const contact of contacts) {
        const contactRow = asRecord(contact)
        const profile = asRecord(contactRow?.profile)
        const waId = typeof contactRow?.wa_id === 'string' ? contactRow.wa_id : ''
        const name = typeof profile?.name === 'string' ? profile.name : ''
        if (waId && name) names.set(waId, name)
      }

      for (const message of value.messages) {
        const messageRow = asRecord(message)
        if (!messageRow) continue
        const body = textFromMetaMessage(messageRow)
        if (!body) continue
        const from = typeof messageRow.from === 'string' ? messageRow.from : ''
        const timestamp = typeof messageRow.timestamp === 'string' ? messageRow.timestamp : ''
        out.push({
          body,
          author: names.get(from) || from || undefined,
          waId: typeof messageRow.id === 'string' ? messageRow.id : undefined,
          postedAt: timestamp ? new Date(Number(timestamp) * 1000).toISOString() : undefined,
        })
      }
    }
  }

  return out
}

export function extractMessages(payload: unknown): IngestMessage[] {
  const row = asRecord(payload)
  if (!row) return []
  const meta = fromMeta(row)
  if (meta.length) return meta
  return fromSimple(row)
}
