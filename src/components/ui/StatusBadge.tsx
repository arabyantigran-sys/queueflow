import { statusLabels } from '../../data/demoData';
import type { AppointmentStatus, CustomerStatus } from '../../types';

export function StatusBadge({ status }: { status: AppointmentStatus | CustomerStatus }) {
  return <span className={`badge badge-${status}`}>{statusLabels[status] ?? status}</span>;
}
