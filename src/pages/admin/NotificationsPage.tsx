import { useAppStore } from '../../store/useAppStore';

export function NotificationsPage() {
  const notifications = useAppStore((s) => s.notifications);
  const updateNotification = useAppStore((s) => s.updateNotification);
  const showToast = useAppStore((s) => s.showToast);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ծանուցումներ</h1>
          <p className="page-subtitle">Push · SMS · Email կարգավորումներ</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20, background: 'var(--primary-soft)', borderColor: 'transparent' }}>
        <div style={{ fontWeight: 650, marginBottom: 6 }}>Օրինակ հաղորդագրություն</div>
        <p style={{ fontSize: '0.95rem' }}>
          «Բարև Ձեզ, Անի։ Հիշեցնում ենք, որ Ձեր այցը Beauty House-ում այսօր 18:30-ին է։»
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.map((n) => (
          <div key={n.id} className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{n.label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{n.description}</div>
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {(['push', 'sms', 'email'] as const).map((ch) => (
                  <label key={ch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>
                    {ch}
                    <button
                      type="button"
                      className={`toggle ${n[ch] ? 'on' : ''}`}
                      onClick={() => {
                        updateNotification(n.id, { [ch]: !n[ch] });
                        showToast('Կարգավորումը պահված է');
                      }}
                      aria-label={`${n.label} ${ch}`}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
