import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformStore } from '../../store/usePlatformStore';
import { useI18n } from '../../i18n/useI18n';
import type { SalonRequestStatus } from '../../types';

export function PlatformRequestsPage() {
  const { t } = useI18n();
  const requests = usePlatformStore((s) => s.requests);
  const [filter, setFilter] = useState<SalonRequestStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const list = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests, filter]);

  const filters: (SalonRequestStatus | 'all')[] = ['all', 'pending', 'reviewing', 'approved', 'rejected'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('platform.req.title')}</h1>
          <p className="page-subtitle">{t('platform.req.subtitle')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? t('common.all') : t(`platform.status.${f}`)}
          </button>
        ))}
      </div>

      <div className="table-wrap card">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('platform.req.salon')}</th>
              <th>{t('platform.req.owner')}</th>
              <th>{t('platform.req.city')}</th>
              <th>{t('platform.req.plan')}</th>
              <th>{t('common.date')}</th>
              <th>{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link to={`/platform/requests/${r.id}`} style={{ fontWeight: 650, color: 'var(--primary)' }}>
                    {r.businessName}
                  </Link>
                </td>
                <td>
                  <div>{r.ownerName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.ownerEmail}</div>
                </td>
                <td>{r.city}</td>
                <td>{r.planRequested.toUpperCase()}</td>
                <td>{r.createdAt.slice(0, 10)}</td>
                <td>
                  <span
                    className={`badge badge-${
                      r.status === 'approved'
                        ? 'completed'
                        : r.status === 'rejected'
                          ? 'cancelled'
                          : r.status === 'reviewing'
                            ? 'confirmed'
                            : 'waiting'
                    }`}
                  >
                    {t(`platform.status.${r.status}`)}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {t('platform.req.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
