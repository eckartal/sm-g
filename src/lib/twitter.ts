// Twitter API v2 client
// Docs: https://developer.twitter.com/en/docs/twitter-api

const TWITTER_API_BASE = 'https://api.twitter.com/2'

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

export interface Tweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics?: {
    retweet_count: number
    reply_count: number
    like_count: number
    quote_count: number
  }
}

export interface Follower {
  id: string
  username: string
  name: string
  profile_image_url?: string
}

export class TwitterClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${TWITTER_API_BASE}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': 'X-Follower-Analytics',
      },
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Twitter API error: ${res.status} - ${error}`)
    }

    return res.json()
  }

  // Get the authenticated user's info
  async getMe(): Promise<{ data: TwitterUser }> {
    return this.fetch('/users/me', {
      'user.fields': 'public_metrics,profile_image_url',
    })
  }

  // Get followers of a user
  async getFollowers(userId: string, paginationToken?: string): Promise<{
    data: Follower[]
    meta: { result_count: number; next_token?: string }
  }> {
    const params: Record<string, string> = {
      'max_results': '1000',
      'user.fields': 'profile_image_url',
    }
    if (paginationToken) {
      params['pagination_token'] = paginationToken
    }
    return this.fetch(`/users/${userId}/followers`, params)
  }

  // Get recent tweets by a user
  async getUserTweets(userId: string, maxResults = 100): Promise<{
    data: Tweet[]
    meta: { result_count: number; next_token?: string }
  }> {
    return this.fetch(`/users/${userId}/tweets`, {
      'max_results': String(maxResults),
      'tweet.fields': 'public_metrics,created_at,author_id',
    })
  }

  // Get users who liked a tweet
  async getTweetLikingUsers(tweetId: string): Promise<{ data: TwitterUser[] }> {
    return this.fetch(`/tweets/${tweetId}/liking_users`, {
      'user.fields': 'public_metrics,profile_image_url',
    })
  }

  // Get users who retweeted a tweet
  async getTweetRetweeters(tweetId: string): Promise<{ data: TwitterUser[] }> {
    return this.fetch(`/tweets/${tweetId}/retweeted_by`, {
      'user.fields': 'public_metrics,profile_image_url',
    })
  }
}

// Factory function for creating client from stored tokens
export function createTwitterClient(accessToken: string): TwitterClient {
  return new TwitterClient(accessToken)
}