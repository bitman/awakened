import { describe, expect, it } from 'vitest'
import { extractMessages } from '@/lib/whatsappIngest'

describe('extractMessages', () => {
  it('reads a simple body payload', () => {
    expect(extractMessages({ body: 'hello from the group', author: 'Scott' })).toEqual([
      { body: 'hello from the group', author: 'Scott' },
    ])
  })

  it('reads a Meta Cloud API group text message', () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ profile: { name: 'Sam' }, wa_id: '447700900123' }],
                messages: [
                  {
                    from: '447700900123',
                    group_id: '123',
                    id: 'wamid.abc',
                    timestamp: '1700000000',
                    type: 'text',
                    text: { body: 'Cash is still useful' },
                  },
                ],
              },
            },
          ],
        },
      ],
    }

    expect(extractMessages(payload)).toEqual([
      {
        body: 'Cash is still useful',
        author: 'Sam',
        waId: 'wamid.abc',
        postedAt: new Date(1700000000 * 1000).toISOString(),
      },
    ])
  })
})
