import type { Brand, Customer } from '@/lib/types'

export interface BrandRepository { getBySlug(slug: string): Promise<Brand | null>; create(input: unknown): Promise<Brand>; update(id: string, input: unknown): Promise<Brand> }
export interface CustomerRepository { getById(id: string): Promise<Customer | null>; list(query?: string): Promise<Customer[]> }
export interface ProgramRepository { snapshot(brand: Brand, customer: Customer): Promise<unknown>; getByCustomerId(customerId: string): Promise<unknown> }
export interface UsageRepository { complete(programId: string, scheduledDay: number): Promise<void> }
export interface SubscriptionRepository { upsertFromStripe(input: unknown): Promise<void> }
export interface AccessLinkRepository { create(brandSlug: string): Promise<{ url: string; token: string }>; revoke(id: string): Promise<void> }
export interface CustomerSessionRepository { findByHash(tokenHash: string): Promise<{ customerId: string; programId: string } | null>; revoke(tokenHash: string): Promise<void> }
export interface StripeEventRepository { hasProcessed(eventId: string): Promise<boolean>; record(eventId: string, eventType: string): Promise<void> }
