import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { createTwitterClient } from '@/lib/twitter'

// Get userId from header or query
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId') || 'demo_user'
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request)

  const tokens = store.getTokens(userId)

  if (!tokens.accessToken) {
    return NextResponse.json({ error: 'X account not connected' }, { status: 400 })
  }

  try {
    const twitter = createTwitterClient(tokens.accessToken)

    // Get authenticated user's info
    const me = await twitter.getMe()
    const xUserId = me.data.id
    const xUsername = me.data.username

    // Update store with X account info
    store.setTokens(userId, {
      accessToken: tokens.accessToken,
      xUserId,
      xUsername,
    })

    // Clear existing data before syncing (to avoid duplicates)
    // In production, you'd want to update existing records instead

    // Sync followers
    let nextToken: string | undefined
    let followersCount = 0
    const followerIdMap = new Map<string, string>() // xUserId -> id

    do {
      const response = await twitter.getFollowers(xUserId, nextToken)

      for (const follower of response.data) {
        const id = `follower_${follower.id}`
        store.addFollower(userId, {
          id,
          xUserId: follower.id,
          username: follower.username,
          displayName: follower.name,
          avatarUrl: follower.profile_image_url || null,
          excluded: false,
          addedAt: new Date(),
        })
        followerIdMap.set(follower.id, id)
        followersCount++
      }

      nextToken = response.meta.next_token
    } while (nextToken)

    // Sync engagement actions from recent tweets
    const tweets = await twitter.getUserTweets(xUserId, 100)
    let actionsCount = 0

    for (const tweet of tweets.data) {
      // Get retweeters
      const retweeters = await twitter.getTweetRetweeters(tweet.id)
      for (const rt of retweeters.data) {
        const followerId = followerIdMap.get(rt.id)
        if (followerId) {
          store.addAction(userId, {
            id: `rt_${tweet.id}_${followerId}`,
            followerId,
            type: 'REPOST',
            tweetId: tweet.id,
            tweetUrl: `https://x.com/${xUsername}/status/${tweet.id}`,
            text: tweet.text,
            createdAt: new Date(),
          })
          actionsCount++
        }
      }

      // Get likers
      const likers = await twitter.getTweetLikingUsers(tweet.id)
      for (const like of likers.data) {
        const followerId = followerIdMap.get(like.id)
        if (followerId) {
          store.addAction(userId, {
            id: `like_${tweet.id}_${followerId}`,
            followerId,
            type: 'LIKE',
            tweetId: tweet.id,
            tweetUrl: `https://x.com/${xUsername}/status/${tweet.id}`,
            text: tweet.text,
            createdAt: new Date(),
          })
          actionsCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        followersSynced: followersCount,
        actionsSynced: actionsCount,
        username: xUsername,
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}