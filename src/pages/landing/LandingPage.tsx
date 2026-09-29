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
import { plans } from '../../data/demoData';
import { formatAMD } from '../../utils/format';
import '../../styles/landing.css';

const problems = [
  'Instagram հաղորդագրություններ',
  'Հեռախոսազանգեր',
  'Walk-in հաճախորդներ',
  'Ձեռագիր տետր',
  'Excel աղյուսակներ',
  'Բաց թողնված այցեր',
  'No-show հաճախորդներ',
  'Կրկնակի ամրագրումներ',
];

const features = [
  { icon: Globe, title: 'Առցանց ամրագրում', desc: 'Հաճախորդները ամրագրում են 24/7' },
  { icon: Clock, title: 'Հերթի կառավարում', desc: 'Live հերթ մեկ էկրանից' },
  { icon: Calendar, title: 'Օրացույց', desc: 'Աշխատակիցների սյունակներով' },
  { icon: Users, title: 'Հաճախորդների բազա', desc: 'Պատմություն և վիճակագրություն' },
  { icon: UserPlus, title: 'Աշխատակիցների գրաֆիկ', desc: 'Ժամանակացույց և ծանրաբեռնվածություն' },
  { icon: Bell, title: 'Ավտո հիշեցումներ', desc: 'SMS, push և email' },
  { icon: QrCode, title: 'QR Booking', desc: 'Ամրագրում սրահից կամ Instagram-ից' },
  { icon: Users, title: 'No-show հետևում', desc: 'Նվազեցրեք բաց թողնված այցերը' },
  { icon: BarChart3, title: 'Վիճակագրություն', desc: 'Եկամուտ և արդյունավետություն' },
  { icon: Building2, title: 'Բազմաթիվ մասնաճյուղեր', desc: 'Մեկ համակարգ բոլորի համար' },
];

const channels = ['Instagram', 'Հեռախոս', 'Կայք', 'QR', 'Walk-in', 'QueueFlow App'];

