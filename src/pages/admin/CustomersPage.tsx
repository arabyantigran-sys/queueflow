import { useMemo, useState } from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { formatAMD, averageVisitValue } from '../../utils/format';
import type { CustomerStatus } from '../../types';
import { useI18n } from '../../i18n/useI18n';

export function CustomersPage() {
  const { t } = useI18n();
  const customers = useAppStore((s) => s.customers);
  const appointments = useAppStore((s) => s.appointments);
  const selectedId = useAppStore((s) => s.selectedCustomerId);
  const selectCustomer = useAppStore((s) => s.selectCustomer);
  const showToast = useAppStore((s) => s.showToast);
  const openModal = useAppStore((s) => s.openAppointmentModal);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | CustomerStatus>('all');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchQ =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query);
      const matchF = filter === 'all' || c.status === filter;
      return matchQ && matchF;
    });
  }, [customers, query, filter]);

  const selected = customers.find((c) => c.id === selectedId);
  const history = appointments
    .filter((a) => a.customerPhone === selected?.phone || a.customerId === selected?.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.cust.title')}</h1>
          <p className="page-subtitle">
            {customers.length} {t('admin.cust.inDatabase')}
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={16} /> {t('admin.cust.newVisit')}
        </Button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              placeholder={t('admin.cust.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              ['all', t('common.all')],
              ['active', t('status.active')],
              ['inactive', t('status.inactive')],
              ['no_show', t('status.no_show')],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" className={`chip ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('common.phone')}</th>
                <th>{t('admin.cust.lastVisit')}</th>
                <th>{t('admin.cust.visits')}</th>
                <th>{t('admin.cust.spent')}</th>
                <th>{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => selectCustomer(c.id)}>
                  <td style={{ fontWeight: 650 }}>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.lastVisit === '2026-09-28' ? t('common.today') : c.lastVisit}</td>
                  <td>
                    {c.totalVisits} {t('common.visits')}
                  </td>
                  <td>{formatAMD(c.totalSpent)}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => selectCustomer(null)}
        title={selected?.name ?? ''}
        wide
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={() => showToast(t('admin.cust.reminderSent'))}>
                <Bell size={16} /> {t('admin.cust.sendReminder')}
              </Button>
              <Button
                onClick={() => {
                  openModal();
                  selectCustomer(null);
                }}
              >
                {t('common.newAppointment')}
              </Button>
            </>
          )
        }
      >
        {selected && (
          <>
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <div>
                <div className="stat-label">{t('common.phone')}</div>
                <div style={{ fontWeight: 650 }}>{selected.phone}</div>
              </div>
              <div>
                <div className="stat-label">{t('admin.cust.birthday')}</div>
                <div style={{ fontWeight: 650 }}>{selected.birthday ?? '—'}</div>
              </div>
              <div>
                <div className="stat-label">{t('admin.cust.nextVisit')}</div>
                <div style={{ fontWeight: 650 }}>{selected.nextVisit ?? '—'}</div>
              </div>
            </div>
            {selected.notes && (
              <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('admin.cust.notes')}: {selected.notes}
              </p>
            )}
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div className="stat-value" style={{ fontSize: '1.35rem' }}>{selected.totalVisits}</div>
                <div className="stat-label">{t('admin.cust.totalVisits')}</div>
              </div>
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div className="stat-value" style={{ fontSize: '1.35rem' }}>{formatAMD(selected.totalSpent)}</div>
                <div className="stat-label">{t('admin.cust.totalSpent')}</div>
              </div>
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div className="stat-value" style={{ fontSize: '1.35rem' }}>
                  {formatAMD(averageVisitValue(selected.totalSpent, selected.totalVisits))}
                </div>
                <div className="stat-label">{t('admin.cust.avgVisit')}</div>
              </div>
            </div>
            <h3 style={{ marginBottom: 10, fontSize: '0.95rem' }}>{t('admin.cust.history')}</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('common.date')}</th>
                    <th>{t('common.service')}</th>
                    <th>{t('common.employee')}</th>
                    <th>{t('common.amount')}</th>
                    <th>{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((a) => (
                    <tr key={a.id} style={{ cursor: 'default' }}>
                      <td>
                        {a.date} {a.startTime}
                      </td>
                      <td>{a.serviceName}</td>
                      <td>{a.employeeName}</td>
                      <td>{formatAMD(a.price)}</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
