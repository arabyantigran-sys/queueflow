import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ListOrdered,
  CalendarCheck,
  Users,
  UserCog,
  Scissors,
  BarChart3,
  Bell,
  QrCode,
  CreditCard,
  Settings,
  Menu,
  BellRing,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { AppointmentModal } from '../shared/AppointmentModal';
import { Toast } from '../ui/Toast';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useI18n } from '../../i18n/useI18n';
import '../../styles/admin.css';

const navDefs = [
  { to: '/admin', end: true, labelKey: 'nav.home', icon: LayoutDashboard },
  { to: '/admin/calendar', labelKey: 'nav.calendar', icon: Calendar },
  { to: '/admin/queue', labelKey: 'nav.queue', icon: ListOrdered },
  { to: '/admin/appointments', labelKey: 'nav.appointments', icon: CalendarCheck },
  { to: '/admin/customers', labelKey: 'nav.customers', icon: Users },
  { to: '/admin/employees', labelKey: 'nav.employees', icon: UserCog },
  { to: '/admin/services', labelKey: 'nav.services', icon: Scissors },
  { to: '/admin/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
  { to: '/admin/notifications', labelKey: 'nav.notifications', icon: Bell },
  { to: '/admin/qr', labelKey: 'nav.qr', icon: QrCode },
  { to: '/admin/billing', labelKey: 'nav.billing', icon: CreditCard },
  { to: '/admin/settings', labelKey: 'nav.settings', icon: Settings },
] as const;

export function AdminLayout() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const business = useAppStore((s) => s.business);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const hydrate = useAppStore((s) => s.hydrate);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
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
          <div className="sidebar-logo">Q</div>
          <div>
            <div className="brand" style={{ fontSize: '1.1rem' }}>
              QueueFlow
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Business OS</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">{t('nav.sectionOps')}</div>
          {navDefs.slice(0, 7).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {t(item.labelKey)}
            </NavLink>
          ))}
          <div className="nav-section">{t('nav.sectionSystem')}</div>
          {navDefs.slice(7).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <button
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick={() => {
              logout();
              navigate('/');
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
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
              {business.name}
            </div>
          </div>
          <div className="topbar-actions">
            <LanguageSwitcher compact />
            <button className="icon-btn" onClick={() => navigate('/admin/notifications')} aria-label="Notifications">
              <BellRing size={18} />
              <span className="notif-dot" />
            </button>
            <div className="user-chip">
              <div className="user-avatar">BH</div>
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 650 }}>{t('nav.manager')}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>admin@beautyhouse.am</div>
              </div>
            </div>
          </div>
        </header>
        <Outlet />
      </div>

      <AppointmentModal />
      <Toast />
    </div>
  );
}
