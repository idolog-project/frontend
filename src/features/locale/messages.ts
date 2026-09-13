/**
 * Every user-facing string in the app, in all three shipping languages.
 *
 * Hand-rolled rather than pulled from a translation library: the brief requires
 * asking before adding a dependency (§12), and at this size a typed record does
 * the job without shipping a runtime.
 *
 * `{name}` style placeholders are substituted by `t()`. There is no plural
 * machinery, so English strings are written to read correctly at any count
 * ("Spots · 1" rather than "1 spots").
 *
 * Language picker labels are NOT here — they live in `store.ts` as
 * `LOCALE_LABEL`, since each must render in its own script regardless of the
 * active locale.
 *
 * NOT covered here: place names, descriptions and course copy. Those are
 * content, not chrome — the API serves them, and the mock handlers pick a
 * language from the Accept-Language header the same way the real one should.
 */
export const ko = {
  'nav.aria': '주요 메뉴',
  'nav.home': '홈',
  'nav.saved': '저장한 코스',
  'nav.my': '마이페이지',

  'onboarding.headline': '최애의 뮤직비디오 속으로 걸어 들어가세요.',

  'login.eyebrow': '로그인',
  'login.headline': '다시 오셨네요',
  'login.lede':
    '구글 계정으로 시작하면 촬영지 지도와 저장한 코스가 기기 사이에서 이어집니다.',
  'login.google': 'Google로 계속하기',
  'login.pending': '들어가는 중',
  'login.failed': '로그인하지 못했습니다. 다시 시도해 주세요.',
  'login.devNotice': '지금은 계정 없이 버튼만 누르면 바로 들어갑니다.',

  'home.filterAll': '전체',
  'home.spotCount': '{count}곳',
  'home.loadFailed': '촬영지를 불러오지 못했습니다. 다시 시도해 주세요.',
  'home.empty': '등록된 촬영지가 없어요',
  'home.emptyBody': '다른 아이돌을 골라보세요.',
  'home.popularIdols': '인기 아이돌',
  'home.otherIdols': '그 외',
  'home.searchIdol': '가수 검색',
  'home.searchSuggestions': '추천 검색어',
  'home.searchNoMatch': '일치하는 가수가 없어요',
  'home.clearFilter': '필터 해제',
  'home.spotList': '촬영지 목록',

  // The colon rides in the value: Chinese wants its own full-width one.
  'card.place': '장소:',
  'card.artist': '가수:',

  'map.detail': '자세히 보기',
  'map.close': '닫기',
  'map.myLocation': '내 위치',

  'locations.eyebrow': '촬영지',
  'locations.title': '{name} 촬영지',
  'locations.titleFallback': '촬영지',
  'locations.empty': '아직 등록된 촬영지가 없어요',
  'locations.emptyBody': '지도에서 다른 아이돌의 촬영지를 둘러보세요.',
  'locations.toMap': '지도 열기',

  'detail.eyebrow': '뮤비 촬영지',
  'detail.back': '뒤로 가기',
  'detail.recreateBadge': '이 장면 재현하기',
  'detail.scene': '이 장면은',
  'detail.guide': '재현 가이드',
  'detail.guideBody':
    '원본과 같은 앵글은 피사체에서 15m쯤 물러나 광각(24-35mm)으로 잡을 때 나옵니다. 수평선이 구조물 뒤로 지나가도록 두고, 흐린 날을 고르면 색감까지 가까워집니다.',
  'detail.watchMv': '{title} 뮤직비디오 보기',
  'detail.gallery': '갤러리',
  'detail.gallerySwipe': '옆으로 넘겨보세요',
  'detail.heroAlt': '{name} 전경',
  'detail.cta': '이 장소로 코스 추천받기',
  'detail.transport': '버스 · 택시',
  'detail.bestLight': '새벽 빛 추천',
  'detail.loadFailed': '촬영지를 불러오지 못했습니다. 다시 시도해 주세요.',

  'plan.step': '단계',
  'plan.stepAria': '{total}단계 중 {current}단계',
  'plan.origin': '출발지',
  'plan.originLine': '{name}에서 출발합니다',
  'plan.originFailed': '출발지를 불러오지 못했습니다. 다시 시도해 주세요.',
  'plan.transportTitle': '어떻게 이동하세요?',
  'plan.radius': '반경 {km}km',
  'plan.stylesTitle': '어떤 걸 좋아하세요?',
  'plan.stylesHint': '하나 이상 골라주세요',
  'plan.more': '더 자세히 설정',
  'plan.moreHint': '출발 시간, 여행 시간, 반려동물, 인원',
  'plan.startTime': '출발 시간',
  'plan.hours': '여행 가능 시간 · {hours}시간',
  'plan.partySize': '여행 인원',
  'plan.withPet': '반려동물과 함께 가요',
  'plan.submit': '코스 추천받기',
  'plan.missing': '{fields}을 골라주세요',
  'plan.missingJoin': '과 ',
  'plan.readyHint': '필수 두 가지만 고르면 됩니다',
  'plan.fieldTransport': '이동수단',
  'plan.fieldStyles': '여행 스타일',

  'wait.eyebrow': '코스 추천받는 중',
  'wait.cancel': '조건 바꾸기',
  'wait.step1': '주변 가볼 만한 곳 찾는 중',
  'wait.step1Caption': '반경 안의 장소를 훑고 있어요',
  'wait.step2': '취향에 맞는 곳 고르는 중',
  'wait.step2Caption': '고른 스타일에 맞춰 추리고 있어요',
  'wait.step3': '동선 짜는 중',
  'wait.step3Caption': '가장 덜 걷는 순서를 찾고 있어요',
  'wait.step4': '이동 시간 계산 중',
  'wait.step4Caption': '구간마다 걸리는 시간을 재고 있어요',

  'result.reason': '이 코스를 고른 이유',
  'result.total': '총 {duration} · {distance}',
  'result.homepage': '홈페이지',
  'result.save': '이 코스 저장하기',
  'result.saved': '저장했습니다',
  'result.saving': '저장하는 중',
  'result.saveToast': '코스를 저장했습니다',
  'result.saveFailed': '저장하지 못했습니다. 다시 시도해 주세요.',
  'result.mapAria': '경로 지도 · 장소 {count}곳',
  'result.mapAriaPins': '지도 · 촬영지 {count}곳',
  'result.driving': '운전 {duration}',
  'result.window': '{start}–{end}',
  'result.directions': '길찾기 열기',
  'result.source': '장소 정보 · 사진 출처 — 한국관광공사 TourAPI',

  'courses.failedTitle': '코스를 추천하지 못했습니다',
  'courses.failedBody':
    '코스를 추천하는 중에 문제가 생겼습니다. 조건을 바꾸거나 다시 시도해 주세요.',
  'courses.retrySame': '조건 그대로 다시 시도',
  'courses.noneTitle': '조건에 맞는 코스가 없었습니다',
  'courses.noneWalk':
    '이동수단이 도보라 반경 3km 안에서만 찾았습니다. 택시나 버스로 바꾸면 반경이 30km로 넓어집니다.',
  'courses.noneStyles':
    '여행 스타일이 {styles} 뿐입니다. 하나만 더 고르면 후보가 늘어납니다.',
  'courses.noneHours':
    '여행 시간이 {hours}시간이라 코스를 채우기 빠듯합니다. 한두 시간 늘리거나 택시로 바꿔보세요.',
  'courses.changeConditions': '조건 바꾸기',

  'saved.eyebrow': '저장한 코스',
  'saved.count': '저장한 코스 {count}개',
  'saved.empty': '아직 저장한 코스가 없어요',
  'saved.emptyBody': '촬영지를 고르고 코스를 추천받으면 여기에 모입니다.',
  'saved.browse': '촬영지 둘러보기',
  'saved.delete': '지우기',
  'saved.deleteToast': '코스를 지웠습니다',
  'saved.deleteFailed': '지우지 못했습니다. 다시 시도해 주세요.',
  'saved.loadFailed': '저장한 코스를 불러오지 못했습니다. 다시 시도해 주세요.',
  'saved.firstStopAlt': '첫 장소 {name}',

  'my.eyebrow': '마이페이지',
  'my.fallbackName': '내 계정',
  'my.language': '언어',
  'my.account': '계정',
  'my.logout': '로그아웃',
  'my.loggingOut': '로그아웃하는 중',

  'notFound.title': '없는 페이지입니다',
  'notFound.body': '주소가 바뀌었거나 지워진 화면이에요. 지도에서 다시 골라보세요.',

  'state.errorEyebrow': '문제 발생',
  'state.retry': '다시 시도',
  'state.genericRetry': '잠시 후 다시 시도해 주세요.',
  'state.mapPending': '지도 불러오는 중',
  'state.mapStandIn': '지도는 곧 여기 들어옵니다',
  'state.crashTitle': '화면을 그리다 문제가 생겼습니다',
  'state.crashBody':
    '새로고침하면 대부분 해결됩니다. 반복되면 아래 오류 내용을 알려주세요.',
  'state.reload': '새로고침',

  'error.generic': '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  'error.unauthenticated': '로그인이 필요합니다.',
  'error.schema': '서버 응답 형식이 예상과 다릅니다: {path}',

  'transport.WALK': '도보',
  'transport.TAXI': '택시',
  'transport.BUS': '버스',
  'transport.CAR': '자가용',

  'style.NATURE': '자연',
  'style.CULTURE': '문화',
  'style.ACTIVITY': '액티비티',
  'style.FOOD': '맛집',
  'style.SHOPPING': '쇼핑',
  'style.PHOTO': '사진',

  'unit.hour': '{n}시간',
  'unit.minute': '{n}분',
  'unit.hourMinute': '{h}시간 {m}분',
  'unit.metre': '{n}m',
  'unit.kilometre': '{n}km',
} as const

