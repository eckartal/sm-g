import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { generateDemoData } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Clear existing data for this user
    store.clear(userId)

    // Generate and populate demo data
    const demoData = generateDemoData()

    // Add followers to store
    for (const follower of demoData.followers) {
      store.addFollower(userId, follower)
    }

    // Add actions to store
    for (const action of demoData.actions) {
      store.addAction(userId, action)
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data loaded successfully',
      summary: {
        followersCount: demoData.followers.length,
        actionsCount: demoData.actions.length,
        likesCount: demoData.actions.filter(a => a.type === 'LIKE').length,
        repostsCount: demoData.actions.filter(a => a.type === 'REPOST').length,
        repliesCount: demoData.actions.filter(a => a.type === 'REPLY').length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed demo data' }, { status: 500 })
  }
}