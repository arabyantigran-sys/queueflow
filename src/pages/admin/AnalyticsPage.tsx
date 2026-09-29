import { useAppStore } from '../../store/useAppStore';
import { formatAMD } from '../../utils/format';

function BarChart({ data, color = 'var(--primary)' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.value > 1000 ? `${Math.round(d.value / 1000)}կ` : d.value}</div>
          <div
            style={{
              width: '100%',
              maxWidth: 36,
              height: `${(d.value / max) * 120}px`,
              background: color,
              borderRadius: '6px 6px 2px 2px',
              minHeight: 4,
              opacity: 0.85,
            }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function HBar({ data }: { data: { name: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d) => (
        <div key={d.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
            <span>{d.name}</span>
            <strong>{d.value}</strong>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 999 }}>
            <div
              style={{
                height: '100%',
                width: `${(d.value / max) * 100}%`,
                background: 'var(--primary)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const analytics = useAppStore((s) => s.analytics);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Վիճակագրություն</h1>
          <p className="page-subtitle">Վերջին 30 օր · իրական դեմո տվյալներ</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        {[
          ['Ընդհանուր ամրագրումներ', analytics.totalAppointments],
          ['Ավարտված', analytics.completed],
          ['Չեղարկված', analytics.cancelled],
          ['No-show', analytics.noShow],
        ].map(([l, v]) => (
          <div className="card card-pad" key={l as string}>
            <div className="stat-value">{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card card-pad">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatAMD(analytics.revenue)}</div>
          <div className="stat-label">Եկամուտ</div>
        </div>
        <div className="card card-pad">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatAMD(analytics.averageBookingValue)}</div>
          <div className="stat-label">Միջին ամրագրում</div>
        </div>
        <div className="card card-pad">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{analytics.repeatCustomers}%</div>
          <div className="stat-label">Կրկնվող հաճախորդներ</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Ամրագրումներ ժամանակի ընթացքում</h3>
          <BarChart data={analytics.appointmentsOverTime} />
        </div>
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Եկամուտ ժամանակի ընթացքում</h3>
          <BarChart data={analytics.revenueOverTime} color="#ea580c" />
        </div>
      </div>

      <div className="grid-3">
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Ամենահայտնի ծառայություններ</h3>
          <HBar data={analytics.popularServices.map((s) => ({ name: s.name, value: s.value }))} />
        </div>
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Աշխատակիցների արդյունք</h3>
          {analytics.employeePerformance.map((e) => (
            <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 650 }}>{e.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.appointments} այց</div>
              </div>
              <strong>{formatAMD(e.revenue)}</strong>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Պիկ ժամեր</h3>
          <HBar data={analytics.peakHours.map((p) => ({ name: p.hour, value: p.count }))} />
        </div>
      </div>
    </div>
  );
}
