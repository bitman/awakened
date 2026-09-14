import { createClient } from '@supabase/supabase-js'

function header(req, name) {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

export async function requireAdmin(req, res) {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !serviceKey) {
    res.status(500).json({ error: 'Server is missing Supabase credentials' })
    return null
  }

  const auth = header(req, 'authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const asUser = createClient(url, anon)
  const { data, error } = await asUser.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  const admin = createClient(url, serviceKey)
  const { data: profile } = await admin.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
  if (profile?.role !== 'admin') {
    res.status(403).json({ error: 'Admins only' })
    return null
  }

  return { user: data.user, admin }
}
