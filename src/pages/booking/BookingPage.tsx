import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, CheckCircle2, MapPin, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { TODAY, timeSlots } from '../../data/demoData';
import { formatAMD } from '../../utils/format';
import { Toast } from '../../components/ui/Toast';

type Step = 'services' | 'specialist' | 'datetime' | 'info' | 'done';

export function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const hydrateBySlug = useAppStore((s) => s.hydrateBySlug);
  const business = useAppStore((s) => s.business);
  const services = useAppStore((s) => s.services);
  const employees = useAppStore((s) => s.employees);
  const draft = useAppStore((s) => s.bookingDraft);
  const setDraft = useAppStore((s) => s.setBookingDraft);
  const resetDraft = useAppStore((s) => s.resetBookingDraft);
  const submitBooking = useAppStore((s) => s.submitBooking);
  const bookingCompleteId = useAppStore((s) => s.bookingCompleteId);
  const bookingNotFound = useAppStore((s) => s.bookingNotFound);
  const appointments = useAppStore((s) => s.appointments);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);
  const showToast = useAppStore((s) => s.showToast);

  const [step, setStep] = useState<Step>('services');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      resetDraft();
      setStep('services');
      if (slug) await hydrateBySlug(slug);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateBySlug, resetDraft, slug]);

  const selectedService = services.find((s) => s.id === draft.serviceId);
  const selectedEmployee =
    draft.employeeId === 'any'
      ? null
      : employees.find((e) => e.id === draft.employeeId);

  const availableEmployees = useMemo(() => {
    if (!draft.serviceId) return employees;
    return employees.filter(
      (e) => e.services.length === 0 || e.services.includes(draft.serviceId!)
    );
  }, [employees, draft.serviceId]);

  const dates = [TODAY, '2026-09-29', '2026-09-30', '2026-10-01'];

  const completed = appointments.find((a) => a.id === bookingCompleteId);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await submitBooking();
      setStep('done');
    } catch {
      showToast('Լրացրեք բոլոր դաշտերը');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        Բեռնվում է...
      </div>
    );
  }

  if (bookingNotFound || (slug && business.slug !== slug)) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="card" style={{ padding: 28, maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Սրահը չի գտնվել</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.95rem' }}>
            <code>/book/{slug}</code> էջը այս սարքում չկա։
            <br />
            Prototype-ում նոր սրահը պահվում է միայն այն բրաուզերում, որտեղ ստեղծել եք։
            <br />
            Դեմո սրահը՝ Beauty House։
          </p>
          <Link to="/book/beauty-house">
            <Button block>Բացել Beauty House դեմոն</Button>
          </Link>
        </div>
        <Toast />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0fdfa 0%, #f8fafc 40%, #fff 100%)',
        padding: '16px 16px 40px',
      }}
    >
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link to="/" className="brand" style={{ fontSize: '1rem', color: 'var(--primary)' }}>
            QueueFlow
          </Link>
          {step !== 'services' && step !== 'done' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const order: Step[] = ['services', 'specialist', 'datetime', 'info', 'done'];
                const i = order.indexOf(step);
                setStep(order[Math.max(0, i - 1)]);
              }}
            >
              <ArrowLeft size={16} /> Հետ
            </button>
          )}
        </div>

        {step !== 'done' && (
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>{business.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Star size={14} fill="#f59e0b" color="#f59e0b" /> {business.rating} ({business.reviewCount})
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} /> {business.city}
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                display: 'inline-flex',
                padding: '4px 10px',
                borderRadius: 999,
                background: 'var(--success-soft)',
                color: 'var(--success)',
                fontSize: '0.8rem',
                fontWeight: 650,
              }}
            >
              Բաց է մինչև {business.openUntil}
            </div>
          </div>
        )}

        {step === 'services' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Ընտրեք ծառայություն</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {services.filter((s) => s.id !== 'svc-massage' || true).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setDraft({ serviceId: s.id, employeeId: null });
                    setStep('specialist');
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `1px solid ${draft.serviceId === s.id ? 'var(--primary)' : 'var(--border)'}`,
                    background: draft.serviceId === s.id ? 'var(--primary-soft)' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 650 }}>
                    <span>{s.nameHy}</span>
                    <span>{formatAMD(s.price)}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.duration} րոպե</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'specialist' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Ընտրեք մասնագետ</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              {selectedService?.nameHy}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className={`chip ${draft.employeeId === 'any' ? 'active' : ''}`}
                style={{ justifyContent: 'flex-start', padding: 14 }}
                onClick={() => {
                  setDraft({ employeeId: 'any' });
                  setStep('datetime');
                }}
              >
                Ցանկացած մասնագետ
              </button>
              {availableEmployees.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={`chip ${draft.employeeId === e.id ? 'active' : ''}`}
                  style={{ justifyContent: 'space-between', padding: 14 }}
                  onClick={() => {
                    setDraft({ employeeId: e.id });
                    setStep('datetime');
                  }}
                >
                  <span>
                    <strong>{e.name}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{e.role}</span>
                  </span>
                  <span>⭐ {e.rating}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'datetime' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Ընտրեք ամսաթիվ և ժամ</h2>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`chip ${draft.date === d ? 'active' : ''}`}
                  onClick={() => setDraft({ date: d })}
                  style={{ flexDirection: 'column', minWidth: 72 }}
                >
                  <span style={{ fontSize: '0.7rem' }}>{d === TODAY ? 'Այսօր' : d.slice(5)}</span>
                  <strong>{d.slice(8)}</strong>
                </button>
              ))}
            </div>
            {draft.date && (
              <>
                <div style={{ fontWeight: 650, marginBottom: 10, fontSize: '0.9rem' }}>Հասանելի ժամեր</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {timeSlots.filter((t) => t >= '17:00' && t <= '19:00').map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`chip ${draft.time === t ? 'active' : ''}`}
                      onClick={() => setDraft({ time: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <Button
                  block
                  disabled={!draft.time}
                  onClick={() => setStep('info')}
                >
                  Շարունակել
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'info' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Ձեր տվյալները</h2>
            <div className="form-group">
              <label className="form-label">Անուն</label>
              <input
                className="form-input"
                value={draft.customerName}
                onChange={(e) => setDraft({ customerName: e.target.value })}
                placeholder="Անի"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Հեռախոս</label>
              <input
                className="form-input"
                value={draft.customerPhone}
                onChange={(e) => setDraft({ customerPhone: e.target.value })}
                placeholder="091 123 456"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Նշումներ (ոչ պարտադիր)</label>
              <textarea
                className="form-textarea"
                value={draft.notes}
                onChange={(e) => setDraft({ notes: e.target.value })}
                placeholder="Հատուկ խնդրանքներ..."
              />
            </div>
            <div
              style={{
                background: 'var(--surface-2)',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                fontSize: '0.875rem',
              }}
            >
              <div>
                <strong>{selectedService?.nameHy}</strong> · {selectedEmployee?.name ?? 'Ցանկացած'}
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                {draft.date === TODAY ? 'Այսօր' : draft.date} · {draft.time} · {formatAMD(selectedService?.price ?? 0)}
              </div>
            </div>
            <Button block size="lg" disabled={!draft.customerName || !draft.customerPhone || submitting} onClick={() => void onSubmit()}>
              {submitting ? 'Ամրագրում...' : 'Հաստատել ամրագրումը'}
            </Button>
          </div>
        )}

        {step === 'done' && completed && (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <CheckCircle2 size={52} color="var(--success)" style={{ margin: '0 auto 12px' }} />
            <h1 style={{ fontSize: '1.35rem', marginBottom: 8 }}>Ամրագրումը հաստատված է</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{business.name}</p>
            <div
              style={{
                background: 'var(--primary-soft)',
                borderRadius: 16,
                padding: 20,
                textAlign: 'left',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 750, marginBottom: 8 }}>
                {completed.date === TODAY ? 'Այսօր' : completed.date} · {completed.startTime}
              </div>
              <div style={{ fontSize: '0.95rem' }}>
                Ծառայություն: <strong>{completed.serviceName}</strong>
              </div>
              <div style={{ fontSize: '0.95rem', marginTop: 4 }}>
                Մասնագետ: <strong>{completed.employeeName}</strong>
              </div>
            </div>
            <Button
              block
              variant="secondary"
              style={{ marginBottom: 10 }}
              onClick={() => showToast('Ավելացված է օրացույցին (դեմո)')}
            >
              <CalendarPlus size={16} /> Ավելացնել օրացույցին
            </Button>
            <Button
              block
              variant="danger"
              onClick={async () => {
                await cancelAppointment(completed.id);
                showToast('Ամրագրումը չեղարկված է');
                navigate('/');
              }}
            >
              Չեղարկել ամրագրումը
            </Button>
            <Link to="/admin" style={{ display: 'block', marginTop: 20, color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              Տեսնել բիզնեսի dashboard-ում →
            </Link>
          </div>
        )}
      </div>
      <Toast />
    </div>
  );
}
