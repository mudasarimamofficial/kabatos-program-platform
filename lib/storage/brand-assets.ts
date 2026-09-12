import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export interface UploadLogoResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Validates and uploads a brand logo to Supabase Storage brand-assets bucket.
 */
export async function uploadBrandLogo(
  brandSlug: string,
  file: File
): Promise<UploadLogoResult> {
  // Validate file size
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return { success: false, error: 'File exceeds 2MB limit.' }
  }

  // Validate MIME type (strictly disallowing unsanitized raw SVG)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Invalid format. Only PNG, JPEG, and WebP images are permitted.',
    }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return {
      success: true,
      url: `/placeholder-logo.svg`,
      path: `${brandSlug}/logo.png`,
    }
  }

  const ext = file.type.split('/')[1] || 'png'
  const sanitizedSlug = brandSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
  const filePath = `${sanitizedSlug}/logo-${Date.now()}.${ext}`

  try {
    const arrayBuffer = await file.arrayBuffer()
    const { data, error } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('brand-assets').getPublicUrl(data.path)

    return { success: true, url: publicUrl, path: data.path }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Storage upload failed.' }
  }
}
