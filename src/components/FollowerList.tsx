"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { EyeOff, ExternalLink } from "lucide-react"

interface Follower {
  id: string
  xUserId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  excluded: boolean
  _count: {
    actions: number
  }
}

interface FollowerListProps {
  followers: Follower[]
  onToggleExclude: (followerId: string, excluded: boolean) => void
  onRefresh?: () => void
}

export function FollowerList({ followers, onToggleExclude, onRefresh }: FollowerListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Follower List</CardTitle>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Follower</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Excluded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {followers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No followers found
                </TableCell>
              </TableRow>
            ) : (
              followers.map((follower) => (
                <TableRow key={follower.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={follower.avatarUrl || undefined} />
                        <AvatarFallback>
                          {follower.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{follower.displayName || follower.username}</div>
                        <div className="text-sm text-muted-foreground">@{follower.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{follower._count.actions}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={follower.excluded}
                        onCheckedChange={(checked) => onToggleExclude(follower.id, checked)}
                      />
                      {follower.excluded && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}