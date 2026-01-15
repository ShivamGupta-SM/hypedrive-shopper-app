import * as Headless from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import type React from 'react'
import { Text } from './text'

const sizes = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
}

export function Dialog({
  size = 'lg',
  className,
  children,
  showCloseButton = false,
  onClose,
  ...props
}: {
  size?: keyof typeof sizes
  className?: string
  children: React.ReactNode
  showCloseButton?: boolean
  onClose?: () => void
} & Omit<Headless.DialogProps, 'as' | 'className'>) {
  return (
    <Headless.Dialog {...props} onClose={onClose || (() => {})}>
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 flex w-screen justify-center overflow-y-auto bg-zinc-950/30 px-2 py-2 backdrop-blur-[2px] transition duration-150 focus:outline-0 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in xs:px-3 xs:py-3 sm:px-6 sm:py-8 lg:px-8 lg:py-16 dark:bg-zinc-950/60"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto pt-4 xs:pt-6 sm:pt-0">
        <div className="grid min-h-full grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr] sm:p-4">
          <Headless.DialogPanel
            transition
            className={clsx(
              className,
              sizes[size],
              'relative row-start-2 w-full min-w-0 rounded-t-2xl bg-white p-5 shadow-xl ring-1 ring-zinc-950/5 xs:rounded-t-3xl xs:p-6 sm:mb-auto sm:rounded-2xl sm:p-6 dark:bg-zinc-900 dark:ring-white/10 forced-colors:outline',
              'max-h-[calc(100vh-1rem)] overflow-y-auto xs:max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-4rem)]',
              'transition duration-150 will-change-transform data-closed:translate-y-12 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in sm:data-closed:translate-y-0 sm:data-closed:data-enter:scale-95'
            )}
          >
            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <XMarkIcon className="size-5" />
              </button>
            )}
            {children}
          </Headless.DialogPanel>
        </div>
      </div>
    </Headless.Dialog>
  )
}

export function DialogTitle({
  className,
  ...props
}: { className?: string } & Omit<Headless.DialogTitleProps, 'as' | 'className'>) {
  return (
    <Headless.DialogTitle
      {...props}
      className={clsx(className, 'text-base/6 font-semibold text-balance text-zinc-950 xs:text-lg/6 sm:text-base/6 dark:text-white')}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: { className?: string } & Omit<Headless.DescriptionProps<typeof Text>, 'as' | 'className'>) {
  return <Headless.Description as={Text} {...props} className={clsx(className, 'mt-1.5 text-pretty text-xs xs:mt-2 xs:text-sm')} />
}

export function DialogBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx(className, 'mt-4 xs:mt-5 sm:mt-6')} />
}

export function DialogActions({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-5 flex flex-col-reverse items-center justify-end gap-2 xs:mt-6 xs:gap-3 sm:mt-8 sm:flex-row sm:*:w-auto',
        '*:w-full *:text-sm xs:*:text-base'
      )}
    />
  )
}
