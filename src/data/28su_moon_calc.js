// ================================================================
// 달의 위치 계산 — 방식 B (항성월 주기 기반 근사값)
// 기준일: 2000년 1월 6일 (각(角)수 시작점 근사)
// 항성월: 27.321661일
//
// 정밀도: 실제 천문 계산 대비 ±1~2수 오차 가능
// 용도: 오늘의 운세 기준 달의 수(宿) 계산
// 실제 서비스 고도화 시 astronomia 라이브러리로 대체 권장
// ================================================================

// 기준일 (밀리초)
const EPOCH_MS = new Date(2000, 0, 6).getTime();

// 항성월 (일)
const SIDEREAL_MONTH = 27.321661;

// 28수 순서 (달의 순행 방향)
const MANSION_ORDER_IDS = [
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,
  15,16,17,18,19,20,21,22,23,24,25,26,27,28
];

/**
 * 특정 날짜의 달이 위치한 수(宿) id 반환
 * @param {Date} date - 계산할 날짜 (기본값: 오늘)
 * @returns {number} 수의 id (1~28)
 */
export function getMoonMansionId(date = new Date()) {
  const targetMs = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  const daysElapsed = (targetMs - EPOCH_MS) / (1000 * 60 * 60 * 24);
  const position = ((daysElapsed % SIDEREAL_MONTH) + SIDEREAL_MONTH) % SIDEREAL_MONTH;
  const mansionIdx = Math.floor(position / SIDEREAL_MONTH * 28) % 28;
  return MANSION_ORDER_IDS[mansionIdx];
}

/**
 * 오늘 달의 수 id 반환
 */
export function getTodayMoonMansionId() {
  return getMoonMansionId(new Date());
}

/**
 * 달의 위치 기반 오행 반환
 * MANSION_DATES에서 해당 수의 오행을 조회해서 사용
 * @param {Date} date
 * @returns {string} 오행 ("목"|"화"|"토"|"금"|"수")
 */
export function getMoonOhaeng(mansionData) {
  // mansionData: MANSION_DATES에서 id로 조회한 객체
  return mansionData?.오행 ?? "토";
}

/**
 * 이달 월주 오행 계산 (절기 기반)
 * 28su_saju_table.js의 MONTH_JIQI 활용
 * @param {Date} date
 * @returns {string} 오행
 */
export function getMonthOhaeng(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 절기 기준 월 경계 (대략적 양력 날짜)
  // 정확한 절기는 매년 1~2일 차이 있음
  const JIQI_BOUNDS = [
    { 사주월: 12, 시작월: 1,  시작일: 6,  오행: "토" },  // 소한
    { 사주월: 1,  시작월: 2,  시작일: 4,  오행: "목" },  // 입춘
    { 사주월: 2,  시작월: 3,  시작일: 6,  오행: "목" },  // 경칩
    { 사주월: 3,  시작월: 4,  시작일: 5,  오행: "토" },  // 청명
    { 사주월: 4,  시작월: 5,  시작일: 6,  오행: "화" },  // 입하
    { 사주월: 5,  시작월: 6,  시작일: 6,  오행: "화" },  // 망종
    { 사주월: 6,  시작월: 7,  시작일: 7,  오행: "토" },  // 소서
    { 사주월: 7,  시작월: 8,  시작일: 7,  오행: "금" },  // 입추
    { 사주월: 8,  시작월: 9,  시작일: 8,  오행: "금" },  // 백로
    { 사주월: 9,  시작월: 10, 시작일: 8,  오행: "토" },  // 한로
    { 사주월: 10, 시작월: 11, 시작일: 7,  오행: "수" },  // 입동
    { 사주월: 11, 시작월: 12, 시작일: 7,  오행: "수" },  // 대설
  ];

  // 현재 날짜가 어느 절기 구간에 속하는지 판별
  const sorted = [...JIQI_BOUNDS].reverse();
  for (const j of sorted) {
    if (
      month > j.시작월 ||
      (month === j.시작월 && day >= j.시작일)
    ) {
      return j.오행;
    }
  }
  return "토";
}

/**
 * 올해 년주 천간 오행 계산
 * @param {number} year
 * @returns {{ 오행: string, 갑자: string, 천간: string }}
 */
export function getYearInfo(year = new Date().getFullYear()) {
  const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"];
  const JIJI     = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const OHAENG   = ["목","목","화","화","토","토","금","금","수","수"];

  const ganIdx = ((year - 4) % 10 + 10) % 10;
  const jiIdx  = ((year - 4) % 12 + 12) % 12;

  return {
    천간: CHEONGAN[ganIdx],
    지지: JIJI[jiIdx],
    오행: OHAENG[ganIdx],
    갑자: CHEONGAN[ganIdx] + JIJI[jiIdx],
  };
}

/**
 * 날짜 기반 계절 반환 (사신 계절이 아닌 실제 날짜 기준)
 * @param {number} month
 * @returns {string}
 */
export function getSeasonByMonth(month) {
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
}
