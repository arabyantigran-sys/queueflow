import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { formatAMD } from '../../utils/format';
import { useI18n } from '../../i18n/useI18n';

export function QRPage() {
  const { t } = useI18n();
  const business = useAppStore((s) => s.business);
  const services = useAppStore((s) => s.services);
  const showToast = useAppStore((s) => s.showToast);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const link = `${window.location.origin}/book/${business.slug}`;

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      showToast(t('admin.qr.notReady'));
      return;
    }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.slug}-booking-qr.png`;
    a.click();
    showToast(t('admin.qr.downloaded'));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.qr.title')}</h1>
          <p className="page-subtitle">
            {t('admin.qr.subtitle')}{' '}
            <strong>/book/{business.slug}</strong>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="qr-grid">
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 236,
              margin: '0 auto 20px',
              padding: 16,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 16,
              display: 'inline-flex',
              justifyContent: 'center',
            }}
          >
            <QRCodeSVG value={link} size={200} level="M" includeMargin bgColor="#ffffff" fgColor="#0f172a" />
            <div style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden>
              <QRCodeCanvas
                value={link}
                size={512}
                level="M"
                includeMargin
                bgColor="#ffffff"
                fgColor="#0f172a"
                ref={canvasRef}
              />
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.9rem' }}>
            {t('admin.qr.scanOpens')} <strong>{business.name}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.8rem' }}>
            {t('admin.qr.tryCamera')}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={downloadQr}>
              <Download size={16} /> {t('admin.qr.download')}
            </Button>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                } catch {
                  /* ignore */
                }
                showToast(t('admin.qr.linkCopied'));
              }}
            >
              <Copy size={16} /> {t('admin.qr.copyLink')}
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
            <h2 className="card-title">{t('admin.qr.preview')}</h2>
            <Link to={`/book/${business.slug}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink size={14} /> {t('admin.qr.open')}
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
            {(services.length ? services.slice(0, 3) : []).map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  marginBottom: 8,
                  fontSize: '0.875rem',
                  background: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{s.nameHy}</span>
                <strong>{formatAMD(s.price)}</strong>
              </div>
            ))}
            <Link to={`/book/${business.slug}`}>
              <Button block size="sm" style={{ marginTop: 8 }}>
                {t('admin.qr.book')}
              </Button>
            </Link>
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
