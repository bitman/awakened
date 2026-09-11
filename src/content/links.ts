import type { TopicSlug } from './site'

export interface ExternalLink {
  slug: string
  title: string
  date: string
  url: string
  topics: TopicSlug[]
  note: string
}

export const links: ExternalLink[] = [
  {
    slug: 'billionaires-social-media',
    title: 'How Billionaires Took Social Media Control',
    date: '2023-09-23',
    url: 'https://youtu.be/DPy4zoZdDZ0?si=mutVewNz7F1LyywM',
    topics: ['control'],
    note: 'Video on how billionaires took control of social media.',
  },
  {
    slug: 'who-owns-the-world',
    title: 'Who Owns The World?',
    date: '2023-09-18',
    url: 'https://rumble.com/vmyx1n-monopoly-who-owns-the-world-documentary-by-tim-gielen.html',
    topics: ['control', 'money'],
    note: 'Monopoly: Who Owns the World, a documentary by Tim Gielen.',
  },
  {
    slug: 'nhs-elderly',
    title: 'NHS is depopulating the elderly',
    date: '2023-09-18',
    url: 'https://www.bitchute.com/video/MzNfZSxVoAh1',
    topics: ['health'],
    note: 'You may need a VPN to see this.',
  },
]

export function linksByTopic(topic: TopicSlug) {
  return links.filter((link) => link.topics.includes(topic))
}
