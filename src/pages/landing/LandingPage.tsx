import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  BarChart3,
  QrCode,
  Bell,
  Clock,
  Building2,
  Check,
  Phone,
  Globe,
  UserPlus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { plans } from '../../data/demoData';
import { formatAMD } from '../../utils/format';
import { useI18n } from '../../i18n/useI18n';
import '../../styles/landing.css';

const problemKeys = [
  'problem.instagram',
  'problem.phone',
  'problem.walkin',
  'problem.notebook',
  'problem.excel',
  'problem.missed',
  'problem.noshow',
  'problem.double',
] as const;

const featureDefs = [
  { icon: Globe, title: 'feat.online', desc: 'feat.onlineD' },
  { icon: Clock, title: 'feat.queue', desc: 'feat.queueD' },
  { icon: Calendar, title: 'feat.calendar', desc: 'feat.calendarD' },
  { icon: Users, title: 'feat.customers', desc: 'feat.customersD' },
  { icon: UserPlus, title: 'feat.schedule', desc: 'feat.scheduleD' },
  { icon: Bell, title: 'feat.reminders', desc: 'feat.remindersD' },
  { icon: QrCode, title: 'feat.qr', desc: 'feat.qrD' },
  { icon: Users, title: 'feat.noshow', desc: 'feat.noshowD' },
  { icon: BarChart3, title: 'feat.analytics', desc: 'feat.analyticsD' },
  { icon: Building2, title: 'feat.branches', desc: 'feat.branchesD' },
] as const;

const channels = ['Instagram', 'Phone', 'Website', 'QR', 'Walk-in', 'QueueFlow App'];

