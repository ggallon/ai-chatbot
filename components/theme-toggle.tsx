'use client'

import va from '@vercel/analytics'
import { clsx } from 'clsx'
import { useCallback, useEffect, useState } from 'react'

import { themeEffect } from '@/lib/utils/theme-effect'

// from https://github.com/rauchg/blog/blob/main/app/theme-toggle.tsx

export function ThemeToggle() {
  // a `null` preference implies auto
  const [preference, setPreference] = useState<undefined | null | string>(
    undefined
  )
  const [currentTheme, setCurrentTheme] = useState<null | string>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isHoveringOverride, setIsHoveringOverride] = useState(false)

  const onMediaChange = useCallback(() => {
    const current = themeEffect()
    setCurrentTheme(current)
  }, [])

  useEffect(() => {
    setPreference(localStorage.getItem('theme'))
    const current = themeEffect()
    setCurrentTheme(current)

    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')
    matchMedia.addEventListener('change', onMediaChange)
    return () => matchMedia.removeEventListener('change', onMediaChange)
  }, [onMediaChange])

  const onStorageChange = useCallback(
    (event: StorageEvent) => {
      if (event.key === 'theme') setPreference(event.newValue)
    },
    [setPreference]
  )

  // when the preference changes, whether from this tab or another,
  // we want to recompute the current theme
  useEffect(() => {
    setCurrentTheme(themeEffect())
  }, [preference])

  useEffect(() => {
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  })

  return (
    <div className="flex items-center justify-items-center space-x-1">
      {/*
        the `theme-auto:` plugin is registered in `tailwind.config.js` and
        works similarly to the `dark:` prefix, which depends on the `theme-effect.ts` behavior
      */}
      <button
        aria-label="Toggle theme"
        className={clsx(
          'inline-flex rounded-sm bg-gray-200 p-2 transition-[background-color] active:bg-gray-300 theme-system:!bg-inherit',
          'dark:bg-[#313131] dark:active:bg-[#242424] dark:[&_.moon-icon]:hidden [&_.sun-icon]:hidden dark:[&_.sun-icon]:inline',
          isHovering && !isHoveringOverride && 'bg-gray-200 dark:bg-[#313131]'
        )}
        onClick={ev => {
          ev.preventDefault()
          // prevent the hover state from rendering
          setIsHoveringOverride(true)

          let newPreference: string | null =
            currentTheme === 'dark' ? 'light' : 'dark'
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
            .matches
            ? 'dark'
            : 'light'

          // if the user has their current OS theme as a preference (instead of auto)
          // and they click the toggle, we want to switch to reset the preference
          if (preference !== null && systemTheme === currentTheme) {
            newPreference = null
            localStorage.removeItem('theme')
          } else {
            localStorage.setItem('theme', newPreference)
          }

          va.track('Theme toggle', {
            Theme: newPreference === null ? 'system' : newPreference
          })

          setPreference(newPreference)
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false)
          setIsHoveringOverride(false)
        }}
      >
        <span className="sun-icon w-4 h-4">
          <SunIcon />
        </span>
        <span className="moon-icon w-4 h-4">
          <MoonIcon />
        </span>
      </button>

      {isHovering && (
        <span className={`text-[9px] text-gray-400`}>
          {preference === null
            ? 'System'
            : preference === 'dark'
            ? 'Dark'
            : 'Light'}
        </span>
      )}
    </div>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      strokeWidth={0}
      viewBox="0 0 56 56"
    >
      <path
        fill="currentColor"
        d="M41.2 36.1c-12.9 0-21-7.8-21-20.3 0-3.5.7-6.7 1.6-8.3.3-.7.4-1 .4-1.5 0-.8-.7-1.7-1.7-1.7-.2 0-.7 0-1.3.3A24.5 24.5 0 0 0 4.4 27.1 23.8 23.8 0 0 0 29 51.7c10.2 0 18.4-5.3 22.3-14.1l.3-1.4c0-1-.9-1.6-1.6-1.6a3 3 0 0 0-1.2.2c-2 .8-4.8 1.3-7.6 1.3zM8.1 27c0-7.3 3.8-14.3 9.9-18-.8 2-1.2 4.5-1.2 7.2 0 14.6 9 23.3 23.9 23.3 2.4 0 4.5-.2 6.4-1a20.8 20.8 0 0 1-18 9.6C17 48 8.1 39 8.1 27z"
      />
    </svg>
  )
}

function SunIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 56 56"
      {...props}
    >
      <path
        d="M30 4.6c0-1-.9-2-2-2a2 2 0 0 0-2 2v5c0 1 .9 2 2 2s2-1 2-2zm9.6 9a2 2 0 0 0 0 2.8c.8.8 2 .8 2.9 0L46 13a2 2 0 0 0 0-2.9 2 2 0 0 0-3 0zm-26 2.8c.7.8 2 .8 2.8 0 .8-.7.8-2 0-2.9L13 10c-.7-.7-2-.8-2.9 0-.7.8-.7 2.1 0 3zM28 16a12 12 0 0 0-12 12 12 12 0 0 0 12 12 12 12 0 0 0 12-12 12 12 0 0 0-12-12zm0 3.6c4.6 0 8.4 3.8 8.4 8.4 0 4.6-3.8 8.4-8.4 8.4a8.5 8.5 0 0 1-8.4-8.4c0-4.6 3.8-8.4 8.4-8.4zM51.3 30c1.1 0 2-.9 2-2s-.9-2-2-2h-4.9a2 2 0 0 0-2 2c0 1.1 1 2 2 2zM4.7 26a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4.9c1 0 2-.9 2-2s-1-2-2-2zm37.8 13.6a2 2 0 0 0-3 0 2 2 0 0 0 0 2.9l3.6 3.5a2 2 0 0 0 2.9 0c.8-.8.8-2.1 0-3zM10 43.1a2 2 0 0 0 0 2.9c.8.7 2.1.8 3 0l3.4-3.5c.8-.8.8-2.1 0-2.9-.8-.8-2-.8-2.9 0zm20 3.4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4.9c0 1 .9 2 2 2s2-1 2-2z"
        fill="currentColor"
      />
    </svg>
  )
}
