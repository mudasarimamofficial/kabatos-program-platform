'use client'

import React, { useState, useEffect } from 'react'
import { Check, QrCode } from 'lucide-react'
import { AdminShell } from './admin-shell'
import { QRCodeCanvas } from 'qrcode.react'
import { brands as mockBrands } from '@/lib/mock/data'
import type { Brand } from '@/lib/types'

export function AccessLinks({ brands = mockBrands }: { brands?: Brand[] }) {
  const [brandSlug, setBrandSlug] = useState('comprex')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const brand = brands.find((item) => item.slug === brandSlug) ?? brands[0]
  const accessUrl =
    mounted && typeof window !== 'undefined'
      ? `${window.location.origin}/${brand.slug}`
      : `/${brand.slug}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(accessUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const download = async (format: 'png' | 'svg') => {
    if (format === 'svg') {
      const QRCode = (await import('qrcode')).default
      const svgString = await QRCode.toString(accessUrl, {
        type: 'svg',
        margin: 2,
        color: { dark: '#18221F', light: '#FFFFFF' },
      })
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `${brand.slug}-access-qr.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      return
    }

    const canvas = document.querySelector<HTMLCanvasElement>('#access-qr')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${brand.slug}-access-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <AdminShell title="Access links" active="access">
      <div className="admin-page">
        <div className="page-actions">
          <p>Share a direct entry point to each program.</p>
          <label className="access-select">
            Brand
            <select value={brandSlug} onChange={(event) => setBrandSlug(event.target.value)}>
              {brands.map((item) => (
                <option value={item.slug} key={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="panel access-panel">
          <div className="qr-art">
            <QRCodeCanvas
              id="access-qr"
              value={accessUrl}
              size={142}
              bgColor="#FFFFFF"
              fgColor="#18221F"
              includeMargin
            />
          </div>
          <div className="access-info">
            <span className="eyebrow">
              {brand.name} · {brand.productName}
            </span>
            <h2>Customer access link</h2>
            <p>Anyone with this link can enter the onboarding flow.</p>
            <div className="copy-field">
              <span>{mounted ? accessUrl.replace(/^https?:\/\//, '') : `/${brand.slug}`}</span>
              <button type="button" aria-label="Copy access link" onClick={copyLink}>
                {copied ? <Check size={17} /> : <QrCode size={17} />}
              </button>
            </div>
            <div className="access-actions">
              <button type="button" className="btn btn-outline" onClick={() => download('png')}>
                <QrCode size={16} /> Download PNG
              </button>
              <button type="button" className="btn btn-outline" onClick={() => download('svg')}>
                <QrCode size={16} /> Download SVG
              </button>
              <button type="button" className="btn btn-ghost" onClick={copyLink}>
                {copied ? 'Link copied.' : 'Copy link'}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {copied ? 'Link copied.' : ''}
            </p>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
