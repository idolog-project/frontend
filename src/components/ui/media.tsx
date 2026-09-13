import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Full-bleed hero with the vignette that lets display type sit on photography.
 * Depth comes from the layered image, never a drop shadow.
 *
 * The default height is responsive rather than a second prop: 420px is over
 * half a phone viewport, which would push every headline below the fold. The
 * `md` half is the original value, so desktop is untouched and callers that
 * pass their own `height` keep full control. 288px is the floor that still
 * clears the overlay controls a caller puts in the top corners — see
 * `ViewfinderFrame`.
 */
export function Hero({
  imageUrl,
  alt,
  height = 'h-72 md:h-[420px]',
  children,
}: {
  imageUrl: string | null
  alt: string
  height?: string
  children?: ReactNode
}) {
  return (
    <section className={cn('relative w-full overflow-hidden bg-surface', height)}>
      {imageUrl && (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      {children}
    </section>
  )
}

/**
 * Four corner brackets that frame the hero like a camera viewfinder — the
 * strongest visual idea in the draft, and the app's one recurring flourish.
 */
export function ViewfinderFrame({ label }: { label: string }) {
  const corner = 'absolute h-4 w-4 border-accent'
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-screen">
      {/* Shorter on a phone so the top brackets clear the hero's back button:
          the frame is centred, so a 192px frame in a 280px hero would start
          56px down and collide with a 40px control sitting 20px from the top.
          At 144px it starts below it, which is what lets a phone hero go down
          to ~280px at all. */}
      <div className="relative flex h-36 w-full max-w-md items-center justify-center opacity-80 md:h-48">
        <span className={cn(corner, 'left-0 top-0 border-l-2 border-t-2')} />
        <span className={cn(corner, 'right-0 top-0 border-r-2 border-t-2')} />
        <span className={cn(corner, 'bottom-0 left-0 border-b-2 border-l-2')} />
        <span className={cn(corner, 'bottom-0 right-0 border-b-2 border-r-2')} />
        <span className="rounded-full border border-border bg-background/80 px-4 py-2 font-display text-label-caps uppercase text-primary backdrop-blur-sm">
          {label}
        </span>
      </div>
    </div>
  )
}

export function GalleryStrip({
  images,
}: {
  images: Array<{ url: string; alt: string }>
}) {
  if (!images.length) return null
  // Two phone-only changes, both about making the scroll visible. Tiles are
  // narrower so the next frame peeks in, and the strip breaks out of the
  // caller's `px-screen` to run to the screen edge — inside the gutter the row
  // ends on trimmed whitespace and looks like it has nothing more to show. The
  // negative margin assumes a `px-screen` parent, which is the screen padding
  // every page uses; `md:` returns it to a plain in-flow list.
  return (
    <ul className="-mx-screen flex gap-4 overflow-x-auto px-screen pb-2 md:mx-0 md:px-0">
      {images.map((image) => (
        <li
          key={image.url}
          className="h-40 w-56 shrink-0 overflow-hidden rounded border border-border bg-surface-raised md:h-48 md:w-64"
        >
          <img
            src={image.url}
            alt={image.alt}
            className="h-full w-full object-cover"
          />
        </li>
      ))}
    </ul>
  )
}
