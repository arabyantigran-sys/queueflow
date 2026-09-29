import { Link } from 'react-router-dom';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';

export function QRPage() {
  const business = useAppStore((s) => s.business);
  const showToast = useAppStore((s) => s.showToast);
  const link = `${window.location.origin}/book/${business.slug}`;

  // Simple SVG QR-like pattern for demo (not a real QR encoder)
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    const finder =
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const data = ((x * 7 + y * 3 + business.name.length) % 5) > 1;
    return finder || data;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ձեր QR Booking</h1>
          <p className="page-subtitle">Տեղադրեք այս QR կոդը ձեր սրահում, Instagram-ում կամ այցեքարտի վրա։</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="qr-grid">
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 220,
              height: 220,
              margin: '0 auto 20px',
              padding: 16,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(21, 1fr)',
              gap: 1,
            }}
            aria-label="QR Code"
          >
            {cells.map((on, i) => (
              <div key={i} style={{ background: on ? '#0f172a' : '#fff', borderRadius: 0.5 }} />
            ))}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
            Սքանավորելով հաճախորդը կբացի ամրագրման էջը
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              onClick={() => showToast('QR-ը ներբեռնված է (դեմո)')}
            >
              <Download size={16} /> Ներբեռնել QR
            </Button>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                } catch {
                  /* ignore */
                }
                showToast('Հղումը պատճենված է');
              }}
            >
              <Copy size={16} /> Copy booking link
            </Button>
          </div>
          <code
            style={{
              display: 'block',
              marginTop: 16,
              padding: 12,
              background: 'var(--surface-2)',
              borderRadius: 10,
              fontSize: '0.8rem',
              wordBreak: 'break-all',
            }}
          >
            {link}
          </code>
        </div>

        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="card-title">Ամրագրման էջի նախադիտում</h2>
            <Link to={`/book/${business.slug}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink size={14} /> Բացել
              </Button>
            </Link>
          </div>
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 20,
              background: 'linear-gradient(180deg, #f0fdfa, #fff)',
              maxWidth: 320,
              margin: '0 auto',
            }}
          >
            <div style={{ fontWeight: 750, fontSize: '1.15rem' }}>{business.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '6px 0 14px' }}>
              ⭐ {business.rating} · {business.city}
            </div>
            {['Մազերի կտրվածք — 8,000 ֏', 'Մատնահարդարում — 7,000 ֏', 'Մազերի ներկում — 18,000 ֏'].map((s) => (
              <div
                key={s}
                style={{
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  marginBottom: 8,
                  fontSize: '0.875rem',
                  background: '#fff',
                }}
              >
                {s}
              </div>
            ))}
            <Button block size="sm" style={{ marginTop: 8 }}>
              Ամրագրել
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .qr-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
