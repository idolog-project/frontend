import type {
  Course,
  CoursePlace,
  FilmingLocation,
  Idol,
  LocationCategory,
  MusicVideo,
  User,
} from '@/api/schemas'
import { SCENE } from './images'

/** Seed content for development. Real places, plausible copy — no lorem (§8.2). */

/** The account the mock Google sign-in returns. */
export const users: Array<User & { password: string }> = [
  { id: 1, email: 'fan@idolog.kr', password: 'idolog1234', nickname: '봄날의팬' },
]

export const idols: Idol[] = [
  {
    id: 1,
    name: 'BTS',
    agency: '빅히트 뮤직',
    imageUrl: SCENE.bts,
    locationCount: 10,
  },
  {
    id: 2,
    name: 'NewJeans',
    agency: '어도어',
    imageUrl: SCENE.newjeans,
    locationCount: 11,
  },
  {
    id: 3,
    name: 'SEVENTEEN',
    agency: '플레디스',
    imageUrl: SCENE.seventeen,
    locationCount: 9,
  },
]

const mv = (
  id: number,
  title: string,
  idolId: number,
  releaseDate: string,
): MusicVideo => ({
  id,
  title,
  idolId,
  releaseDate,
  youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
})

const SPRING_DAY = mv(1, 'Spring Day', 1, '2017-02-13')
const BUTTER = mv(2, 'Butter', 1, '2021-05-21')
const DYNAMITE = mv(3, 'Dynamite', 1, '2020-08-21')
const DITTO = mv(4, 'Ditto', 2, '2022-12-19')
const HYPE_BOY = mv(5, 'Hype Boy', 2, '2022-08-01')
const AKKINDA = mv(6, '아낀다', 3, '2016-05-25')
const HOT = mv(7, 'HOT', 3, '2022-05-27')

/** Named where the photo genuinely matches; everything else rotates the pool. */
const LOCATION_IMAGE: Record<number, string> = {
  1: SCENE.jumunjinBusStop,
  2: SCENE.anmokCoffeeStreet,
  3: SCENE.jeongdongjin,
  4: SCENE.banpoHanRiver,
  5: SCENE.gamcheonVillage,
  6: SCENE.huinnyeoulVillage,
  7: SCENE.eurwangriBeach,
  8: SCENE.seoulForest,
  9: SCENE.samcheongdong,
  10: SCENE.seongsanIlchulbong,
}

const SCENE_POOL = [
  SCENE.jumunjinWide,
  SCENE.cafeTable,
  SCENE.gangneungMarket,
  SCENE.jumunjinLighthouse,
  SCENE.gyeongpoLake,
  SCENE.sunpoWetland,
  SCENE.signupBackdrop,
  SCENE.waitingBackdrop,
  SCENE.onboarding,
  SCENE.loginBackdrop,
]

/** Most seed places are the filming location itself; the cafes and viewpoints
 *  around them are what the map's other two filter chips switch on. */
const loc = (
  id: number,
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  description: string,
  musicVideos: MusicVideo[],
  category: LocationCategory = 'MV_SPOT',
): FilmingLocation => ({
  id,
  name,
  category,
  address,
  latitude,
  longitude,
  imageUrl: LOCATION_IMAGE[id] ?? SCENE_POOL[id % SCENE_POOL.length],
  description,
  musicVideos,
})

