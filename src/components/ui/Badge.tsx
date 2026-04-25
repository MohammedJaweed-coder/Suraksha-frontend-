import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import type { IncidentStatus } from '../../types';

const styles: Record<IncidentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CRITICAL: 'bg-red-100 text-red-800'
};

export function Badge({ status }: { status: IncidentStatus }): JSX.Element {
  const { t } = useTranslation();

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${styles[status]}`}>
      {status === 'RESOLVED' && <Check size={14} />}
      {t(`status.${status}`)}
    </span>
  );
}
