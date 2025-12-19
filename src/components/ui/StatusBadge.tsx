import type { PaymentStatus, MembershipStatus, ShowStatus } from '@/lib/schemas/enums';
import {
  translatePaymentStatus,
  translateMembershipStatus,
  translateShowStatus,
} from '@/lib/i18n/translations';

type StatusType = PaymentStatus | MembershipStatus | ShowStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  type?: 'payment' | 'membership' | 'show' | 'generic';
  className?: string;
}

const COLOR_CLASSES = {
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
} as const;

const MEMBERSHIP_STATUS_COLORS: Record<MembershipStatus, string> = {
  pending: 'yellow',
  validated: 'green',
  cancelled: 'red',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'yellow',
  cashed: 'green',
  cancelled: 'red',
};

export const SHOW_STATUS_COLORS: Record<ShowStatus, string> = {
  pending: 'yellow',
  paid: 'green',
  cancelled: 'red',
};

export function StatusBadge({ 
  status, 
  type = 'generic',
  className = '' 
}: StatusBadgeProps) {
  let label = status;
  let colorClass = 'gray';
  
  // Traduire selon le type
  if (type === 'payment') {
    label = translatePaymentStatus(status as PaymentStatus);
    colorClass = PAYMENT_STATUS_COLORS[status as PaymentStatus] || colorClass;
  } else if (type === 'membership') {
    label = translateMembershipStatus(status as MembershipStatus);
    colorClass = MEMBERSHIP_STATUS_COLORS[status as MembershipStatus] || colorClass;
  } else if (type === 'show') {
    label = translateShowStatus(status as ShowStatus);
    colorClass = SHOW_STATUS_COLORS[status as ShowStatus] || colorClass;
  }
  colorClass = COLOR_CLASSES[colorClass];
  
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass} ${className}`}>
      {label}
    </span>
  );
}