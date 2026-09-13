import type { Idol } from '@/api/schemas'

/**
 * Ranked idol search.
 *
 * Hand-written rather than pulled from a fuzzy-match package, because the part
 * that matters here is Korean-specific and general libraries do not do it: a
 * Korean reader looking for 방탄소년단 types "방탄", or just the lead consonants
 * "ㅂㅌ", and expects both to land. The seven Latin names in the catalogue
 * (A.C.E, B1A4, BTOB, EXO, GOT7, NCT, TXT) need ordinary case- and
 * punctuation-insensitive matching at the same time.
 *
 * Every tier below is ordered so a more literal match always outranks a looser
 * one — a substring beats initials, initials beat a typo — and popularity only
 * breaks ties between equally good matches.
 */

const HANGUL_FIRST = 0xac00
const HANGUL_LAST = 0xd7a3
/** Syllables spanned by one lead consonant: 21 vowels × 28 finals. */
const SYLLABLES_PER_LEAD = 588

// prettier-ignore
const LEAD_CONSONANTS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const

const SCORE = {
  exact: 100,
  prefix: 80,
  substring: 60,
  initialsPrefix: 45,
  initialsSubstring: 35,
  subsequence: 20,
  typo: 10,
} as const

/** Longest name we bother running edit distance over. */
const MAX_TYPO_LENGTH = 12

/**
 * Drops the things people leave out when typing a name: spaces, dots and
 * hyphens (so "ace" finds A.C.E), and case.
 */
function normalise(text: string): string {
  return text.replace(/[\s.\-_]/g, '').toLowerCase()
}

/**
 * The lead consonant of a syllable — 방 → ㅂ. Anything that is not a composed
 * Hangul syllable passes through unchanged, so Latin names still compare.
 */
function leadConsonant(character: string): string {
  const code = character.charCodeAt(0)
  if (code < HANGUL_FIRST || code > HANGUL_LAST) return character
  return LEAD_CONSONANTS[Math.floor((code - HANGUL_FIRST) / SYLLABLES_PER_LEAD)]
}

function initials(text: string): string {
  return [...text].map(leadConsonant).join('')
}

/** Do the query's characters appear in order, though not adjacently? */
function isSubsequence(haystack: string, needle: string): boolean {
  let index = 0
  for (const character of haystack) {
    if (character === needle[index]) index += 1
    if (index === needle.length) return true
  }
  return needle.length === 0
}

/**
 * Levenshtein distance, stopped early once it cannot beat `limit`.
 *
 * Only used to forgive a slip of a key or two, so there is no point computing
 * the exact distance of two words that are nothing alike.
 */
function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    let rowBest = i
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const value = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      )
      current.push(value)
      if (value < rowBest) rowBest = value
    }
    if (rowBest > limit) return limit + 1
    previous = current
  }
  return previous[b.length]
}

/**
 * How well one name answers the query, or null when it does not.
 *
 * Later matches score lower than earlier ones within a tier, so "이" ranks
 * 이사배 above 케이윌.
 */
function scoreName(name: string, query: string): number | null {
  const target = normalise(name)
  const needle = normalise(query)
  if (!needle) return null

  if (target === needle) return SCORE.exact
  if (target.startsWith(needle)) return SCORE.prefix
  const at = target.indexOf(needle)
  if (at > 0) return SCORE.substring - at

  // Initials are jamo, which a syllable query can never equal, so this is safe
  // to try unconditionally rather than sniffing the query first.
  const initialsOf = initials(target)
  if (initialsOf.startsWith(needle)) return SCORE.initialsPrefix
  const initialsAt = initialsOf.indexOf(needle)
  if (initialsAt > 0) return SCORE.initialsSubstring - initialsAt

  if (isSubsequence(target, needle)) return SCORE.subsequence

  // One slip per four characters, and never on a query too short to tell a typo
  // from a different word.
  if (needle.length >= 3 && target.length <= MAX_TYPO_LENGTH) {
    const allowed = Math.max(1, Math.floor(needle.length / 4))
    const distance = editDistance(target, needle, allowed)
    if (distance <= allowed) return SCORE.typo - distance
  }

  return null
}

/** Ties go to the idol with more filming locations — the more useful answer. */
function byPopularity(a: Idol, b: Idol): number {
  return b.locationCount - a.locationCount || a.name.localeCompare(b.name, 'ko')
}

/**
 * Suggestions for the search box, best first.
 *
 * An empty query is not "no results" — it is the moment the box opens, so the
 * most-filmed idols stand in as the default suggestions.
 *
 * Every match is returned. Cutting the list to a handful here would hide
 * answers the reader could otherwise reach, and the box shows them in a
 * fixed-height scroller, so a long list costs nothing on screen.
 */
export function searchIdols(idols: Idol[], query: string): Idol[] {
  const trimmed = query.trim()
  if (!trimmed) return [...idols].sort(byPopularity)

  return idols
    .map((idol) => ({ idol, score: scoreName(idol.name, trimmed) }))
    .filter((match): match is { idol: Idol; score: number } => match.score !== null)
    .sort((a, b) => b.score - a.score || byPopularity(a.idol, b.idol))
    .map((match) => match.idol)
}