const planFeatureCounts: Record<string, number> = {
  starter: 5,
  business: 6,
  pro: 5,
  enterprise: 5,
};

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
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
          <span className="brand" style={{ fontSize: '1.2rem' }}>
            QueueFlow
          </span>
        </Link>
        <div className="landing-nav-links">
          <span className="nav-link hide-sm" style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'default' }}>
            {t('landing.forSalons')}
          </span>
          <a href="#how" className="nav-link hide-sm">
            {t('landing.how')}
          </a>
          <a href="#features" className="nav-link hide-sm">
            {t('landing.features')}
          </a>
          <a href="#pricing" className="nav-link hide-sm">
            {t('landing.pricing')}
          </a>
          <Link to="/book/beauty-house" className="nav-link hide-sm">
            {t('landing.customerDemo')}
          </Link>
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="ghost" size="sm">
              {t('landing.salonLogin')}
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">{t('landing.connectSalon')}</Button>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <Building2 size={14} /> {t('landing.heroEyebrow')}
          </div>
          <h1>{t('landing.heroTitle')}</h1>
          <p className="hero-sub">{t('landing.heroSub')}</p>
          <div className="hero-ctas">
            <Link to="/register">
              <Button size="lg">{t('landing.ctaConnect')}</Button>
            </Link>
            <a href="#how">
              <Button variant="secondary" size="lg">
                {t('landing.ctaHow')}
              </Button>
            </a>
          </div>
          <p className="hero-note">{t('landing.trialNote')}</p>
        </div>

        <div className="hero-preview" aria-hidden>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Beauty House</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t('common.today')}</div>
            </div>
            <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999 }}>
              Live
            </div>
          </div>
          <div className="preview-grid">
            <div className="preview-card" style={{ gridRow: 'span 2' }}>
              <h4>{t('nav.appointments')}</h4>
              {[
                ['09:00', 'Աննա', '✓'],
                ['10:00', 'Մարիա', '…'],
                ['10:30', 'Նարե', '●'],
                ['11:00', 'Ռուզաննա', '…'],
              ].map(([time, name, s]) => (
                <div className="preview-row" key={time}>
                  <span>
                    <strong>{time}</strong> {name}
                  </span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="preview-card">
              <h4>{t('nav.queue')}</h4>
              <div className="preview-stat">5</div>
            </div>
            <div className="preview-card">
              <h4>{t('nav.analytics')}</h4>
              <div className="preview-row">
                <span>24</span>
                <strong>16</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-muted" id="problem">
        <div className="section-head">
          <h2>{t('landing.problemTitle')}</h2>
          <p>{t('landing.problemSub')}</p>
        </div>
        <div className="problem-grid">
          {problemKeys.map((key) => (
            <div className="problem-chip" key={key}>
              {t(key)}
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="how">
        <div className="section-head">
          <h2>{t('landing.howTitle')}</h2>
          <p>{t('landing.howSub')}</p>
        </div>
        <div className="steps">
          {(
            [
              ['1', 'landing.step1t', 'landing.step1d'],
              ['2', 'landing.step2t', 'landing.step2d'],
              ['3', 'landing.step3t', 'landing.step3d'],
            ] as const
          ).map(([n, title, desc]) => (
            <div className="step-card" key={n}>
              <div className="step-num">{n}</div>
              <h3 style={{ marginBottom: 8 }}>{t(title)}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t(desc)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-muted" id="unified">
        <div className="section-head">
          <h2>{t('landing.unifiedTitle')}</h2>
          <p>{t('landing.unifiedSub')}</p>
        </div>
        <div className="unified">
          <div className="channel-row">
            {channels.map((c) => (
              <span className="channel-pill" key={c}>
                {c === 'Phone' && <Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />}
                {c === 'Website' && <Globe size={14} style={{ marginRight: 6, verticalAlign: -2 }} />}
                {c}
              </span>
            ))}
          </div>
          <div className="flow-arrow">↓</div>
          <div className="one-calendar">
            <Calendar size={28} />
            ONE CALENDAR
          </div>
          <div className="flow-arrow">↓</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Business</div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-head">
          <h2>{t('landing.featuresTitle')}</h2>
          <p>{t('landing.featuresSub')}</p>
        </div>
        <div className="features-grid">
          {featureDefs.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="icon">
                <f.icon size={20} />
              </div>
              <h3>{t(f.title)}</h3>
              <p>{t(f.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-muted" id="experience">
        <div className="cx-layout">
          <div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('landing.cxBadge')}
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 750, marginBottom: 12 }}>{t('landing.cxTitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '1.05rem' }}>{t('landing.cxSub')}</p>
            <Link to="/book/beauty-house">
              <Button>{t('landing.cxCta')}</Button>
            </Link>
          </div>
          <div className="phone-frame">
            <div className="phone-screen">
              <div style={{ fontWeight: 750, fontSize: '1.1rem' }}>Beauty House</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>⭐ 4.8</div>
              {[
                ['Haircut', '8,000 ֏'],
                ['Manicure', '7,000 ֏'],
                ['Coloring', '18,000 ֏'],
              ].map(([n, p]) => (
                <div
                  key={n}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    marginBottom: 8,
                    fontSize: '0.875rem',
                  }}
                >
                  <span>{n}</span>
                  <strong>{p}</strong>
                </div>
              ))}
              <Button block style={{ marginTop: 8 }}>
                {t('book.confirm')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="section-head">
          <h2>{t('landing.pricingTitle')}</h2>
          <p>{t('landing.pricingSub')}</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`price-card ${plan.recommended ? 'recommended' : ''}`}>
              {plan.recommended && <div className="price-badge">{t('landing.recommended')}</div>}
              <div style={{ fontWeight: 750, letterSpacing: '0.04em', fontSize: '0.85rem' }}>{plan.name}</div>
              <div className="price-amount">{plan.price == null ? t('common.custom') : formatAMD(plan.price)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {plan.price == null ? t('landing.customQuote') : t('landing.perMonth')}
              </div>
              <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t(`plan.${plan.id}.desc`)}
              </p>
              <ul className="price-features">
                {Array.from({ length: planFeatureCounts[plan.id] }, (_, i) => (
                  <li key={i}>
                    <Check size={16} color="var(--primary)" /> {t(`plan.${plan.id}.f${i + 1}`)}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant={plan.recommended ? 'primary' : 'secondary'} block>
                  {plan.price == null ? t('landing.contact') : t('landing.start')}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <span className="brand">QueueFlow</span>
          <div style={{ marginTop: 4 }}>{t('landing.footerTag')}</div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <LanguageSwitcher compact />
          <Link to="/login">{t('landing.footerLogin')}</Link>
          <Link to="/register">{t('landing.footerConnect')}</Link>
          <Link to="/book/beauty-house">{t('landing.footerDemo')}</Link>
        </div>
      </footer>
    </div>
  );
}
