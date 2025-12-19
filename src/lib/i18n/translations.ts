import type { PaymentStatus, PaymentType, MembershipStatus, ShowStatus } from '@/lib/schemas/enums';

// Payment Status
export const PAYMENT_STATUS_TRANSLATIONS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  cashed: 'Encaissé',
  cancelled: 'Annulé',
};

// Payment Type
export const PAYMENT_TYPE_TRANSLATIONS: Record<PaymentType, string> = {
  cash: 'Espèces',
  check: 'Chèque',
  transfer: 'Virement',
};

// Membership Status
export const MEMBERSHIP_STATUS_TRANSLATIONS: Record<MembershipStatus, string> = {
  pending: 'En attente',
  validated: 'Validé',
  cancelled: 'Annulé',
};
// Show Status
export const SHOW_STATUS_TRANSLATIONS: Record<ShowStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  cancelled: 'Annulé',
};

// Helper générique pour traduire
export function translate<T extends string>(
  value: T,
  translations: Record<T, string>,
): string {
  return translations[value] || value;
}

// Helpers spécifiques
export const translatePaymentStatus = (status: PaymentStatus) =>
  translate(status, PAYMENT_STATUS_TRANSLATIONS);

export const translatePaymentType = (type: PaymentType) =>
  translate(type, PAYMENT_TYPE_TRANSLATIONS);

export const translateMembershipStatus = (status: MembershipStatus) =>
  translate(status, MEMBERSHIP_STATUS_TRANSLATIONS);

export const translateShowStatus = (status: ShowStatus) =>
  translate(status, SHOW_STATUS_TRANSLATIONS);