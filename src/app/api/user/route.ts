import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tokens = store.getTokens(userId)

  return NextResponse.json({
    xAccessToken: !!tokens.accessToken,
    xUserId: tokens.xUserId,
    xUsername: tokens.xUsername,
  })
}