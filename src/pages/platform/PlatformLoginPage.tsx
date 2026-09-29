import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { usePlatformStore } from '../../store/usePlatformStore';
import { PLATFORM_ADMIN } from '../../data/platformData';
import { useI18n } from '../../i18n/useI18n';

export function PlatformLoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const login = usePlatformStore((s) => s.login);
  const [email, setEmail] = useState(PLATFORM_ADMIN.email as string);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/platform');
      return;
    }
    setError(t('platform.loginError'));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(15,23,42,0.12), transparent), var(--bg)',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link to="/" className="brand" style={{ fontSize: '1.25rem' }}>
            QueueFlow
          </Link>
          <LanguageSwitcher compact />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Shield size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.4rem', margin: 0 }}>{t('platform.loginTitle')}</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
          {t('platform.loginSub')}
        </p>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>
          )}
          <Button type="submit" block size="lg">
            {t('platform.loginBtn')}
          </Button>
        </form>
        <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t('platform.loginHint')}: {PLATFORM_ADMIN.email} / {PLATFORM_ADMIN.password}
        </p>
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
            {t('platform.salonLoginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
