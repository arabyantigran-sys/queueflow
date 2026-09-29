import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { usePlatformStore } from '../../store/usePlatformStore';
import { useI18n } from '../../i18n/useI18n';
import type { PlanId } from '../../types';

const plans: PlanId[] = ['starter', 'business', 'pro', 'enterprise'];

export function PlatformSalonDetailPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const salons = usePlatformStore((s) => s.salons);
  const setSalonStatus = usePlatformStore((s) => s.setSalonStatus);
  const setSalonPlan = usePlatformStore((s) => s.setSalonPlan);

  const salon = useMemo(() => salons.find((s) => s.id === id || s.slug === id), [salons, id]);

  if (!salon) {
    return (
      <div className="page">
        <p>{t('platform.salons.notFound')}</p>
        <Link to="/platform/salons">{t('common.back')}</Link>
      </div>
    );
  }

  const bookingPath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/book/${salon.slug}`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p style={{ fontSize: '0.85rem', marginBottom: 4 }}>
            <Link to="/platform/salons" style={{ color: 'var(--primary)' }}>
              ← {t('platform.nav.salons')}
            </Link>
          </p>
          <h1 className="page-title">{salon.name}</h1>
          <p className="page-subtitle">
            {t(`platform.salon.${salon.status ?? 'active'}`)} · {salon.plan.toUpperCase()}
          </p>
        </div>
        <a href={bookingPath} target="_blank" rel="noreferrer">
          <Button variant="secondary">
            <ExternalLink size={16} /> {t('platform.salons.openBooking')}
          </Button>
        </a>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 14 }}>
            {t('platform.salons.details')}
          </h2>
          <Row label={t('admin.settings.address')} value={salon.address || '—'} />
          <Row label={t('admin.settings.city')} value={salon.city} />
          <Row label={t('common.phone')} value={salon.phone} />
          <Row label={t('auth.email')} value={salon.ownerEmail || '—'} />
          <Row label={t('platform.salons.created')} value={salon.createdAt || '—'} />
          <Row label={t('platform.salons.billing')} value={salon.nextBillingDate} />
          <Row label={t('platform.salons.trialEnds')} value={salon.trialEndsAt || '—'} />
          <Row label="Slug" value={salon.slug} />
        </div>

        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 14 }}>
            {t('platform.salons.manage')}
          </h2>
          <label className="form-label">{t('platform.req.plan')}</label>
          <select
            className="form-select"
            value={salon.plan}
            onChange={(e) => void setSalonPlan(salon.id, e.target.value as PlanId)}
            style={{ marginBottom: 16 }}
          >
            {plans.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {salon.status !== 'active' && (
              <Button onClick={() => void setSalonStatus(salon.id, 'active')}>
                {t('platform.salons.activate')}
              </Button>
            )}
            {salon.status !== 'trial' && (
              <Button variant="secondary" onClick={() => void setSalonStatus(salon.id, 'trial')}>
                {t('platform.salons.setTrial')}
              </Button>
            )}
            {salon.status !== 'suspended' && (
              <Button variant="danger" onClick={() => void setSalonStatus(salon.id, 'suspended')}>
                {t('platform.salons.suspend')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
