import type { FilmingLocation, Idol } from '@/api/schemas'

/**
 * One colour per idol so a map full of pins reads at a glance.
 *
 * Every entry is already in the design system — coral and violet are the two
 * ends of the signature gradient, mint is the live-state highlight — so adding
 * idol colour does not introduce a new palette. Assigned by position, so a
 * fourth idol picks up the next colour without any code change.
 */
export const IDOL_PALETTE = [
  '#FF5A6E', // accent coral
  '#8A5CF6', // gradient violet
  '#63E6C7', // live mint
  '#FFB3B6', // primary pink
  '#F2C14E', // amber
  '#5AB0FF', // sky
] as const

export function idolColors(idols: Idol[]): Map<number, string> {
  return new Map(
    idols.map((idol, index) => [idol.id, IDOL_PALETTE[index % IDOL_PALETTE.length]]),
  )
}

/**
 * A location can appear in several idols' videos. The pin takes the colour of
 * the first idol that has one, which keeps a location's colour stable no matter
 * which filter is active.
 */
export function colorForLocation(
  location: FilmingLocation,
  colors: Map<number, string>,
): string | undefined {
  for (const video of location.musicVideos) {
    const color = colors.get(video.idolId)
    if (color) return color
  }
  return undefined
}
