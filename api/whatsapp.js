import { createClient } from '@supabase/supabase-js'
import { fetchPreview, firstHttpUrl } from './preview.js'

function asRecord(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value
  return null
}

function textFromMetaMessage(message) {
  const type = typeof message.type === 'string' ? message.type : 'text'
  const text = asRecord(message.text)
  if (type === 'text' && typeof text?.body === 'string') return text.body.trim()
  const image = asRecord(message.image)
  if (type === 'image') {
    return typeof image?.caption === 'string' && image.caption.trim() ? image.caption.trim() : '(image)'
  }
  const video = asRecord(message.video)
  if (type === 'video') {
    return typeof video?.caption === 'string' && video.caption.trim() ? video.caption.trim() : '(video)'
  }
  if (type === 'audio') return '(audio)'
  if (type === 'sticker') return '(sticker)'
  return ''
}

function extractMessages(payload) {
  const row = asRecord(payload)
  if (!row) return []

  if (row.object === 'whatsapp_business_account' && Array.isArray(row.entry)) {
    const out = []
    for (const entry of row.entry) {
      const entryRow = asRecord(entry)
      if (!Array.isArray(entryRow?.changes)) continue
      for (const change of entryRow.changes) {
        const value = asRecord(asRecord(change)?.value)
        if (!Array.isArray(value?.messages)) continue
        const names = new Map()
        for (const contact of Array.isArray(value.contacts) ? value.contacts : []) {
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

  if (typeof row.body === 'string' && row.body.trim()) {
    return [
      {
        body: row.body.trim(),
        author: typeof row.author === 'string' ? row.author : undefined,
        waId: typeof row.id === 'string' ? row.id : undefined,
        postedAt: typeof row.posted_at === 'string' ? row.posted_at : undefined,
      },
    ]
  }

  return []
}

function header(req, name) {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

function queryValue(req, name) {
  const value = req.query[name]
  return Array.isArray(value) ? value[0] : value
}

function authorised(req) {
  const secret = process.env.WHATSAPP_INGEST_SECRET
  if (!secret) return false
  const auth = header(req, 'authorization') ?? ''
  return auth === `Bearer ${secret}`
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const mode = queryValue(req, 'hub.mode')
      const token = queryValue(req, 'hub.verify_token')
      const challenge = queryValue(req, 'hub.challenge')
      if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge ?? '')
        return
      }
      res.status(403).send('Forbidden')
      return
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    if (!authorised(req)) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      res.status(500).json({ error: 'Server is missing Supabase service credentials' })
      return
    }

    const messages = extractMessages(payload)
    if (!messages.length) {
      res.status(200).json({ inserted: 0 })
      return
    }

    const supabase = createClient(url, serviceKey)
    let inserted = 0

    for (const message of messages) {
      const link = firstHttpUrl(message.body)
      const preview = link ? await fetchPreview(link) : null
      const { error } = await supabase.from('group_posts').insert({
        body: message.body,
        author_name: message.author ?? null,
        wa_id: message.waId ?? null,
        source: 'whatsapp',
        published: true,
        posted_at: message.postedAt ?? new Date().toISOString(),
        author_id: null,
        link_url: preview?.url ?? null,
        link_title: preview?.title ?? null,
        link_image: preview?.image ?? null,
      })
      if (!error) {
        inserted += 1
        continue
      }
      if (error.code === '23505') continue
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json({ inserted })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Ingest failed' })
  }
}
