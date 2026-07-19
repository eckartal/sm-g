import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeXquikTweet } from '../src/lib/xquik'

test('normalizes the live Xquik search result contract', () => {
  const tweet = normalizeXquikTweet(
    {
      id: '123',
      text: 'Market update',
      author: { id: '456', username: 'analyst' },
      createdAt: '2026-07-19T12:00:00Z',
      retweetCount: 4,
      replyCount: 3,
      likeCount: 21,
      quoteCount: 2,
    },
    'fallback-author'
  )

  assert.deepEqual(tweet, {
    id: '123',
    text: 'Market update',
    author_id: '456',
    created_at: '2026-07-19T12:00:00Z',
    public_metrics: {
      retweet_count: 4,
      reply_count: 3,
      like_count: 21,
      quote_count: 2,
    },
  })
})

test('preserves legacy metrics and uses the authenticated user ID as fallback', () => {
  const tweet = normalizeXquikTweet(
    {
      id: '789',
      text: 'Legacy result',
      public_metrics: {
        retweet_count: 1,
        reply_count: 2,
        like_count: 3,
        quote_count: 4,
      },
    },
    'authenticated-user-id'
  )

  assert.equal(tweet?.author_id, 'authenticated-user-id')
  assert.deepEqual(tweet?.public_metrics, {
    retweet_count: 1,
    reply_count: 2,
    like_count: 3,
    quote_count: 4,
  })
})
