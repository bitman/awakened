import type { TopicSlug } from './site'

export interface Post {
  slug: string
  title: string
  date: string
  topics: TopicSlug[]
  excerpt: string
  body: string[]
  images: string[]
}

export const posts: Post[] = [
  {
    slug: 'leaflet-info',
    title: 'Leaflet Info',
    date: '2023-10-14',
    topics: ['control', 'money'],
    excerpt:
      'Five sanctions on the horizon: CBDC, SDGs, ESG, C40 cities, and Smart Cities — and the opposing energy of WATCH.',
    body: [
      'We are going to be sanctioned in five ways, CBDC, SDGS, which are the foundation of the agenda based on Net Zero, ESG’s working in conjunction with SDG’s in a state and private partnership, and C40 cities run by the State and Smart Cities by the WEF.',
      'SMART stands for Surveillance Monitoring Analysing Recording Technology.',
      'WATCH stands for Wise Autonomous Thinking Conscious Human, the opposing energy to their Agenda.',
    ],
    images: ['/images/leaflet1.jpg', '/images/leaflet2.jpg'],
  },
  {
    slug: 'self-custody',
    title: 'Self Custody',
    date: '2023-09-23',
    topics: ['money'],
    excerpt:
      'There is a big difference between self custody and other types of holdings when it comes to banking.',
    body: [
      'There is a big difference between Self Custody and other types of holdings when it comes to banking...',
      'People don’t seem to understand the many differences in something you can control, and something governments have total control over.',
    ],
    images: ['/images/cbdc.jpg'],
  },
]

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function postsByTopic(topic: TopicSlug) {
  return posts.filter((post) => post.topics.includes(topic))
}
