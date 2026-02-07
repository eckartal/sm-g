"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Trophy, ExternalLink, BarChart3, Users, Zap } from "lucide-react"
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
  engagementRate: number
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

// Skeleton Components
function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 bg-muted animate-pulse rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 bg-muted animate-pulse rounded" />
      ))}
    </div>
  )
}

function ActionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted animate-pulse rounded w-full" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-muted animate-pulse rounded" />
      ))}
    </div>
  )
}

// Badge Component for Action Types
function ActionBadge({ type }: { type: string }) {
  const colors = {
    REPOST: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REPLY: "bg-blue-100 text-blue-700 border-blue-200",
    LIKE: "bg-rose-100 text-rose-700 border-rose-200",
  }
  const colorClass = colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700"

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {type}
    </span>
  )
}

// Rank Badge Component
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold border border-amber-200">
        {rank}
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-bold border border-slate-200">
        {rank}
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 text-sm font-bold border border-amber-200">
        {rank}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
      {rank}
    </span>
  )
}

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [followers, setFollowers] = useState<Follower[]>([])
  const [activeTab, setActiveTab] = useState("leaderboard")
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lbRes, actionsRes, followersRes] = await Promise.all([
        fetch("/api/leaderboard"),
        fetch("/api/actions"),
        fetch("/api/followers"),
      ])

      const lbData = await lbRes.json()
      const actionsData = await actionsRes.json()
      const followersData = await followersRes.json()

      if (lbData.leaderboard) setLeaderboard(lbData.leaderboard)
      if (actionsData.actions) setActions(actionsData.actions)
      if (followersData.followers) setFollowers(followersData.followers)
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">X Follower Analytics</h1>
                <p className="text-sm text-muted-foreground">Track your engagement</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{followers.length}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Total Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalScore}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Active Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeFollowers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="list">Followers</TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Engagement Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-14">Rank</TableHead>
                        <TableHead>Follower</TableHead>
                        <TableHead className="text-center">
                          <span className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Repost
                          </span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Reply
                          </span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Like
                          </span>
                        </TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((entry, index) => (
                        <TableRow
                          key={entry.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <RankBadge rank={index + 1} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={entry.avatarUrl || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {entry.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {entry.displayName || entry.username}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{entry.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                              {entry.repostCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                              {entry.replyCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-700 text-sm font-medium">
                              {entry.likeCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                              {entry.score}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ActionsSkeleton />
                ) : (
                  <>
                    {/* Filter Pills */}
                    <div className="flex gap-2 mb-6">
                      {["all", "REPOST", "REPLY", "LIKE"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() =>
                            setActionFilter(filter === "all" ? null : filter)
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            (filter === "all" && !actionFilter) ||
                            filter === actionFilter
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {filter === "all"
                            ? "All"
                            : filter.charAt(0) + filter.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {filteredActions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          No actions found
                        </div>
                      ) : (
                        filteredActions.map((action) => (
                          <div
                            key={action.id}
                            className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                          >
                            <Avatar className="h-11 w-11">
                              <AvatarImage
                                src={action.follower.avatarUrl || undefined}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {action.follower.username
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">
                                  {action.follower.displayName ||
                                    action.follower.username}
                                </span>
                                <span className="text-muted-foreground">
                                  @{action.follower.username}
                                </span>
                                <ActionBadge type={action.type} />
                              </div>
                              {action.text && (
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                  "{action.text}"
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(action.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                            </div>
                            <a
                              href={action.tweetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followers List Tab */}
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Followers</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Follower</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {followers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                            No followers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        followers.map((follower) => (
                          <TableRow
                            key={follower.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={follower.avatarUrl || undefined}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {follower.username
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {follower.displayName || follower.username}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    @{follower.username}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                                {follower._count.actions}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                  follower.excluded
                                    ? "bg-red-50 text-red-700 border border-red-100"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    follower.excluded ? "bg-red-500" : "bg-emerald-500"
                                  }`}
                                />
                                {follower.excluded ? "Excluded" : "Active"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}