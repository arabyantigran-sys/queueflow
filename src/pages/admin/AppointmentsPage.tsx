import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store/useAppStore';
import { TODAY, channelLabels } from '../../data/demoData';
import { formatAMD } from '../../utils/format';
import type { AppointmentStatus } from '../../types';

export function AppointmentsPage() {
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
          <h1 className="page-title">Ամրագրումներ</h1>
          <p className="page-subtitle">Բոլոր ալիքներից եկող ամրագրումները</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={16} /> Նոր ամրագրում
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {(
          [
            ['all', 'Բոլորը'],
            ['confirmed', 'Հաստատված'],
            ['waiting', 'Սպասում'],
            ['in_progress', 'Ընթացքում'],
            ['completed', 'Ավարտված'],
            ['cancelled', 'Չեղարկված'],
            ['no_show', 'No-show'],
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
                <th>Ամսաթիվ</th>
                <th>Հաճախորդ</th>
                <th>Ծառայություն</th>
                <th>Աշխատակից</th>
                <th>Ալիք</th>
                <th>Գումար</th>
                <th>Կարգավիճակ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} onClick={() => openModal(a)}>
                  <td>
                    {a.date === TODAY ? 'Այսօր' : a.date} {a.startTime}
                  </td>
                  <td style={{ fontWeight: 650 }}>{a.customerName}</td>
                  <td>{a.serviceName}</td>
                  <td>{a.employeeName}</td>
                  <td>{channelLabels[a.channel]}</td>
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
                        Հերթ
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
