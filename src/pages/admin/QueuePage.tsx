import { useMemo } from 'react';
import { Check, Play, X, ArrowRight, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import { TODAY } from '../../data/demoData';
import { useI18n } from '../../i18n/useI18n';

export function QueuePage() {
  const { t } = useI18n();
  const appointments = useAppStore((s) => s.appointments);
  const updateStatus = useAppStore((s) => s.updateAppointmentStatus);
  const openModal = useAppStore((s) => s.openAppointmentModal);

  const queue = useMemo(
    () =>
      appointments
        .filter((a) => a.date === TODAY && (a.status === 'waiting' || a.status === 'in_progress' || a.status === 'confirmed'))
        .filter((a) => a.status !== 'confirmed' || a.startTime <= '12:00')
        .sort((a, b) => {
          const order = { in_progress: 0, waiting: 1, confirmed: 2 } as Record<string, number>;
          return (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.startTime.localeCompare(b.startTime);
        }),
    [appointments]
  );

  const waiting = queue.filter((a) => a.status === 'waiting');
  const avgWait = waiting.length
    ? Math.round(waiting.reduce((s, a) => s + (a.waitingMinutes ?? 10), 0) / waiting.length)
    : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.queue.title')}</h1>
          <p className="page-subtitle">{t('admin.queue.subtitle')}</p>
        </div>
        <Button onClick={() => openModal()}>{t('admin.queue.addWalkin')}</Button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card card-pad">
          <div className="stat-value">{waiting.length}</div>
          <div className="stat-label">{t('admin.queue.peopleWaiting')}</div>
        </div>
        <div className="card card-pad">
          <div className="stat-value">
            {avgWait} {t('common.min')}
          </div>
          <div className="stat-label">{t('admin.queue.avgWait')}</div>
        </div>
        <div className="card card-pad">
          <div className="stat-value">{queue.filter((a) => a.status === 'in_progress').length}</div>
          <div className="stat-label">{t('admin.queue.inProgress')}</div>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <Button
            onClick={() => {
              const next = waiting[0];
              if (next) void updateStatus(next.id, 'in_progress');
            }}
          >
            <ArrowRight size={16} /> {t('admin.queue.nextCustomer')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const next = waiting[0];
              if (next) void updateStatus(next.id, 'in_progress');
            }}
          >
            <Play size={16} /> {t('admin.queue.serviceStarted')}
          </Button>
          <Button
            variant="success"
            onClick={() => {
              const cur = queue.find((a) => a.status === 'in_progress');
              if (cur) void updateStatus(cur.id, 'completed');
            }}
          >
            <Check size={16} /> {t('common.complete')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              const cur = waiting[0] ?? queue[0];
              if (cur) void updateStatus(cur.id, 'cancelled');
            }}
          >
            <X size={16} /> {t('common.cancelAction')}
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {queue.map((a, i) => (
            <div
              key={a.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto',
                gap: 16,
                alignItems: 'center',
                padding: 16,
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: a.status === 'in_progress' ? 'var(--primary-soft)' : '#fff',
              }}
            >
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 750,
                  color: 'var(--primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{a.customerName}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 2 }}>
                  {a.serviceName} · {a.employeeName} · {t(`channel.${a.channel}`)}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 6,
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Clock size={12} />
                  {a.waitingMinutes != null
                    ? `${a.waitingMinutes} ${t('admin.queue.waitingMins')}`
                    : a.status === 'waiting'
                      ? t('admin.queue.justJoined')
                      : a.startTime}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <StatusBadge status={a.status} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {a.status === 'waiting' && (
                    <Button size="sm" variant="secondary" onClick={() => void updateStatus(a.id, 'in_progress')}>
                      {t('common.start')}
                    </Button>
                  )}
                  {a.status === 'in_progress' && (
                    <Button size="sm" variant="success" onClick={() => void updateStatus(a.id, 'completed')}>
                      {t('common.complete')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
