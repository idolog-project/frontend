import type { ReactNode } from 'react'

/**
 * Login and signup share this split so the pair reads as one moment: the
 * photograph carries the mood, the panel carries the work.
 */
export function AuthLayout({
  imageUrl,
  children,
}: {
  imageUrl: string
  children: ReactNode
}) {
  return (
    <div className="flex h-full">
      {/* Decorative mood panel — alt="" so a screen reader goes straight to the
          one action on the page instead of a scenery description. */}
      <div className="relative hidden w-[55%] shrink-0 lg:block">
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60" />
        <span className="absolute left-screen top-screen bg-gradient-to-r from-accent to-accent-end bg-clip-text font-display text-title-md text-transparent">
          Idolog
        </span>
      </div>

      {/* `my-auto` on the panel rather than `items-center` on the scroller: a
          centred flex item that outgrows its scroll container has its overflow
          cut off at the top and unreachable, which is exactly what a phone in
          landscape (or with large text) does to this panel. Auto margins centre
          the same way but yield to the scroll. */}
      <div className="flex flex-1 overflow-y-auto px-screen py-12 md:py-16">
        <div className="mx-auto my-auto flex w-full max-w-sm flex-col gap-8">
          {/* The wordmark lives in the photo panel, which is hidden below `lg`,
              so a phone sign-in would carry no brand at all. Shown below `md`
              only, which leaves every desktop width exactly as it was. */}
          <span
            className="w-max bg-gradient-to-r from-accent to-accent-end bg-clip-text font-display text-title-md text-transparent md:hidden"
          >
            Idolog
          </span>
          {children}
        </div>
      </div>
    </div>
  )
}
