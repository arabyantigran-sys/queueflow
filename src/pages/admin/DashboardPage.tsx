import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Play, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import { TODAY, channelLabels } from '../../data/demoData';

export function DashboardPage() {
  const appointments = useAppStore((s) => s.appointments);
  const openModal = useAppStore((s) => s.openAppointmentModal);
  const updateStatus = useAppStore((s) => s.updateAppointmentStatus);

  const today = useMemo(
    () => appointments.filter((a) => a.date === TODAY).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments]
  );

  const stats = {
    total: today.length,
    waiting: today.filter((a) => a.status === 'waiting').length,
    completed: today.filter((a) => a.status === 'completed').length,
    cancelled: today.filter((a) => a.status === 'cancelled' || a.status === 'no_show').length,
  };

  const queue = today.filter((a) => a.status === 'waiting' || a.status === 'in_progress');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Գլխավոր</h1>
          <p className="page-subtitle">Այսօր · Beauty House · բոլոր ալիքները մեկ տեղում</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={16} /> Նոր ամրագրում
        </Button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['Այսօրվա ամրագրումներ', stats.total],
          ['Սպասող հաճախորդներ', stats.waiting],
          ['Ավարտված այցեր', stats.completed],
          ['Չեղարկումներ', stats.cancelled],
        ].map(([label, value]) => (
          <div className="card card-pad" key={label as string}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }} className="dash-grid">
        <div className="card card-pad">
          <div className="card-header">
            <h2 className="card-title">Այսօրվա գրաֆիկ</h2>
            <Link to="/admin/calendar" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              Օրացույց →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {today.slice(0, 10).map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                }}
              >
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{a.startTime}</strong>
                <div>
                  <div style={{ fontWeight: 650 }}>
                    {a.employeeName} — {a.serviceName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {a.customerName} · {channelLabels[a.channel]}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-header">
            <h2 className="card-title">Ընթացիկ հերթ</h2>
            <Link to="/admin/queue" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              Բացել →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {queue.length === 0 && <div className="empty-state">Հերթը դատարկ է</div>}
            {queue.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-soft)',
                    color: 'var(--primary-ink)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 750,
                  }}
                >
                  #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 650 }}>{a.customerName.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.serviceName}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button
              onClick={() => {
                const next = queue.find((a) => a.status === 'waiting');
                if (next) void updateStatus(next.id, 'in_progress');
              }}
            >
              <ArrowRight size={16} /> Հաջորդ հաճախորդ
            </Button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const next = queue.find((a) => a.status === 'waiting');
                  if (next) void updateStatus(next.id, 'in_progress');
                }}
              >
                <Play size={14} /> Սկսել
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  const cur = queue.find((a) => a.status === 'in_progress') ?? queue[0];
                  if (cur) void updateStatus(cur.id, 'completed');
                }}
              >
                <Check size={14} /> Ավարտել
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const cur = queue[0];
                  if (cur) void updateStatus(cur.id, 'cancelled');
                }}
              >
                <X size={14} /> Չեղարկել
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
