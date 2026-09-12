import { describe, it, expect } from 'vitest'
import QRCode from 'qrcode'

describe('QR Code True SVG Generation (§49)', () => {
  it('generates genuine XML SVG markup and never PNG octet-stream data', async () => {
    const testUrl = 'https://kabatos-program-platform.vercel.app/comprex'
    const svgString = await QRCode.toString(testUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#18221F',
        light: '#FFFFFF',
      },
    })

    // Verification 1: Must be string starting with <svg
    expect(svgString).toBeTypeOf('string')
    expect(svgString.trim().startsWith('<svg')).toBe(true)

    // Verification 2: Must contain standard XML SVG namespace
    expect(svgString).toContain('xmlns="http://www.w3.org/2000/svg"')

    // Verification 3: Must contain viewBox and path elements
    expect(svgString).toContain('viewBox=')
    expect(svgString).toContain('path')

    // Verification 4: Must end with </svg>
    expect(svgString.trim().endsWith('</svg>')).toBe(true)

    // Verification 5: Must NOT be a data:image/png base64 string
    expect(svgString).not.toContain('data:image/png')
    expect(svgString).not.toContain('image/octet-stream')
  })
})
