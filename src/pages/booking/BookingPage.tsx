import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, CheckCircle2, MapPin, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { TODAY, timeSlots } from '../../data/demoData';
import { formatAMD } from '../../utils/format';
import { Toast } from '../../components/ui/Toast';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useI18n } from '../../i18n/useI18n';

type Step = 'services' | 'specialist' | 'datetime' | 'info' | 'done';

export function BookingPage() {
  const { slug } = useParams();
  const { t } = useI18n();
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
    draft.employeeId === 'any' ? null : employees.find((e) => e.id === draft.employeeId);

  const availableEmployees = useMemo(() => {
    if (!draft.serviceId) return employees;
    return employees.filter((e) => e.services.length === 0 || e.services.includes(draft.serviceId!));
  }, [employees, draft.serviceId]);

  const dates = [TODAY, '2026-09-29', '2026-09-30', '2026-10-01'];
  const completed = appointments.find((a) => a.id === bookingCompleteId);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await submitBooking();
      setStep('done');
    } catch {
      showToast(t('book.fillAll'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>{t('common.loading')}</div>
    );
  }

  if (bookingNotFound || (slug && business.slug !== slug)) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="card" style={{ padding: 28, maxWidth: 420, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <LanguageSwitcher compact />
          </div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{t('book.notFoundTitle')}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.95rem' }}>{t('book.notFoundBody')}</p>
          <Link to="/book/beauty-house">
            <Button block>{t('book.openDemo')}</Button>
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('book.booking')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageSwitcher compact />
            {step !== 'services' && step !== 'done' && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const order: Step[] = ['services', 'specialist', 'datetime', 'info', 'done'];
                  const i = order.indexOf(step);
                  setStep(order[Math.max(0, i - 1)]);
                }}
              >
                <ArrowLeft size={16} /> {t('common.back')}
              </button>
            )}
          </div>
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
              {t('book.openUntil')} {business.openUntil}
            </div>
          </div>
        )}

        {step === 'services' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>{t('book.selectService')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {services.map((s) => (
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {s.duration} {t('book.min')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'specialist' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{t('book.selectSpecialist')}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>{selectedService?.nameHy}</p>
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
                {t('common.anySpecialist')}
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
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>{t('book.selectDateTime')}</h2>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`chip ${draft.date === d ? 'active' : ''}`}
                  onClick={() => setDraft({ date: d })}
                  style={{ flexDirection: 'column', minWidth: 72 }}
                >
                  <span style={{ fontSize: '0.7rem' }}>{d === TODAY ? t('common.today') : d.slice(5)}</span>
                  <strong>{d.slice(8)}</strong>
                </button>
              ))}
            </div>
            {draft.date && (
              <>
                <div style={{ fontWeight: 650, marginBottom: 10, fontSize: '0.9rem' }}>{t('book.availableTimes')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {timeSlots
                    .filter((slot) => slot >= '17:00' && slot <= '19:00')
                    .map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`chip ${draft.time === slot ? 'active' : ''}`}
                        onClick={() => setDraft({ time: slot })}
                      >
                        {slot}
                      </button>
                    ))}
                </div>
                <Button block disabled={!draft.time} onClick={() => setStep('info')}>
                  {t('book.continue')}
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'info' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>{t('book.yourDetails')}</h2>
            <div className="form-group">
              <label className="form-label">{t('book.name')}</label>
              <input
                className="form-input"
                value={draft.customerName}
                onChange={(e) => setDraft({ customerName: e.target.value })}
                placeholder="Ani"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('book.phone')}</label>
              <input
                className="form-input"
                value={draft.customerPhone}
                onChange={(e) => setDraft({ customerPhone: e.target.value })}
                placeholder="091 123 456"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('book.notes')}</label>
              <textarea
                className="form-textarea"
                value={draft.notes}
                onChange={(e) => setDraft({ notes: e.target.value })}
                placeholder="..."
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
                <strong>{selectedService?.nameHy}</strong> · {selectedEmployee?.name ?? t('common.anySpecialist')}
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                {draft.date === TODAY ? t('common.today') : draft.date} · {draft.time} ·{' '}
                {formatAMD(selectedService?.price ?? 0)}
              </div>
            </div>
            <Button
              block
              size="lg"
              disabled={!draft.customerName || !draft.customerPhone || submitting}
              onClick={() => void onSubmit()}
            >
              {submitting ? t('book.confirming') : t('book.confirm')}
            </Button>
          </div>
        )}

        {step === 'done' && completed && (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <CheckCircle2 size={52} color="var(--success)" style={{ margin: '0 auto 12px' }} />
            <h1 style={{ fontSize: '1.35rem', marginBottom: 8 }}>{t('book.confirmed')}</h1>
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
                {completed.date === TODAY ? t('common.today') : completed.date} · {completed.startTime}
              </div>
              <div style={{ fontSize: '0.95rem' }}>
                {t('book.service')}: <strong>{completed.serviceName}</strong>
              </div>
              <div style={{ fontSize: '0.95rem', marginTop: 4 }}>
                {t('book.specialist')}: <strong>{completed.employeeName}</strong>
              </div>
            </div>
            <Button block variant="secondary" style={{ marginBottom: 10 }} onClick={() => showToast(t('book.addToCalendar'))}>
              <CalendarPlus size={16} /> {t('book.addToCalendar')}
            </Button>
            <Button
              block
              variant="danger"
              onClick={async () => {
                await cancelAppointment(completed.id);
                showToast(t('book.cancelBooking'));
                setStep('services');
                resetDraft();
              }}
            >
              {t('book.cancelBooking')}
            </Button>
            <p style={{ marginTop: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('common.poweredBy')}</p>
          </div>
        )}
      </div>
      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('common.poweredBy')}</p>
      <Toast />
    </div>
  );
}
