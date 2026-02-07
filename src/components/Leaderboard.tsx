"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, MessageCircle, Heart, Repeat2 } from "lucide-react"

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

interface LeaderboardProps {
  data: LeaderboardEntry[]
  weights: { REPOST: number; REPLY: number; LIKE: number }
  onExport?: () => void
}

export function Leaderboard({ data, weights, onExport }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<"score" | "engagementRate">("score")
  const sortedData = [...data].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        {onExport && (
          <button className="px-3 py-1 text-sm border rounded" onClick={onExport}>
            Export CSV
          </button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="score" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="score" onClick={() => setSortBy("score")}>
              Total Score
            </TabsTrigger>
            <TabsTrigger value="engagement" onClick={() => setSortBy("engagementRate")}>
              Engagement Rate
            </TabsTrigger>
          </TabsList>
          <TabsContent value="score" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Follower</TableHead>
                  <TableHead className="text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Repeat2 className="h-4 w-4" /> Repost ({weights.REPOST})
                    </span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="flex items-center justify-center gap-1">
                      <MessageCircle className="h-4 w-4" /> Reply ({weights.REPLY})
                    </span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Heart className="h-4 w-4" /> Like ({weights.LIKE})
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.avatarUrl || undefined} />
                          <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.displayName || entry.username}</div>
                          <div className="text-sm text-muted-foreground">@{entry.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{entry.repostCount}</TableCell>
                    <TableCell className="text-center">{entry.replyCount}</TableCell>
                    <TableCell className="text-center">{entry.likeCount}</TableCell>
                    <TableCell className="text-right font-bold">{entry.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="engagement" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Follower</TableHead>
                  <TableHead className="text-right">Engagement Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.avatarUrl || undefined} />
                          <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.displayName || entry.username}</div>
                          <div className="text-sm text-muted-foreground">@{entry.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{entry.engagementRate.toFixed(3)}/day</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}