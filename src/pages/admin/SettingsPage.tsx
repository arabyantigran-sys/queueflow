import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n/useI18n';

export function SettingsPage() {
  const { t } = useI18n();
  const business = useAppStore((s) => s.business);
  const updateBusiness = useAppStore((s) => s.updateBusiness);

  const [name, setName] = useState(business.name);
  const [address, setAddress] = useState(business.address);
  const [phone, setPhone] = useState(business.phone);
  const [city, setCity] = useState(business.city);
  const [cancellation, setCancellation] = useState(business.cancellationPolicy);
  const [rules, setRules] = useState(business.bookingRules);
  const [hours, setHours] = useState(business.workingHours);

  const dayLabels: Record<string, string> = {
    monday: t('day.monday'),
    tuesday: t('day.tuesday'),
    wednesday: t('day.wednesday'),
    thursday: t('day.thursday'),
    friday: t('day.friday'),
    saturday: t('day.saturday'),
    sunday: t('day.sunday'),
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.settings.title')}</h1>
          <p className="page-subtitle">{t('admin.settings.subtitle')}</p>
        </div>
        <Button
          onClick={() =>
            void updateBusiness({
              name,
              address,
              phone,
              city,
              cancellationPolicy: cancellation,
              bookingRules: rules,
              workingHours: hours,
            })
          }
        >
          {t('common.save')}
        </Button>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 16 }}>{t('admin.settings.business')}</h2>
          <div className="form-group">
            <label className="form-label">{t('common.name')}</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.settings.address')}</label>
            <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.settings.city')}</label>
            <input className="form-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('common.phone')}</label>
            <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.settings.logo')}</label>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              BH
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 16 }}>{t('admin.settings.workingHours')}</h2>
          {Object.entries(hours).map(([day, h]) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 100, fontSize: '0.875rem', fontWeight: 550 }}>{dayLabels[day]}</span>
              <input
                className="form-input"
                style={{ width: 90 }}
                value={h.open}
                onChange={(e) => setHours({ ...hours, [day]: { ...h, open: e.target.value } })}
              />
              <span>–</span>
              <input
                className="form-input"
                style={{ width: 90 }}
                value={h.close}
                onChange={(e) => setHours({ ...hours, [day]: { ...h, close: e.target.value } })}
              />
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 16 }}>{t('admin.settings.bookingRules')}</h2>
          <div className="form-group">
            <label className="form-label">{t('admin.settings.rules')}</label>
            <textarea className="form-textarea" value={rules} onChange={(e) => setRules(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.settings.cancelPolicy')}</label>
            <textarea className="form-textarea" value={cancellation} onChange={(e) => setCancellation(e.target.value)} />
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 16 }}>{t('admin.settings.other')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(
              [
                ['/admin/employees', t('nav.employees')],
                ['/admin/services', t('nav.services')],
                ['/admin/notifications', t('nav.notifications')],
                ['/admin/billing', t('admin.settings.payments')],
              ] as const
            ).map(([to, label]) => (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  display: 'block',
                }}
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
