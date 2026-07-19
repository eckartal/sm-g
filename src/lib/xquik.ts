import type { Tweet } from './twitter'

type XquikTweet = {
  id?: unknown
  text?: unknown
  author?: unknown
  author_id?: unknown
  authorId?: unknown
  created_at?: unknown
  createdAt?: unknown
  public_metrics?: unknown
  metrics?: unknown
  retweetCount?: unknown
  replyCount?: unknown
  likeCount?: unknown
  quoteCount?: unknown
}

type TweetMetrics = Tweet['public_metrics']

function readObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readMetrics(tweet: XquikTweet): TweetMetrics {
  const metrics = readObject(tweet.public_metrics ?? tweet.metrics)
  return {
    retweet_count: readNumber(metrics?.retweet_count ?? tweet.retweetCount),
    reply_count: readNumber(metrics?.reply_count ?? tweet.replyCount),
    like_count: readNumber(metrics?.like_count ?? tweet.likeCount),
    quote_count: readNumber(metrics?.quote_count ?? tweet.quoteCount),
  }
}

function readTweetItems(payload: unknown): XquikTweet[] {
  if (Array.isArray(payload)) {
    return payload as XquikTweet[]
  }

  const object = readObject(payload)
  if (!object) {
    return []
  }

  for (const key of ['data', 'tweets', 'results', 'items']) {
    const value = object[key]
    if (Array.isArray(value)) {
      return value as XquikTweet[]
    }

    const nestedItems = readTweetItems(value)
    if (nestedItems.length) {
      return nestedItems
    }
  }

  return []
}

export function normalizeXquikTweet(
  tweet: XquikTweet,
  fallbackAuthorId: string
): Tweet | null {
  const id = readString(tweet.id)
  const text = readString(tweet.text)
  if (!id || !text) {
    return null
  }
  const author = readObject(tweet.author)

  return {
    id,
    text,
    author_id:
      readString(tweet.author_id) ??
      readString(tweet.authorId) ??
      readString(author?.id) ??
      fallbackAuthorId,
    created_at:
      readString(tweet.created_at) ??
      readString(tweet.createdAt) ??
      new Date().toISOString(),
    public_metrics: readMetrics(tweet),
  }
}

export async function fetchXquikUserTweets(
  username: string,
  authorId: string,
  maxResults = 100
): Promise<{ data: Tweet[]; meta: { result_count: number } } | null> {
  const apiKey = process.env.XQUIK_API_KEY
  if (!apiKey) {
    return null
  }

  const baseUrl = process.env.XQUIK_API_BASE_URL ?? 'https://xquik.com'
  const searchUrl = new URL('/api/v1/x/tweets/search', baseUrl)
  searchUrl.searchParams.set('q', `from:${username}`)
  searchUrl.searchParams.set('limit', String(maxResults))

  const response = await fetch(searchUrl.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Xquik API error: ${response.status} - ${await response.text()}`)
  }

  const payload = await response.json()
  const data = readTweetItems(payload)
    .map((tweet) => normalizeXquikTweet(tweet, authorId))
    .filter((tweet): tweet is Tweet => Boolean(tweet))

  return {
    data,
    meta: {
      result_count: data.length,
    },
  }
}
