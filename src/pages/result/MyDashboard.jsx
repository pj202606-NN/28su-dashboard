import { useState, useMemo } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { calcBirthMansion, getZodiacSign } from '../../utils/mansionCalculator';
import { generateAllFortunes } from '../../data/28su_fortune_v5';
import { getYearInfo } from '../../data/28su_moon_calc';
import { MANSION_DATES } from '../../data/28su_dates_v3';
import { MANSION_KEYWORDS } from '../../data/28su_keywords_v2';
import { getFiguresByMansion } from '../../data/28su_figures';
import { SASHIN, CHILYO } from '../../data/28su_database_final';
import styles from './MyDashboard.module.css';

// ── 상수 ──────────────────────────────────────────────────────────
const OHAENG_HAN   = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
const OHAENG_COLOR = { 목: '#4A6B4A', 화: '#7A4848', 토: '#8A7850', 금: '#7A8888', 수: '#3A6080' };
const SASHIN_COLOR = { 동방청룡: '#3A6A9A', 북방현무: '#3A4A52', 서방백호: '#8A9898', 남방주작: '#8A4848' };

const LUCKY_COLOR_HEX = {
  청색: '#3A6080', 적색: '#7A4040', 황색: '#8A7040',
  황금색: '#C9A84C', 백색: '#C8C0A8', 흑색: '#2A3038', 은색: '#7A8888',
};

const FORTUNE_TABS       = ['오늘', '이달', '올해', '분석'];
const FORTUNE_CATEGORIES = ['종합', '연애', '직업', '재물'];
const ANALYSIS_LABELS    = { 본질: '본질', 강점: '강점', 관계스타일: '관계 스타일', 주의점: '주의점' };

// Jan 1, 2000 (UTC) = 계유일(癸酉日). 天干 오행: 계→수 (idx 9)
// 검증: Jan 27, 2000 + 26일 = idx 5 → 기→토 (기해일) ✓
function calcIlganOhaeng(solarYear, solarMonth, solarDay) {
  const ref   = Date.UTC(2000, 0, 1);
  const birth = Date.UTC(solarYear, solarMonth - 1, solarDay);
  const days  = Math.round((birth - ref) / 86400000);
  const idx   = ((days % 10) + 9 + 10) % 10;
  return ['목','목','화','화','토','토','금','금','수','수'][idx];
}