export const locations: FilmingLocation[] = [
  loc(
    1,
    '주문진 방파제 버스정류장',
    '강원 강릉시 주문진읍 향호리 8-8',
    37.8983,
    128.8322,
    "동해를 마주 보는 이 정류장은 'You Never Walk Alone' 재킷 촬영을 위해 세워졌습니다. 촬영 후 철거됐지만 팬들의 요청으로 강릉시가 다시 만들어 지금은 상시 개방됩니다.",
    [SPRING_DAY],
  ),
  loc(
    2,
    '안목해변 커피거리',
    '강원 강릉시 창해로14번길 20',
    37.7733,
    128.9476,
    '바다를 마주한 카페가 줄지어 선 거리. 흐린 날 촬영본 특유의 잿빛 톤이 잘 나오는 구간입니다.',
    [SPRING_DAY],
    'CAFE',
  ),
  loc(
    3,
    '정동진 해변',
    '강원 강릉시 강동면 정동진리',
    37.6906,
    129.0334,
    '기차역이 바다에 가장 가까운 곳. 새벽 첫차 시간대에 사람이 가장 적습니다.',
    [SPRING_DAY, DYNAMITE],
  ),
  loc(
    4,
    '반포한강공원 잠수교',
    '서울 서초구 신반포로11길 40',
    37.5133,
    126.9954,
    '야간 조명이 켜지면 다리 아래 구조물이 그대로 프레임이 됩니다.',
    [DYNAMITE],
  ),
  loc(
    5,
    '감천문화마을',
    '부산 사하구 감내2로 203',
    35.0975,
    129.0107,
    '계단식으로 쌓인 색색의 집들. 오후 늦게 빛이 골목 안쪽까지 들어옵니다.',
    [AKKINDA],
  ),
  loc(
    6,
    '흰여울문화마을',
    '부산 영도구 영선동4가 1044-6',
    35.0779,
    129.0454,
    '절벽 위 좁은 길에서 바다가 바로 내려다보입니다. 길이 좁아 삼각대는 어렵습니다.',
    [AKKINDA, HOT],
  ),
  loc(
    7,
    '을왕리해수욕장',
    '인천 중구 을왕동 산 129-2',
    37.4467,
    126.3733,
    '서해라 일몰이 정면으로 떨어집니다. 공항에서 가까워 환승 시간에도 다녀올 수 있습니다.',
    [HYPE_BOY],
  ),
  loc(
    8,
    '서울숲 은행나무길',
    '서울 성동구 뚝섬로 273',
    37.5444,
    127.0374,
    '가을에 노랗게 물드는 직선 구간. 평일 오전이 가장 한산합니다.',
    [DITTO],
  ),
  loc(
    9,
    '삼청동 돌담길',
    '서울 종로구 삼청로 100',
    37.5838,
    126.9816,
    '돌담과 한옥 지붕선이 겹치는 구간. 좁은 인도라 통행에 주의가 필요합니다.',
    [DITTO, BUTTER],
  ),
  loc(
    10,
    '성산일출봉 입구',
    '제주 서귀포시 성산읍 일출로 284-12',
    33.4581,
    126.9425,
    '분화구 능선이 배경으로 들어오는 지점. 입장 전 광장에서도 같은 각이 나옵니다.',
    [HOT],
  ),
  loc(11, '속초 아바이마을', '강원 속초시 청호로 122', 38.1962, 128.5946, '갯배가 오가는 좁은 수로. 배가 건너올 때 프레임이 완성됩니다.', [SPRING_DAY]),
  loc(12, '삼척 장호항', '강원 삼척시 근덕면 장호리', 37.3216, 129.2708, '물빛이 유난히 맑아 한국의 나폴리로 불리는 항구입니다.', [DYNAMITE]),
  loc(13, '해운대 청사포 다릿돌전망대', '부산 해운대구 중동 산3-9', 35.1573, 129.1955, '바다 위로 뻗은 유리 전망대. 일출 시간대가 가장 붐빕니다.', [HOT], 'PHOTO_SPOT'),
  loc(14, '광안리해수욕장', '부산 수영구 광안해변로 219', 35.1532, 129.1187, '광안대교 야경이 정면으로 들어오는 백사장입니다.', [AKKINDA, HOT]),
  loc(15, '부산 초량 이바구길', '부산 동구 초량상로 1', 35.1152, 129.0371, '가파른 계단 골목과 항구가 한 장에 잡힙니다.', [AKKINDA]),
  loc(16, '협재해수욕장', '제주 제주시 한림읍 협재리', 33.3941, 126.2396, '비양도가 정면에 뜨는 에메랄드빛 해변입니다.', [HYPE_BOY]),
  loc(17, '사려니숲길', '제주 제주시 조천읍 교래리', 33.4194, 126.6478, '삼나무가 곧게 뻗은 직선 산책로. 안개 낀 이른 아침이 좋습니다.', [DITTO]),
  loc(18, '우도 하고수동해변', '제주 제주시 우도면 연평리', 33.5127, 126.9713, '흰 모래와 옥빛 물이 대비되는 작은 해변입니다.', [HYPE_BOY]),
  loc(19, '낙산공원 성곽길', '서울 종로구 낙산길 41', 37.5808, 127.0074, '성곽을 따라 서울 야경이 발밑으로 펼쳐집니다.', [BUTTER], 'PHOTO_SPOT'),
  loc(20, '여의도 한강공원 물빛무대', '서울 영등포구 여의동로 330', 37.5285, 126.9327, '해질녘 역광에 실루엣이 잘 나오는 계단식 무대입니다.', [DYNAMITE, BUTTER]),
  loc(21, '성수동 연무장길', '서울 성동구 연무장길 45', 37.5445, 127.0557, '붉은 벽돌 공장과 카페가 섞인 거리입니다.', [DITTO], 'CAFE'),
  loc(22, '청계천 광통교', '서울 종로구 관철동', 37.5690, 126.9847, '물길 아래로 내려가면 도심 소음이 갑자기 멀어집니다.', [BUTTER]),
  loc(23, '북촌 한옥마을 8경', '서울 종로구 북촌로11길', 37.5826, 126.9836, '기와지붕 너머로 남산타워가 겹치는 지점입니다.', [DITTO, BUTTER], 'PHOTO_SPOT'),
  loc(24, '파주 헤이리 예술마을', '경기 파주시 탄현면 헤이리마을길', 37.7963, 126.6963, '건물마다 형태가 달라 배경 고르는 재미가 있습니다.', [HYPE_BOY]),
  loc(25, '양평 두물머리', '경기 양평군 양서면 두물머리길 125', 37.5375, 127.3247, '느티나무와 물안개가 겹치는 새벽이 이 장소의 전부입니다.', [SPRING_DAY]),
  loc(26, '인천 송도 센트럴파크', '인천 연수구 컨벤시아대로 160', 37.3925, 126.6394, '수로와 고층 빌딩이 만드는 인공적인 스카이라인입니다.', [HYPE_BOY]),
  loc(27, '경주 첨성대 일원', '경북 경주시 인왕동 839-1', 35.8348, 129.2190, '밤에 조명이 들어오면 주변이 비어 있어 피사체가 또렷합니다.', [AKKINDA]),
  loc(28, '안동 하회마을', '경북 안동시 풍천면 종가길 40', 36.5390, 128.5175, '흙담과 초가지붕이 이어지는 길이 계속 나옵니다.', [AKKINDA]),
  loc(29, '순천만 갈대밭', '전남 순천시 순천만길 513', 34.8853, 127.5093, '해질 무렵 갈대가 금색으로 물듭니다. 나무데크가 끝까지 이어집니다.', [DITTO]),
  loc(30, '여수 돌산공원 전망대', '전남 여수시 돌산읍 돌산로 3600-1', 34.7361, 127.7466, '여수 밤바다와 케이블카가 한 화면에 들어옵니다.', [HOT, DYNAMITE], 'PHOTO_SPOT'),
]

