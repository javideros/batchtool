import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStepDataUpdate } from '../use-step-data-update'
import { useFormStore } from '@/lib/jsr352batchjobstore'

// Mock the store
vi.mock('@/lib/jsr352batchjobstore', () => ({
  useFormStore: vi.fn()
}))

// Add missing vi import
import { vi } from 'vitest'

describe('useStepDataUpdate', () => {
  const mockUpdateStepItems = vi.fn()
  const mockStepItems = [
    { id: 'step1', stepName: 'test_step', type: 'A' },
    { id: 'step2', stepName: 'another_step', type: 'B' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useFormStore as any).mockReturnValue({
      formData: { stepItems: mockStepItems },
      setFormData: mockUpdateStepItems
    })
  })

  it('should return current step items', () => {
    const { result } = renderHook(() => useStepDataUpdate())
    
    expect(result.current.stepItems).toEqual(mockStepItems)
  })

  it('should update step data correctly', () => {
    const { result } = renderHook(() => useStepDataUpdate())
    
    const newData = { batchletClass: 'com.test.NewBatchlet' }
    
    act(() => {
      result.current.updateStepData('step1', newData)
    })

    expect(mockUpdateStepItems).toHaveBeenCalledWith({
      stepItems: [
        { id: 'step1', stepName: 'test_step', type: 'A', ...newData },
        { id: 'step2', stepName: 'another_step', type: 'B' }
      ]
    })
  })

  it('should handle updating non-existent step', () => {
    const { result } = renderHook(() => useStepDataUpdate())
    
    const newData = { batchletClass: 'com.test.NewBatchlet' }
    
    act(() => {
      result.current.updateStepData('non-existent', newData)
    })

    // Should not modify the array if step doesn't exist
    expect(mockUpdateStepItems).toHaveBeenCalledWith({
      stepItems: mockStepItems
    })
  })

  it('should handle empty step items array', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useFormStore as any).mockReturnValue({
      formData: { stepItems: [] },
      setFormData: mockUpdateStepItems
    })

    const { result } = renderHook(() => useStepDataUpdate())
    
    expect(result.current.stepItems).toEqual([])
    
    act(() => {
      result.current.updateStepData('step1', { batchletClass: 'com.test.Test' })
    })

    expect(mockUpdateStepItems).toHaveBeenCalledWith({
      stepItems: []
    })
  })
})