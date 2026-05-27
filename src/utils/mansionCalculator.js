import { getMansionByDate } from '../data/28su_dates_v3.js';
import { MANSIONS } from '../data/28su_database_final.js';

// id → MANSIONS 상세 정보 빠른 조회용 맵
const MANSION_MAP = Object.fromEntries(MANSIONS.map(m => [m.id, m]));

// ── 서양 황도 12궁: 생년월일 직접 계산 ──────────────────────────
const ZODIAC = [
  { name: '염소자리',   range: '12/22~1/19',  check: v => v >= 1222 || v <= 119 },
  { name: '물병자리',   range: '1/20~2/18',   check: v => v >= 120  && v <= 218 },
  { name: '물고기자리', range: '2/19~3/20',   check: v => v >= 219  && v <= 320 },
  { name: '양자리',     range: '3/21~4/19',   check: v => v >= 321  && v <= 419 },
  { name: '황소자리',   range: '4/20~5/20',   check: v => v >= 420  && v <= 520 },
  { name: '쌍둥이자리', range: '5/21~6/21',   check: v => v >= 521  && v <= 621 },
  { name: '게자리',     range: '6/22~7/22',   check: v => v >= 622  && v <= 722 },
  { name: '사자자리',   range: '7/23~8/22',   check: v => v >= 723  && v <= 822 },
  { name: '처녀자리',   range: '8/23~9/22',   check: v => v >= 823  && v <= 922 },
  { name: '천칭자리',   range: '9/23~10/23',  check: v => v >= 923  && v <= 1023 },
  { name: '전갈자리',   range: '10/24~11/22', check: v => v >= 1024 && v <= 1122 },
  { name: '사수자리',   range: '11/23~12/21', check: v => v >= 1123 && v <= 1221 },
];

/**
 * 양력 월/일로 서양 황도 12궁을 반환한다.
 * @returns {{ name: string, range: string }}
 */
export function getZodiacSign(month, day) {
  const v = month * 100 + day;
  return ZODIAC.find(z => z.check(v)) ?? ZODIAC[0];
}

/**
 * 양력 생년월일로 본명수(28수)를 반환한다.
 *
 * - 날짜 조회: 28su_dates_v3.js의 getMansionByDate (365일 완전 분할)
 * - 상세 정보: 28su_database_final.js의 MANSIONS에서 id로 조회
 *
 * @param {number} solarYear
 * @param {number} solarMonth
 * @param {number} solarDay
 * @param {number|null} sijin - 미사용 (서명 유지)
 * @returns {{ id, 별자리명, 사신, 오행, mansion } | null}
 */
export function calcBirthMansion(solarYear, solarMonth, solarDay, sijin = null) {
  // 1. v3 날짜 범위로 수 식별
  const dateEntry = getMansionByDate(solarMonth, solarDay);
  if (!dateEntry) return null;

  // 2. id로 28su_database_final.js 상세 정보 조회
  const mansion = MANSION_MAP[dateEntry.id] ?? null;

  return {
    id:      dateEntry.id,
    별자리명: dateEntry.별자리명,
    사신:    dateEntry.사신,
    오행:    dateEntry.오행,
    mansion,
  };
}
