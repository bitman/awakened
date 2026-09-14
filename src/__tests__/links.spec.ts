import { describe, expect, it } from 'vitest'
import { decodeHtmlEntities, firstHttpUrl, linkParts, tidyLinkTitle } from '@/lib/links'

describe('firstHttpUrl', () => {
  it('picks the first http(s) link', () => {
    expect(firstHttpUrl('see https://example.com/path?x=1 and more')).toBe('https://example.com/path?x=1')
  })
})

describe('tidyLinkTitle', () => {
  it('decodes entities and drops Facebook view counts', () => {
    expect(
      tidyLinkTitle(
        '255K views &#xb7; 20K reactions | In 1929, half the market wouldn&#x2019;t buy',
      ),
    ).toBe('In 1929, half the market wouldn’t buy')
  })
})

describe('decodeHtmlEntities', () => {
  it('decodes hex entities', () => {
    expect(decodeHtmlEntities('wouldn&#x2019;t')).toBe('wouldn’t')
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
