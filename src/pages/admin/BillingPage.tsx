import { Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { plans } from '../../data/demoData';
import { formatAMD } from '../../utils/format';
import type { PlanId } from '../../types';
import { useI18n } from '../../i18n/useI18n';

const PLAN_FEATURE_COUNTS: Record<string, number> = {
  starter: 5,
  business: 6,
  pro: 5,
  enterprise: 5,
};

export function BillingPage() {
  const { t } = useI18n();
  const business = useAppStore((s) => s.business);
  const setPlan = useAppStore((s) => s.setPlan);
  const current = plans.find((p) => p.id === business.plan)!;
  const featureCount = PLAN_FEATURE_COUNTS[current.id] ?? current.features.length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.billing.title')}</h1>
          <p className="page-subtitle">{t('admin.billing.subtitle')}</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'var(--primary)', boxShadow: '0 0 0 3px rgba(15,118,110,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              {t('admin.billing.currentPlan')}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 750, marginTop: 6 }}>{current.name}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              {current.price != null ? `${formatAMD(current.price)} ${t('landing.perMonth')}` : t('common.custom')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-label">{t('admin.billing.nextPayment')}</div>
            <div style={{ fontWeight: 700 }}>{business.nextBillingDate}</div>
          </div>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Array.from({ length: featureCount }, (_, i) => t(`plan.${current.id}.f${i + 1}`)).map((f) => (
            <li key={f} style={{ display: 'flex', gap: 8, fontSize: '0.9rem' }}>
              <Check size={16} color="var(--primary)" /> {f}
            </li>
          ))}
        </ul>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: 14 }}>{t('admin.billing.changePlan')}</h2>
      <div className="grid-3">
        {plans.filter((p) => p.id !== 'enterprise').map((plan) => {
          const count = PLAN_FEATURE_COUNTS[plan.id] ?? plan.features.length;
          return (
            <div
              key={plan.id}
              className="card card-pad"
              style={{
                borderColor: plan.id === business.plan ? 'var(--primary)' : undefined,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontWeight: 750 }}>{plan.name}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 750, margin: '8px 0' }}>
                {plan.price != null ? formatAMD(plan.price) : t('common.custom')}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1 }}>
                {t(`plan.${plan.id}.desc`)}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Array.from({ length: count }, (_, i) => t(`plan.${plan.id}.f${i + 1}`)).map((f) => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Check size={14} color="var(--primary)" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                style={{ marginTop: 16 }}
                variant={plan.id === business.plan ? 'secondary' : 'primary'}
                disabled={plan.id === business.plan}
                onClick={() => setPlan(plan.id as PlanId)}
              >
                {plan.id === business.plan ? t('admin.billing.current') : t('admin.billing.changePlan')}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
