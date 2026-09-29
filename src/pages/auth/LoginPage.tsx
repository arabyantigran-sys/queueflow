import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n/useI18n';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const { t } = useI18n();
  const [email, setEmail] = useState('admin@beautyhouse.am');
  const [password, setPassword] = useState('demo1234');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) navigate('/admin');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(20,184,166,0.15), transparent), var(--bg)',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--font-brand)',
                fontWeight: 800,
              }}
            >
              Q
            </div>
            <span className="brand" style={{ fontSize: '1.35rem' }}>
              QueueFlow
            </span>
          </Link>
          <LanguageSwitcher compact />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{t('auth.loginTitle')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>{t('auth.loginSub')}</p>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
              {t('auth.forgot')}
            </button>
          </div>
          <Button type="submit" block size="lg">
            {t('auth.loginBtn')}
          </Button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('auth.noAccount')} ·{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 650 }}>
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
