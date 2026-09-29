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
import '../../styles/admin.css';

const nav = [
  { to: '/admin', end: true, label: 'Գլխավոր', icon: LayoutDashboard },
  { to: '/admin/calendar', label: 'Օրացույց', icon: Calendar },
  { to: '/admin/queue', label: 'Հերթ', icon: ListOrdered },
  { to: '/admin/appointments', label: 'Ամրագրումներ', icon: CalendarCheck },
  { to: '/admin/customers', label: 'Հաճախորդներ', icon: Users },
  { to: '/admin/employees', label: 'Աշխատակիցներ', icon: UserCog },
  { to: '/admin/services', label: 'Ծառայություններ', icon: Scissors },
  { to: '/admin/analytics', label: 'Վիճակագրություն', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Ծանուցումներ', icon: Bell },
  { to: '/admin/qr', label: 'QR Booking', icon: QrCode },
  { to: '/admin/billing', label: 'Բաժանորդագրություն', icon: CreditCard },
  { to: '/admin/settings', label: 'Կարգավորումներ', icon: Settings },
];

export function AdminLayout() {
  const navigate = useNavigate();
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
          <div className="nav-section">Գործառույթներ</div>
          {nav.slice(0, 7).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <div className="nav-section">Համակարգ</div>
          {nav.slice(7).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
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
            Ելք
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
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--success)',
                }}
              />
              {business.name}
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => navigate('/admin/notifications')} aria-label="Notifications">
              <BellRing size={18} />
              <span className="notif-dot" />
            </button>
            <div className="user-chip">
              <div className="user-avatar">BH</div>
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 650 }}>Մենեջեր</div>
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
