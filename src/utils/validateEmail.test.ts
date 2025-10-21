import { describe, it, expect } from 'vitest'
import { validateEmail } from './validateEmail'

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    const valid = [
      'user@example.com',
      'USER@EXAMPLE.COM',
      'first.last@sub.domain.co',
      'name+tag@domain.io',
    ]
    for (const e of valid) {
      expect(validateEmail(e)).toBeTruthy()
    }
  })

  it('rejects invalid emails', () => {
    const invalid = [
      '',
      'plainaddress',
      '@no-local-part.com',
      'user@',
      'user@.com',
      'user@domain,com',
      'user@domain..com',
    ]
    for (const e of invalid) {
      expect(validateEmail(e)).toBeFalsy()
    }
  })
})
