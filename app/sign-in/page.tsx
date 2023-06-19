import { Suspense } from 'react'
import { LoginButton } from '@/components/login-button'

export default async function SignInPage() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      <Suspense fallback={null}>
        <LoginButton />
      </Suspense>
    </div>
  )
}
