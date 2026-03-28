import type { SubmissionItemStatus } from '../../types'
import { STATUS_LABELS } from '../../types'

const STATUS_COLORS: Record<SubmissionItemStatus, { bg: string; color: string }> = {
  PENDING:   { bg: '#fef9c3', color: '#854d0e' },
  APPROVED:  { bg: '#dcfce7', color: '#166534' },
  REJECTED:  { bg: '#fee2e2', color: '#991b1b' },
  IN_STORE:  { bg: '#dbeafe', color: '#1e40af' },
  SOLD:      { bg: '#f3f4f6', color: '#374151' },
  RETURNED:  { bg: '#ffedd5', color: '#9a3412' },
}

export function StatusBadge({ status }: { status: SubmissionItemStatus }) {
  const { bg, color } = STATUS_COLORS[status]
  return (
    <span style={{ background: bg, color, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {STATUS_LABELS[status]}
    </span>
  )
}
