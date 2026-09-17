export function luminance(hex: string) {
  const c = hex.replace('#', '').match(/.{2}/g)!.map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722
}
export function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}
export function deriveTextColor(color: string) {
  return contrast('#121212', color) >= 4.5 ? '#121212' : '#FFFFFF'
}
export function deriveHoverColor(color: string) {
  // Preserve the established amber palette; this is a color token, not a tenant rule.
  if (color.toUpperCase() === '#F07106') return '#D85800'
  return '#' + color.slice(1).match(/.{2}/g)!.map(c => Math.floor(parseInt(c, 16) * 0.85).toString(16).padStart(2, '0')).join('').toUpperCase()
}
