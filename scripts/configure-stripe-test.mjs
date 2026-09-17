// Run: node --env-file=.env.local scripts/configure-stripe-test.mjs
// Uses existing TEST credentials; never prints secrets. Only COMPREX current config is versioned.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { COMPREX_PLAN as plan } from '../lib/stripe/plan.ts'
assert.match(process.env.STRIPE_SECRET_KEY || '', /^(sk|rk)_test_/)
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,'finbvtwjddrmbuuuyeni.supabase.co')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const products = await stripe.products.list({ active: true, limit: 100 })
let product = products.data.find(p => p.metadata.kabatos_plan === 'comprex-tracking-v1')
if (!product) product = await stripe.products.create({ name: plan.name, metadata: { kabatos_plan: 'comprex-tracking-v1' } }, { idempotencyKey:'kabatos-comprex-tracking-product-v1' })
assert.equal(product.livemode,false)
const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 })
let price = prices.data.find(p => p.unit_amount===plan.amount && p.currency===plan.currency && p.recurring?.interval===plan.interval && p.recurring.interval_count===1)
assert(prices.data.length===0 || (prices.data.length===1 && price), 'Review existing plan prices before changing configuration')
if (!price) price = await stripe.prices.create({ product:product.id, unit_amount:plan.amount,currency:plan.currency,recurring:{interval:plan.interval},lookup_key:'kabatos_comprex_tracking_usd_month_v1' }, { idempotencyKey:'kabatos-comprex-tracking-price-v1' })
assert.equal(price.livemode,false)
let env=fs.readFileSync('.env.local','utf8')
const key='COMPREX_STRIPE_TEST_PRICE_ID'
env=new RegExp(`^${key}=.*$`,'m').test(env)?env.replace(new RegExp(`^${key}=.*$`,'m'),`${key}=${price.id}`):`${env}\n${key}=${price.id}\n`
fs.writeFileSync('.env.local',env)
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}})
const check=r=>{if(r.error)throw new Error(r.error.message);return r.data}
check(await admin.auth.signInWithPassword({email:process.env.DEV_ADMIN_EMAIL,password:process.env.DEV_ADMIN_PASSWORD}))
const brands=check(await admin.rpc('admin_brand_list',{}))
const b=brands.find(b=>b.slug==='comprex');assert(b)
const c=b.current_config;assert(c)
if(c.stripe_price_id!==price.id) check(await admin.rpc('admin_edit_brand',{
  p_brand_id:b.id,p_expected_version:b.config_version,p_name:b.name,p_logo_path:b.logo_path,
  p_primary_color:b.primary_color,p_secondary_color:b.secondary_color,p_highlight_color:b.highlight_color,
  p_product_name:b.product_name,p_reorder_url:b.reorder_url,p_timezone:b.timezone,
  p_duration_days:c.duration_days,p_schedule_days:c.schedule_days,p_usage_title:c.usage_title,
  p_usage_instructions:c.usage_instructions,p_running_low_days:c.running_low_days,
  p_subscription_required:true,p_stripe_price_id:price.id,p_active:b.active,
}))
console.log(JSON.stringify({mode:'TEST',product:product.id,price:price.id,amount:price.unit_amount,currency:price.currency,interval:price.recurring.interval,trialDays:plan.trialDays,devConfiguration:'CONFIGURED'}))
