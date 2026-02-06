'use client'

import { useSearchParams } from 'next/navigation'
import { ShareStep } from '../components/share-step'
import { Suspense } from 'react'

function ShareContent() {
  const searchParams = useSearchParams()
  const username = searchParams.get('username') || ''
  const name = searchParams.get('name') || ''
  const city = searchParams.get('city') || ''

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-accent/40 via-background to-background">
      <div className="w-full max-w-[480px]">
        <ShareStep
          username={username}
          displayName={name}
          avatarUrl={null}
          city={city}
        />
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShareContent />
    </Suspense>
  )
}
