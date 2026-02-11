"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ExternalLink, RefreshCw, Check, Terminal, LogIn } from "lucide-react"
import Link from "next/link"

// Generate a fake userId for demo purposes
function generateDemoUserId() {
  return 'demo_user_' + Math.random().toString(36).substring(2, 15)
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [xUsername, setXUsername] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Check URL params for connection status
  useEffect(() => {
    const connectedParam = searchParams.get('connected')
    const errorParam = searchParams.get('error')

    if (connectedParam === 'true') {
      setConnected(true)
      // Refresh user data
      checkConnection()
    }

    if (errorParam) {
      setError(errorParam)
      // Clear the error param from URL
      router.replace('/dashboard/settings', { scroll: false })
    }
  }, [searchParams, router])

  // Generate or get demo user ID
  useEffect(() => {
    let demoId = localStorage.getItem('demo_user_id')
    if (!demoId) {
      demoId = generateDemoUserId()
      localStorage.setItem('demo_user_id', demoId)
    }
    setUserId(demoId)

    // Check connection status
    checkConnection()
  }, [])

  const checkConnection = useCallback(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.xAccessToken) {
          setConnected(true)
          setXUsername(data.xUsername || "")
        }
      })
      .catch(console.error)
  }, [])

  const handleConnect = () => {
    setConnecting(true)
    // Redirect to Twitter OAuth
    window.location.href = '/api/auth/x'
  }

  const handleSync = async () => {
    if (!userId) return

    setSyncing(true)
    try {
      const res = await fetch("/api/sync", { method: "POST" })
      if (res.ok) {
        window.location.reload()
      } else {
        const error = await res.json()
        alert(error.message || "Sync failed")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred during sync")
    } finally {
      setSyncing(false)
    }
  }

  const handleManualConnect = async (token: string) => {
    if (!token.trim() || !userId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/user/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      })

      if (res.ok) {
        setConnected(true)
        setXUsername((await res.json()).xUsername || "")
      } else {
        const error = await res.json()
        setError(error.message || "Failed to connect")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 border-b border-white/10 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-sm">
              ←
            </Link>
            <span className="mono text-sm text-zinc-400">settings</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto fade-in">
        <h1 className="mono text-lg text-white mb-8">settings</h1>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="mono text-xs text-red-400">
              error: {error}
            </p>
          </div>
        )}

        {/* Account */}
        <Card className="bg-transparent border-white/10 mb-6">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10">
              <span className="mono text-xs text-zinc-500 uppercase tracking-wider">Session</span>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                <Terminal className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-white text-sm">Demo User</p>
                <p className="mono text-xs text-zinc-600">{userId || 'initializing...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* X Connection */}
        <Card className="bg-transparent border-white/10 mb-6">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="mono text-xs text-zinc-500 uppercase tracking-wider">X Connection</span>
              {connected && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Check className="w-3 h-3" />
                  connected
                </span>
              )}
            </div>
            <div className="p-4">
              {connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 py-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="mono text-sm text-zinc-400">@{xUsername}</span>
                  </div>
                  <Button
                    onClick={handleSync}
                    disabled={syncing}
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-lg h-10"
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        sync data
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* OAuth Connect Button */}
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full bg-[#000000] border border-white/20 text-white hover:bg-white/10 rounded-lg h-12"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        redirecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Connect with X
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-black text-zinc-600 mono">or enter token manually</span>
                    </div>
                  </div>

                  {/* Manual token input */}
                  <ManualTokenInput onConnect={handleManualConnect} loading={loading} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Manual token input component
function ManualTokenInput({ onConnect, loading }: { onConnect: (token: string) => void; loading: boolean }) {
  const [token, setToken] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConnect(token)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mono text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
          access_token
        </label>
        <input
          type="password"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 h-10 text-white placeholder:text-zinc-700 mono text-sm focus:outline-none focus:border-white/30"
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !token.trim()}
        className="w-full bg-white text-black hover:bg-zinc-200 rounded-lg h-10 mono"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            connecting...
          </>
        ) : (
          "connect"
        )}
      </Button>
    </form>
  )
}