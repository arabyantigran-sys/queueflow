import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const setOnboarding = useAppStore((s) => s.setOnboarding);
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
        <Link to="/" className="brand" style={{ fontSize: '1.25rem', display: 'inline-block', marginBottom: 24 }}>
          QueueFlow
        </Link>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Ստեղծել բիզնես հաշիվ</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>30 օր անվճար փորձաշրջան</p>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Բիզնեսի անուն</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Օր. Beauty House"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Գաղտնաբառ</label>
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
            Շարունակել
          </Button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Արդեն ունե՞ք հաշիվ · <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 650 }}>Մուտք</Link>
        </p>
      </div>
    </div>
  );
}
