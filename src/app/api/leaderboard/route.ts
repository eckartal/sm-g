import { NextRequest, NextResponse } from 'next/server'

const ACTION_WEIGHTS = {
  REPOST: 3,
  REPLY: 2,
  LIKE: 1,
}

// Demo follower data (same as followers route)
const demoFollowers = [
  {
    id: '1', xUserId: 'follower_1', username: 'tech_enthusiast', displayName: 'Tech Enthusiast',
    avatarUrl: null, excluded: false, addedAt: new Date().toISOString(),
    actions: [
      { id: 'a1', type: 'REPOST', tweetId: 'tweet_1', tweetUrl: 'https://x.com/1', text: 'Great post!', createdAt: new Date().toISOString() },
      { id: 'a2', type: 'LIKE', tweetId: 'tweet_2', tweetUrl: 'https://x.com/2', createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    id: '2', xUserId: 'follower_2', username: 'crypto_insider', displayName: 'Crypto Insider',
    avatarUrl: null, excluded: false, addedAt: new Date().toISOString(),
    actions: [
      { id: 'a3', type: 'REPOST', tweetId: 'tweet_1', tweetUrl: 'https://x.com/1', text: 'Wow!', createdAt: new Date().toISOString() },
      { id: 'a4', type: 'REPLY', tweetId: 'tweet_3', tweetUrl: 'https://x.com/3', text: 'Totally agree', createdAt: new Date().toISOString() },
      { id: 'a5', type: 'LIKE', tweetId: 'tweet_4', tweetUrl: 'https://x.com/4', createdAt: new Date(Date.now() - 172800000).toISOString() },
    ],
  },
  {
    id: '3', xUserId: 'follower_3', username: 'design_lover', displayName: 'Design Lover',
    avatarUrl: null, excluded: false, addedAt: new Date().toISOString(),
    actions: [
      { id: 'a6', type: 'LIKE', tweetId: 'tweet_5', tweetUrl: 'https://x.com/5', createdAt: new Date().toISOString() },
      { id: 'a7', type: 'LIKE', tweetId: 'tweet_6', tweetUrl: 'https://x.com/6', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'a8', type: 'LIKE', tweetId: 'tweet_7', tweetUrl: 'https://x.com/7', createdAt: new Date(Date.now() - 172800000).toISOString() },
    ],
  },
  {
    id: '4', xUserId: 'follower_4', username: 'marketing_guru', displayName: 'Marketing Guru',
    avatarUrl: null, excluded: false, addedAt: new Date().toISOString(),
    actions: [
      { id: 'a9', type: 'REPLY', tweetId: 'tweet_8', tweetUrl: 'https://x.com/8', text: 'Great insights!', createdAt: new Date().toISOString() },
      { id: 'a10', type: 'LIKE', tweetId: 'tweet_9', tweetUrl: 'https://x.com/9', createdAt: new Date().toISOString() },
    ],
  },
  {
    id: '5', xUserId: 'follower_5', username: 'startup_founder', displayName: 'Startup Founder',
    avatarUrl: null, excluded: false, addedAt: new Date().toISOString(),
    actions: [
      { id: 'a11', type: 'REPOST', tweetId: 'tweet_10', tweetUrl: 'https://x.com/10', text: 'Must read!', createdAt: new Date().toISOString() },
      { id: 'a12', type: 'REPOST', tweetId: 'tweet_11', tweetUrl: 'https://x.com/11', text: 'Sharing with my network', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'a13', type: 'REPLY', tweetId: 'tweet_12', tweetUrl: 'https://x.com/12', text: 'Question?', createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 'a14', type: 'LIKE', tweetId: 'tweet_13', tweetUrl: 'https://x.com/13', createdAt: new Date(Date.now() - 259200000).toISOString() },
    ],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const followers = demoFollowers.filter(f => !f.excluded)

  const leaderboard = followers.map((follower) => {
    let score = 0, likeCount = 0, replyCount = 0, repostCount = 0

    follower.actions.forEach((action) => {
      const weight = ACTION_WEIGHTS[action.type as keyof typeof ACTION_WEIGHTS] || 1
      score += weight
      switch (action.type) {
        case 'LIKE': likeCount++; break
        case 'REPLY': replyCount++; break
        case 'REPOST': repostCount++; break
      }
    })

    const daysActive = Math.max(1, Math.ceil((Date.now() - new Date(follower.addedAt).getTime()) / 86400000))
    const engagementRate = parseFloat((score / daysActive).toFixed(3))

    return {
      id: follower.id, xUserId: follower.xUserId, username: follower.username,
      displayName: follower.displayName, avatarUrl: follower.avatarUrl,
      score, likeCount, replyCount, repostCount, engagementRate,
      lastActionAt: follower.actions[0]?.createdAt || null,
    }
  })

  leaderboard.sort((a, b) => b.score - a.score)

  return NextResponse.json({
    leaderboard: leaderboard.slice((page - 1) * limit, page * limit),
    weights: ACTION_WEIGHTS,
  })
}