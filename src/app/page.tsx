import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <span className="text-xl font-bold">X Follower Analytics</span>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Understand Your X Followers
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track engagement, identify your top supporters, and understand 
            how your followers interact with your content.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
