import { createClient } from '@supabase/supabase-js'
import { extractMessages } from '../src/lib/whatsappIngest'

type VercelReq = {
  method?: string
  query: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

type VercelRes = {
  status: (code: number) => VercelRes
  send: (body: string) => void
  json: (body: unknown) => void
}

function header(req: VercelReq, name: string) {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

function queryValue(req: VercelReq, name: string) {
  const value = req.query[name]
  return Array.isArray(value) ? value[0] : value
}

function authorised(req: VercelReq) {
  const secret = process.env.WHATSAPP_INGEST_SECRET
  if (!secret) return false
  const auth = header(req, 'authorization') ?? ''
  return auth === `Bearer ${secret}`
}

export default async function handler(req: VercelReq, res: VercelRes) {
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
    const row = {
      body: message.body,
      author_name: message.author ?? null,
      wa_id: message.waId ?? null,
      source: 'whatsapp',
      published: true,
      posted_at: message.postedAt ?? new Date().toISOString(),
      author_id: null,
    }

    const { error } = await supabase.from('group_posts').insert(row)
    if (!error) {
      inserted += 1
      continue
    }
    if (error.code === '23505') continue
    res.status(500).json({ error: error.message })
    return
  }

  res.status(200).json({ inserted })
}
