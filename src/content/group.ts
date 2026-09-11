export interface GroupPost {
  id: string
  date: string
  body: string
}

/** Curated WhatsApp excerpts. Empty until someone starts selecting posts. */
export const groupPosts: GroupPost[] = []
