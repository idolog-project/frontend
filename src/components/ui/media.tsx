import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Full-bleed hero with the vignette that lets display type sit on photography.
 * Depth comes from the layered image, never a drop shadow.
 */
export function Hero({
  imageUrl,
  alt,
  height = 'h-[420px]',
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
      <div className="relative flex h-48 w-full max-w-md items-center justify-center opacity-80">
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
  return (
    <ul className="flex gap-4 overflow-x-auto pb-2">
      {images.map((image) => (
        <li
          key={image.url}
          className="h-48 w-64 shrink-0 overflow-hidden rounded border border-border bg-surface-raised"
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
