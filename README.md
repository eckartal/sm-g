# sm-g | X Follower Analytics Dashboard

A modern dashboard to analyze X (Twitter) followers with engagement metrics, leaderboards, and action feeds.

## Features

- **Leaderboard**: Weighted scoring (Repost=3pts, Reply=2pts, Like=1pt)
- **Action Feed**: Filter recent interactions by type
- **Follower List**: View all followers with engagement stats
- **Skeleton Loading States**: Smooth loading UX
- **Responsive Design**: Works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn UI + Tailwind CSS
- **Auth**: Clerk (ready for integration)
- **Database**: PostgreSQL + Prisma ORM (schema ready)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/sm_g"

# X API (optional - for real data)
X_API_KEY=your_x_api_key
```

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Main dashboard page
│   └── sign-in/       # Clerk sign-in
├── components/
│   ├── ui/            # shadcn UI components
│   └── *.tsx          # Custom components
└── lib/               # Utilities & Prisma client
```

## Demo Mode

The app runs in demo mode with in-memory data. To connect real X API:

1. Get X API credentials from developer.twitter.com
2. Update the sync routes to call X API
3. Set up PostgreSQL and run `npx prisma db push`

## License

MIT