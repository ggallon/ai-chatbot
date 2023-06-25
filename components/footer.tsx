import React from 'react'

import { ExternalLink } from '@/components/external-link'
import { cn } from '@/lib/utils/ui'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      AI chatbot built with{' '}
      <ExternalLink href="https://nextjs.org">Next.js</ExternalLink> and{' '}
      <ExternalLink href="https://sdk.vercel.ai/docs">
        Vercel AI SDK
      </ExternalLink>
      .
    </p>
  )
}
