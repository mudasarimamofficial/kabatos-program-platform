import { z } from 'zod'

export const checkoutInputSchema = z.object({
  brandSlug: z.string().regex(/^[a-z0-9-]+$/),
  customerId: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
})

export type CheckoutInput = z.infer<typeof checkoutInputSchema>
