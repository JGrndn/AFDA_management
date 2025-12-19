import type { PaymentType, ShowStatus } from '@/lib/schemas/enums';
import {
  PAYMENT_TYPES,
  SHOW_STATUSES,
} from '@/lib/schemas/enums';
import {
  translatePaymentType,
  translateShowStatus,
} from '@/lib/i18n/translations';

interface SelectOption<T> {
  value: T;
  label: string;
  color?: string;
}

export function getPaymentTypeOptions(): SelectOption<PaymentType>[] {
  return PAYMENT_TYPES.map(type => ({
    value: type,
    label: translatePaymentType(type),
  }));
}

export function getShowStatusOptions(): SelectOption<ShowStatus>[] {
  return SHOW_STATUSES.map(status => ({
    value: status,
    label: translateShowStatus(status)
  }));
}