import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformStore } from '../../store/usePlatformStore';
import { useI18n } from '../../i18n/useI18n';
import type { SalonLifecycle } from '../../types';

export function PlatformSalonsPage() {
  const { t } = useI18n();
  const salons = usePlatformStore((s) => s.salons);
  const [filter, setFilter] = useState<SalonLifecycle | 'all'>('all');

  const filtered = useMemo(() => {
    const list =
      filter === 'all' ? salons : salons.filter((s) => (s.status ?? 'active') === filter);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [salons, filter]);

  const filters: (SalonLifecycle | 'all')[] = ['all', 'active', 'trial', 'suspended'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('platform.salons.title')}</h1>
          <p className="page-subtitle">{t('platform.salons.subtitle')}</p>
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
            {f === 'all' ? t('common.all') : t(`platform.salon.${f}`)}
          </button>
        ))}
      </div>

      <div className="table-wrap card">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('platform.req.salon')}</th>
              <th>{t('platform.req.city')}</th>
              <th>{t('platform.req.plan')}</th>
              <th>{t('platform.salons.billing')}</th>
              <th>{t('platform.salons.created')}</th>
              <th>{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link to={`/platform/salons/${s.id}`} style={{ fontWeight: 650, color: 'var(--primary)' }}>
                    {s.name}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/book/{s.slug}</div>
                </td>
                <td>{s.city}</td>
                <td>{s.plan.toUpperCase()}</td>
                <td>{s.nextBillingDate}</td>
                <td>{s.createdAt ?? '—'}</td>
                <td>
                  <span
                    className={`badge badge-${
                      s.status === 'suspended' ? 'cancelled' : s.status === 'trial' ? 'waiting' : 'completed'
                    }`}
                  >
                    {t(`platform.salon.${s.status ?? 'active'}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
