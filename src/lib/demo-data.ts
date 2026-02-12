// Demo data generator for testing without Twitter API

const DEMO_USERNAMES = [
  'alex_tech', 'sarah_design', 'mike_devops', 'emma_startup', 'james_ai',
  'lisa_crypto', 'david_product', 'anna_ux', 'chris_data', 'nina_systems',
]

const DEMO_DISPLAY_NAMES = [
  'Alex Thompson', 'Sarah Chen', 'Mike Rodriguez', 'Emma Wilson', 'James Park',
  'Lisa Wang', 'David Kumar', 'Anna Schmidt', 'Chris Brown', 'Nina Patel',
]

const DEMO_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chris',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
]

const TWEET_TEXTS = [
  'Great insights on the new framework!',
  'This is exactly what I needed to read today',
  'Love this approach to the problem',
  'Been thinking about this too - great post!',
  'Your threads are always so helpful',
  'Just implemented this, works like a charm',
  'Thanks for sharing these resources',
  'This changed my perspective completely',
  'Game changer for our team!',
  'Can\'t wait to try this out',
]

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export interface DemoFollower {
  id: string
  xUserId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  excluded: boolean
  addedAt: Date
}

export interface DemoAction {
  id: string
  followerId: string
  type: 'LIKE' | 'REPOST' | 'REPLY'
  tweetId: string
  tweetUrl: string
  text: string | null
  createdAt: Date
}

export interface DemoData {
  followers: DemoFollower[]
  actions: DemoAction[]
}

export function generateDemoData(): DemoData {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Generate followers
  const followers: DemoFollower[] = DEMO_USERNAMES.map((username, index) => ({
    id: generateId(),
    xUserId: `user_${username}_${index}`,
    username,
    displayName: DEMO_DISPLAY_NAMES[index],
    avatarUrl: DEMO_AVATARS[index],
    excluded: false,
    addedAt: randomDate(thirtyDaysAgo, now),
  }))

  // Generate actions - spread across followers with varied engagement
  const actions: DemoAction[] = []
  const actionTypes: Array<'LIKE' | 'REPOST' | 'REPLY'> = ['LIKE', 'REPOST', 'REPLY']

  // Generate 50 actions with realistic distribution
  for (let i = 0; i < 50; i++) {
    const follower = followers[Math.floor(Math.random() * followers.length)]
    const type = actionTypes[Math.floor(Math.random() * actionTypes.length)]
    const tweetId = generateId()
    const createdAt = randomDate(thirtyDaysAgo, now)

    actions.push({
      id: generateId(),
      followerId: follower.xUserId,
      type,
      tweetId,
      tweetUrl: `https://twitter.com/yourhandle/status/${tweetId}`,
      text: type === 'REPLY' ? TWEET_TEXTS[i % TWEET_TEXTS.length] : null,
      createdAt,
    })
  }

  // Sort actions by date (newest first)
  actions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return { followers, actions }
}