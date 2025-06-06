import { classify } from '../classifier'

describe('classifier', () => {
  it('detects passports', () => {
    const out = classify('USA PASSPORT Exp 04/25/2035\nJohn Doe')
    expect(out.type_enum).toBe('passport')
    expect(out.confidence).toBeGreaterThanOrEqual(40)
  })

  it('handles unknown', () => {
    const out = classify('Random flyer text')
    expect(out.type_enum).toBeNull()
    expect(out.confidence).toBe(0)
  })

  it('parses expiry', () => {
    const out = classify('Something expires 12-31-2026')
    expect(out.expiry_date).not.toBeNull()
  })
})