function gradeStyle(state) {
  if (!state) return '#606068';
  if (state === '대길') return '#C9A84C';
  if (state.includes('길')) return '#5A7A5A';
  if (state.includes('흉')) return '#7A4848';
  if (state.includes('주의')) return '#A09060';
  return '#606068';
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────

function MansionCard({ mansion, state: s }) {
  const sashinInfo = SASHIN[mansion.사신];
  const chilyoInfo = CHILYO[mansion.칠요];
  const sashinColor = SASHIN_COLOR[mansion.사신] ?? '#C9A84C';
  const ohaengColor = OHAENG_COLOR[mansion.오행] ?? '#8A8070';
  const baseStateColor = gradeStyle(mansion.기본상태);
  const zodiac = getZodiacSign(s.solarMonth, s.solarDay);

  return (
    <div className={styles.heroCard}>
      <div
        className={styles.heroAccentBar}
        style={{ background: sashinColor }}
      />
      <div className={styles.heroBody}>
        <div className={styles.mansionHeader}>
          <div>
            <p className={styles.mansionSu}>{mansion.수} · {mansion.칠요포함명칭}</p>
            <h3 className={styles.mansionName}>{mansion.별자리명}</h3>
            <p className={styles.birthDateLabel}>
              {s.isLunar
                ? `음력 ${s.originalYear}. ${s.originalMonth}. ${s.originalDay} → 양력 ${s.solarYear}. ${s.solarMonth}. ${s.solarDay}`
                : `양력 ${s.solarYear}. ${s.solarMonth}. ${s.solarDay}`}
              {' · '}
              {s.hourLabel}
            </p>
          </div>
          <div className={styles.sashinBadge} style={{ color: sashinColor, borderColor: `${sashinColor}66` }}>
            <span className={styles.sashinName}>{sashinInfo?.이름 ?? mansion.사신}</span>
          </div>
        </div>

        <div className={styles.infoGrid}>
          {[
            { label: '상징 동물', value: mansion.상징동물, color: null },
            { label: '기본 길흉', value: mansion.기본상태, color: baseStateColor },
            { label: '오행', value: `${mansion.오행}(${OHAENG_HAN[mansion.오행]})`, color: ohaengColor },
            { label: '음양', value: mansion.음양, color: null },
            { label: '칠요', value: chilyoInfo?.이름 ?? mansion.칠요, color: null },
            { label: '오상', value: mansion.오상, color: null },
          ].map(({ label, value, color }) => (
            <div key={label} className={styles.infoItem}>
              <span className={styles.infoLabel}>{label}</span>
              <span className={styles.infoValue} style={color ? { color } : undefined}>{value}</span>
            </div>
          ))}
        </div>

        <div>
          <p className={styles.infoLabel} style={{ marginBottom: 8 }}>키워드</p>
          <div className={styles.keywords}>
            {mansion.키워드.map(kw => (
              <span key={kw} className={styles.kwTag}>{kw}</span>
            ))}
          </div>
        </div>

        <div className={styles.hwangdoBox}>
          <span className={styles.hwangdoLabel}>서양 황도 12궁</span>
          <p className={styles.hwangdoNote}>
            생년월일 기준 <strong>{zodiac.name}</strong>({zodiac.range})에 해당합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function FortuneSection({ mansion, fortunes }) {
  const [tab, setTab]           = useState('오늘');
  const [category, setCategory] = useState('종합');
  const [expanded, setExpanded] = useState(false);

  const isAnalysis = tab === '분석';
  const current    = isAnalysis ? null : fortunes[tab]?.[category];
  const tabOhaeng  = current?.moonOhaeng ?? current?.monthOhaeng ?? current?.yearOhaeng;
  const analysis   = fortunes['분석'];

  return (
    <div>
      {/* 기간 탭 */}
      <div className={styles.tabs}>
        {FORTUNE_TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => { setTab(t); setCategory('종합'); setExpanded(false); }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 분석 탭 */}
      {isAnalysis && analysis?.sections && (
        <div className={styles.analysisSections}>
          {Object.entries(analysis.sections).map(([key, text]) => (
            <div key={key} className={styles.analysisCard}>
              <p className={styles.analysisSectionLabel}>{ANALYSIS_LABELS[key] ?? key}</p>
              <p className={styles.analysisText}>{text}</p>
            </div>
          ))}
        </div>
      )}

      {/* 오늘·이달·올해 탭 */}
      {!isAnalysis && (
        <>
          <div className={styles.categories}>
            {FORTUNE_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                onClick={() => { setCategory(cat); setExpanded(false); }}
              >
                {cat}
              </button>
            ))}
          </div>

          {current && (
            <div className={styles.card} style={{ borderColor: current.gradeInfo.색상 + '40' }}>
              <div className={styles.fortuneHeader}>
                <span
                  className={styles.fortuneGrade}
                  style={{ color: current.gradeInfo.색상, borderColor: current.gradeInfo.색상 + '60' }}
                >
                  {current.gradeInfo.등급}
                </span>
                <span className={styles.fortuneRelation}>
                  내 오행&nbsp;
                  <span style={{ color: OHAENG_COLOR[mansion.오행] }}>
                    {mansion.오행}({OHAENG_HAN[mansion.오행]})
                  </span>
                  &nbsp;→&nbsp;{tab}&nbsp;
                  <span style={{ color: OHAENG_COLOR[tabOhaeng] }}>
                    {tabOhaeng}({OHAENG_HAN[tabOhaeng]})
                  </span>
                  &nbsp;·&nbsp;
                  <span style={{ color: current.gradeInfo.색상 }}>{current.relation}</span>
                </span>
              </div>
              <p className={styles.fortuneText}>{current.summary}</p>
              {expanded && (
                <p className={styles.fortuneDetail}>{current.detail}</p>
              )}
              <button
                className={styles.detailToggleBtn}
                onClick={() => setExpanded(v => !v)}
              >
                {expanded ? '접기' : '자세히 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LuckyCards({ mansion }) {
  const chilyoInfo    = CHILYO[mansion.칠요];
  const luckyColorHex = LUCKY_COLOR_HEX[mansion.행운색] ?? '#606068';

  return (
    <div className={styles.luckyGrid}>
      <div className={styles.luckyCard}>
        <div className={styles.luckyCircle} style={{ backgroundColor: luckyColorHex }} />
        <span className={styles.luckyLabel}>행운의 색</span>
        <span className={styles.luckyValue}>{mansion.행운색}</span>
      </div>
      <div className={styles.luckyCard}>
        <div className={styles.luckyCompass}>{mansion.행운방위}</div>
        <span className={styles.luckyLabel}>행운의 방위</span>
        <span className={styles.luckyValue}>{mansion.행운방위}쪽</span>
      </div>
      <div className={styles.luckyCard}>
        <div className={styles.luckyDayBubble}>{chilyoInfo?.이름?.[0] ?? mansion.칠요}</div>
        <span className={styles.luckyLabel}>행운의 요일</span>
        <span className={styles.luckyValue}>{chilyoInfo?.이름 ?? mansion.칠요 + '요일'}</span>
      </div>
      <div className={styles.luckyCard}>
        <div className={styles.luckyPlanetBubble}>{chilyoInfo?.행성?.[0] ?? '-'}</div>
        <span className={styles.luckyLabel}>행운의 행성</span>
        <span className={styles.luckyValue}>{chilyoInfo?.행성}</span>
      </div>
    </div>
  );
}

function HistoricalFigures({ figures, mansionName }) {
  if (figures.length === 0) {
    return <p className={styles.emptyMsg}>{mansionName}에 해당하는 역사 인물 데이터가 없습니다.</p>;
  }
  return (
    <div className={styles.figuresGrid}>
      {figures.map(fig => (
        <div key={fig.이름} className={styles.figureCard}>
          <p className={styles.figureName}>{fig.이름}</p>
          <p className={styles.figureTitle}>{fig.직함}</p>
          {fig.생년 && <p className={styles.figureBirth}>{fig.생년}년생 · {fig.음력생일}</p>}
          <p className={styles.figureDesc}>{fig.한줄소개}</p>
        </div>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────

function MyDashboard() {
  const state = useOutletContext();

  const { solarYear, solarMonth, solarDay, hour } = state ?? {};

  const birthMansion = useMemo(
    () => (state ? calcBirthMansion(solarYear, solarMonth, solarDay, hour) : null),
    [state, solarYear, solarMonth, solarDay, hour],
  );
  const mansion = birthMansion?.mansion ?? null;

  const mansionWithKw = useMemo(() => (mansion ? {
    ...mansion,
    키워드: MANSION_KEYWORDS[mansion.id]?.키워드 ?? mansion.키워드,
  } : null), [mansion]);

  const ilganOhaeng   = state ? calcIlganOhaeng(solarYear, solarMonth, solarDay) : null;
  const nianganOhaeng = state ? getYearInfo(solarYear).오행 : null;

  const fortunes = useMemo(
    () => (mansionWithKw ? generateAllFortunes(mansionWithKw, MANSION_DATES, ilganOhaeng, nianganOhaeng) : null),
    [mansionWithKw, ilganOhaeng, nianganOhaeng],
  );

  const figures = useMemo(
    () => (mansion ? getFiguresByMansion(mansion.별자리명) : []),
    [mansion],
  );

  if (!state) return <Navigate to="/" replace />;
  if (!mansion) return <Navigate to="/" replace />;

  return (
    <div className={styles.dashboard}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>내 별자리 정보</h2>
        <MansionCard mansion={mansionWithKw} state={state} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>운세</h2>
        <FortuneSection mansion={mansionWithKw} fortunes={fortunes} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>행운 정보</h2>
        <LuckyCards mansion={mansion} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>같은 별자리 역사 인물</h2>
        <HistoricalFigures figures={figures} mansionName={mansion.별자리명} />
      </section>
    </div>
  );
}

export default MyDashboard;