/**
 * Which locations belong to which idol. A location can appear under more than
 * one idol when several music videos used it.
 */
export const locationsByIdol: Record<number, number[]> = {
  1: [1, 2, 3, 4, 11, 12, 20, 22, 25, 30],
  2: [7, 8, 9, 16, 17, 18, 21, 23, 24, 26, 29],
  3: [5, 6, 10, 13, 14, 15, 19, 27, 28],
}

/**
 * Photos come straight from TourAPI's public CDN, the same source the real
 * backend will use, so the itinerary looks like the finished product rather
 * than a grid of placeholders.
 */
const tour = (id: string) => `https://tong.visitkorea.or.kr/cms/resource/${id}`

type PlaceSeed = {
  order: number
  name: string
  address: string
  latitude: number
  longitude: number
  overview: string
  arrivalTime: string
  category: string
  imageUrl: string | null
  distanceFromPrevMeters: number | null
  durationFromPrevSeconds: number | null
}

const place = (seed: PlaceSeed): CoursePlace => ({
  ...seed,
  homepageUrl: null,
})

const ORIGIN = {
  order: 1,
  name: '주문진읍 BTS 앨범사진 촬영지',
  address: '강릉시 주문진읍 향호리',
  latitude: 37.9125457281,
  longitude: 128.8170522589,
  arrivalTime: '08:00',
  category: '촬영지',
  imageUrl: tour('95/3383895_image2_1.JPG'),
  distanceFromPrevMeters: null,
  durationFromPrevSeconds: null,
}

