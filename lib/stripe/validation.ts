import { z } from 'zod'

export const checkoutInputSchema = z.object({
  brandSlug: z.string().regex(/^[a-z0-9-]+$/),
}).strict()

export type CheckoutInput = z.infer<typeof checkoutInputSchema>
