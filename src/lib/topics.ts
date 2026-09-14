import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/dates'

export interface Topic {
  slug: string
  title: string
}

export const fallbackTopics: Topic[] = [
  { slug: 'control', title: 'Control' },
  { slug: 'health', title: 'Health' },
  { slug: 'money', title: 'Money' },
]

let cache: Topic[] | null = null

export async function listTopics() {
  if (cache) return cache

  const { data, error } = await supabase.from('topics').select('slug, title').order('title')
  if (error || !data) {
    cache = fallbackTopics
    return cache
  }

  cache = data.length ? data : fallbackTopics
  return cache
}

export function clearTopicCache() {
  cache = null
}

export async function createTopic(title: string) {
  const slug = slugify(title)
  const { error } = await supabase.from('topics').insert({ slug, title: title.trim() })
  if (error) throw error
  clearTopicCache()
  return { slug, title: title.trim() }
}

export function topicTitle(topics: Topic[], slug: string) {
  return topics.find((topic) => topic.slug === slug)?.title ?? slug
}
