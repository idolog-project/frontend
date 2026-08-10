/**
 * Minimal typing for the parts of the Kakao Maps SDK this app touches.
 * The SDK ships no types, and pulling a community package in would need
 * approval (§12), so the surface is declared narrowly here.
 */
export type KakaoLatLng = { getLat(): number; getLng(): number }

export type KakaoMaps = {
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  LatLngBounds: new () => { extend(latlng: KakaoLatLng): void }
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => {
    setBounds(bounds: { extend(latlng: KakaoLatLng): void }): void
    setCenter(latlng: KakaoLatLng): void
  }
  CustomOverlay: new (options: {
    position: KakaoLatLng
    content: HTMLElement
    map?: unknown
    yAnchor?: number
    zIndex?: number
    /** Keeps clicks inside the overlay from also reaching the map beneath it. */
    clickable?: boolean
  }) => { setMap(map: unknown): void }
  Polyline: new (options: {
    path: KakaoLatLng[]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeStyle?: string
  }) => { setMap(map: unknown): void }
  event: {
    addListener(target: unknown, type: string, handler: () => void): void
    removeListener(target: unknown, type: string, handler: () => void): void
  }
  load(callback: () => void): void
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps }
  }
}

const SDK_ID = 'kakao-maps-sdk'
let loader: Promise<KakaoMaps> | null = null

export function kakaoKey(): string | undefined {
  const key = import.meta.env.VITE_KAKAO_MAP_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : undefined
}

/** Loads the SDK once and resolves when `kakao.maps` is ready to use. */
export function loadKakaoMaps(): Promise<KakaoMaps> {
  const key = kakaoKey()
  if (!key) return Promise.reject(new Error('VITE_KAKAO_MAP_KEY is not set'))

  loader ??= new Promise<KakaoMaps>((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao!.maps))
      return
    }

    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null
    const script = existing ?? document.createElement('script')

    script.addEventListener('load', () => {
      if (!window.kakao?.maps) {
        reject(new Error('Kakao SDK loaded but window.kakao.maps is missing'))
        return
      }
      // autoload=false means the namespace is only usable inside load().
      window.kakao.maps.load(() => resolve(window.kakao!.maps))
    })
    script.addEventListener('error', () => {
      // A silent fallback hides the cause, and every cause here is fixable in
      // the Kakao console — so say what to check.
      const reason = [
        'Kakao Maps SDK did not load. The three things that cause this:',
        '  1. 카카오맵 product is disabled for the app  (Kakao Developers > 내 애플리케이션 > 제품 설정 > 카카오맵 > 활성화 ON)',
        `  2. this origin is not a registered 사이트 도메인  (${window.location.origin})`,
        '  3. the key is a REST API key rather than a JavaScript key',
        `Request: https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key.slice(0, 6)}…`,
      ].join('\n')
      console.error(`[idolog] ${reason}`)
      reject(new Error(reason))
    })

    if (!existing) {
      script.id = SDK_ID
      script.async = true
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`
      document.head.appendChild(script)
    }
  }).catch((error) => {
    // Let a later mount retry rather than caching the failure forever.
    loader = null
    throw error
  })

  return loader
}
