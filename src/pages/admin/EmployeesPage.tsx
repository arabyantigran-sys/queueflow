import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { formatAMD } from '../../utils/format';

export function EmployeesPage() {
  const employees = useAppStore((s) => s.employees);
  const services = useAppStore((s) => s.services);
  const addEmployee = useAppStore((s) => s.addEmployee);
  const deleteEmployee = useAppStore((s) => s.deleteEmployee);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('09:00 – 18:00');
  const [detailId, setDetailId] = useState<string | null>(null);

  const detail = employees.find((e) => e.id === detailId);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Աշխատակիցներ</h1>
          <p className="page-subtitle">{employees.length} մասնագետ</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Ավելացնել աշխատակից
        </Button>
      </div>

      <div className="grid-3">
        {employees.map((e) => (
          <button
            key={e.id}
            type="button"
            className="card card-pad"
            style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }}
            onClick={() => setDetailId(e.id)}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #0f766e, #5eead4)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 750,
                  fontSize: '1.1rem',
                }}
              >
                {e.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 750, fontSize: '1.05rem' }}>{e.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{e.role}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>Ժամեր: <strong style={{ color: 'var(--text)' }}>{e.workingHours}</strong></div>
              <div>Այսօր: <strong style={{ color: 'var(--text)' }}>{e.appointmentsToday} այց</strong></div>
              <div>Եկամուտ: <strong style={{ color: 'var(--text)' }}>{formatAMD(e.revenue)}</strong></div>
              <div>Վարկանիշ: <strong style={{ color: 'var(--text)' }}>⭐ {e.rating}</strong></div>
            </div>
          </button>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Նոր աշխատակից"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Փակել
            </Button>
            <Button
              onClick={async () => {
                if (!name) return;
                await addEmployee({ name, role: role || 'Մասնագետ', phone: phone || '091 000 000', workingHours: hours });
                setOpen(false);
                setName('');
                setRole('');
              }}
            >
              Պահպանել
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Անուն</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Դեր</label>
          <input className="form-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Վարսահարդար" />
        </div>
        <div className="form-group">
          <label className="form-label">Հեռախոս</label>
          <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="091 123 456" />
        </div>
        <div className="form-group">
          <label className="form-label">Աշխատանքային ժամեր</label>
          <input className="form-input" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={!!detail}
        onClose={() => setDetailId(null)}
        title={detail?.name ?? ''}
        footer={
          detail && (
            <Button
              variant="danger"
              onClick={async () => {
                await deleteEmployee(detail.id);
                setDetailId(null);
              }}
            >
              <Trash2 size={16} /> Հեռացնել
            </Button>
          )
        }
      >
        {detail && (
          <>
            <p style={{ marginBottom: 12 }}>
              <strong>{detail.role}</strong> · {detail.phone}
            </p>
            <p style={{ marginBottom: 8, color: 'var(--text-secondary)' }}>Աշխատանքային ժամեր: {detail.workingHours}</p>
            <h4 style={{ marginBottom: 8 }}>Ծառայություններ</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {services
                .filter((s) => detail.services.includes(s.id) || detail.services.length === 0)
                .map((s) => (
                  <span key={s.id} className="chip" style={{ cursor: 'default' }}>
                    {s.nameHy}
                  </span>
                ))}
            </div>
            <div className="grid-2" style={{ marginTop: 16 }}>
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{detail.appointmentsToday}</div>
                <div className="stat-label">Այսօրվա այցեր</div>
              </div>
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{formatAMD(detail.revenue)}</div>
                <div className="stat-label">Արդյունավետություն</div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
