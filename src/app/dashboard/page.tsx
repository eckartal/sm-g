"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Activity, Users, Zap } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

// Types
interface Action {
  id: string
  type: string
  tweetId: string
  tweetUrl: string
  text: string | null
  createdAt: string
  follower: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
}

interface LeaderboardEntry {
  id: string
  xUserId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  score: number
  likeCount: number
  replyCount: number
  repostCount: number
  lastActionAt: string | null
}

interface Follower {
  id: string
  xUserId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  excluded: boolean
  _count: { actions: number }
}

const WEIGHTS = { REPOST: 3, REPLY: 2, LIKE: 1 }

// Format number with locale
function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

// Ghostty-style progress bar
function ProgressBar({ value, max, color = "text-white" }: { value: number; max: number; color?: string }) {
  const width = Math.min(100, (value / max) * 100)
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-20 h-1 bg-white/10 relative overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

// Stat card component
function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeColor = "text-zinc-500"
}: {
  label: string
  value: string | number
  icon: any
  change?: string
  changeColor?: string
}) {
  return (
    <div className="p-4 -mx-2 hover:bg-white/5 transition-colors rounded-lg">
      <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="mono-tight text-2xl text-white">{value}</div>
      {change && (
        <div className={`text-xs mt-1 ${changeColor}`}>{change}</div>
      )}
    </div>
  )
}

