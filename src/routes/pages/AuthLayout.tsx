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

      <div className="flex flex-1 items-center overflow-y-auto px-screen py-16">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">{children}</div>
      </div>
    </div>
  )
}
