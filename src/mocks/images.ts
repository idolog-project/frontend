/**
 * Imagery lifted from the Stitch drafts and committed under `public/seed/`, so
 * development looks like the design instead of a wall of grey boxes.
 *
 * These are AI-generated images from the design tool, not licensed photography.
 * They are development seed content only — every one of them goes away once the
 * backend serves real `imageUrl` values.
 */
const seed = (n: number) => `/seed/scene-${String(n).padStart(2, '0')}.jpg`

export const SCENE = {
  // Filming locations
  jumunjinBusStop: seed(48),
  anmokCoffeeStreet: seed(2),
  jeongdongjin: seed(4),
  banpoHanRiver: seed(41),
  gamcheonVillage: seed(13),
  huinnyeoulVillage: seed(19),
  eurwangriBeach: seed(17),
  seoulForest: seed(28),
  samcheongdong: seed(26),
  seongsanIlchulbong: seed(21),

  // Course stops
  gangneungMarket: seed(3),
  cafeTable: seed(46),
  jumunjinLighthouse: seed(39),
  gyeongpoLake: seed(29),
  sunpoWetland: seed(22),
  jumunjinWide: seed(40),

  // Idol portraits
  bts: seed(35),
  newjeans: seed(8),
  seventeen: seed(44),

  // Full-bleed backdrops
  onboarding: seed(47),
  loginBackdrop: seed(45),
  signupBackdrop: seed(23),
  waitingBackdrop: seed(18),

  // Spot detail gallery
  gallery: [seed(50), seed(51), seed(52)],
} as const

/**
 * The frames the full-bleed screens — the language pick and sign-in — draw from.
 *
 * Hand-picked rather than "every file in the folder". The seed set also holds
 * UI mock-ups lifted from the design tool — screenshots with panels and labels
 * baked in, one of them a mock of this very language screen — and close-up
 * portraits. Neither can sit behind a headline: one shows a second interface
 * inside the app, the other puts a stranger's face on the first screen anyone
 * sees. `SCENE.loginBackdrop` was one of the mock-ups.
 *
 * What is left is wide, dark and quiet, which is what the gradients over these
 * screens expect. A brighter frame leaves the white headline fighting the photo.
 */
export const BACKDROP_SCENES = [2, 4, 13, 18, 19, 21, 40, 41, 47, 51].map(seed)

/**
 * One of them, at random.
 *
 * Call it as a `useState` initialiser, never while rendering: picking inline
 * deals a new photo on every re-render, and the background flickers as the rest
 * of the screen settles.
 */
export function randomBackdrop(): string {
  return BACKDROP_SCENES[Math.floor(Math.random() * BACKDROP_SCENES.length)]
}
