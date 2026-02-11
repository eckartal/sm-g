import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'

// Get userId from header or query (demo mode)
function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request) || 'demo_user'

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  if (!store.hasConnected(userId)) {
    return NextResponse.json({ actions: [], total: 0 })
  }

  let actions = store.getActions(userId).map(action => {
    const follower = store.getFollowers(userId).find(f => f.id === action.followerId)
    return {
      ...action,
      follower: follower ? {
        id: follower.id,
        xUserId: follower.xUserId,
        username: follower.username,
        displayName: follower.displayName,
        avatarUrl: follower.avatarUrl,
      } : null,
    }
  }).filter(a => a.follower && !a.follower.excluded)

  if (type !== 'all') {
    actions = actions.filter(a => a.type === type.toUpperCase())
  }

  actions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = actions.length
  const paginatedActions = actions.slice((page - 1) * limit, page * limit)

  return NextResponse.json({ actions: paginatedActions, total })
}