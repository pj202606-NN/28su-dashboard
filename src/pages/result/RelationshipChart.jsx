import { useState, useMemo } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { calcBirthMansion } from '../../utils/mansionCalculator';
import { MANSIONS } from '../../data/28su_database_final';
import { RELATIONS } from '../../data/28su_relations';
import styles from './RelationshipChart.module.css';

const MANSION_MAP  = Object.fromEntries(MANSIONS.map(m => [m.id, m]));
const OHAENG_COLOR = { 목: '#4A6B4A', 화: '#7A4848', 토: '#8A7850', 금: '#7A8888', 수: '#3A6080' };
const SASHIN_COLOR = { 동방청룡: '#3A6A9A', 북방현무: '#3A4A52', 서방백호: '#8A9898', 남방주작: '#8A4848' };
const OHAENG_HAN   = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };

const GRADE_CONFIG = [
  { key: '🌟 천생연분', label: '천생연분', color: '#C9A84C' },
  { key: '💚 잘 맞음',  label: '잘 맞음',  color: '#5A7A5A' },
  { key: '🌀 무난',     label: '무난',      color: '#606068' },
  { key: '⚠️ 주의',     label: '주의',      color: '#A09060' },
  { key: '⚡ 충돌',     label: '충돌',      color: '#7A4848' },
];

// ── 내 별자리 카드 ─────────────────────────────────────────────────

