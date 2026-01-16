import clsx from 'clsx'

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
>

/**
 * Main page heading - Uses Instrument Serif
 * Typical usage: Page titles like "Dashboard", "Wallet", "Campaigns"
 */
export function Heading({ className, level = 1, ...props }: HeadingProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(
        className,
        'font-serif text-3xl tracking-tight text-zinc-950 sm:text-4xl dark:text-white'
      )}
    />
  )
}

/**
 * Section subheading - Uses Instrument Serif (smaller)
 * Typical usage: Section titles within pages
 */
export function Subheading({ className, level = 2, ...props }: HeadingProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(
        className,
        'font-serif text-xl tracking-tight text-zinc-950 sm:text-2xl dark:text-white'
      )}
    />
  )
}

/**
 * Small section title - Uses sans-serif for smaller labels
 * Typical usage: Card titles, list headers
 */
export function SectionTitle({ className, level = 3, ...props }: HeadingProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(
        className,
        'text-sm font-semibold text-zinc-900 dark:text-white'
      )}
    />
  )
}
