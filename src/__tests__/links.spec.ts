import { describe, expect, it } from 'vitest'
import { firstHttpUrl, linkParts } from '@/lib/links'

describe('firstHttpUrl', () => {
  it('picks the first http(s) link', () => {
    expect(firstHttpUrl('see https://example.com/path?x=1 and more')).toBe('https://example.com/path?x=1')
  })
})

describe('linkParts', () => {
  it('splits text around the url', () => {
    expect(linkParts('watch https://youtu.be/abc now')).toEqual([
      { type: 'text', value: 'watch ' },
      { type: 'link', value: 'https://youtu.be/abc' },
      { type: 'text', value: ' now' },
    ])
  })
})