// Skeleton loader
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-white/5 animate-pulse ${className}`} />
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 -mx-2">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 bg-white/5 rounded" />
      ))}
    </div>
  )
}

function ActionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-white/5 rounded" />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [followers, setFollowers] = useState<Follower[]>([])
  const [activeTab, setActiveTab] = useState("leaderboard")
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [actionFilter, setActionFilter] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState("")
  const [sort, setSort] = useState("actions")

  useEffect(() => {
    const saved = localStorage.getItem("selectedAccount")
    if (saved) setSelectedAccount(saved)
    fetchData()
  }, [])

  const loadDemoData = async () => {
    setSeeding(true)
    try {
      const userId = selectedAccount || 'demo'
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to load demo data:', error)
    } finally {
      setSeeding(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lbRes, actionsRes, followersRes] = await Promise.all([
        fetch("/api/leaderboard"),
        fetch("/api/actions"),
        fetch(`/api/followers?sort=${sort}`),
      ])

      const lbData = await lbRes.json()
      const actionsData = await actionsRes.json()
      const followersData = await followersRes.json()

      if (lbData.leaderboard) setLeaderboard(lbData.leaderboard)
      if (actionsData.actions) setActions(actionsData.actions)
      if (followersData.followers) setFollowers(followersData.followers)

      // Auto-seed demo data if empty
      const hasData = (lbData.leaderboard?.length > 0 || actionsData.actions?.length > 0 || followersData.followers?.length > 0)
      if (!hasData && !seeding) {
        await loadDemoData()
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActions = actionFilter
    ? actions.filter((a) => a.type === actionFilter)
    : actions

  const totalScore = leaderboard.reduce((sum, e) => sum + e.score, 0)
  const activeFollowers = leaderboard.filter((e) => e.score > 0).length
  const maxScore = Math.max(...leaderboard.map(e => e.score), 1)

  const getActionColor = (type: string) => {
    switch (type) {
      case 'LIKE': return 'action-like'
      case 'REPOST': return 'action-repost'
      case 'REPLY': return 'action-reply'
      default: return 'text-zinc-400'
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return '♥'
      case 'REPOST': return '↺'
      case 'REPLY': return '→'
      default: return '●'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Ghostty minimal */}
      <header className="sticky top-0 z-10 bg-black/95 border-b border-white/10 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm">
              ←
            </Link>
            <span className="mono text-sm text-zinc-400">
              {selectedAccount ? `@${selectedAccount}` : 'dashboard'}
            </span>
          </div>
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            new →
          </Link>
        </div>
      </header>

      <main className="px-6 py-8 max-w-5xl mx-auto fade-in">
        {/* Stats - Mono typography */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-0 border-b border-white/10">
            <StatCard
              label="Followers"
              value={followers.length.toLocaleString()}
              icon={Users}
              change="tracked"
              changeColor="text-zinc-600"
            />
            <StatCard
              label="Actions"
              value={totalScore.toLocaleString()}
              icon={Activity}
              change="engagements"
              changeColor="text-zinc-600"
            />
            <StatCard
              label="Score"
              value={(totalScore / Math.max(followers.length, 1)).toFixed(2)}
              icon={Zap}
              change="avg per user"
              changeColor="text-zinc-600"
            />
          </div>
        )}

        {/* Tabs - Minimal underline */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex gap-8 border-b border-white/10 bg-transparent p-0 h-auto mt-8 mb-6">
            <TabsTrigger
              value="leaderboard"
              className="px-0 pb-2 text-xs mono uppercase tracking-widest data-[state=active]:text-white data-[state=inactive]:text-zinc-600 hover:text-zinc-400 bg-transparent shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-white transition-all"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="px-0 pb-2 text-xs mono uppercase tracking-widest data-[state=active]:text-white data-[state=inactive]:text-zinc-600 hover:text-zinc-400 bg-transparent shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-white transition-all"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="px-0 pb-2 text-xs mono uppercase tracking-widest data-[state=active]:text-white data-[state=inactive]:text-zinc-600 hover:text-zinc-400 bg-transparent shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-white transition-all"
            >
              List
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-0">
            <div className="space-y-1">
              {loading || seeding ? (
                <TableSkeleton />
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-600 mono text-sm mb-4">No data yet</p>
                  <button
                    onClick={loadDemoData}
                    disabled={seeding}
                    className="mono text-xs text-white hover:text-zinc-300 transition-colors border border-white/20 px-4 py-2 rounded"
                  >
                    {seeding ? 'Loading...' : 'Load demo data'}
                  </button>
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 py-3 px-4 hover:bg-white/5 transition-colors rounded-lg group"
                  >
                    {/* Rank */}
                    <span className="mono text-zinc-600 text-sm w-6">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.avatarUrl || undefined} />
                      <AvatarFallback className="bg-white/10 text-white text-xs">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm truncate">
                          {entry.displayName || entry.username}
                        </span>
                        <span className="text-zinc-600 text-xs mono">
                          @{entry.username}
                        </span>
                      </div>
                    </div>

                    {/* Score bar */}
                    <ProgressBar value={entry.score} max={maxScore} />

                    {/* Score number */}
                    <span className="mono text-white text-sm w-12 text-right">
                      {entry.score}
                    </span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="mt-0">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="p-0">
                {/* Filter */}
                <div className="flex gap-4 mb-4">
                  {['all', 'REPOST', 'REPLY', 'LIKE'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActionFilter(filter === 'all' ? null : filter)}
                      className={`mono text-xs uppercase tracking-wider transition-colors ${
                        (filter === 'all' && !actionFilter) || filter === actionFilter
                          ? 'text-white'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {loading || seeding ? (
                  <ActionsSkeleton />
                ) : filteredActions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-600 mono text-sm mb-4">No activity recorded</p>
                    <button
                      onClick={loadDemoData}
                      disabled={seeding}
                      className="mono text-xs text-white hover:text-zinc-300 transition-colors border border-white/20 px-4 py-2 rounded"
                    >
                      {seeding ? 'Loading...' : 'Load demo data'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-4 py-3 px-4 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {/* Action type indicator */}
                        <span className={`mono text-sm w-6 ${getActionColor(action.type)}`}>
                          {getActionIcon(action.type)}
                        </span>

                        {/* Avatar */}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={action.follower.avatarUrl || undefined} />
                          <AvatarFallback className="bg-white/10 text-white text-xs">
                            {action.follower.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white text-sm">
                              {action.follower.displayName || action.follower.username}
                            </span>
                            <span className="mono text-xs text-zinc-600">
                              @{action.follower.username}
                            </span>
                            <span className={`mono text-xs ${getActionColor(action.type)}`}>
                              {action.type.toLowerCase()}
                            </span>
                          </div>
                          {action.text && (
                            <p className="text-sm text-zinc-500 truncate mt-0.5">
                              "{action.text}"
                            </p>
                          )}
                        </div>

                        {/* Time */}
                        <span className="mono text-xs text-zinc-600 whitespace-nowrap">
                          {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}
                        </span>

                        {/* Link */}
                        <a
                          href={action.tweetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-white/10 transition-colors text-zinc-600 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followers List Tab */}
          <TabsContent value="list" className="mt-0">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="p-0">
                {/* Sort */}
                <div className="flex justify-end mb-4">
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value)
                      fetch(`/api/followers?sort=${e.target.value}`)
                        .then(res => res.json())
                        .then(data => data.followers && setFollowers(data.followers))
                    }}
                    className="mono text-xs bg-transparent text-zinc-600 border-none cursor-pointer hover:text-zinc-400 focus:outline-none"
                  >
                    <option value="actions">by actions</option>
                    <option value="recent">by recent</option>
                    <option value="followers">by followers</option>
                  </select>
                </div>

                {loading || seeding ? (
                  <TableSkeleton />
                ) : followers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-600 mono text-sm mb-4">No followers synced</p>
                    <button
                      onClick={loadDemoData}
                      disabled={seeding}
                      className="mono text-xs text-white hover:text-zinc-300 transition-colors border border-white/20 px-4 py-2 rounded"
                    >
                      {seeding ? 'Loading...' : 'Load demo data'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {followers.map((follower) => (
                      <div
                        key={follower.id}
                        className="flex items-center gap-4 py-3 px-4 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={follower.avatarUrl || undefined} />
                          <AvatarFallback className="bg-white/10 text-white text-xs">
                            {follower.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm truncate">
                              {follower.displayName || follower.username}
                            </span>
                            <span className="mono text-xs text-zinc-600">
                              @{follower.username}
                            </span>
                          </div>
                        </div>

                        {/* Actions count */}
                        <span className="mono text-xs text-zinc-500 w-8 text-right">
                          {follower._count.actions}
                        </span>

                        {/* Status dot */}
                        <span className={`w-2 h-2 rounded-full ${
                          follower.excluded ? 'bg-red-500' : 'bg-zinc-700'
                        }`} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}