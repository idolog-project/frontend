/**
 * Stand-in reviews, so the review UI can be looked at before there is anywhere
 * to read real ones from.
 *
 * Development seed content, like everything else in this folder — written to
 * fill a layout, not reported by anyone who went. Delete this file the day the
 * API serves reviews; `ReviewSection` reads it in exactly one place.
 *
 * Keyed by location id, and deliberately sparse: most locations come back
 * empty, which is what the real thing will look like for a while and is the
 * state worth seeing.
 */
export type SeedReview = {
  id: string
  nickname: string
  /** 1–5. */
  rating: number
  /** ISO date, formatted by the locale at render time. */
  writtenOn: string
  body: string
}

export const REVIEW_SEED: Record<number, SeedReview[]> = {
  // 메이즈랜드
  1: [
    {
      id: 'r1',
      nickname: '제주러버',
      rating: 5,
      writtenOn: '2026-08-14',
      body: '미로 입구 쪽이 뮤비에 나온 그 각도예요. 사람 없을 때 찍으려면 문 여는 시간에 맞춰 가는 걸 추천합니다.',
    },
    {
      id: 'r2',
      nickname: 'hyeon',
      rating: 4,
      writtenOn: '2026-07-30',
      body: '생각보다 넓어서 한 바퀴 도는 데 한 시간 정도 걸렸어요. 여름엔 그늘이 적어서 모자 필수.',
    },
  ],
}
