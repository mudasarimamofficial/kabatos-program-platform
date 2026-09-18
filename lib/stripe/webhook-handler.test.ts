import { describe,it,expect,vi,beforeEach } from 'vitest'
import type Stripe from 'stripe'
import { reconcileStripeEvent } from './reconcile'
import { cancelCustomerSubscription } from './customer'

const sub = (status='trialing') => ({id:'sub_fixture',object:'subscription',customer:'cus_fixture',livemode:false,status,
  metadata:{brandSlug:'comprex',attemptId:'attempt'},trial_start:100,trial_end:604900,canceled_at:null,cancel_at_period_end:false,
  items:{data:[{quantity:1,current_period_start:100,current_period_end:604900,price:{id:'price_fixture',livemode:false,active:true,
    unit_amount:499,currency:'usd',billing_scheme:'per_unit',recurring:{interval:'month',interval_count:1,usage_type:'licensed'}}}]}})
function fixture(status='trialing') {
  const processed=new Set<string>(), calls:Array<{name:string,args:any}>=[]
  const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{program_id:'program',brand_id:'brand',stripe_customer_id:'cus_fixture'},error:null})})})}),
    rpc:vi.fn(async(name:string,args:any)=>{calls.push({name,args});
      if(name==='stripe_register_event')return {data:{status:processed.has(args.p_event_id)?'processed':'pending'}}
      if(name==='stripe_claim_reconcile')return {data:{fence:1}}
      if(name==='stripe_reconcile_subscription_v2'){processed.add(args.p_event_id);return {data:{program_status:'active',subscription_status:args.p_status}}}
      if(name==='stripe_customer_subscription_context')return {data:{program_id:'program',brand_id:'brand',stripe_subscription_id:'sub_fixture',stripe_customer_id:'cus_fixture'}}
      return {data:{}}
    })}
  const stripe={subscriptions:{retrieve:vi.fn(async()=>sub(status)),update:vi.fn(async()=>({...sub(status),cancel_at_period_end:true}))}}
  return {db,stripe,calls}
}
beforeEach(()=>vi.stubEnv('COMPREX_STRIPE_TEST_PRICE_ID','price_fixture'))
describe('Durable webhook orchestration',()=>{
  for(const type of ['checkout.session.completed','customer.subscription.created','customer.subscription.updated','invoice.paid','invoice.payment_succeeded']) {
    it(`${type}: replay uses durable event record and never runs activation twice`,async()=>{
      const f=fixture(), object=type.startsWith('invoice')?{object:'invoice',id:'in_fixture',parent:{subscription_details:{subscription:'sub_fixture'}}}:type.startsWith('checkout')?{object:'checkout.session',id:'cs_test_fixture',subscription:'sub_fixture'}:sub()
      const event={id:'evt_fixture',type,created:100,livemode:false,data:{object}} as Stripe.Event
      await reconcileStripeEvent(event,f.stripe as any,f.db as any)
      expect((await reconcileStripeEvent(event,f.stripe as any,f.db as any)).status).toBe('duplicate_ignored')
      expect(f.calls.filter(c=>c.name==='stripe_reconcile_subscription_v2')).toHaveLength(1)
      expect(f.calls.find(c=>c.name==='stripe_reconcile_subscription_v2')?.args).toMatchObject({p_status:'trialing',p_cancel_at_period_end:false})
    })
  }
  for(const [type,status] of [['invoice.payment_failed','past_due'],['customer.subscription.deleted','canceled']]) {
    it(`${type}: persists current provider state and releases lease`,async()=>{
      const f=fixture(status),object=type.startsWith('invoice')?{object:'invoice',id:'in_fixture',parent:{subscription_details:{subscription:'sub_fixture'}}}:sub(status)
      await reconcileStripeEvent({id:'evt_fixture',type,created:100,livemode:false,data:{object}} as Stripe.Event,f.stripe as any,f.db as any)
      expect(f.calls.find(c=>c.name==='stripe_reconcile_subscription_v2')?.args.p_status).toBe(status)
      expect(f.calls.at(-1)?.name).toBe('stripe_release_reconcile')
    })
  }
  it('cancellation uses only the capability-owned subscription and persists period-end intent',async()=>{
    const f=fixture();await cancelCustomerSubscription('comprex','capability',f.stripe as any,f.db as any)
    expect(f.stripe.subscriptions.update).toHaveBeenCalledWith('sub_fixture',{cancel_at_period_end:true},{idempotencyKey:'kabatos-cancel-sub_fixture'})
    expect(f.calls.some(c=>c.name==='stripe_persist_cancellation')).toBe(true)
  })
  it('denied capability cannot cause any Stripe cancellation',async()=>{
    const f=fixture();f.db.rpc.mockResolvedValueOnce({error:{message:'invalid access'}} as any)
    await expect(cancelCustomerSubscription('demo-wellness','wrong-capability',f.stripe as any,f.db as any)).rejects.toThrow()
    expect(f.stripe.subscriptions.update).not.toHaveBeenCalled()
  })
  it('database failure is retryable and never acknowledged as processed',async()=>{
    const f=fixture();f.db.rpc.mockResolvedValueOnce({error:{message:'offline'}} as any)
    await expect(reconcileStripeEvent({id:'evt_fixture',type:'customer.subscription.updated',created:100,livemode:false,data:{object:sub()}} as unknown as Stripe.Event,f.stripe as any,f.db as any)).rejects.toThrow()
  })
})
