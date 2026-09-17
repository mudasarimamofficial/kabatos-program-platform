/** Client-approved tracking service terms. Physical products are sold separately. */
export const COMPREX_PLAN = Object.freeze({
  brandSlug: 'comprex', name: 'Kabatos / COMPREX Tracking Service',
  amount: 499, currency: 'usd', interval: 'month', trialDays: 7,
  priceLabel: '$4.99/month', trialLabel: '7-day free trial',
})
export type SubscriptionState = {
  required: boolean; status: string | null; access: boolean;
  trial_start: string | null; trial_end: string | null;
  current_period_start: string | null; current_period_end: string | null;
  cancel_at_period_end: boolean; canceled_at: string | null;
}
export function subscriptionHasAccess(status: string, end: string | null, now = Date.now()) {
  return ['trialing', 'active'].includes(status) && Boolean(end && Date.parse(end) > now)
}