export type MessageKey = keyof typeof ko

export const en: Record<MessageKey, string> = {
  'nav.aria': 'Main menu',
  'nav.home': 'Home',
  'nav.saved': 'Saved courses',
  'nav.my': 'Profile',

  'onboarding.headline': "Step into your bias's music video.",

  'login.eyebrow': 'Sign in',
  'login.headline': 'Good to see you again',
  'login.lede':
    'Sign in with Google to keep your filming locations and saved courses in sync across every device.',
  'login.google': 'Continue with Google',
  'login.pending': 'Signing you in',
  'login.failed': "Couldn't sign you in. Try again.",
  'login.devNotice': 'No account needed yet — this button takes you straight in.',

  'home.filterAll': 'All',
  'home.spotCount': 'Locations · {count}',
  'home.loadFailed': "Couldn't load filming locations. Try again.",
  'home.empty': 'No filming locations yet',
  'home.emptyBody': 'Try another idol.',
  'home.popularIdols': 'Popular idols',
  'home.otherIdols': 'Others',
  'home.searchIdol': 'Search idols',
  'home.searchSuggestions': 'Suggestions',
  'home.searchNoMatch': 'No matching idol',
  'home.clearFilter': 'Clear filter',
  'home.spotList': 'Filming locations',

  'card.place': 'Place:',
  'card.artist': 'Artist:',

  'map.detail': 'View details',
  'map.close': 'Close',
  'map.myLocation': 'Your location',

  'locations.eyebrow': 'Filming locations',
  'locations.title': '{name} filming locations',
  'locations.titleFallback': 'Filming locations',
  'locations.empty': 'No filming locations yet',
  'locations.emptyBody': "Browse another idol's locations on the map.",
  'locations.toMap': 'Open the map',

  'detail.eyebrow': 'MV location',
  'detail.back': 'Go back',
  'detail.recreateBadge': 'Recreate this shot',
  'detail.scene': 'The scene',
  'detail.guide': 'How to recreate it',
  'detail.guideBody':
    'To match the original angle, stand about 15 metres back from your subject and shoot wide, 24-35mm. Keep the horizon running behind the structure, and pick an overcast day to get close to the original colour.',
  'detail.watchMv': 'Watch the {title} music video',
  'detail.gallery': 'Gallery',
  'detail.gallerySwipe': 'Swipe to view',
  'detail.heroAlt': '{name}, wide view',
  'detail.cta': 'Build a course from here',
  'detail.transport': 'Bus · Taxi',
  'detail.bestLight': 'Best at dawn',
  'detail.loadFailed': "Couldn't load this location. Try again.",

  'plan.step': 'Step',
  'plan.stepAria': 'Step {current} of {total}',
  'plan.origin': 'Starting point',
  'plan.originLine': 'Starting from {name}',
  'plan.originFailed': "Couldn't load the starting point. Try again.",
  'plan.transportTitle': 'How are you getting around?',
  'plan.radius': '{km} km radius',
  'plan.stylesTitle': 'What are you into?',
  'plan.stylesHint': 'Pick at least one',
  'plan.more': 'More options',
  'plan.moreHint': 'Start time, hours available, pets, party size',
  'plan.startTime': 'Start time',
  'plan.hours': 'Hours available · {hours} hr',
  'plan.partySize': 'Party size',
  'plan.withPet': 'Bringing a pet',
  'plan.submit': 'Build my course',
  'plan.missing': 'Choose {fields}',
  'plan.missingJoin': ' and ',
  'plan.readyHint': "Pick those two and you're set",
  'plan.fieldTransport': 'a way to get around',
  'plan.fieldStyles': 'a travel style',

  'wait.eyebrow': 'Building your course',
  'wait.cancel': 'Change my answers',
  'wait.step1': 'Finding places worth a stop',
  'wait.step1Caption': 'Scanning everything inside your radius',
  'wait.step2': 'Picking what suits you',
  'wait.step2Caption': 'Narrowing to the styles you chose',
  'wait.step3': 'Working out the order',
  'wait.step3Caption': 'Finding the order with the least walking',
  'wait.step4': 'Working out travel times',
  'wait.step4Caption': 'Timing each leg between stops',

  'result.reason': 'Why this course',
  'result.total': 'Total {duration} · {distance}',
  'result.homepage': 'Website',
  'result.save': 'Save this course',
  'result.saved': 'Saved',
  'result.saving': 'Saving',
  'result.saveToast': 'Course saved',
  'result.saveFailed': "Couldn't save it. Try again.",
  'result.mapAria': 'Route map · {count} stops',
  'result.mapAriaPins': 'Map · {count} filming locations',
  'result.driving': '{duration} driving',
  'result.window': '{start}–{end}',
  'result.directions': 'Open directions',
  'result.source': 'Place data and photos — Korea Tourism Organization TourAPI',

  'courses.failedTitle': "Couldn't build a course",
  'courses.failedBody':
    'Something went wrong while building your course. Change your answers or try again.',
  'courses.retrySame': 'Retry with the same answers',
  'courses.noneTitle': 'Nothing matched your answers',
  'courses.noneWalk':
    'On foot the search only covers a 3 km radius. Switching to taxi or bus widens it to 30 km.',
  'courses.noneStyles':
    "You only picked {styles}. Add one more and there's more to work with.",
  'courses.noneHours':
    'A {hours}-hour window is tight for a full course. Add an hour or two, or switch to taxi.',
  'courses.changeConditions': 'Change my answers',

  'saved.eyebrow': 'Saved courses',
  'saved.count': 'Saved courses · {count}',
  'saved.empty': 'Nothing saved yet',
  'saved.emptyBody': 'Pick a location, build a course, and it lands here.',
  'saved.browse': 'Browse locations',
  'saved.delete': 'Remove',
  'saved.deleteToast': 'Course removed',
  'saved.deleteFailed': "Couldn't remove it. Try again.",
  'saved.loadFailed': "Couldn't load your saved courses. Try again.",
  'saved.firstStopAlt': 'First stop: {name}',

  'my.eyebrow': 'Profile',
  'my.fallbackName': 'My account',
  'my.language': 'Language',
  'my.account': 'Account',
  'my.logout': 'Sign out',
  'my.loggingOut': 'Signing out',

  'notFound.title': "We can't find that page",
  'notFound.body':
    'The address may have changed, or the page was removed. Head back to the map and pick a location.',

  'state.errorEyebrow': 'Something went wrong',
  'state.retry': 'Try again',
  'state.genericRetry': 'Try again in a moment.',
  'state.mapPending': 'Loading the map',
  'state.mapStandIn': 'The map lands here soon',
  'state.crashTitle': 'This screen hit an error',
  'state.crashBody':
    'Reloading usually clears it. If it keeps happening, send us the error below.',
  'state.reload': 'Reload',

  'error.generic': "Couldn't complete that request. Try again in a moment.",
  'error.unauthenticated': 'You need to sign in first.',
  'error.schema': "The server's response was not the shape we expected: {path}",

  'transport.WALK': 'Walk',
  'transport.TAXI': 'Taxi',
  'transport.BUS': 'Bus',
  'transport.CAR': 'Car',

  'style.NATURE': 'Nature',
  'style.CULTURE': 'Culture',
  'style.ACTIVITY': 'Activity',
  'style.FOOD': 'Food',
  'style.SHOPPING': 'Shopping',
  'style.PHOTO': 'Photo',

  'unit.hour': '{n} hr',
  'unit.minute': '{n} min',
  'unit.hourMinute': '{h} hr {m} min',
  'unit.metre': '{n} m',
  'unit.kilometre': '{n} km',
}

