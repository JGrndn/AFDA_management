import { z } from 'zod';

// Payment Status
export const PaymentStatusSchema = z.enum(['pending', 'cashed', 'cancelled']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// Payment Type
export const PaymentTypeSchema = z.enum(['cash', 'check', 'transfer']);
export type PaymentType = z.infer<typeof PaymentTypeSchema>;

// Membership Status
export const MembershipStatusSchema = z.enum(['pending', 'validated', 'cancelled']);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

// Show Status
export const ShowStatusSchema = z.enum([
  'pending', 'paid', 'cancelled'
]);
export type ShowStatus = z.infer<typeof ShowStatusSchema>;

// Helpers pour obtenir toutes les valeurs (utile pour les selects)
export const PAYMENT_STATUSES = PaymentStatusSchema.options;
export const PAYMENT_TYPES = PaymentTypeSchema.options;
export const MEMBERSHIP_STATUSES = MembershipStatusSchema.options;
export const SHOW_STATUSES = ShowStatusSchema.options;