import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TODAY } from '../../data/demoData';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Channel } from '../../types';
import { timeSlots } from '../../data/demoData';

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'phone', label: 'Հեռախոս' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Կայք' },
  { value: 'qr', label: 'QR' },
  { value: 'queueflow', label: 'QueueFlow' },
];

export function AppointmentModal() {
  const open = useAppStore((s) => s.appointmentModalOpen);
  const editing = useAppStore((s) => s.editingAppointment);
  const close = useAppStore((s) => s.closeAppointmentModal);
  const createAppointment = useAppStore((s) => s.createAppointment);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const services = useAppStore((s) => s.services);
  const employees = useAppStore((s) => s.employees);
  const business = useAppStore((s) => s.business);
  const customers = useAppStore((s) => s.customers);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(TODAY);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [channel, setChannel] = useState<Channel>('phone');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setCustomerName(editing.customerName);
      setCustomerPhone(editing.customerPhone);
      setServiceId(editing.serviceId);
      setEmployeeId(editing.employeeId);
      setDate(editing.date);
      setTime(editing.startTime);
      setNotes(editing.notes ?? '');
      setChannel(editing.channel);
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setServiceId(services[0]?.id ?? '');
      setEmployeeId(employees[0]?.id ?? '');
      setDate(TODAY);
      setTime('10:00');
      setNotes('');
      setChannel('phone');
    }
  }, [open, editing, services, employees]);

  const service = services.find((s) => s.id === serviceId);
  const employee = employees.find((e) => e.id === employeeId);

  const onPickCustomer = (id: string) => {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
  };

  const handleSave = async () => {
    if (!customerName || !customerPhone || !service || !employee) return;
    setSaving(true);
    const duration = service.duration;
    const [h, m] = time.split(':').map(Number);
    const endM = h * 60 + m + duration;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;

    try {
      if (editing) {
        await updateAppointment(editing.id, {
          customerName,
          customerPhone,
          serviceId: service.id,
          serviceName: service.nameHy,
          employeeId: employee.id,
          employeeName: employee.name,
          date,
          startTime: time,
          endTime,
          notes,
          channel,
          price: service.price,
        });
      } else {
        await createAppointment({
          businessId: business.id,
          customerId: '',
          customerName,
          customerPhone,
          serviceId: service.id,
          serviceName: service.nameHy,
          employeeId: employee.id,
          employeeName: employee.name,
          date,
          startTime: time,
          endTime,
          status: channel === 'walk_in' ? 'waiting' : 'confirmed',
          channel,
          notes,
          price: service.price,
          waitingMinutes: channel === 'walk_in' ? 0 : undefined,
        });
      }
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? 'Խմբագրել ամրագրումը' : 'Նոր ամրագրում'}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Փակել
          </Button>
          <Button onClick={handleSave} disabled={saving || !customerName || !customerPhone}>
            {saving ? 'Պահպանում...' : 'Պահպանել'}
          </Button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Գոյություն ունեցող հաճախորդ</label>
        <select className="form-select" defaultValue="" onChange={(e) => onPickCustomer(e.target.value)}>
          <option value="">— Ընտրել կամ լրացնել նոր —</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.phone}
            </option>
          ))}
        </select>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Անուն</label>
          <input className="form-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Օր. Անի Հակոբյան" />
        </div>
        <div className="form-group">
          <label className="form-label">Հեռախոս</label>
          <input className="form-input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="091 123 456" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Ալիք</label>
        <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
          {channelOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Հեռախոս, Instagram կամ walk-in — բոլորը մեկ օրացույցում
        </p>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Ծառայություն</label>
          <select className="form-select" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameHy} — {s.price.toLocaleString('hy-AM')} ֏
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Աշխատակից</label>
          <select className="form-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {e.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Ամսաթիվ</label>
          <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Ժամ</label>
          <select className="form-select" value={time} onChange={(e) => setTime(e.target.value)}>
            {timeSlots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Նշումներ</label>
        <textarea className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Լրացուցիչ տեղեկություն..." />
      </div>
    </Modal>
  );
}
