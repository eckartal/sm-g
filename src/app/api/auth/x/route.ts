import { NextResponse } from 'next/server'
import { createOAuthClient, generateState, generateCodeVerifier } from '@/lib/twitter-oauth'

export async function GET() {
  try {
    const oauthClient = createOAuthClient()
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    // Store state and code verifier in cookies for callback verification
    const response = NextResponse.redirect(await oauthClient.getAuthorizationUrl(state, codeVerifier))

    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    })

    response.cookies.set('twitter_oauth_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    })

    return response
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=oauth_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }
}