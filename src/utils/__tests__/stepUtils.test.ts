import { describe, it, expect } from 'vitest'
import { resolveTargetStepId, isAddingNewStep } from '../stepUtils'

describe('Step Utils', () => {
  const mockStepItems = [
    { id: 'step1', stepName: 'existing_step' },
    { id: 'step2', stepName: 'another_step' }
  ]

  describe('resolveTargetStepId', () => {
    it('should return provided stepItemId when valid', () => {
      const result = resolveTargetStepId('step1', mockStepItems, false)
      expect(result).toBe('step1')
    })

    it('should return undefined when adding new step', () => {
      const result = resolveTargetStepId(undefined, mockStepItems, true)
      expect(result).toBeUndefined()
    })

    it('should return last step id when no stepItemId and not adding new', () => {
      const result = resolveTargetStepId(undefined, mockStepItems, false)
      expect(result).toBe('step2')
    })

    it('should handle empty stepItems array', () => {
      const result = resolveTargetStepId(undefined, [], true)
      expect(result).toBeUndefined()
    })
  })

  describe('isAddingNewStep', () => {
    it('should return true when multiple dynamic step screens exist', () => {
      const steps = [
        { id: 1, name: 'Dynamic Step Configuration' },
        { id: 2, name: 'Dynamic Step Configuration' }
      ]
      expect(isAddingNewStep(steps)).toBe(true)
    })

    it('should return false when single or no dynamic step screens', () => {
      const steps = [
        { id: 1, name: 'Dynamic Step Configuration' }
      ]
      expect(isAddingNewStep(steps)).toBe(false)
    })

    it('should handle empty steps array', () => {
      expect(isAddingNewStep([])).toBe(false)
    })
  })
})