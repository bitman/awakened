import { randomBytes } from 'node:crypto'
import { requireAdmin } from './adminAuth.js'

function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
}

function randomPassword() {
  return randomBytes(12).toString('base64url')
}

async function listMembers(admin) {
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ perPage: 200 })
  if (usersError) throw usersError

  const { data: profiles, error: profilesError } = await admin.from('profiles').select('id, role')
  if (profilesError) throw profilesError

  const roleById = new Map((profiles ?? []).map((row) => [row.id, row.role]))

  return (usersData.users ?? []).map((user) => ({
    id: user.id,
    email: user.email ?? '',
    role: roleById.get(user.id) === 'admin' ? 'admin' : 'member',
    created_at: user.created_at,
  }))
}

export default async function handler(req, res) {
  try {
    const ctx = await requireAdmin(req, res)
    if (!ctx) return

    if (req.method === 'GET') {
      res.status(200).json({ members: await listMembers(ctx.admin) })
      return
    }

    const payload = parseBody(req) ?? {}

    if (req.method === 'POST') {
      const email = String(payload.email ?? '')
        .trim()
        .toLowerCase()
      const role = payload.role === 'admin' ? 'admin' : 'member'
      if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'A valid email is required' })
        return
      }

      const provided = typeof payload.password === 'string' && payload.password.trim().length >= 8
      const password = provided ? payload.password.trim() : randomPassword()
      const generated = !provided

      const { data, error } = await ctx.admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error || !data.user) {
        res.status(400).json({ error: error?.message ?? 'Could not create user' })
        return
      }

      const { error: profileError } = await ctx.admin.from('profiles').upsert({
        id: data.user.id,
        role,
      })
      if (profileError) {
        res.status(500).json({ error: profileError.message })
        return
      }

      res.status(200).json({
        member: { id: data.user.id, email, role },
        password: generated ? password : undefined,
      })
      return
    }

    if (req.method === 'PATCH') {
      const id = String(payload.id ?? '')
      const role = payload.role === 'admin' ? 'admin' : 'member'
      if (!id) {
        res.status(400).json({ error: 'Missing user id' })
        return
      }

      if (id === ctx.user.id && role !== 'admin') {
        const members = await listMembers(ctx.admin)
        const admins = members.filter((member) => member.role === 'admin')
        if (admins.length <= 1) {
          res.status(400).json({ error: 'Keep at least one admin' })
          return
        }
      }

      const { error } = await ctx.admin.from('profiles').upsert({ id, role })
      if (error) {
        res.status(500).json({ error: error.message })
        return
      }

      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Request failed' })
  }
}
