import { NextRequest, NextResponse } from 'next/server'

// In-memory demo data store (replaces database for testing)
const demoFollowers = [
  {
    id: '1',
    xUserId: 'follower_1',
    username: 'tech_enthusiast',
    displayName: 'Tech Enthusiast',
    avatarUrl: null,
    excluded: false,
    addedAt: new Date().toISOString(),
    actions: [
      { id: 'a1', type: 'REPOST', tweetId: 'tweet_1', tweetUrl: 'https://x.com/user/status/1', text: 'Great post!', createdAt: new Date().toISOString() },
      { id: 'a2', type: 'LIKE', tweetId: 'tweet_2', tweetUrl: 'https://x.com/user/status/2', createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    id: '2',
    xUserId: 'follower_2',
    username: 'crypto_insider',
    displayName: 'Crypto Insider',
    avatarUrl: null,
    excluded: false,
    addedAt: new Date().toISOString(),
    actions: [
      { id: 'a3', type: 'REPOST', tweetId: 'tweet_1', tweetUrl: 'https://x.com/user/status/1', text: 'Wow!', createdAt: new Date().toISOString() },
      { id: 'a4', type: 'REPLY', tweetId: 'tweet_3', tweetUrl: 'https://x.com/user/status/3', text: 'Totally agree', createdAt: new Date().toISOString() },
      { id: 'a5', type: 'LIKE', tweetId: 'tweet_4', tweetUrl: 'https://x.com/user/status/4', createdAt: new Date(Date.now() - 172800000).toISOString() },
    ],
  },
  {
    id: '3',
    xUserId: 'follower_3',
    username: 'design_lover',
    displayName: 'Design Lover',
    avatarUrl: null,
    excluded: false,
    addedAt: new Date().toISOString(),
    actions: [
      { id: 'a6', type: 'LIKE', tweetId: 'tweet_5', tweetUrl: 'https://x.com/user/status/5', createdAt: new Date().toISOString() },
      { id: 'a7', type: 'LIKE', tweetId: 'tweet_6', tweetUrl: 'https://x.com/user/status/6', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'a8', type: 'LIKE', tweetId: 'tweet_7', tweetUrl: 'https://x.com/user/status/7', createdAt: new Date(Date.now() - 172800000).toISOString() },
    ],
  },
  {
    id: '4',
    xUserId: 'follower_4',
    username: 'marketing_guru',
    displayName: 'Marketing Guru',
    avatarUrl: null,
    excluded: false,
    addedAt: new Date().toISOString(),
    actions: [
      { id: 'a9', type: 'REPLY', tweetId: 'tweet_8', tweetUrl: 'https://x.com/user/status/8', text: 'Great insights!', createdAt: new Date().toISOString() },
      { id: 'a10', type: 'LIKE', tweetId: 'tweet_9', tweetUrl: 'https://x.com/user/status/9', createdAt: new Date().toISOString() },
    ],
  },
  {
    id: '5',
    xUserId: 'follower_5',
    username: 'startup_founder',
    displayName: 'Startup Founder',
    avatarUrl: null,
    excluded: false,
    addedAt: new Date().toISOString(),
    actions: [
      { id: 'a11', type: 'REPOST', tweetId: 'tweet_10', tweetUrl: 'https://x.com/user/status/10', text: 'Must read!', createdAt: new Date().toISOString() },
      { id: 'a12', type: 'REPOST', tweetId: 'tweet_11', tweetUrl: 'https://x.com/user/status/11', text: 'Sharing with my network', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'a13', type: 'REPLY', tweetId: 'tweet_12', tweetUrl: 'https://x.com/user/status/12', text: 'Question?', createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 'a14', type: 'LIKE', tweetId: 'tweet_13', tweetUrl: 'https://x.com/user/status/13', createdAt: new Date(Date.now() - 259200000).toISOString() },
    ],
  },
]

// POST /api/followers/sync - Demo mode with in-memory data
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    synced: demoFollowers.length,
    message: 'Demo data loaded (in-memory mode)',
    followers: demoFollowers,
  })
}

// GET /api/followers - List followers from demo data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const excluded = searchParams.get('excluded')
  const search = searchParams.get('search')

  let followers = [...demoFollowers]

  if (excluded === 'false') {
    followers = followers.filter(f => !f.excluded)
  }

  if (search) {
    const s = search.toLowerCase()
    followers = followers.filter(f =>
      f.username.toLowerCase().includes(s) ||
      (f.displayName && f.displayName.toLowerCase().includes(s))
    )
  }

  const followersWithCount = followers.map(f => ({
    ...f,
    _count: { actions: f.actions.length },
  }))

  return NextResponse.json({
    followers: followersWithCount,
    pagination: { page: 1, limit: 50, total: followersWithCount.length, totalPages: 1 },
  })
}