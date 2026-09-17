import { expect, it } from 'vitest'
import { contrast, deriveHoverColor, deriveTextColor } from './contrast'
it('keeps accessible text for the normal and hover palettes of both brands', () => {
  for (const primary of ['#F07106', '#246B5A']) {
    for (const background of [primary, deriveHoverColor(primary)]) {
      expect(contrast(deriveTextColor(background), background)).toBeGreaterThanOrEqual(4.5)
    }
  }
  expect(contrast('#FFFFFF', '#D85800')).toBeLessThan(4.5)
  expect(deriveHoverColor('#F07106')).toBe('#D85800')
})
