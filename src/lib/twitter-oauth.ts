// Twitter OAuth 2.0 Client
// Handles PKCE flow for secure authentication

export interface TwitterOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
}

export interface TwitterTokens {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
  scope?: string
}

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
}

// Generate random string for PKCE code_verifier
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// SHA256 hash for PKCE code_challenge
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Generate state parameter for CSRF protection
function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export class TwitterOAuthClient {
  private config: TwitterOAuthConfig
  private authUrl = 'https://twitter.com/i/oauth2/authorize'
  private tokenUrl = 'https://api.twitter.com/2/oauth2/token'

  constructor(config: TwitterOAuthConfig) {
    this.config = config
  }

  // Generate authorization URL with PKCE
  async getAuthorizationUrl(state: string, codeVerifier: string): Promise<string> {
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return `${this.authUrl}?${params.toString()}`
  }

  // Exchange authorization code for tokens
  async exchangeCode(code: string, codeVerifier: string): Promise<TwitterTokens> {
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      code_verifier: codeVerifier,
    })

    // Encode client credentials
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')

    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    return res.json()
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TwitterTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    })

    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')

    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Token refresh failed: ${error}`)
    }

    return res.json()
  }
}

// Factory function to create client with env vars
export function createOAuthClient(): TwitterOAuthClient {
  return new TwitterOAuthClient({
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    redirectUri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/api/auth/x/callback',
    scope: ['tweet.read', 'users.read', 'follows.read', 'offline.access'],
  })
}

// Helper to get current epoch time
export function getEpochTime(): number {
  return Math.floor(Date.now() / 1000)
}