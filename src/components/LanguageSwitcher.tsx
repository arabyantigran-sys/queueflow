import { useEffect, useRef, useState } from 'react';
import { languages, type Lang } from '../i18n/types';
import { useI18n } from '../i18n/useI18n';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === lang)!;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (code: Lang) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('lang.label')}
        style={{ gap: 6, minWidth: compact ? undefined : 120 }}
      >
        <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{current.flag}</span>
        {!compact && <span>{current.label}</span>}
        <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>▾</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            minWidth: 160,
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pick(l.code)}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                border: 'none',
                background: l.code === lang ? 'var(--primary-soft)' : '#fff',
                cursor: 'pointer',
                fontWeight: l.code === lang ? 700 : 500,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
