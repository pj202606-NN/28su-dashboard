import { useState, useEffect, useCallback } from 'react';
import { MANSIONS, SASHIN } from '../../data/28su_database_final';
import { MANSION_DATES } from '../../data/28su_dates_v3';
import { MANSION_OBS } from '../../data/28su_obs_data';
import styles from './ConstellationOverview.module.css';

const SASHIN_ORDER = ['동방청룡', '북방현무', '서방백호', '남방주작'];
const SASHIN_LABEL = {
  동방청룡: '동방 청룡',
  북방현무: '북방 현무',
  서방백호: '서방 백호',
  남방주작: '남방 주작',
};
const SASHIN_COLOR = {
  동방청룡: '#3A6A9A',
  북방현무: '#3A4A52',
  서방백호: '#8A9898',
  남방주작: '#8A4848',
};
const SASHIN_ICON  = { 동방청룡: '龍', 북방현무: '武', 서방백호: '虎', 남방주작: '雀' };
const OHAENG_HAN   = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
const OHAENG_COLOR = { 목: '#4A6B4A', 화: '#7A4848', 토: '#8A7850', 금: '#7A8888', 수: '#3A6080' };
const LUCKY_COLOR_HEX = {
  청색: '#3A6080', 적색: '#7A4040', 황색: '#8A7040',
  황금색: '#C9A84C', 백색: '#C8C0A8', 흑색: '#2A3038', 은색: '#7A8888',
};

const DATE_MAP = Object.fromEntries(MANSION_DATES.map(m => [m.id, m]));
const OBS_MAP  = Object.fromEntries(MANSION_OBS.map(m => [m.id, m]));

function formatDateRange(id) {
  const d = DATE_MAP[id];
  if (!d) return '';
  return `${d.시작.월}/${d.시작.일} ~ ${d.종료.월}/${d.종료.일}`;
}

// ── 모달 ─────────────────────────────────────────────────────────

function MansionModal({ mansion, onClose }) {
  const color    = SASHIN_COLOR[mansion.사신];
  const luckyHex = LUCKY_COLOR_HEX[mansion.행운색] ?? '#606068';
  const obs      = OBS_MAP[mansion.id];

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* 상단 헤더 */}
        <div className={styles.modalHeader} style={{ borderColor: `${color}40` }}>
          <div>
            <p className={styles.modalSu} style={{ color }}>{mansion.수} · {mansion.칠요포함명칭}</p>
            <h2 className={styles.modalName}>{mansion.별자리명}</h2>
            <p className={styles.modalDate}>{formatDateRange(mansion.id)}</p>
          </div>
          <div className={styles.modalSashinBadge} style={{ color, borderColor: `${color}50` }}>
            <span className={styles.modalSashinIcon}>{SASHIN_ICON[mansion.사신]}</span>
            <span>{SASHIN_LABEL[mansion.사신]}</span>
          </div>
        </div>

        {/* 기본 정보 그리드 */}
        <div className={styles.modalGrid}>
          {[
            { label: '상징 동물', value: mansion.상징동물 },
            { label: '오행', value: `${mansion.오행}(${OHAENG_HAN[mansion.오행]})`, color: OHAENG_COLOR[mansion.오행] },
            { label: '음양', value: mansion.음양 },
            { label: '기본 길흉', value: mansion.기본상태 },
            { label: '오상', value: mansion.오상 },
            { label: '거성', value: mansion.거성 },
          ].map(({ label, value, color: c }) => (
            <div key={label} className={styles.modalGridItem}>
              <span className={styles.modalGridLabel}>{label}</span>
              <span className={styles.modalGridValue} style={c ? { color: c } : undefined}>{value}</span>
            </div>
          ))}
        </div>

        {/* 키워드 */}
        <div className={styles.modalKeywords}>
          {mansion.키워드.map(kw => (
            <span key={kw} className={styles.kwTag}>{kw}</span>
          ))}
        </div>

        {/* 설화 */}
        <div className={styles.modalBlock}>
          <p className={styles.modalBlockLabel}>설화·역사 기록</p>
          <p className={styles.modalBlockText}>{mansion.설화요약}</p>
        </div>

        {/* 운세 특성 */}
        <div className={styles.modalBlock}>
          <p className={styles.modalBlockLabel}>운세 특성</p>
          <p className={styles.modalBlockText}>{mansion.운세특성}</p>
        </div>

        {/* 관측 정보 */}
        {obs && (
          <div className={styles.modalBlock}>
            <p className={styles.modalBlockLabel}>관측 정보</p>
            <div className={styles.obsGrid}>
              <div className={styles.obsGridItem}>
                <span className={styles.modalGridLabel}>겉보기 등급</span>
                <span className={styles.modalGridValue}>
                  {obs.겉보기등급}등급
                  <span className={styles.obsGradeTip}> (수가 작을수록 밝음)</span>
                </span>
                {obs.겉보기등급 >= 5 && (
                  <span className={styles.obsWarning}>맨눈 관측이 어렵습니다</span>
                )}
              </div>
              <div className={styles.obsGridItem}>
                <span className={styles.modalGridLabel}>최적 관측 시기</span>
                <span className={styles.modalGridValue}>{obs.최적관측}</span>
              </div>
            </div>
            <p className={styles.modalBlockText}>{obs.관측설명}</p>
          </div>
        )}

        {/* 행운 정보 */}
        <div className={styles.modalLucky}>
          <div className={styles.modalLuckyItem}>
            <div className={styles.luckyCircle} style={{ backgroundColor: luckyHex }} />
            <span className={styles.modalGridLabel}>행운의 색</span>
            <span className={styles.modalGridValue}>{mansion.행운색}</span>
          </div>
          <div className={styles.modalLuckyItem}>
            <div className={styles.luckyCompass} style={{ borderColor: `${color}80`, color }}>
              {mansion.행운방위}
            </div>
            <span className={styles.modalGridLabel}>행운의 방위</span>
            <span className={styles.modalGridValue}>{mansion.행운방위}쪽</span>
          </div>
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

