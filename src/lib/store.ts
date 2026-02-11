// Simple in-memory storage for single-user testing
// In production, replace with Prisma/database

interface Follower {
  id: string
  xUserId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  excluded: boolean
  addedAt: Date
}

interface Action {
  id: string
  followerId: string
  type: 'LIKE' | 'REPOST' | 'REPLY'
  tweetId: string
  tweetUrl: string
  text: string | null
  createdAt: Date
}

interface UserData {
  xAccessToken: string | null
  xUserId: string | null
  xUsername: string | null
  followers: Map<string, Follower>
  actions: Map<string, Action>
}

// Global in-memory store (resets on server restart)
const globalStore = globalThis as unknown as {
  store: Map<string, UserData>
}

if (!globalStore.store) {
  globalStore.store = new Map()
}

function getUserStore(userId: string): UserData {
  if (!globalStore.store.has(userId)) {
    globalStore.store.set(userId, {
      xAccessToken: null,
      xUserId: null,
      xUsername: null,
      followers: new Map(),
      actions: new Map(),
    })
  }
  return globalStore.store.get(userId)!
}

export const store = {
  getUser(userId: string) {
    return getUserStore(userId)
  },

  setTokens(userId: string, tokens: { accessToken: string; xUserId: string; xUsername: string }) {
    const userStore = getUserStore(userId)
    userStore.xAccessToken = tokens.accessToken
    userStore.xUserId = tokens.xUserId
    userStore.xUsername = tokens.xUsername
  },

  getTokens(userId: string) {
    const userStore = getUserStore(userId)
    return {
      accessToken: userStore.xAccessToken,
      xUserId: userStore.xUserId,
      xUsername: userStore.xUsername,
    }
  },

  hasConnected(userId: string) {
    const userStore = getUserStore(userId)
    return !!userStore.xAccessToken
  },

  addFollower(userId: string, follower: Follower) {
    const userStore = getUserStore(userId)
    userStore.followers.set(follower.xUserId, follower)
  },

  getFollowers(userId: string): Follower[] {
    const userStore = getUserStore(userId)
    return Array.from(userStore.followers.values())
  },

  addAction(userId: string, action: Action) {
    const userStore = getUserStore(userId)
    userStore.actions.set(action.id, action)
  },

  getActions(userId: string): Action[] {
    const userStore = getUserStore(userId)
    return Array.from(userStore.actions.values())
  },

  getFollowerActions(userId: string, followerId: string): Action[] {
    const userStore = getUserStore(userId)
    return Array.from(userStore.actions.values()).filter(a => a.followerId === followerId)
  },

  clear(userId: string) {
    globalStore.store.delete(userId)
  },
}