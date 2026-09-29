import { useState } from 'react';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { formatAMD } from '../../utils/format';
import { useI18n } from '../../i18n/useI18n';

export function ServicesPage() {
  const { t } = useI18n();
  const services = useAppStore((s) => s.services);
  const addService = useAppStore((s) => s.addService);
  const updateService = useAppStore((s) => s.updateService);
  const deleteService = useAppStore((s) => s.deleteService);
  const duplicateService = useAppStore((s) => s.duplicateService);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nameHy, setNameHy] = useState('');
  const [price, setPrice] = useState('8000');
  const [duration, setDuration] = useState('45');

  const editing = services.find((s) => s.id === editId);

  const openCreate = () => {
    setEditId(null);
    setNameHy('');
    setPrice('8000');
    setDuration('45');
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setEditId(id);
    setNameHy(s.nameHy);
    setPrice(String(s.price));
    setDuration(String(s.duration));
    setOpen(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.svc.title')}</h1>
          <p className="page-subtitle">{t('admin.svc.subtitle')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> {t('admin.svc.add')}
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {services.map((s) => (
          <div
            key={s.id}
            className="card card-pad"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            <div>
              <div style={{ fontWeight: 750, fontSize: '1.05rem' }}>{s.nameHy}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                {formatAMD(s.price)} · {s.duration} {t('common.minutes')}
                {s.description ? ` · ${s.description}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => openEdit(s.id)}>
                <Pencil size={14} /> {t('common.edit')}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => void duplicateService(s.id)}>
                <Copy size={14} /> {t('common.duplicate')}
              </Button>
              <Button variant="danger" size="sm" onClick={() => void deleteService(s.id)}>
                <Trash2 size={14} /> {t('common.delete')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t('admin.svc.editTitle') : t('admin.svc.newTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('common.close')}
            </Button>
            <Button
              onClick={async () => {
                if (!nameHy) return;
                if (editId) {
                  await updateService(editId, {
                    nameHy,
                    name: nameHy,
                    price: Number(price) || 0,
                    duration: Number(duration) || 30,
                  });
                } else {
                  await addService({
                    nameHy,
                    name: nameHy,
                    price: Number(price) || 0,
                    duration: Number(duration) || 30,
                  });
                }
                setOpen(false);
              }}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">{t('common.name')}</label>
          <input className="form-input" value={nameHy} onChange={(e) => setNameHy(e.target.value)} />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">{t('admin.svc.price')}</label>
            <input className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.svc.duration')}</label>
            <input className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
