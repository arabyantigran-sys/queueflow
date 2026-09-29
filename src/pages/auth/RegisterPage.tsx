import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n/useI18n';

export function RegisterPage() {
  const navigate = useNavigate();
  const setOnboarding = useAppStore((s) => s.setOnboarding);
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOnboarding({ step: 1, businessName: name });
    navigate('/onboarding');
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
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link to="/" className="brand" style={{ fontSize: '1.25rem' }}>
            QueueFlow
          </Link>
          <LanguageSwitcher compact />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{t('auth.registerTitle')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{t('auth.registerSub')}</p>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.businessName')}</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Beauty House"
              required
            />
          </div>
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
              minLength={6}
            />
          </div>
          <Button type="submit" block size="lg">
            {t('auth.continue')}
          </Button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('auth.hasAccount')} ·{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 650 }}>
            {t('common.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
