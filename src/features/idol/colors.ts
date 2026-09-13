import type { FilmingLocation, Idol } from '@/api/schemas'

/**
 * One colour per idol so a map full of pins reads at a glance.
 *
 * Every entry is already in the design system — coral and violet are the two
 * ends of the signature gradient, mint is the live-state highlight — so adding
 * idol colour does not introduce a new palette.
 *
 * Six colours is the whole budget, and the catalogue holds far more idols than
 * that, so colour is spent on the few the legend names rather than spread
 * thin. See `featuredIdols` and `UNFEATURED_PIN_COLOR`.
 */
export const IDOL_PALETTE = [
  '#FF5A6E', // accent coral
  '#8A5CF6', // gradient violet
  '#63E6C7', // live mint
  '#FFB3B6', // primary pink
  '#F2C14E', // amber
  '#5AB0FF', // sky
] as const

/**
 * How many idols the map legend names.
 *
 * Five, because the palette holds six: keeping one spare lets the legend also
 * name an idol you filtered to from the full dropdown without two rows ever
 * sharing a colour.
 */
export const FEATURED_IDOL_COUNT = 5

/**
 * Pin colour for an idol the legend does not name.
 *
 * Deliberately not `DEFAULT_PIN_COLOR`, which is the same coral as
 * `IDOL_PALETTE[0]` — falling back to it would paint forty-odd unnamed idols
 * the same colour as the one the legend claims for the top idol. This is
 * `--color-text-muted`, so unnamed pins read as background next to named ones.
 */
export const UNFEATURED_PIN_COLOR = '#9a9aa4'

/**
 * The idols worth naming: the ones with the most filming locations.
 *
 * Catalogue order is arbitrary, so "most locations" is the only popularity
 * signal the API gives us — and it is the honest one here, since the number is
 * exactly how much of the map that idol accounts for.
 *
 * Ties break by name so the legend does not reshuffle between loads.
 */
export function featuredIdols(idols: Idol[], count = FEATURED_IDOL_COUNT): Idol[] {
  return [...idols]
    .sort(
      (a, b) => b.locationCount - a.locationCount || a.name.localeCompare(b.name, 'ko'),
    )
    .slice(0, count)
}

/**
 * Assigns one palette colour per idol, by position.
 *
 * Pass only the idols the legend names. Handing it the whole catalogue would
 * wrap the six-colour palette around forty-eight idols, so pins that look alike
 * would belong to different idols and the legend could not be trusted.
 */
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
