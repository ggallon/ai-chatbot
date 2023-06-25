'use client'

import dlv from 'dlv'
import * as React from 'react'
import colorPalette from 'tailwindcss/colors'

export function kebabToTitleCase(str) {
  return str
    .replace(/(?:^|-)([a-z])/gi, (m, p1) => ` ${p1.toUpperCase()}`)
    .trim()
}

function ColorPalette({ name, value }) {
  const [{ state }, setState] = React.useState({ state: 'idle' })

  React.useEffect(() => {
    if (state === 'copied') {
      const handle = window.setTimeout(() => {
        setState({ state: 'idle' })
      }, 1500)
      return () => {
        window.clearTimeout(handle)
      }
    }
  }, [state])

  return (
    <div className="relative flex">
      <div
        className="flex w-full cursor-pointer items-center gap-x-3 sm:block sm:space-y-1.5"
        onClick={() =>
          navigator.clipboard.writeText(value).then(() => {
            setState({ state: 'copied' })
          })
        }
      >
        <div
          className="h-10 w-10 rounded dark:ring-1 dark:ring-inset dark:ring-white/10 sm:w-full"
          style={{ backgroundColor: value }}
        />
        <div className="px-0.5">
          <div className="w-6 text-xs font-medium text-slate-900 dark:text-white 2xl:w-full">
            {name}
          </div>
          <div className="font-mono text-xs lowercase text-slate-500 dark:text-slate-400 sm:text-[0.625rem] md:text-xs lg:text-[0.625rem] 2xl:text-xs">
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}

function ColorPaletteGlobale({ name, value }) {
  const [{ state }, setState] = React.useState({ state: 'idle' })

  const bgValue = `bg-${name}`

  React.useEffect(() => {
    if (state === 'copied') {
      const handle = window.setTimeout(() => {
        setState({ state: 'idle' })
      }, 1500)
      return () => {
        window.clearTimeout(handle)
      }
    }
  }, [state])

  return (
    <div className="relative flex">
      <div
        className="flex w-full cursor-pointer items-center gap-x-3 sm:block sm:space-y-1.5"
        onClick={() =>
          navigator.clipboard.writeText(value).then(() => {
            setState({ state: 'copied' })
          })
        }
      >
        <div
          className={`h-10 w-10 rounded dark:ring-1 dark:ring-inset dark:ring-white/10 sm:w-full ${bgValue}`}
        />
        <div className="px-0.5">
          <div className="w-6 text-xs font-medium text-slate-900 dark:text-white 2xl:w-full">
            {name}
          </div>
          <div className="font-mono text-xs lowercase text-slate-500 dark:text-slate-400 sm:text-[0.625rem] md:text-xs lg:text-[0.625rem] 2xl:text-xs">
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ColorPaletteReference({ colors }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-2 gap-y-8 sm:grid-cols-1">
      {colors.map((color, i) => {
        let title = Array.isArray(color) ? color[0] : kebabToTitleCase(color)
        let value = Array.isArray(color) ? color[1] : color

        let palette =
          typeof value === 'string'
            ? [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                variant => ({
                  name: variant,
                  value: dlv(colorPalette, [value, variant])
                })
              )
            : Object.keys(value).map(name => ({ name, value: value[name] }))

        return (
          <div key={title} className="2xl:contents">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 2xl:col-end-1 2xl:pt-2.5">
              {title
                .split('')
                .flatMap((l, i) => {
                  return i !== 0 && l.toUpperCase() === l ? [' ', l] : [l]
                })
                .join('')}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-x-2 gap-y-3 sm:mt-2 sm:grid-cols-11 2xl:mt-0">
              {palette.map((props, j) => (
                <ColorPalette key={j} {...props} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ColorPaletteGlobal({ colors }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-2 gap-y-8 sm:grid-cols-1">
      {colors.map((color, i) => {
        return (
          <div key={color.name} className="2xl:contents">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 2xl:col-end-1 2xl:pt-2.5">
              {color.name}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-x-2 gap-y-3 sm:mt-2 sm:grid-cols-11 2xl:mt-0">
              <ColorPaletteGlobale name={color.name} value={color.value} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const globalLight = [
  { name: 'background', value: '0 0% 99%' },
  { name: 'foreground', value: '0 0% 11%' },
  { name: 'muted', value: '240 4.8% 95.9%' },
  { name: 'muted-foreground', value: '240 3.8% 46.1%' },
  { name: 'popover', value: '0 0% 99%' },
  { name: 'popover-foreground', value: '0 0% 11%' },
  { name: 'card', value: '0 0% 99%' },
  { name: 'card-foreground', value: '0 0% 11%' },
  { name: 'border', value: '240 5.9% 90%' },
  { name: 'input', value: '240 5.9% 90%' },
  { name: 'primary', value: '240 5.9% 10%' },
  { name: 'primary-foreground', value: '0 0% 99%' },
  { name: 'secondary', value: '240 4.8% 95.9%' },
  { name: 'secondary-foreground', value: '240 5.9% 10%' },
  { name: 'accent', value: '240 4.8% 95.9%' },
  { name: 'accent-foreground', value: '240 5.9% 10%' },
  { name: 'destructive', value: '0 84.2% 60.2%' },
  { name: 'destructive-foreground', value: '0 0% 99%' },
  { name: 'ring', value: '240 5% 64.9%' }
]

export default async function Color() {
  return (
    <div className="mx-auto px-8 pb-2">
      <ColorPaletteGlobal colors={globalLight} />
      <ColorPaletteReference
        colors={[
          'slate',
          'gray',
          'zinc',
          'neutral',
          'stone',
          'red',
          'orange',
          'amber',
          'yellow',
          'lime',
          'green',
          'emerald',
          'teal',
          'cyan',
          'sky',
          'blue',
          'indigo',
          'violet',
          'purple',
          'fuchsia',
          'pink',
          'rose'
        ]}
      />
    </div>
  )
}
