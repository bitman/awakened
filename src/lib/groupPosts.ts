import { supabase } from '@/lib/supabase'

export interface LinkPreview {
  url: string
  title?: string
  image?: string | null
}

export interface GroupPost {
  id: string
  body: string
  date: string
  author?: string
  source?: string
  linkUrl?: string
  linkTitle?: string
  linkImage?: string
}

interface GroupRow {
  id: string
  body: string
  posted_at: string
  author_name: string | null
  source: string | null
  link_url: string | null
  link_title: string | null
  link_image: string | null
}

export async function listGroupPosts() {
  const { data, error } = await supabase
    .from('group_posts')
    .select('id, body, posted_at, author_name, source, link_url, link_title, link_image')
    .order('posted_at', { ascending: false })

  if (error) throw error
  return (data as GroupRow[]).map((row) => ({
    id: row.id,
    body: row.body,
    date: row.posted_at,
    author: row.author_name ?? undefined,
    source: row.source ?? undefined,
    linkUrl: row.link_url ?? undefined,
    linkTitle: row.link_title ?? undefined,
    linkImage: row.link_image ?? undefined,
  }))
}

export async function createGroupPost(body: string, preview?: LinkPreview | null) {
  const { error } = await supabase.from('group_posts').insert({
    body,
    link_url: preview?.url ?? null,
    link_title: preview?.title ?? null,
    link_image: preview?.image ?? null,
  })
  if (error) throw error
}

export async function deleteGroupPost(id: string) {
  const { error } = await supabase.from('group_posts').delete().eq('id', id)
  if (error) throw error
}

export async function unfurlText(text: string) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) return null

  const response = await fetch('/api/unfurl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  })
  if (!response.ok) return null
  const payload = (await response.json()) as { preview?: LinkPreview | null }
  return payload.preview ?? null
}