function MyCard({ mansion }) {
  const color = SASHIN_COLOR[mansion.사신] ?? '#C9A84C';
  return (
    <div className={styles.myCard} style={{ borderColor: `${color}50` }}>
      <div className={styles.myCardAccent} style={{ backgroundColor: color, opacity: 0.6 }} />
      <div className={styles.myCardBody}>
        <div>
          <p className={styles.myCardSu} style={{ color }}>{mansion.수} · {mansion.칠요포함명칭}</p>
          <h2 className={styles.myCardName}>{mansion.별자리명}</h2>
          <p className={styles.myCardSub}>
            {mansion.사신} · {mansion.오행}({OHAENG_HAN[mansion.오행]}) · {mansion.상징동물}
          </p>
        </div>
        <div className={styles.myCardKeywords}>
          {mansion.키워드.slice(0, 4).map(kw => (
            <span key={kw} className={styles.kwTag}>{kw}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 상대 별자리 카드 ──────────────────────────────────────────────

function RelCard({ item, isSelected, onClick }) {
  const { mansion, rel } = item;
  const gradeConf   = GRADE_CONFIG.find(g => g.key === rel.등급) ?? GRADE_CONFIG[2];
  const sashinColor = SASHIN_COLOR[mansion.사신] ?? '#8A8070';

  return (
    <button
      className={`${styles.relCard} ${isSelected ? styles.relCardSelected : ''}`}
      style={{ '--grade-color': gradeConf.color, '--sashin-color': sashinColor }}
      onClick={onClick}
    >
      <span className={styles.relGradeBadge} style={{ color: gradeConf.color, borderColor: `${gradeConf.color}50` }}>
        {gradeConf.label}
      </span>
      <p className={styles.relCardName}>{mansion.별자리명}</p>
      <p className={styles.relCardSu}>{mansion.수}</p>
      <p className={styles.relCardAnimal}>{mansion.상징동물}</p>
    </button>
  );
}

// ── 관계 상세 패널 ────────────────────────────────────────────────

function RelDetail({ item, myMansion, onClose }) {
  const { mansion, rel } = item;
  const gradeConf   = GRADE_CONFIG.find(g => g.key === rel.등급) ?? GRADE_CONFIG[2];
  const sashinColor = SASHIN_COLOR[mansion.사신] ?? '#8A8070';

  return (
    <div className={styles.detail} style={{ borderColor: `${gradeConf.color}40` }}>
      <div className={styles.detailHeader}>
        <div className={styles.detailGradeBadge} style={{ color: gradeConf.color, borderColor: `${gradeConf.color}60` }}>
          {gradeConf.label}
        </div>
        <div className={styles.detailTitle}>
          <span className={styles.detailMyName}>{myMansion.별자리명}</span>
          <span className={styles.detailArrow}>↔</span>
          <span className={styles.detailOtherName} style={{ color: sashinColor }}>
            {mansion.별자리명}
          </span>
        </div>
        <button className={styles.detailClose} onClick={onClose}>닫기</button>
      </div>

      <div className={styles.detailMeta}>
        <span className={styles.detailMetaItem}>
          오행 관계: <strong>{rel.오행관계}</strong>
        </span>
        <span className={styles.detailMetaItem}>
          사신 관계: <strong>{rel.사신관계}</strong>
        </span>
        {rel.칠요일치 && (
          <span className={styles.detailMetaItemGold}>칠요 일치</span>
        )}
      </div>

      <p className={styles.detailDesc}>{rel.설명}</p>

      <div className={styles.detailOtherInfo}>
        <span>{mansion.수}</span>
        <span className={styles.dot}>·</span>
        <span>{mansion.사신}</span>
        <span className={styles.dot}>·</span>
        <span style={{ color: OHAENG_COLOR[mansion.오행] }}>
          {mansion.오행}({OHAENG_HAN[mansion.오행]})
        </span>
        <span className={styles.dot}>·</span>
        <span>{mansion.상징동물}</span>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────

function RelationshipChart() {
  const state = useOutletContext();
  const [selected, setSelected] = useState(null);

  if (!state) return <Navigate to="/" replace />;

  const { solarYear, solarMonth, solarDay, hour } = state;

  const birthMansion = useMemo(
    () => calcBirthMansion(solarYear, solarMonth, solarDay, hour),
    [solarYear, solarMonth, solarDay, hour],
  );
  const mansion = birthMansion?.mansion;
  if (!mansion) return <Navigate to="/" replace />;

  const myId = mansion.id;

  const grouped = useMemo(() => {
    const rawRels = RELATIONS[myId] ?? {};
    const map = Object.fromEntries(GRADE_CONFIG.map(g => [g.key, []]));
    Object.entries(rawRels).forEach(([otherId, rel]) => {
      const other = MANSION_MAP[Number(otherId)];
      if (!other) return;
      const gradeKey = rel.등급;
      if (map[gradeKey]) map[gradeKey].push({ mansion: other, rel });
    });
    return map;
  }, [myId]);

  const handleSelect = (item) => {
    setSelected(prev =>
      prev?.mansion.id === item.mansion.id ? null : item
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>별자리 관계표</h1>
        <p className={styles.pageDesc}>27개 별자리와의 궁합을 오행·사신·칠요 기준으로 분석합니다</p>
      </div>

      <section>
        <p className={styles.sectionLabel}>내 별자리</p>
        <MyCard mansion={mansion} />
      </section>

      {GRADE_CONFIG.map(grade => {
        const items = grouped[grade.key] ?? [];
        if (items.length === 0) return null;

        const hasDetailHere = selected &&
          items.some(i => i.mansion.id === selected.mansion.id);

        return (
          <section key={grade.key} className={styles.gradeSection}>
            <div className={styles.gradeHeader}>
              <span className={styles.gradeLabel} style={{ color: grade.color }}>{grade.label}</span>
              <span className={styles.gradeCount}>{items.length}개</span>
            </div>

            <div className={styles.relGrid}>
              {items.map(item => (
                <RelCard
                  key={item.mansion.id}
                  item={item}
                  isSelected={selected?.mansion.id === item.mansion.id}
                  onClick={() => handleSelect(item)}
                />
              ))}
            </div>

            {hasDetailHere && (
              <RelDetail
                item={selected}
                myMansion={mansion}
                onClose={() => setSelected(null)}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

export default RelationshipChart;
