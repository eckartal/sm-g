import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'

const ACTION_WEIGHTS = {
  REPOST: 3,
  REPLY: 2,
  LIKE: 1,
}

// Get userId from header or query (demo mode)
function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request) || 'demo_user'

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  if (!store.hasConnected(userId)) {
    return NextResponse.json({ leaderboard: [], weights: ACTION_WEIGHTS })
  }

  const followers = store.getFollowers(userId).filter(f => !f.excluded)

  const leaderboard = followers.map((follower) => {
    const actions = store.getFollowerActions(userId, follower.id)
    let score = 0
    let likeCount = 0
    let replyCount = 0
    let repostCount = 0

    actions.forEach((action) => {
      const weight = ACTION_WEIGHTS[action.type as keyof typeof ACTION_WEIGHTS] || 1
      score += weight
      switch (action.type) {
        case 'LIKE': likeCount++; break
        case 'REPLY': replyCount++; break
        case 'REPOST': repostCount++; break
      }
    })

    return {
      id: follower.id,
      xUserId: follower.xUserId,
      username: follower.username,
      displayName: follower.displayName,
      avatarUrl: follower.avatarUrl,
      score,
      likeCount,
      replyCount,
      repostCount,
      lastActionAt: actions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]?.createdAt || null,
    }
  })

  leaderboard.sort((a, b) => b.score - a.score)

  return NextResponse.json({
    leaderboard: leaderboard.slice((page - 1) * limit, page * limit),
    weights: ACTION_WEIGHTS,
  })
}