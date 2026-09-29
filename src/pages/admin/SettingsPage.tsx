import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';

const dayLabels: Record<string, string> = {
  monday: 'Երկուշաբթի',
  tuesday: 'Երեքշաբթի',
  wednesday: 'Չորեքշաբթի',
  thursday: 'Հինգշաբթի',
  friday: 'Ուրբաթ',
  saturday: 'Շաբաթ',
  sunday: 'Կիրակի',
};

export function SettingsPage() {
  const business = useAppStore((s) => s.business);
  const updateBusiness = useAppStore((s) => s.updateBusiness);

  const [name, setName] = useState(business.name);
  const [address, setAddress] = useState(business.address);
  const [phone, setPhone] = useState(business.phone);
  const [city, setCity] = useState(business.city);
  const [cancellation, setCancellation] = useState(business.cancellationPolicy);
  const [rules, setRules] = useState(business.bookingRules);
  const [hours, setHours] = useState(business.workingHours);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Կարգավորումներ</h1>
          <p className="page-subtitle">Բիզնեսի պրոֆիլ և ամրագրման կանոններ</p>
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
          Պահպանել
        </Button>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 16 }}>Բիզնեսի տվյալներ</h2>
          <div className="form-group">
            <label className="form-label">Անուն</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Հասցե</label>
            <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Քաղաք</label>
            <input className="form-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Հեռախոս</label>
            <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Լոգո</label>
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
          <h2 className="card-title" style={{ marginBottom: 16 }}>Աշխատանքային ժամեր</h2>
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
          <h2 className="card-title" style={{ marginBottom: 16 }}>Ամրագրման կանոններ</h2>
          <div className="form-group">
            <label className="form-label">Կանոններ</label>
            <textarea className="form-textarea" value={rules} onChange={(e) => setRules(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Չեղարկման քաղաքականություն</label>
            <textarea className="form-textarea" value={cancellation} onChange={(e) => setCancellation(e.target.value)} />
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 16 }}>Այլ բաժիններ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(
              [
                ['/admin/employees', 'Աշխատակիցներ'],
                ['/admin/services', 'Ծառայություններ'],
                ['/admin/notifications', 'Ծանուցումներ'],
                ['/admin/billing', 'Վճարումներ'],
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
