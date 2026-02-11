import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { createTwitterClient } from '@/lib/twitter'

// Get userId from header or query
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId') || 'demo_user'
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request)

  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 })
    }

    // Verify the token by fetching user info
    const twitter = createTwitterClient(accessToken)
    const me = await twitter.getMe()

    // Store tokens in memory
    store.setTokens(userId, {
      accessToken,
      xUserId: me.data.id,
      xUsername: me.data.username,
    })

    return NextResponse.json({
      success: true,
      xUsername: me.data.username,
    })
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json(
      { error: 'Invalid access token' },
      { status: 400 }
    )
  }
}