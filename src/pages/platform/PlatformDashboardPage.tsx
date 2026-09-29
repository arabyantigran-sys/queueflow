import { Link } from 'react-router-dom';
import { Inbox, Store, Clock, CheckCircle2 } from 'lucide-react';
import { usePlatformStore } from '../../store/usePlatformStore';
import { useI18n } from '../../i18n/useI18n';
import { formatAMD } from '../../utils/format';

export function PlatformDashboardPage() {
  const { t } = useI18n();
  const requests = usePlatformStore((s) => s.requests);
  const salons = usePlatformStore((s) => s.salons);
  const loading = usePlatformStore((s) => s.loading);

  const pending = requests.filter((r) => r.status === 'pending').length;
  const reviewing = requests.filter((r) => r.status === 'reviewing').length;
  const active = salons.filter((s) => s.status === 'active' || s.status === 'trial').length;
  const suspended = salons.filter((s) => s.status === 'suspended').length;
  const recentRequests = [...requests]
    .filter((r) => r.status === 'pending' || r.status === 'reviewing')
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('platform.dash.title')}</h1>
          <p className="page-subtitle">{t('platform.dash.subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {(
              [
                { label: t('platform.dash.pending'), value: pending, Icon: Inbox },
                { label: t('platform.dash.reviewing'), value: reviewing, Icon: Clock },
                { label: t('platform.dash.activeSalons'), value: active, Icon: Store },
                { label: t('platform.dash.suspended'), value: suspended, Icon: CheckCircle2 },
              ] as const
            ).map(({ label, value, Icon }) => (
              <div key={label} className="card card-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="stat-label">{label}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 750, marginTop: 4 }}>{value}</div>
                  </div>
                  <Icon size={22} color="var(--primary)" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="card-title">{t('platform.dash.newRequests')}</h2>
                <Link to="/platform/requests" style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--primary)' }}>
                  {t('platform.dash.viewAll')}
                </Link>
              </div>
              {recentRequests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('platform.dash.noPending')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentRequests.map((r) => (
                    <Link
                      key={r.id}
                      to={`/platform/requests/${r.id}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 650 }}>{r.businessName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {r.ownerName} · {r.city}
                        </div>
                      </div>
                      <span className={`badge badge-${r.status === 'pending' ? 'waiting' : 'confirmed'}`}>
                        {t(`platform.status.${r.status}`)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="card-title">{t('platform.dash.salonsOverview')}</h2>
                <Link to="/platform/salons" style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--primary)' }}>
                  {t('platform.dash.viewAll')}
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {salons.slice(0, 6).map((s) => (
                  <Link
                    key={s.id}
                    to={`/platform/salons/${s.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 650 }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {s.plan.toUpperCase()} · {s.city}
                      </div>
                    </div>
                    <span className={`badge badge-${s.status === 'suspended' ? 'cancelled' : s.status === 'trial' ? 'waiting' : 'completed'}`}>
                      {t(`platform.salon.${s.status ?? 'active'}`)}
                    </span>
                  </Link>
                ))}
              </div>
              <p style={{ marginTop: 14, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('platform.dash.mrrHint')} · {formatAMD(salons.filter((s) => s.status !== 'suspended').length * 9900)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
