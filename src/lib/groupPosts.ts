import { supabase } from '@/lib/supabase'

export interface GroupPost {
  id: string
  body: string
  date: string
  author?: string
  source?: string
}

interface GroupRow {
  id: string
  body: string
  posted_at: string
  author_name: string | null
  source: string | null
}

export async function listGroupPosts() {
  const { data, error } = await supabase
    .from('group_posts')
    .select('id, body, posted_at, author_name, source')
    .order('posted_at', { ascending: false })

  if (error) throw error
  return (data as GroupRow[]).map((row) => ({
    id: row.id,
    body: row.body,
    date: row.posted_at,
    author: row.author_name ?? undefined,
    source: row.source ?? undefined,
  }))
}

export async function createGroupPost(body: string) {
  const { error } = await supabase.from('group_posts').insert({ body })
  if (error) throw error
}

export async function deleteGroupPost(id: string) {
  const { error } = await supabase.from('group_posts').delete().eq('id', id)
  if (error) throw error
}
