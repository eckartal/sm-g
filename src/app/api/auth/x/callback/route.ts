import { NextRequest, NextResponse } from 'next/server'
import { createOAuthClient } from '@/lib/twitter-oauth'
import { store } from '@/lib/store'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle errors from Twitter
  if (error) {
    console.error('Twitter OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${error}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=no_code', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }

  // Verify state
  const storedState = request.cookies.get('twitter_oauth_state')?.value
  const codeVerifier = request.cookies.get('twitter_oauth_verifier')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=invalid_state', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }

  try {
    const oauthClient = createOAuthClient()
    const tokens = await oauthClient.exchangeCode(code, codeVerifier)

    // Get user info using the access token
    const userRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!userRes.ok) {
      throw new Error('Failed to get user info')
    }

    const userData = await userRes.json()
    const userId = userData.data.id
    const username = userData.data.username

    // Store tokens (in production, encrypt these!)
    // For demo, we use a session-based user ID
    const sessionId = 'demo_user'

    store.setTokens(sessionId, {
      accessToken: tokens.access_token,
      xUserId: userId,
      xUsername: username,
    })

    // Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL('/dashboard/settings?connected=true', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
    response.cookies.delete('twitter_oauth_state')
    response.cookies.delete('twitter_oauth_verifier')

    return response
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }
}