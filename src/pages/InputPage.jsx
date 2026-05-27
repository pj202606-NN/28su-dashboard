import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import styles from './InputPage.module.css';

const HOURS = [
  { label: '모름', value: null },
  { label: '자시 (子時, 23~01시)', value: 0 },
  { label: '축시 (丑時, 01~03시)', value: 1 },
  { label: '인시 (寅時, 03~05시)', value: 2 },
  { label: '묘시 (卯時, 05~07시)', value: 3 },
  { label: '진시 (辰時, 07~09시)', value: 4 },
  { label: '사시 (巳時, 09~11시)', value: 5 },
  { label: '오시 (午時, 11~13시)', value: 6 },
  { label: '미시 (未時, 13~15시)', value: 7 },
  { label: '신시 (申時, 15~17시)', value: 8 },
  { label: '유시 (酉時, 17~19시)', value: 9 },
  { label: '술시 (戌時, 19~21시)', value: 10 },
  { label: '해시 (亥時, 21~23시)', value: 11 },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 2010 - 1930 + 1 }, (_, i) => 1930 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function InputPage() {
  const navigate = useNavigate();

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hourIndex, setHourIndex] = useState(0); // 0 = 모름
  const [isLunar, setIsLunar] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!year || !month || !day) {
      setError('연도, 월, 일을 모두 선택해주세요.');
      return;
    }
    setError('');

    let solarYear = Number(year);
    let solarMonth = Number(month);
    let solarDay = Number(day);

    if (isLunar) {
      const calendar = new KoreanLunarCalendar();
      calendar.setLunarDate(solarYear, solarMonth, solarDay, false);
      const solar = calendar.getSolarCalendar();
      solarYear = solar.year;
      solarMonth = solar.month;
      solarDay = solar.day;
    }

    const selectedHour = HOURS[Number(hourIndex)];

    navigate('/result/dashboard', {
      state: {
        solarYear,
        solarMonth,
        solarDay,
        hour: selectedHour.value,
        hourLabel: selectedHour.label,
        isLunar,
        originalYear: Number(year),
        originalMonth: Number(month),
        originalDay: Number(day),
      },
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.brandMark}>二十八宿</span>
        <h1 className={styles.title}>28수 별자리 운세</h1>
        <div className={styles.headerTexts}>
          <p className={styles.catchphrase}>오래된 밤하늘에 새겨진 당신의 이야기</p>
          <p className={styles.subtitle}>생년월일시를 입력하면 당신의 별자리를 알려드립니다</p>
        </div>

        <div className={styles.toggleRow}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${!isLunar ? styles.active : ''}`}
            onClick={() => setIsLunar(false)}
          >
            양력
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${isLunar ? styles.active : ''}`}
            onClick={() => setIsLunar(true)}
          >
            음력
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>연도</label>
            <select
              className={styles.select}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">연도 선택</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>월</label>
            <select
              className={styles.select}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">월 선택</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>일</label>
            <select
              className={styles.select}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="">일 선택</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>시</label>
            <select
              className={styles.select}
              value={hourIndex}
              onChange={(e) => setHourIndex(e.target.value)}
            >
              {HOURS.map((h, i) => (
                <option key={i} value={i}>{h.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="button" className={styles.submitBtn} onClick={handleSubmit}>
          나의 별자리 확인하기
        </button>
      </div>
    </div>
  );
}

export default InputPage;
