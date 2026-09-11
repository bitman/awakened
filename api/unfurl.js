import { createClient } from '@supabase/supabase-js'
import { fetchPreview, firstHttpUrl } from './preview.js'

function header(req, name) {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) {
    res.status(500).json({ error: 'Missing Supabase URL' })
    return
  }

  const auth = header(req, 'authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const supabase = createClient(url, anon)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const target = typeof payload?.url === 'string' ? payload.url : firstHttpUrl(payload?.text ?? '')
  if (!target) {
    res.status(200).json({ preview: null })
    return
  }

  const preview = await fetchPreview(target)
  res.status(200).json({ preview })
}
