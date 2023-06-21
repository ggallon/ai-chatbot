'use client'

import { Dialog, Menu, Transition } from '@headlessui/react'
import { MoreVertical, X } from 'lucide-react'
import { Fragment, useState } from 'react'

import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'
import { SlideoversTabs } from './slideovers-tabs'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export interface SlideOversProps {
  children?: React.ReactNode
}

export default function Slideover({ children }: SlideOversProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        className="-ml-2 h-9 w-9 p-0"
        onClick={() => setOpen(!open)}
      >
        <IconSidebar className="h-6 w-6" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10 sm:pr-16">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="flex items-start justify-between p-4">
                        <Dialog.Title className="text-sm font-semibold text-foreground">
                          Your's History
                        </Dialog.Title>
                        <Button
                          variant="ghost"
                          className="-ml-2 h-4 w-4 p-0 hover:bg-none"
                          onClick={() => setOpen(false)}
                        >
                          <X className="h-6 w-6" aria-hidden="true" />
                          <span className="sr-only">Toggle Sidebar r</span>
                        </Button>
                      </div>
                      <SlideoversTabs />
                      {children}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
