import { OnboardingWizard } from './components/onboarding-wizard'

interface PageProps {
  searchParams: Promise<{ from?: string; skip_to?: string }>
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialFrom = params.from || null

  return <OnboardingWizard initialFrom={initialFrom} />
}
