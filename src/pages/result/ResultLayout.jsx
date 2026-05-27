import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './ResultLayout.module.css';

const NAV_ITEMS = [
  { to: 'dashboard', label: '내 대시보드' },
  { to: 'overview',  label: '28수 별자리' },
  { to: 'chart',     label: '별자리 관계표' },
];

const THEMES = ['dark', 'light', 'deep'];
const THEME_LABEL = { dark: '기본', light: '라이트', deep: '딥 다크' };

function ResultLayout() {
  const { state } = useLocation();
  const [userData] = useState(state);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(t => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.layout}>

      {/* ── 모바일 탑바 ── */}
      <header className={styles.topbar}>
        <span className={styles.topbarBrand}>二十八宿</span>
        <div className={styles.topbarRight}>
          <button className={styles.themeToggleSm} onClick={cycleTheme} title="테마 변경">
            {THEME_LABEL[theme]}
          </button>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="메뉴"
          >
            {menuOpen ? '닫기' : '메뉴'}
          </button>
        </div>
      </header>

      {/* ── 사이드바 오버레이 (모바일) ── */}
      {menuOpen && (
        <div className={styles.drawerOverlay} onClick={closeMenu} />
      )}

      {/* ── 사이드바 ── */}
      <nav className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>

        {/* 브랜드 */}
        <button className={styles.brand} onClick={() => navigate('/')}>
          <span className={styles.brandChar}>二十八宿</span>
          <span className={styles.brandSub}>한국의 별자리 운세</span>
        </button>

        {/* 내비게이션 */}
        <ul className={styles.navList}>
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* 푸터: 테마 토글 */}
        <div className={styles.sidebarFooter}>
          <button className={styles.themeBtn} onClick={cycleTheme}>
            <span>{THEME_LABEL[theme]} 모드</span>
          </button>
          <p className={styles.footerNote}>6th DMD Exhibition</p>
        </div>
      </nav>

      {/* ── 메인 콘텐츠 ── */}
      <main className={styles.content}>
        <Outlet context={userData} />
      </main>
    </div>
  );
}

export default ResultLayout;
