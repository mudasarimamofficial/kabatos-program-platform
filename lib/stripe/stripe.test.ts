import { describe, it, expect, vi, afterEach } from 'vitest'
import Stripe from 'stripe'
import { checkoutInputSchema } from './validation'
import { COMPREX_PLAN, subscriptionHasAccess } from './plan'
import { assertApprovedPrice, getStripe } from './server'

afterEach(() => vi.unstubAllEnvs())
describe('Approved TEST billing contract', () => {
  it('defines exactly USD 499 cents monthly with seven trial days', () => {
    expect(COMPREX_PLAN).toMatchObject({ amount:499,currency:'usd',interval:'month',trialDays:7 })
  })
  it('rejects browser-selected identities, terms and return URLs', () => {
    expect(checkoutInputSchema.safeParse({brandSlug:'comprex'}).success).toBe(true)
    for(const field of ['customerId','subscriptionId','priceId','amount','trialDays','success_url']) {
      expect(checkoutInputSchema.safeParse({brandSlug:'comprex',[field]:'injected'}).success).toBe(false)
    }
  })
  it('grants only unexpired trialing/active access, including scheduled cancellation', () => {
    const end='2030-01-01T00:00:00Z', now=Date.parse('2029-12-31T00:00:00Z')
    for(const status of ['trialing','active']) expect(subscriptionHasAccess(status,end,now)).toBe(true)
    for(const status of ['canceled','unpaid','past_due','paused','incomplete','incomplete_expired']) expect(subscriptionHasAccess(status,end,now)).toBe(false)
    expect(subscriptionHasAccess('trialing',end,Date.parse(end))).toBe(false)
    expect(subscriptionHasAccess('active',null,now)).toBe(false)
  })
  it('rejects LIVE keys before making a request', () => {
    vi.stubEnv('STRIPE_SECRET_KEY',['sk','live','invalid'].join('_'))
    expect(()=>getStripe()).toThrow('TEST')
  })
  it('validates the real price fields rather than trusting a configured ID', () => {
    vi.stubEnv('COMPREX_STRIPE_TEST_PRICE_ID','price_fixture')
    const price={id:'price_fixture',livemode:false,active:true,unit_amount:499,currency:'usd',billing_scheme:'per_unit',recurring:{interval:'month',interval_count:1,usage_type:'licensed'}} as Stripe.Price
    expect(()=>assertApprovedPrice(price)).not.toThrow()
    for(const altered of [{unit_amount:4999},{currency:'eur'},{livemode:true},{recurring:{interval:'day',interval_count:1}}]) expect(()=>assertApprovedPrice({...price,...altered} as Stripe.Price)).toThrow()
  })
  it('requires a valid signature over the exact raw body', () => {
    const stripe=new Stripe(['sk','test','unitfixture'].join('_'))
    const secret='unit-test-signing-secret', payload=JSON.stringify({id:'evt_fixture',object:'event',livemode:false})
    const header=stripe.webhooks.generateTestHeaderString({payload,secret})
    expect(stripe.webhooks.constructEvent(payload,header,secret).id).toBe('evt_fixture')
    expect(()=>stripe.webhooks.constructEvent(payload+' ',header,secret)).toThrow()
    expect(()=>stripe.webhooks.constructEvent(payload,'invalid',secret)).toThrow()
  })
})
