import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import { TODAY } from '../../data/demoData';
import { formatAMD } from '../../utils/format';
import type { AppointmentStatus } from '../../types';
import { useI18n } from '../../i18n/useI18n';

export function AppointmentsPage() {
  const { t } = useI18n();
  const appointments = useAppStore((s) => s.appointments);
  const openModal = useAppStore((s) => s.openAppointmentModal);
  const updateStatus = useAppStore((s) => s.updateAppointmentStatus);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');

  const list = useMemo(() => {
    return appointments
      .filter((a) => filter === 'all' || a.status === filter)
      .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime));
  }, [appointments, filter]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.appts.title')}</h1>
          <p className="page-subtitle">{t('admin.appts.subtitle')}</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={16} /> {t('common.newAppointment')}
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {(
          [
            ['all', t('common.all')],
            ['confirmed', t('status.confirmed')],
            ['waiting', t('status.waiting')],
            ['in_progress', t('status.in_progress')],
            ['completed', t('status.completed')],
            ['cancelled', t('status.cancelled')],
            ['no_show', t('status.no_show')],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={`chip ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('common.date')}</th>
                <th>{t('common.customer')}</th>
                <th>{t('common.service')}</th>
                <th>{t('common.employee')}</th>
                <th>{t('common.channel')}</th>
                <th>{t('common.amount')}</th>
                <th>{t('common.status')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} onClick={() => openModal(a)}>
                  <td>
                    {a.date === TODAY ? t('common.today') : a.date} {a.startTime}
                  </td>
                  <td style={{ fontWeight: 650 }}>{a.customerName}</td>
                  <td>{a.serviceName}</td>
                  <td>{a.employeeName}</td>
                  <td>{t(`channel.${a.channel}`)}</td>
                  <td>{formatAMD(a.price)}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    {a.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          void updateStatus(a.id, 'waiting');
                        }}
                      >
                        {t('admin.appts.toQueue')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
