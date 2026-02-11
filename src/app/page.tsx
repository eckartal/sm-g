"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Terminal, ArrowRight } from "lucide-react"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { isSignedIn } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setLoading(true)
      localStorage.setItem("selectedAccount", username.trim())
      if (isSignedIn) {
        router.push("/dashboard")
      } else {
        router.push("/sign-in?redirect_url=" + encodeURIComponent("/dashboard"))
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-32">
        <div className="max-w-xl mx-auto text-center space-y-10 fade-in">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <Terminal className="w-6 h-6 text-zinc-400" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl mono-tight tracking-tight">
              x-follower-analytics
            </h1>
            <p className="text-zinc-500 text-sm mono">
              track engagement • identify supporters • understand your audience
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 text-sm mono bg-white/5 border-white/10 rounded-r-none pl-4 text-white placeholder:text-zinc-700 focus-visible:ring-white/20 focus-visible:border-white/20"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading || !username.trim()}
              className="h-11 px-6 rounded-l-none bg-white text-black hover:bg-zinc-200 mono text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                </span>
              ) : (
                <>
                  run
                  <ArrowRight className="ml-2 w-3 h-3" />
                </>
              )}
            </Button>
          </form>

          {/* Example */}
          <p className="text-xs text-zinc-700 mono">
            try: <button type="button" onClick={() => setUsername("asimovinc")} className="text-zinc-500 hover:text-zinc-400 transition-colors">asimovinc</button>
          </p>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-32">
          <div className="container mx-auto px-6 py-6 text-center">
            <p className="text-xs text-zinc-700 mono">built with next.js</p>
          </div>
        </footer>
      </div>
    </div>
  )
}