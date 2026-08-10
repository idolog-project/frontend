/**
 * Dev-only switches for exercising the recommendation flow without a backend.
 *
 * In the browser console:
 *   localStorage.setItem('idolog:mock-scenario', 'empty')   // 결과 0개
 *   localStorage.setItem('idolog:mock-scenario', 'error')   // 추천 실패
 *   localStorage.removeItem('idolog:mock-scenario')         // 정상
 *
 *   localStorage.setItem('idolog:mock-delay', '1000')       // 대기 1초로 단축
 *   localStorage.removeItem('idolog:mock-delay')            // 기본값으로
 */
export type MockScenario = 'ok' | 'empty' | 'error'

const SCENARIO_KEY = 'idolog:mock-scenario'
const DELAY_KEY = 'idolog:mock-delay'

export function currentScenario(): MockScenario {
  const value = localStorage.getItem(SCENARIO_KEY)
  return value === 'empty' || value === 'error' ? value : 'ok'
}

/**
 * How long the recommendation call pretends to take. The brief says the real
 * one runs 10-30s; this sits at the low end so development stays bearable, and
 * can be shortened further from the console while testing other screens.
 */
export function recommendDelayMs(): number {
  const raw = localStorage.getItem(DELAY_KEY)
  // Number(null) is 0, so an unset key must bail out before coercion or the
  // default 12s silently becomes 0ms.
  if (raw === null || raw.trim() === '') return 12_000
  const override = Number(raw)
  return Number.isFinite(override) && override >= 0 ? override : 12_000
}
