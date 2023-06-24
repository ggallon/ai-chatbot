import { type Metadata } from 'next'
import { Suspense } from 'react'

import { LoginButton } from '@/components/login-button'

export const metadata: Metadata = {
  title: 'Login'
}

export default function SignInPage() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center gap-5 py-10">
      <Suspense fallback={null}>
        <LoginButton />
      </Suspense>
    </div>
  )
}
