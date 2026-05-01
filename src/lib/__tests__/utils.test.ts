import { describe, it, expect } from 'vitest'
import { getInitials, formatDate, isOverdue, getStatusColors } from '../utils'

describe('getInitials', () => {
  it('returns first letter of each of first 2 words uppercased', () => {
    expect(getInitials('Openn Pilar')).toBe('OP')
  })
  it('returns first 2 chars when single word', () => {
    expect(getInitials('Viviera')).toBe('VI')
  })
  it('handles 3+ word names', () => {
    expect(getInitials('Del Sol Auto')).toBe('DS')
  })
})

describe('isOverdue', () => {
  it('returns true when due_date is in the past and task not completed', () => {
    expect(isOverdue('2020-01-01', false)).toBe(true)
  })
  it('returns false when task is completed', () => {
    expect(isOverdue('2020-01-01', true)).toBe(false)
  })
  it('returns false when due_date is null', () => {
    expect(isOverdue(null, false)).toBe(false)
  })
  it('returns false when due_date is in the future', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    expect(isOverdue(future.toISOString().split('T')[0], false)).toBe(false)
  })
})

describe('formatDate', () => {
  it('returns dash when null', () => {
    expect(formatDate(null)).toBe('—')
  })
  it('formats a date string to a readable format', () => {
    const result = formatDate('2025-10-24')
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/oct|24/)
  })
})

describe('getStatusColors', () => {
  it('returns green colors for verde', () => {
    const colors = getStatusColors('verde')
    expect(colors.dot).toContain('green')
    expect(colors.bgResting).toContain('34, 197, 94')
  })
  it('returns yellow colors for amarillo', () => {
    const colors = getStatusColors('amarillo')
    expect(colors.dot).toContain('yellow')
  })
  it('returns red colors for rojo', () => {
    const colors = getStatusColors('rojo')
    expect(colors.dot).toContain('red')
  })
  it('returns gray colors for null', () => {
    const colors = getStatusColors(null)
    expect(colors.dot).toContain('gray')
  })
})
