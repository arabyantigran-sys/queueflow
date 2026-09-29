import { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { TODAY } from '../../data/demoData';
import type { Appointment } from '../../types';

type View = 'day' | 'week' | 'month';

const hours = Array.from({ length: 13 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`);

export function CalendarPage() {
  const appointments = useAppStore((s) => s.appointments);
  const employees = useAppStore((s) => s.employees);
  const openModal = useAppStore((s) => s.openAppointmentModal);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);

  const [view, setView] = useState<View>('day');
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const dayApts = useMemo(
    () => appointments.filter((a) => a.date === selectedDate && a.status !== 'cancelled'),
    [appointments, selectedDate]
  );

  const weekDates = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];

  const shiftDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Օրացույց</h1>
          <p className="page-subtitle">Աշխատակիցների սյունակներ · բոլոր ալիքների ամրագրումները</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={16} /> Նոր ամրագրում
        </Button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => shiftDate(-1)}>
              <ChevronLeft size={16} />
            </Button>
            <strong>{selectedDate === TODAY ? 'Այսօր' : selectedDate}</strong>
            <Button variant="secondary" size="sm" onClick={() => shiftDate(1)}>
              <ChevronRight size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(TODAY)}>
              Այսօր
            </Button>
          </div>
          <div className="tabs">
            {([
              ['day', 'Օր'],
              ['week', 'Շաբաթ'],
              ['month', 'Ամիս'],
            ] as const).map(([id, label]) => (
              <button key={id} className={`tab ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'day' && (
        <div className="card" style={{ overflow: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `64px repeat(${employees.length}, minmax(160px, 1fr))`,
              minWidth: 600,
            }}
          >
            <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }} />
            {employees.map((e) => (
              <div
                key={e.id}
                style={{
                  padding: 12,
                  borderBottom: '1px solid var(--border)',
                  borderLeft: '1px solid var(--border)',
                  fontWeight: 700,
                  textAlign: 'center',
                  background: 'var(--surface-2)',
                }}
              >
                {e.name}
                <div style={{ fontWeight: 500, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.role}</div>
              </div>
            ))}
            {hours.map((hour) => (
              <div key={`row-${hour}`} style={{ display: 'contents' }}>
                <div
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    height: 72,
                  }}
                >
                  {hour}
                </div>
                {employees.map((e) => {
                  const apt = dayApts.find(
                    (a) => a.employeeId === e.id && a.startTime.startsWith(hour.slice(0, 2))
                  );
                  return (
                    <div
                      key={`${e.id}-${hour}`}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        borderLeft: '1px solid var(--border)',
                        height: 72,
                        padding: 4,
                        position: 'relative',
                      }}
                      onDragOver={(ev) => ev.preventDefault()}
                      onDrop={(ev) => {
                        const id = ev.dataTransfer.getData('aptId');
                        if (id) void updateAppointment(id, { employeeId: e.id, employeeName: e.name, startTime: hour });
                      }}
                    >
                      {apt && (
                        <button
                          type="button"
                          draggable
                          onDragStart={(ev) => ev.dataTransfer.setData('aptId', apt.id)}
                          onClick={() => setSelected(apt)}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: 8,
                            background:
                              apt.status === 'completed'
                                ? 'var(--success-soft)'
                                : apt.status === 'waiting'
                                  ? 'var(--warning-soft)'
                                  : 'var(--primary-soft)',
                            color: 'var(--text)',
                            padding: 8,
                            textAlign: 'left',
                            cursor: 'grab',
                            fontSize: '0.75rem',
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{apt.startTime} {apt.customerName.split(' ')[0]}</div>
                          <div>{apt.serviceName}</div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="card card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {weekDates.map((d) => (
              <div key={d} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10, minHeight: 140 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem' }}>
                  {d === TODAY ? 'Այսօր' : d.slice(5)}
                </div>
                {appointments
                  .filter((a) => a.date === d && a.status !== 'cancelled')
                  .slice(0, 4)
                  .map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelected(a)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        background: 'var(--primary-soft)',
                        borderRadius: 6,
                        padding: '4px 6px',
                        marginBottom: 4,
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      {a.startTime} {a.customerName.split(' ')[0]}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'month' && (
        <div className="card card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուր', 'Շբթ', 'Կիր'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontWeight: 650, fontSize: '0.8rem', color: 'var(--text-muted)', padding: 8 }}>
                {d}
              </div>
            ))}
            {Array.from({ length: 30 }, (_, i) => {
              const day = String(i + 1).padStart(2, '0');
              const date = `2026-09-${day}`;
              const count = appointments.filter((a) => a.date === date).length;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    if (i + 1 <= 30) {
                      setSelectedDate(i + 1 <= 28 ? date : `2026-09-28`);
                      setView('day');
                    }
                  }}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 10,
                    minHeight: 64,
                    background: date === selectedDate ? 'var(--primary-soft)' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 650 }}>{i + 1}</div>
                  {count > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: 4 }}>{count} այց</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Ամրագրում"
        footer={
          selected && (
            <>
              <Button variant="danger" onClick={() => { void cancelAppointment(selected.id); setSelected(null); }}>
                Չեղարկել
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  openModal(selected);
                  setSelected(null);
                }}
              >
                Խմբագրել
              </Button>
              <Button
                onClick={() => {
                  void updateAppointment(selected.id, {
                    date: '2026-09-29',
                    startTime: selected.startTime,
                  });
                  setSelected(null);
                }}
              >
                Տեղափոխել վաղը
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <strong>{selected.customerName}</strong> · {selected.customerPhone}
            </div>
            <div>
              {selected.serviceName} · {selected.employeeName}
            </div>
            <div>
              {selected.date} · {selected.startTime}–{selected.endTime}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Քաշեք օրացույցում՝ վերանշանակելու համար (drag & drop)
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
