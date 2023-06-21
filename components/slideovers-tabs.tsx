'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { name: 'Chat', href: '/' },
  { name: 'Prompt', href: '/prompt' },
  { name: 'Write', href: '/write' }
]

export function SlideoversTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 px-4">
      <nav className="-mb-px flex space-x-6">
        {tabs.map(tab => {
          const isActice = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`whitespace-nowrap border-b-2 px-1 pb-3.5 text-sm font-medium ${
                isActice
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
