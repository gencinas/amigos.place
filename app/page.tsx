import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Share2, MessageCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-gradient-warm">amigos.place</span>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="rounded-full shadow-lg shadow-primary/25 hover:-translate-y-0.5">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Stay with friends,<br /><span className="text-gradient-warm">travel Europe</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Share your home availability with friends. No fees, no strangers
            — just your people, your couch, your city.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25 hover:-translate-y-0.5">
              Create your free profile
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground/70">Already used by friends across 12+ European cities</p>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center space-y-3 rounded-xl p-4 transition-colors hover:bg-accent">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Set your availability</h3>
                <p className="text-sm text-muted-foreground">
                  Mark the dates when your home is available for friends to visit.
                </p>
              </div>
              <div className="text-center space-y-3 rounded-xl p-4 transition-colors hover:bg-accent">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Share your link</h3>
                <p className="text-sm text-muted-foreground">
                  Send your personal page to friends — like Calendly, but for your couch.
                </p>
              </div>
              <div className="text-center space-y-3 rounded-xl p-4 transition-colors hover:bg-accent">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Accept requests</h3>
                <p className="text-sm text-muted-foreground">
                  Friends pick dates and send a request. You accept or decline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to host your friends?</h2>
          <p className="text-muted-foreground">
            It takes 2 minutes to set up. Share it in the group chat.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25 hover:-translate-y-0.5">
              Get started
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          amigos.place — made with love for friends who travel
        </div>
      </footer>
    </div>
  )
}
