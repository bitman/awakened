import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/dates'

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  topics: string[]
  images: string[]
  date: string
}

interface PostRow {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  topics: string[] | null
  images: string[] | null
  published_at: string
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    topics: row.topics ?? [],
    images: row.images ?? [],
    date: row.published_at,
  }
}

export async function listPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, body, topics, images, published_at')
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data as PostRow[]).map(mapPost)
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, body, topics, images, published_at')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data ? mapPost(data as PostRow) : null
}

export async function createPost(input: {
  title: string
  body: string
  excerpt: string
  topics: string[]
}) {
  const base = slugify(input.title)
  let slug = base
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from('posts').insert({
      slug,
      title: input.title,
      body: input.body,
      excerpt: input.excerpt,
      topics: input.topics,
    })

    if (!error) return slug
    if (error.code !== '23505') throw error
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`
  }
  throw new Error('Could not create a unique slug.')
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

export async function setPostTopics(id: string, topics: string[]) {
  const { error } = await supabase.from('posts').update({ topics }).eq('id', id)
  if (error) throw error
}
