import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'

// GET /api/followers - List followers from in-memory store
export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const sort = searchParams.get('sort') || 'actions'
  const excluded = searchParams.get('excluded')
  const search = searchParams.get('search')

  if (!store.hasConnected(userId)) {
    return NextResponse.json({
      followers: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    })
  }

  let followers = store.getFollowers(userId)

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

  // Add action count
  const followersWithCount = followers.map(f => ({
    ...f,
    _count: { actions: store.getFollowerActions(userId, f.id).length },
  }))

  // Sort
  if (sort === 'followers') {
    followersWithCount.sort((a, b) => (b as any).followersCount - (a as any).followersCount)
  } else if (sort === 'actions') {
    followersWithCount.sort((a, b) => b._count.actions - a._count.actions)
  } else if (sort === 'recent') {
    followersWithCount.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
  }

  const total = followersWithCount.length

  return NextResponse.json({
    followers: followersWithCount.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}