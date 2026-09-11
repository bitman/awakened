import { supabase } from '@/lib/supabase'
import { topics, type TopicSlug } from '@/content/site'
import { slugify } from '@/lib/dates'

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  topics: TopicSlug[]
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

const allowed = new Set<string>(topics.map((topic) => topic.slug))

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    topics: (row.topics ?? []).filter((topic): topic is TopicSlug => allowed.has(topic)),
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
  topics: TopicSlug[]
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
