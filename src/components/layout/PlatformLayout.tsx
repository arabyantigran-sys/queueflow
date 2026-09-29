import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Store, Menu, LogOut, Shield } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { usePlatformStore } from '../../store/usePlatformStore';
import { useI18n } from '../../i18n/useI18n';
import '../../styles/admin.css';

const nav = [
  { to: '/platform', end: true as const, labelKey: 'platform.nav.dashboard', icon: LayoutDashboard },
  { to: '/platform/requests', labelKey: 'platform.nav.requests', icon: Inbox },
  { to: '/platform/salons', labelKey: 'platform.nav.salons', icon: Store },
];

export function PlatformLayout() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isAuthenticated = usePlatformStore((s) => s.isAuthenticated);
  const sidebarOpen = usePlatformStore((s) => s.sidebarOpen);
  const setSidebarOpen = usePlatformStore((s) => s.setSidebarOpen);
  const hydrate = usePlatformStore((s) => s.hydrate);
  const logout = usePlatformStore((s) => s.logout);
  const toast = usePlatformStore((s) => s.toast);
  const pendingCount = usePlatformStore(
    (s) => s.requests.filter((r) => r.status === 'pending' || r.status === 'reviewing').length
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/platform/login');
      return;
    }
    void hydrate();
  }, [isAuthenticated, hydrate, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="admin-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg,#0f172a,#334155)' }}>
            <Shield size={18} />
          </div>
          <div>
            <div className="brand" style={{ fontSize: '1.05rem' }}>
              QueueFlow
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('platform.badge')}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">{t('platform.nav.section')}</div>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? Boolean(item.end) : false}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {t(item.labelKey)}
              {item.to === '/platform/requests' && pendingCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: '2px 7px',
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <button
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick={() => {
              logout();
              navigate('/platform/login');
            }}
          >
            <LogOut size={18} />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="icon-btn menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <Menu size={18} />
            </button>
            <div className="business-selector">
              <Shield size={14} />
              {t('platform.title')}
            </div>
          </div>
          <div className="topbar-actions">
            <LanguageSwitcher compact />
            <div className="user-chip">
              <div className="user-avatar" style={{ background: '#0f172a' }}>
                QF
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 650 }}>{t('platform.adminRole')}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>admin@queueflow.am</div>
              </div>
            </div>
          </div>
        </header>
        <Outlet />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
