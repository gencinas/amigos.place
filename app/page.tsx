import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">amigos.place</span>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Stay with friends,<br />travel Europe
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Share your home availability with friends. No fees, no strangers
            — just your people, your couch, your city.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-8 text-base">
              Create your free profile
            </Button>
          </Link>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  1
                </div>
                <h3 className="font-semibold">Set your availability</h3>
                <p className="text-sm text-muted-foreground">
                  Mark the dates when your home is available for friends to visit.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  2
                </div>
                <h3 className="font-semibold">Share your link</h3>
                <p className="text-sm text-muted-foreground">
                  Send your personal page to friends — like Calendly, but for your couch.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  3
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
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-8 text-base">
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
