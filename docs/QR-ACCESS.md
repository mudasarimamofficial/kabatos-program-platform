# Access Links & True SVG QR Architecture

## System Overview
Access links provide frictionless entry into brand onboarding without exposing internal database IDs or requiring customer credentials.

## Technical Details
- **Component:** `components/admin/access-links.tsx`
- **QR Code Canvas:** Rendered live in the browser using `qrcode.react`.
- **True SVG Generation:** Dynamic runtime export using the `qrcode` library:
  ```typescript
  const QRCode = (await import('qrcode')).default
  const svgString = await QRCode.toString(accessUrl, {
    type: 'svg',
    margin: 2,
    color: { dark: '#18221F', light: '#FFFFFF' },
  })
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  ```
- **PNG Generation:** Exported directly from HTML5 canvas via `canvas.toDataURL('image/png')`.
- **Zero Hydration Mismatch:** Protected by `mounted` state so server-rendered HTML matches initial client hydration.