/** Simplified Chinese — the variant most K-pop fan services ship first. */
export const zh: Record<MessageKey, string> = {
  'nav.aria': '主菜单',
  'nav.home': '首页',
  'nav.saved': '已保存路线',
  'nav.my': '我的',

  'onboarding.headline': '走进你本命的 MV 里。',

  'login.eyebrow': '登录',
  'login.headline': '又见面了',
  'login.lede':
    '用 Google 账号登录，地图上的拍摄地和已保存的路线会在各设备间同步。',
  'login.google': '通过 Google 账号继续',
  'login.pending': '正在登录',
  'login.failed': '登录失败，请重试。',
  'login.devNotice': '现在不需要账号，点一下就直接进入。',

  'home.filterAll': '全部',
  'home.spotCount': '{count}处',
  'home.loadFailed': '拍摄地加载失败，请重试。',
  'home.empty': '还没有收录的拍摄地',
  'home.emptyBody': '换一位偶像看看。',
  'home.popularIdols': '热门偶像',
  'home.otherIdols': '其他',
  'home.searchIdol': '搜索歌手',
  'home.searchSuggestions': '推荐搜索',
  'home.searchNoMatch': '没有匹配的歌手',
  'home.clearFilter': '清除筛选',
  'home.spotList': '拍摄地列表',

  'card.place': '地点：',
  'card.artist': '歌手：',

  'map.detail': '查看详情',
  'map.close': '关闭',
  'map.myLocation': '我的位置',

  'locations.eyebrow': '拍摄地',
  'locations.title': '{name} 的拍摄地',
  'locations.titleFallback': '拍摄地',
  'locations.empty': '还没有收录的拍摄地',
  'locations.emptyBody': '在地图上看看其他偶像的拍摄地。',
  'locations.toMap': '在地图上查看',

  'detail.eyebrow': 'MV 拍摄地',
  'detail.back': '返回',
  'detail.recreateBadge': '复刻这一幕',
  'detail.scene': '这一幕',
  'detail.guide': '复刻指南',
  'detail.guideBody':
    '退到距离主体约 15 米，用 24-35mm 广角拍。让海平线从建筑物后方穿过，选阴天拍，颜色会更接近原片。',
  'detail.watchMv': '观看《{title}》MV',
  'detail.gallery': '图集',
  'detail.gallerySwipe': '左右滑动查看',
  'detail.heroAlt': '{name} 全景',
  'detail.cta': '从这里规划路线',
  'detail.transport': '公交 · 出租车',
  'detail.bestLight': '清晨光线最佳',
  'detail.loadFailed': '拍摄地加载失败，请重试。',

  'plan.step': '步骤',
  'plan.stepAria': '第 {current} 步，共 {total} 步',
  'plan.origin': '出发地',
  'plan.originLine': '从 {name} 出发',
  'plan.originFailed': '出发地加载失败，请重试。',
  'plan.transportTitle': '怎么出行？',
  'plan.radius': '半径{km}公里',
  'plan.stylesTitle': '喜欢玩点什么？',
  'plan.stylesHint': '至少选一项',
  'plan.more': '更多设置',
  'plan.moreHint': '出发时间、可用时长、宠物、人数',
  'plan.startTime': '出发时间',
  'plan.hours': '可用时长 · {hours}小时',
  'plan.partySize': '出行人数',
  'plan.withPet': '带宠物同行',
  'plan.submit': '规划路线',
  'plan.missing': '请选择{fields}',
  'plan.missingJoin': '和',
  'plan.readyHint': '只需选好这两项',
  'plan.fieldTransport': '出行方式',
  'plan.fieldStyles': '旅行风格',

  'wait.eyebrow': '正在规划路线',
  'wait.cancel': '修改条件',
  'wait.step1': '正在找附近值得去的地方',
  'wait.step1Caption': '扫一遍半径内的所有地点',
  'wait.step2': '正在挑你会喜欢的地方',
  'wait.step2Caption': '按你选的风格筛选',
  'wait.step3': '正在安排顺序',
  'wait.step3Caption': '尽量少走回头路',
  'wait.step4': '正在计算路上时间',
  'wait.step4Caption': '逐段测量所需时间',

  'result.reason': '为什么推荐这条路线',
  'result.total': '共 {duration} · {distance}',
  'result.homepage': '官网',
  'result.save': '保存这条路线',
  'result.saved': '已保存',
  'result.saving': '正在保存',
  'result.saveToast': '路线已保存',
  'result.saveFailed': '保存失败，请重试。',
  'result.mapAria': '路线地图 · {count} 个地点',
  'result.mapAriaPins': '地图 · {count} 处拍摄地',
  'result.driving': '驾车{duration}',
  'result.window': '{start}–{end}',
  'result.directions': '打开导航',
  'result.source': '地点信息与照片来源 — 韩国观光公社 TourAPI',

  'courses.failedTitle': '路线规划失败',
  'courses.failedBody': '规划路线时出了问题。修改条件或再试一次。',
  'courses.retrySame': '按原条件重试',
  'courses.noneTitle': '没有符合条件的路线',
  'courses.noneWalk':
    '选了步行，只搜了半径3公里以内。换成出租车或公交，范围会扩到30公里。',
  'courses.noneStyles': '风格只选了{styles}。再多选一项，候选就会变多。',
  'courses.noneHours': '{hours}小时有点紧张。多留一两个小时，或换成出租车。',
  'courses.changeConditions': '修改条件',

  'saved.eyebrow': '已保存路线',
  'saved.count': '已保存 {count} 条路线',
  'saved.empty': '还没有保存的路线',
  'saved.emptyBody': '选个拍摄地规划路线，就会出现在这里。',
  'saved.browse': '浏览拍摄地',
  'saved.delete': '删除',
  'saved.deleteToast': '路线已删除',
  'saved.deleteFailed': '删除失败，请重试。',
  'saved.loadFailed': '已保存的路线加载失败，请重试。',
  'saved.firstStopAlt': '第一站 {name}',

  'my.eyebrow': '我的',
  'my.fallbackName': '我的账号',
  'my.language': '语言',
  'my.account': '账号',
  'my.logout': '退出登录',
  'my.loggingOut': '正在退出',

  'notFound.title': '页面不存在',
  'notFound.body': '地址可能变了，或者页面已删除。回地图上再挑一个拍摄地。',

  'state.errorEyebrow': '出问题了',
  'state.retry': '重试',
  'state.genericRetry': '请稍后再试。',
  'state.mapPending': '正在加载地图',
  'state.mapStandIn': '地图很快出现在这里',
  'state.crashTitle': '页面渲染时出了问题',
  'state.crashBody': '刷新一般就能解决。反复出现的话，请把下面的错误信息发给我们。',
  'state.reload': '刷新',

  'error.generic': '请求没能完成，请稍后再试。',
  'error.unauthenticated': '请先登录。',
  'error.schema': '服务器返回的数据格式和预期不符：{path}',

  'transport.WALK': '步行',
  'transport.TAXI': '出租车',
  'transport.BUS': '公交',
  'transport.CAR': '自驾',

  'style.NATURE': '自然',
  'style.CULTURE': '文化',
  'style.ACTIVITY': '户外活动',
  'style.FOOD': '美食',
  'style.SHOPPING': '购物',
  'style.PHOTO': '拍照',

  // Chinese sets a numeral closed up against its Han unit or counter —
  // 2小时30分钟, 12.4公里, 8处. No space, unlike the Latin/Han rule used elsewhere.
  'unit.hour': '{n}小时',
  'unit.minute': '{n}分钟',
  'unit.hourMinute': '{h}小时{m}分钟',
  'unit.metre': '{n}米',
  'unit.kilometre': '{n}公里',
}

export const messages = { ko, en, zh }
