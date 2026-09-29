import type { AppointmentStatus, CustomerStatus } from '../../types';
import { useI18n } from '../../i18n/useI18n';

export function StatusBadge({ status }: { status: AppointmentStatus | CustomerStatus }) {
  const { t } = useI18n();
  return <span className={`badge badge-${status}`}>{t(`status.${status}`)}</span>;
}
