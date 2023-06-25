import { Ratelimit } from '@upstash/ratelimit'
import { type Metadata } from 'next'
import { headers } from 'next/headers'

import { ratelimit } from '@/lib/upstash/ratelimit'

export const metadata: Metadata = {
  title: 'Ratelimit'
}

export default async function Limit() {
  const ip = headers().get('x-forwarded-for')
  const { success, limit, remaining, reset } = await ratelimit(
    true,
    Ratelimit.fixedWindow(10, '60s')
  ).custum.limit(`test_${ip ?? '0.0.0.0'}`)

  return (
    <main className="flex min-h-full flex-col items-center justify-between p-24">
      <div className="relative flex text-center text-4xl font-semibold lg:text-7xl">
        {success ? (
          <>Ratelimit checker</>
        ) : (
          <>
            You have reached the limit,
            <br />
            please come back later
          </>
        )}
      </div>

      <div className="my-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={'mb-3 text-2xl font-semibold'}>Success</h2>
          <p className={'m-0 max-w-[30ch] text-sm opacity-50'}>
            {success.toString()}
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={'mb-3 text-2xl font-semibold'}>Limit </h2>
          <p className={'m-0 max-w-[30ch] text-sm opacity-50'}>{limit}</p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={'mb-3 text-2xl font-semibold'}>Remaining</h2>
          <p className={'m-0 max-w-[30ch] text-sm opacity-50'}>{remaining}</p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={'mb-3 text-2xl font-semibold'}>Reset</h2>
          <p className={'m-0 max-w-[30ch] text-sm opacity-50'}>
            {new Date(reset).toUTCString()}
          </p>
        </div>
      </div>
    </main>
  )
}
