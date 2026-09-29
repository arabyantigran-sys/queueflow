import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { slugify } from '../../data/api';
import type { BusinessType } from '../../types';
import { CheckCircle2 } from 'lucide-react';

const types: { id: BusinessType; label: string }[] = [
  { id: 'beauty_salon', label: 'Գեղեցկության սրահ' },
  { id: 'barbershop', label: 'Սափրիչ' },
  { id: 'nail_studio', label: 'Եղունգների ստուդիա' },
  { id: 'massage', label: 'Մերսում' },
  { id: 'dental', label: 'Ատամնաբուժական կլինիկա' },
  { id: 'medical', label: 'Բժշկական կլինիկա' },
  { id: 'other', label: 'Այլ' },
];

const dayLabels: Record<string, string> = {
  monday: 'Երկուշաբթի',
  tuesday: 'Երեքշաբթի',
  wednesday: 'Չորեքշաբթի',
  thursday: 'Հինգշաբթի',
  friday: 'Ուրբաթ',
  saturday: 'Շաբաթ',
  sunday: 'Կիրակի',
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const onboarding = useAppStore((s) => s.onboarding);
  const setOnboarding = useAppStore((s) => s.setOnboarding);
  const finishOnboarding = useAppStore((s) => s.finishOnboarding);
  const showToast = useAppStore((s) => s.showToast);

  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [svcName, setSvcName] = useState('');
  const [svcPrice, setSvcPrice] = useState('8000');
  const [svcDuration, setSvcDuration] = useState('45');
  const [saving, setSaving] = useState(false);

  const step = onboarding.step;
  const total = 6;

  const previewSlug = useMemo(
    () => slugify(onboarding.businessName || 'nor-sarah'),
    [onboarding.businessName]
  );

  const next = () => setOnboarding({ step: Math.min(step + 1, 7) });
  const back = () => setOnboarding({ step: Math.max(step - 1, 1) });

  const finish = async () => {
    if (!onboarding.businessName.trim()) {
      showToast('Լրացրեք բիզնեսի անունը');
      setOnboarding({ step: 1 });
      return;
    }
    setSaving(true);
    try {
      await finishOnboarding();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--bg)',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 560, padding: 32 }}>
        {step <= 6 && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 4,
                    background: i < step ? 'var(--primary)' : 'var(--border)',
                  }}
                />
              ))}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>
              Քայլ {step} / {total}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Բիզնեսի անուն</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ինչպե՞ս կկոչվի ձեր բիզնեսը</p>
            <input
              className="form-input"
              value={onboarding.businessName}
              onChange={(e) => setOnboarding({ businessName: e.target.value })}
              placeholder="Օր. Glow Studio"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Բիզնեսի տեսակ</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ընտրեք ձեզ ամենամոտ տարբերակը</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip ${onboarding.businessType === t.id ? 'active' : ''}`}
                  style={{ justifyContent: 'center', padding: '14px 12px' }}
                  onClick={() => setOnboarding({ businessType: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Ավելացրեք աշխատակիցներ</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Գոնե մեկը խորհուրդ է տրվում</p>
            <div className="grid-2">
              <input className="form-input" placeholder="Անուն" value={empName} onChange={(e) => setEmpName(e.target.value)} />
              <input className="form-input" placeholder="Դեր" value={empRole} onChange={(e) => setEmpRole(e.target.value)} />
            </div>
            <Button
              variant="secondary"
              style={{ marginTop: 10 }}
              onClick={() => {
                if (!empName) return;
                setOnboarding({
                  employees: [...onboarding.employees, { name: empName, role: empRole || 'Մասնագետ' }],
                });
                setEmpName('');
                setEmpRole('');
              }}
            >
              + Ավելացնել
            </Button>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {onboarding.employees.map((e, i) => (
                <div key={i} className="chip" style={{ justifyContent: 'space-between' }}>
                  <span>
                    {e.name} · {e.role}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Ավելացրեք ծառայություններ</h1>
            <div className="grid-2" style={{ marginBottom: 10 }}>
              <input className="form-input" placeholder="Անուն" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
              <input className="form-input" placeholder="Գին (֏)" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} />
            </div>
            <input
              className="form-input"
              placeholder="Տևողություն (րոպե)"
              value={svcDuration}
              onChange={(e) => setSvcDuration(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!svcName) return;
                setOnboarding({
                  services: [
                    ...onboarding.services,
                    { name: svcName, price: Number(svcPrice) || 0, duration: Number(svcDuration) || 30 },
                  ],
                });
                setSvcName('');
              }}
            >
              + Ավելացնել
            </Button>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {onboarding.services.map((s, i) => (
                <div key={i} className="chip" style={{ justifyContent: 'space-between' }}>
                  {s.name} · {s.price.toLocaleString('hy-AM')} ֏ · {s.duration} ր
                </div>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Աշխատանքային ժամեր</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Կարող եք փոխել ավելի ուշ կարգավորումներում</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(onboarding.workingHours).map(([day, hours]) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                  <span style={{ width: 110, fontWeight: 550, fontSize: '0.9rem' }}>{dayLabels[day]}</span>
                  <input
                    className="form-input"
                    style={{ width: 100 }}
                    value={hours.open}
                    onChange={(e) =>
                      setOnboarding({
                        workingHours: {
                          ...onboarding.workingHours,
                          [day]: { ...hours, open: e.target.value },
                        },
                      })
                    }
                  />
                  <span>–</span>
                  <input
                    className="form-input"
                    style={{ width: 100 }}
                    value={hours.close}
                    onChange={(e) =>
                      setOnboarding({
                        workingHours: {
                          ...onboarding.workingHours,
                          [day]: { ...hours, close: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Ամրագրման էջ</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Ավարտից հետո կստեղծվի նոր սրահ՝ այս հղումով (ոչ Beauty House)
            </p>
            <div
              className="card card-pad"
              style={{ background: 'var(--primary-soft)', borderColor: 'transparent', marginBottom: 16 }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{onboarding.businessName || 'Նոր սրահ'}</div>
              <code style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/book/{previewSlug}
              </code>
            </div>
          </>
        )}

        {step === 7 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={56} color="var(--success)" style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Հայտը ուղարկված է</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              <strong>{onboarding.businessName}</strong> սրահի հայտը ստացվել է։ QueueFlow թիմը կստուգի և
              կհաստատի՝ կարգավիճակը կփոխվի ընթացքում։
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Հայտի ID · {onboarding.submittedRequestId}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button size="lg" onClick={() => navigate('/')}>
                Վերադառնալ գլխավոր
              </Button>
              <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                Սրահի մուտք (հաստատումից հետո) →
              </Link>
            </div>
          </div>
        )}

        {step <= 6 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <Button variant="ghost" onClick={back} disabled={step === 1}>
              Հետ
            </Button>
            {step < 6 ? (
              <Button onClick={next} disabled={step === 1 && !onboarding.businessName.trim()}>
                Հաջորդ
              </Button>
            ) : (
              <Button onClick={() => void finish()} disabled={saving}>
                {saving ? 'Ուղարկում...' : 'Ուղարկել հայտը'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
