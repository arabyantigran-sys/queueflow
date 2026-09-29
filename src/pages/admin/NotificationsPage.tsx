import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n/useI18n';

const notifKeyById: Record<string, string> = {
  'n-confirm': 'confirm',
  'n-reminder': 'reminder',
  'n-queue': 'queue',
  'n-cancel': 'cancel',
  'n-noshow': 'noshow',
};

export function NotificationsPage() {
  const { t } = useI18n();
  const notifications = useAppStore((s) => s.notifications);
  const updateNotification = useAppStore((s) => s.updateNotification);
  const showToast = useAppStore((s) => s.showToast);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.notif.title')}</h1>
          <p className="page-subtitle">{t('admin.notif.subtitle')}</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20, background: 'var(--primary-soft)', borderColor: 'transparent' }}>
        <div style={{ fontWeight: 650, marginBottom: 6 }}>{t('admin.notif.exampleTitle')}</div>
        <p style={{ fontSize: '0.95rem' }}>{t('admin.notif.exampleMsg')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.map((n) => {
          const key = notifKeyById[n.id] ?? 'confirm';
          const label = t(`admin.notif.${key}.label`);
          const description = t(`admin.notif.${key}.desc`);
          return (
            <div key={n.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{description}</div>
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  {(['push', 'sms', 'email'] as const).map((ch) => (
                    <label
                      key={ch}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 650,
                      }}
                    >
                      {ch}
                      <button
                        type="button"
                        className={`toggle ${n[ch] ? 'on' : ''}`}
                        onClick={() => {
                          updateNotification(n.id, { [ch]: !n[ch] });
                          showToast(t('admin.notif.saved'));
                        }}
                        aria-label={`${label} ${ch}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
