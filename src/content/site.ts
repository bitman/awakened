export const site = {
  name: 'The Awakened',
  domain: 'the-awakened.uk',
  tagline: 'Awake to our environment',
  intro: 'We have truth on our side.',
  about: `The Awakened Group are a collection of people who aspire to become more aware of what's happening in the world. They seek to deepen their understanding of global events, societal issues, and individual perspectives. Through dialogue, education, and action, members of this group strive to foster empathy, promote critical thinking, and contribute positively to their communities. By staying informed, engaged, and proactive, they aim to effect meaningful change.`,
  postsDisclaimer:
    'Posts that appear below are the opinions of the author and may not represent the group as a whole.',
  email: 'mailto:pokerlad@gmail.com',
  twitter: 'https://twitter.com/real_bitman',
}

export const topics = [
  { slug: 'control', title: 'Control' },
  { slug: 'health', title: 'Health' },
  { slug: 'money', title: 'Money' },
] as const

export type TopicSlug = (typeof topics)[number]['slug']