/**
 * Three courses out of the same filming location, deliberately different in
 * character so the compare UI has something real to compare: north along the
 * coast, south through coffee and lakes, or inland into the valleys.
 */
export const courses: Course[] = [
  {
    id: 'course-north-coast',
    title: '파도만 따라가는 길',
    summary:
      '주문진 향호리에서 양양 하조대까지, 해안도로만 타고 북상합니다. 되돌아오는 구간이 없어 운전이 가장 편합니다.',
    reason:
      '사진과 자연을 고르셔서 해안선을 따라 한 방향으로만 올라가는 구성으로 짰습니다. 오전에는 사람이 적은 작은 해변, 오후에는 빛이 부드러워지는 하조대 쪽으로 배치했어요.',
    startTime: '08:00',
    endTime: '18:30',
    totalDistanceMeters: 23000,
    totalDurationSeconds: 37800,
    travelDurationSeconds: 2400,
    places: [
      place({
        ...ORIGIN,
        overview:
          '향호 바다를 등지고 선 그 버스정류장입니다. 아침 8시 전후가 사람이 가장 적고, 해가 옆에서 들어와 사진이 잘 나옵니다.',
      }),
      place({
        order: 2,
        name: '지경리해변',
        address: '양양군 현남면 동해대로 62',
        latitude: 37.9204639845,
        longitude: 128.8032171516,
        arrivalTime: '08:30',
        category: '해변',
        imageUrl: tour('11/2922111_image2_1.jpg'),
        overview:
          '강릉과 양양이 갈라지는 자리의 작은 해변입니다. 편의시설이 거의 없어 그만큼 조용합니다.',
        distanceFromPrevMeters: 2000,
        durationFromPrevSeconds: 300,
      }),
      place({
        order: 3,
        name: '남애항 · 남애1리해수욕장',
        address: '양양군 현남면 매바위길 138',
        latitude: 37.9449469437,
        longitude: 128.7871622863,
        arrivalTime: '09:10',
        category: '항구',
        imageUrl: tour('15/2746915_image2_1.jpg'),
        overview:
          '방파제와 매바위, 등대가 한 화면에 들어옵니다. 빨간 등대까지 왕복 20분 정도입니다.',
        distanceFromPrevMeters: 4000,
        durationFromPrevSeconds: 600,
      }),
      place({
        order: 4,
        name: '휴휴암',
        address: '양양군 현남면 광진2길 3-16',
        latitude: 37.961269667,
        longitude: 128.7674802246,
        arrivalTime: '10:20',
        category: '사찰',
        imageUrl: tour('38/3490638_image2_1.jpg'),
        overview:
          '절 마당이 곧 바위 해안이라 파도 소리를 들으며 앉아 있을 수 있습니다. 시간을 넉넉히 잡으세요.',
        distanceFromPrevMeters: 3000,
        durationFromPrevSeconds: 480,
      }),
      place({
        order: 5,
        name: '죽도해수욕장 · 죽도정 전망대',
        address: '양양군 현남면 인구리',
        latitude: 37.9716711612,
        longitude: 128.7635358133,
        arrivalTime: '11:30',
        category: '해변·전망',
        imageUrl: tour('12/2746912_image2_1.jpg'),
        overview:
          '솔숲 계단을 5분쯤 오르면 전망대입니다. 해변과 서핑하는 사람들이 한눈에 내려다보입니다.',
        distanceFromPrevMeters: 2000,
        durationFromPrevSeconds: 300,
      }),
      place({
        order: 6,
        name: '웨이브웍스',
        address: '양양군 현남면 인구중앙길 110',
        latitude: 37.9746290716,
        longitude: 128.7594333144,
        arrivalTime: '12:40',
        category: '점심·카페',
        imageUrl: tour('54/3428154_image2_1.jpg'),
        overview: '죽도 뒤 인구리 골목의 카페입니다. 서핑 동네라 분위기가 느슨합니다.',
        distanceFromPrevMeters: 500,
        durationFromPrevSeconds: 300,
      }),
      place({
        order: 7,
        name: '하조대해수욕장 · 하조대 무인등대',
        address: '양양군 현북면 하조대해안길 35',
        latitude: 38.0229894402,
        longitude: 128.7242655472,
        arrivalTime: '14:00',
        category: '해변·등대',
        imageUrl: tour('73/2745273_image2_1.jpg'),
        overview:
          '절벽 위 무인등대에서 보는 바위섬과 소나무가 이 일대에서 가장 인상적입니다.',
        distanceFromPrevMeters: 8000,
        durationFromPrevSeconds: 900,
      }),
      place({
        order: 8,
        name: '서피비치',
        address: '양양군 현북면 하조대해안길 119',
        latitude: 38.0280442733,
        longitude: 128.7173076869,
        arrivalTime: '15:30',
        category: '해변',
        imageUrl: tour('90/2745190_image2_1.jpg'),
        overview:
          '파라솔과 빈백이 깔린 넓은 백사장입니다. 오후 늦게 갈수록 사람이 빠지고 빛이 부드러워집니다.',
        distanceFromPrevMeters: 1000,
        durationFromPrevSeconds: 180,
      }),
      place({
        order: 9,
        name: '하조맛식당',
        address: '양양군 하륜길 8',
        latitude: 38.0200203383,
        longitude: 128.7241545392,
        arrivalTime: '17:00',
        category: '저녁',
        imageUrl: tour('89/2892489_image2_1.jpg'),
        overview:
          '하조대 초입의 동네 밥집입니다. 여기서 주문진까지는 25분이면 돌아옵니다.',
        distanceFromPrevMeters: 2000,
        durationFromPrevSeconds: 300,
      }),
    ],
  },
  {
    id: 'course-coffee-lake',
    title: '커피와 호수 사이',
    summary:
      '주문진에서 강릉 시내로 내려오며 바다·커피·호수를 차례로 지납니다. 걷는 양이 가장 적어 체력 부담이 없습니다.',
    reason:
      '맛집과 문화를 고르셨고 여행 시간도 넉넉해서, 이동보다 앉아 있는 시간이 긴 구성으로 짰습니다. 오후에 비가 와도 실내로 대체할 수 있게 아르떼뮤지엄을 넣었어요.',
    startTime: '08:00',
    endTime: '19:00',
    totalDistanceMeters: 25000,
    totalDurationSeconds: 39600,
    travelDurationSeconds: 2700,
    places: [
      place({
        ...ORIGIN,
        overview: '세 코스 모두 여기서 시작합니다. 이 코스는 정류장을 등지고 남쪽입니다.',
      }),
      place({
        order: 2,
        name: '소돌해수욕장',
        address: '강릉시 주문진읍 해안로 1993',
        latitude: 37.9062383246,
        longitude: 128.8272654209,
        arrivalTime: '08:20',
        category: '해변',
        imageUrl: tour('23/2921823_image2_1.jpg'),
        overview:
          '기암괴석이 흩어진 짧은 해변입니다. 옆 아들바위공원까지 한 바퀴가 20분입니다.',
        distanceFromPrevMeters: 2000,
        durationFromPrevSeconds: 300,
      }),
      place({
        order: 3,
        name: '주문진 방파제',
        address: '강릉시 주문진읍 해안로 1609',
        latitude: 37.8796220881,
        longitude: 128.8335906768,
        arrivalTime: '09:10',
        category: '방파제',
        imageUrl: tour('81/2656581_image2_1.jpg'),
        overview:
          '드라마 촬영으로 알려진 방파제입니다. 아침에 조용하고 옆 젤라또 가게에서 커피 들고 걷기 좋습니다.',
        distanceFromPrevMeters: 4000,
        durationFromPrevSeconds: 600,
      }),
      place({
        order: 4,
        name: '에세이',
        address: '강릉시 연곡면 영진길 33',
        latitude: 37.8713120639,
        longitude: 128.8399653593,
        arrivalTime: '10:10',
        category: '카페',
        imageUrl: tour('99/2776899_image2_1.jpeg'),
        overview: '영진해변 바로 앞 카페입니다. 창가에 앉으면 시야가 전부 바다입니다.',
        distanceFromPrevMeters: 2000,
        durationFromPrevSeconds: 300,
      }),
      place({
        order: 5,
        name: '보헤미안 박이추커피',
        address: '강릉시 사천면 해안로 1107',
        latitude: 37.846918193,
        longitude: 128.8669136848,
        arrivalTime: '11:10',
        category: '카페',
        imageUrl: tour('38/3560938_image2_1.jpg'),
        overview:
          '강릉 커피의 출발점으로 꼽히는 곳입니다. 핸드드립 한 잔을 오래 마셔도 어색하지 않습니다.',
        distanceFromPrevMeters: 5000,
        durationFromPrevSeconds: 600,
      }),
      place({
        order: 6,
        name: '강릉짬뽕순두부 동화가든 본점',
        address: '강릉시 초당순두부길77번길 15',
        latitude: 37.7912255723,
        longitude: 128.9146972153,
        arrivalTime: '12:40',
        category: '점심',
        imageUrl: tour('20/3029720_image2_1.jpg'),
        overview:
          '초당 순두부 골목의 대표 식당입니다. 대기가 기니 12시 반 전에 도착하는 편이 낫습니다.',
        distanceFromPrevMeters: 10000,
        durationFromPrevSeconds: 1080,
      }),
      place({
        order: 7,
        name: '경포호수광장',
        address: '강릉시 해안로 415',
        latitude: 37.7977913781,
        longitude: 128.9095224784,
        arrivalTime: '14:00',
        category: '호수',
        imageUrl: tour('60/3460260_image2_1.jpg'),
        overview:
          '호수 한 바퀴가 4km 남짓입니다. 광장 쪽 절반만 돌아도 충분합니다.',
        distanceFromPrevMeters: 1000,
        durationFromPrevSeconds: 300,
      }),
      place({
        order: 8,
        name: '아르떼뮤지엄 강릉',
        address: '강릉시 난설헌로 131',
        latitude: 37.79008946,
        longitude: 128.9079034181,
        arrivalTime: '15:30',
        category: '실내',
        imageUrl: tour('34/3085834_image2_1.jpg'),
        overview:
          '미디어아트 전시관입니다. 오후에 지치거나 비가 올 때를 위한 실내 자리로 넣었습니다.',
        distanceFromPrevMeters: 1000,
        durationFromPrevSeconds: 300,
      }),
      place({
        order: 9,
        name: '툇마루',
        address: '강릉시 난설헌로 232',
        latitude: 37.7929448142,
        longitude: 128.9145027351,
        arrivalTime: '17:30',
        category: '저녁·카페',
        imageUrl: tour('03/2844103_image2_1.jpeg'),
        overview:
          '해가 넘어가는 시간에 맞춘 마지막 자리입니다. 주문진까지는 30분입니다.',
        distanceFromPrevMeters: 1000,
        durationFromPrevSeconds: 300,
      }),
    ],
  },
  {
    id: 'course-inland',
    title: '바다를 등지고 산으로',
    summary:
      '해안을 벗어나 오대산 소금강 계곡으로 들어갔다가, 산사와 향교를 거쳐 강릉 구도심에서 마칩니다. 걷는 시간이 가장 깁니다.',
    reason:
      '자연과 액티비티를 고르셔서 계곡 트레킹을 중심에 두었습니다. 오전에 가장 많이 걷고, 오후로 갈수록 앉는 시간이 늘어나게 배치했어요.',
    startTime: '08:00',
    endTime: '19:00',
    totalDistanceMeters: 60000,
    totalDurationSeconds: 39600,
    travelDurationSeconds: 5700,
    places: [
      place({
        ...ORIGIN,
        overview: '바다 사진을 먼저 남겨 두고 출발합니다. 이후로는 하루 종일 산과 계곡입니다.',
      }),
      place({
        order: 2,
        name: '오대산 소금강계곡',
        address: '강릉시 연곡면 삼산리',
        latitude: 37.8306548995,
        longitude: 128.6576247467,
        arrivalTime: '08:45',
        category: '계곡',
        imageUrl: tour('13/3577813_image2_1.jpg'),
        overview:
          '주차장에 세우고 걸어 들어갑니다. 무릉계·식당암까지는 길이 평탄해 부담이 없습니다.',
        distanceFromPrevMeters: 23000,
        durationFromPrevSeconds: 2100,
      }),
      place({
        order: 3,
        name: '구룡폭포',
        address: '강릉시 연곡면 소금강길 500',
        latitude: 37.802691973,
        longitude: 128.6835093795,
        arrivalTime: '09:30',
        category: '폭포',
        imageUrl: tour('42/3029842_image2_1.jpg'),
        overview:
          '소금강 안쪽의 아홉 단 폭포입니다. 왕복 3시간이라 무리면 식당암까지만 다녀와도 됩니다.',
        distanceFromPrevMeters: 3000,
        durationFromPrevSeconds: 3600,
      }),
      place({
        order: 4,
        name: '보현사',
        address: '강릉시 성산면 보현길 396',
        latitude: 37.736626283,
        longitude: 128.7693064482,
        arrivalTime: '12:30',
        category: '사찰',
        imageUrl: tour('87/3378387_image2_1.JPG'),
        overview:
          '관광객이 거의 없는 산사입니다. 낭원대사탑비가 있는 마당이 특히 조용합니다.',
        distanceFromPrevMeters: 14000,
        durationFromPrevSeconds: 1500,
      }),
      place({
        order: 5,
        name: '라몬타냐',
        address: '강릉시 관솔길 22-10',
        latitude: 37.7387418481,
        longitude: 128.8681808072,
        arrivalTime: '13:30',
        category: '점심',
        imageUrl: tour('14/2869014_image2_1.jpg'),
        overview:
          '산에서 내려오는 길목의 식당입니다. 오전 내내 걸었을 테니 늦더라도 제대로 먹는 자리입니다.',
        distanceFromPrevMeters: 12000,
        durationFromPrevSeconds: 1200,
      }),
      place({
        order: 6,
        name: '강릉향교',
        address: '강릉시 명륜로 29',
        latitude: 37.7635561721,
        longitude: 128.8952470467,
        arrivalTime: '15:00',
        category: '고건축',
        imageUrl: tour('99/3374199_image2_1.JPG'),
        overview:
          '대성전과 명륜당이 조선 초 모습으로 남아 있습니다. 마당 노거수 그늘이 좋고 관람료가 없습니다.',
        distanceFromPrevMeters: 5000,
        durationFromPrevSeconds: 600,
      }),
      place({
        order: 7,
        name: '고래책방',
        address: '강릉시 율곡로 2848',
        latitude: 37.7582957085,
        longitude: 128.8972525847,
        arrivalTime: '16:00',
        category: '서점',
        imageUrl: tour('46/2793046_image2_1.jpg'),
        overview:
          '구도심의 독립서점입니다. 층마다 앉을 자리가 있어 걷느라 지친 다리를 쉬게 하는 구간입니다.',
        distanceFromPrevMeters: 800,
        durationFromPrevSeconds: 600,
      }),
      place({
        order: 8,
        name: '강릉 동부시장',
        address: '강릉시 옥천로 48',
        latitude: 37.7601039005,
        longitude: 128.9007299929,
        arrivalTime: '17:00',
        category: '저녁',
        imageUrl: tour('12/3029812_image2_1.jpg'),
        overview:
          '저녁은 시장에서 해결합니다. 2층에 다른 공간도 있어 구경이 지루하지 않습니다.',
        distanceFromPrevMeters: 500,
        durationFromPrevSeconds: 300,
      }),
    ],
  },
]