export function LandingPage() {
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
            Սրահների համար
          </span>
          <a href="#how" className="nav-link hide-sm">
            Ինչպես է աշխատում
          </a>
          <a href="#features" className="nav-link hide-sm">
            Հնարավորություններ
          </a>
          <a href="#pricing" className="nav-link hide-sm">
            Գներ
          </a>
          <Link to="/book/beauty-house" className="nav-link hide-sm">
            Հաճախորդի էջ (դեմո)
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Սրահի մուտք
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Միացնել սրահը</Button>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <Building2 size={14} /> Սրահների և սերվիս բիզնեսների համար
          </div>
          <h1>Բոլոր հաճախորդները՝ մեկ հերթում</h1>
          <p className="hero-sub">
            Կառավարեք հերթերը, ամրագրումները և հաճախորդներին մեկ պարզ համակարգում՝ անկախ նրանից, թե
            որտեղից է եկել պատվերը։
          </p>
          <div className="hero-ctas">
            <Link to="/register">
              <Button size="lg">Միացնել իմ սրահը</Button>
            </Link>
            <a href="#how">
              <Button variant="secondary" size="lg">
                Տեսնել ինչպես է աշխատում
              </Button>
            </a>
          </div>
          <p className="hero-note">30 օր անվճար փորձաշրջան սրահների համար · Առանց քարտի</p>
        </div>

        <div className="hero-preview" aria-hidden>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Beauty House</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Այսօրվա ակնարկ</div>
            </div>
            <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999 }}>
              Live
            </div>
          </div>
          <div className="preview-grid">
            <div className="preview-card" style={{ gridRow: 'span 2' }}>
              <h4>Այսօրվա ամրագրումներ</h4>
              {[
                ['09:00', 'Աննա · Կտրվածք', '✓'],
                ['10:00', 'Մարիա · Սպասում', '…'],
                ['10:30', 'Նարե · Ներկում', '●'],
                ['11:00', 'Ռուզաննա · Հերթ', '…'],
              ].map(([t, n, s]) => (
                <div className="preview-row" key={t}>
                  <span>
                    <strong>{t}</strong> {n}
                  </span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="preview-card">
              <h4>Ընթացիկ հերթ</h4>
              <div className="preview-stat">5</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>հաջորդը՝ Մարիա</div>
            </div>
            <div className="preview-card">
              <h4>Վիճակագրություն</h4>
              <div className="preview-row">
                <span>Այցեր</span>
                <strong>24</strong>
              </div>
              <div className="preview-row">
                <span>Ավարտված</span>
                <strong>16</strong>
              </div>
            </div>
            <div className="preview-card" style={{ gridColumn: '1 / -1' }}>
              <h4>Աշխատակիցների գրաֆիկ</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Աննա', 'Մարիամ', 'Սոնա'].map((n) => (
                  <div
                    key={n}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      padding: '10px 8px',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{n}</div>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>Զբաղված</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-muted" id="problem">
        <div className="section-head">
          <h2>Ձեր հաճախորդները գալիս են տարբեր ճանապարհներով</h2>
          <p>Կառավարեք նրանց մեկ համակարգում։</p>
        </div>
        <div className="problem-grid">
          {problems.map((p) => (
            <div className="problem-chip" key={p}>
              {p}
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="how">
        <div className="section-head">
          <h2>Ինչպես է աշխատում</h2>
          <p>Երեք պարզ քայլ՝ ձեր բիզնեսը թվայնացնելու համար</p>
        </div>
        <div className="steps">
          {[
            ['1', 'Միացրեք ձեր բիզնեսը', 'Գրանցվեք և ստեղծեք ձեր պրոֆիլը մի քանի րոպեում։'],
            ['2', 'Ավելացրեք ծառայություններն ու աշխատակիցներին', 'Սահմանեք գներ, տևողություն և գրաֆիկներ։'],
            ['3', 'Սկսեք ընդունել և կառավարել հերթերը', 'Բոլոր ալիքներից եկող հաճախորդները՝ մեկ օրացույցում։'],
          ].map(([n, t, d]) => (
            <div className="step-card" key={n}>
              <div className="step-num">{n}</div>
              <h3 style={{ marginBottom: 8 }}>{t}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-muted" id="unified">
        <div className="section-head">
          <h2>Մեկ օրացույց բոլոր ալիքների համար</h2>
          <p>Manage every customer. From every channel. In one queue.</p>
        </div>
        <div className="unified">
          <div className="channel-row">
            {channels.map((c) => (
              <span className="channel-pill" key={c}>
                {c === 'Հեռախոս' && <Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />}
                {c === 'Կայք' && <Globe size={14} style={{ marginRight: 6, verticalAlign: -2 }} />}
                {c}
              </span>
            ))}
          </div>
          <div className="flow-arrow">↓</div>
          <div className="one-calendar">
            <Calendar size={28} />
            ONE CALENDAR
            <span style={{ fontWeight: 500, fontSize: '0.85rem', opacity: 0.9 }}>մեկ հերթ · մեկ համակարգ</span>
          </div>
          <div className="flow-arrow">↓</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Ձեր բիզնեսը</div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-head">
          <h2>Ամեն ինչ՝ մեկ հարթակում</h2>
          <p>Ամրագրումներ, հերթ, հաճախորդներ և վերլուծություն</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="icon">
                <f.icon size={20} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
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
              Հաճախորդի էջ · դեմո
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 750, marginBottom: 12 }}>Ինչ է տեսնում հաճախորդը</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '1.05rem' }}>
              Հաճախորդը չի տեսնում գներ կամ բաժանորդագրություն։ Նա ստանում է միայն սրահի ամրագրման էջը՝
              ծառայություն, մասնագետ, ժամ։
            </p>
            <Link to="/book/beauty-house">
              <Button>Բացել հաճախորդի դեմո էջը</Button>
            </Link>
          </div>
          <div className="phone-frame">
            <div className="phone-screen">
              <div style={{ fontWeight: 750, fontSize: '1.1rem' }}>Beauty House</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>⭐ 4.8 · Երևան</div>
              <div style={{ fontWeight: 650, marginBottom: 8, fontSize: '0.85rem' }}>Ծառայություններ</div>
              {[
                ['Մազերի կտրվածք', '8,000 ֏'],
                ['Մատնահարդարում', '7,000 ֏'],
                ['Մազերի ներկում', '18,000 ֏'],
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
              <div style={{ fontWeight: 650, margin: '14px 0 8px', fontSize: '0.85rem' }}>Մասնագետ</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['Աննա', 'Մարիամ', 'Ցանկացած'].map((n, i) => (
                  <span
                    key={n}
                    className={`chip ${i === 0 ? 'active' : ''}`}
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    {n}
                  </span>
                ))}
              </div>
              <div style={{ fontWeight: 650, marginBottom: 8, fontSize: '0.85rem' }}>Ժամեր</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {['17:00', '17:30', '18:00', '18:30'].map((t, i) => (
                  <span key={t} className={`chip ${i === 2 ? 'active' : ''}`} style={{ padding: '6px 10px' }}>
                    {t}
                  </span>
                ))}
              </div>
              <Button block>Ամրագրել</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="section-head">
          <h2>Գներ սրահների համար</h2>
          <p>Հաճախորդները սա չեն տեսնում։ Սա միայն բիզնեսի բաժանորդագրությունն է։</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`price-card ${plan.recommended ? 'recommended' : ''}`}>
              {plan.recommended && <div className="price-badge">Առաջարկվող</div>}
              <div style={{ fontWeight: 750, letterSpacing: '0.04em', fontSize: '0.85rem' }}>{plan.name}</div>
              <div className="price-amount">{plan.price == null ? 'Custom' : formatAMD(plan.price)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {plan.price == null ? 'անհատական գնանշում' : '/ ամիս'}
              </div>
              <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{plan.description}</p>
              <ul className="price-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={16} color="var(--primary)" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant={plan.recommended ? 'primary' : 'secondary'} block>
                  {plan.price == null ? 'Կապվել մեզ հետ' : 'Սկսել'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <span className="brand">QueueFlow</span>
          <div style={{ marginTop: 4 }}>Գործիք սրահների համար · One place for every appointment.</div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/login">Սրահի մուտք</Link>
          <Link to="/register">Միացնել սրահը</Link>
          <Link to="/book/beauty-house">Հաճախորդի դեմո էջ</Link>
        </div>
      </footer>
    </div>
  );
}
