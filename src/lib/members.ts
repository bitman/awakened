import { supabase } from '@/lib/supabase'
import type { MemberRole } from '@/stores/session'

export interface Member {
  id: string
  email: string
  role: MemberRole
  created_at?: string
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not signed in')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function listMembers() {
  const response = await fetch('/api/members', { headers: await authHeaders() })
  const payload = (await response.json()) as { members?: Member[]; error?: string }
  if (!response.ok) throw new Error(payload.error ?? 'Could not load members')
  return payload.members ?? []
}

export async function createMember(input: { email: string; password?: string; role: MemberRole }) {
  const response = await fetch('/api/members', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  })
  const payload = (await response.json()) as {
    member?: Member
    password?: string
    error?: string
  }
  if (!response.ok) throw new Error(payload.error ?? 'Could not add member')
  return payload
}

export async function setMemberRole(id: string, role: MemberRole) {
  const response = await fetch('/api/members', {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ id, role }),
  })
  const payload = (await response.json()) as { error?: string }
  if (!response.ok) throw new Error(payload.error ?? 'Could not update role')
}
