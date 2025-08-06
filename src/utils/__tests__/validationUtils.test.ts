import { describe, it, expect } from 'vitest'
import { createUniqueClassValidator, createUniqueClassErrorMessage } from '../validationUtils'

describe('Validation Utils', () => {
  const mockStepItems = [
    { id: 'step1', batchletClass: 'com.test.ExistingBatchlet' },
    { id: 'step2', readerClass: 'com.test.ExistingReader' },
    { id: 'step3', writerClass: 'com.test.ExistingWriter' }
  ]

  describe('createUniqueClassValidator', () => {
    it('should return true for unique class name', () => {
      const validator = createUniqueClassValidator('batchletClass', mockStepItems, 'step4')
      const result = validator('com.test.NewBatchlet')
      expect(result).toBe(true)
    })

    it('should return false for duplicate class name', () => {
      const validator = createUniqueClassValidator('batchletClass', mockStepItems, 'step4')
      const result = validator('com.test.ExistingBatchlet')
      expect(result).toBe(false)
    })

    it('should allow same class for same step (editing)', () => {
      const validator = createUniqueClassValidator('batchletClass', mockStepItems, 'step1')
      const result = validator('com.test.ExistingBatchlet')
      expect(result).toBe(true)
    })

    it('should handle empty class name', () => {
      const validator = createUniqueClassValidator('batchletClass', mockStepItems, 'step4')
      const result = validator('')
      expect(result).toBe(true)
    })

    it('should allow same class name in different field types', () => {
      const validator = createUniqueClassValidator('processorClass', mockStepItems, 'step4')
      const result = validator('com.test.ExistingReader')
      expect(result).toBe(true) // Different field types can have same class name
    })
  })

  describe('createUniqueClassErrorMessage', () => {
    it('should create appropriate error message', () => {
      const message = createUniqueClassErrorMessage('Batchlet')
      expect(message).toBe('Batchlet class name must be unique')
    })

    it('should handle different class types', () => {
      const message = createUniqueClassErrorMessage('Reader')
      expect(message).toBe('Reader class name must be unique')
    })
  })
})