// ── 카드 ──────────────────────────────────────────────────────────

function MansionCard({ mansion, onClick }) {
  const color = SASHIN_COLOR[mansion.사신];
  const obs   = OBS_MAP[mansion.id];
  return (
    <button className={styles.card} onClick={() => onClick(mansion)}>
      <div className={styles.cardAccent} style={{ backgroundColor: color, opacity: 0.6 }} />
      <p className={styles.cardSu} style={{ color }}>{mansion.수}</p>
      <p className={styles.cardName}>{mansion.별자리명}</p>
      <p className={styles.cardAnimal}>{mansion.상징동물}</p>
      <p className={styles.cardDate}>{formatDateRange(mansion.id)}</p>
      <div className={styles.cardKeywords}>
        {mansion.키워드.slice(0, 3).map(kw => (
          <span key={kw} className={styles.kwTagSm}>{kw}</span>
        ))}
      </div>
      {obs && (
        <div className={styles.cardObs}>
          <span className={styles.cardObsItem}>{obs.겉보기등급}등급</span>
          <span className={styles.cardObsItem}>{obs.최적관측}</span>
        </div>
      )}
    </button>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────

function ConstellationOverview() {
  const [selected, setSelected] = useState(null);
  const handleClose = useCallback(() => setSelected(null), []);

  const grouped = SASHIN_ORDER.map(sashin => ({
    sashin,
    mansions: MANSIONS.filter(m => m.사신 === sashin),
  }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>28수 별자리</h1>
        <p className={styles.pageDesc}>동방 7수 · 북방 7수 · 서방 7수 · 남방 7수</p>
      </div>

      {grouped.map(({ sashin, mansions }) => {
        const color = SASHIN_COLOR[sashin];
        return (
          <section key={sashin} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupIcon} style={{ color, borderColor: `${color}50` }}>
                {SASHIN_ICON[sashin]}
              </span>
              <div>
                <h2 className={styles.groupTitle} style={{ color }}>{SASHIN_LABEL[sashin]}</h2>
                <p className={styles.groupSub}>{SASHIN[sashin]?.계절} · {SASHIN[sashin]?.오행}행 · {mansions.length}수</p>
              </div>
            </div>
            <div className={styles.grid}>
              {mansions.map(m => (
                <MansionCard key={m.id} mansion={m} onClick={setSelected} />
              ))}
            </div>
          </section>
        );
      })}

      {selected && <MansionModal mansion={selected} onClose={handleClose} />}
    </div>
  );
}

export default ConstellationOverview;
