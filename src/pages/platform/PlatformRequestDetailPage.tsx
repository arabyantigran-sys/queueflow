import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { usePlatformStore } from '../../store/usePlatformStore';
import { useI18n } from '../../i18n/useI18n';

export function PlatformRequestDetailPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const requests = usePlatformStore((s) => s.requests);
  const setRequestStatus = usePlatformStore((s) => s.setRequestStatus);
  const approveRequest = usePlatformStore((s) => s.approveRequest);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const req = useMemo(() => requests.find((r) => r.id === id), [requests, id]);

  if (!req) {
    return (
      <div className="page">
        <p>{t('platform.req.notFound')}</p>
        <Link to="/platform/requests">{t('common.back')}</Link>
      </div>
    );
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p style={{ fontSize: '0.85rem', marginBottom: 4 }}>
            <Link to="/platform/requests" style={{ color: 'var(--primary)' }}>
              ← {t('platform.nav.requests')}
            </Link>
          </p>
          <h1 className="page-title">{req.businessName}</h1>
          <p className="page-subtitle">
            {t(`platform.status.${req.status}`)} · {req.createdAt.slice(0, 16).replace('T', ' ')}
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 14 }}>
            {t('platform.req.owner')}
          </h2>
          <div className="form-group">
            <div className="stat-label">{t('common.name')}</div>
            <div style={{ fontWeight: 600 }}>{req.ownerName}</div>
          </div>
          <div className="form-group">
            <div className="stat-label">{t('auth.email')}</div>
            <div style={{ fontWeight: 600 }}>{req.ownerEmail}</div>
          </div>
          <div className="form-group">
            <div className="stat-label">{t('common.phone')}</div>
            <div style={{ fontWeight: 600 }}>{req.ownerPhone}</div>
          </div>
          <div className="form-group">
            <div className="stat-label">{t('admin.settings.city')}</div>
            <div style={{ fontWeight: 600 }}>{req.city}</div>
          </div>
          <div className="form-group">
            <div className="stat-label">{t('platform.req.plan')}</div>
            <div style={{ fontWeight: 600 }}>{req.planRequested.toUpperCase()}</div>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: 14 }}>
            {t('platform.req.details')}
          </h2>
          <div className="stat-label" style={{ marginBottom: 6 }}>
            {t('nav.employees')}
          </div>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18 }}>
            {req.employees.map((e, i) => (
              <li key={i}>
                {e.name} · {e.role}
              </li>
            ))}
          </ul>
          <div className="stat-label" style={{ marginBottom: 6 }}>
            {t('nav.services')}
          </div>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18 }}>
            {req.services.map((s, i) => (
              <li key={i}>
                {s.name} · {s.price} ֏ · {s.duration} {t('common.minutes')}
              </li>
            ))}
          </ul>
          <div className="form-group">
            <label className="form-label">{t('platform.req.notes')}</label>
            <textarea
              className="form-textarea"
              value={notes || req.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('platform.req.notesPlaceholder')}
            />
          </div>
        </div>
      </div>

      {req.status !== 'approved' && req.status !== 'rejected' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => void run(() => setRequestStatus(req.id, 'reviewing', notes || req.notes))}
          >
            {t('platform.req.markReview')}
          </Button>
          <Button disabled={busy} onClick={() => void run(() => approveRequest(req.id))}>
            {t('platform.req.approve')}
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => void run(() => setRequestStatus(req.id, 'rejected', notes || req.notes))}
          >
            {t('platform.req.reject')}
          </Button>
        </div>
      )}

      {req.approvedBusinessId && (
        <p style={{ marginTop: 16 }}>
          <Link to={`/platform/salons/${req.approvedBusinessId}`} style={{ color: 'var(--primary)', fontWeight: 650 }}>
            {t('platform.req.openSalon')} →
          </Link>
        </p>
      )}
    </div>
  );
}
