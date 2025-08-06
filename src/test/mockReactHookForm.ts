import { vi } from 'vitest'

export const createMockFormControl = () => ({
  _formState: { 
    errors: {},
    isSubmitting: false,
    isValidating: false,
    isDirty: false,
    isValid: true
  },
  _fields: {},
  _defaultValues: {},
  _formValues: {},
  register: vi.fn(() => ({})),
  unregister: vi.fn(),
  getFieldState: vi.fn(() => ({ error: undefined, isDirty: false, isTouched: false })),
  _getWatch: vi.fn(() => ({})),
  _subjects: {
    array: { 
      next: vi.fn(), 
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() }))
    },
    values: { 
      next: vi.fn(), 
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() }))
    },
    state: { 
      next: vi.fn(), 
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() }))
    }
  },
  _options: {},
  _names: { mount: new Set(), unMount: new Set(), array: new Set(), watch: new Set() }
})

export const createMockForm = () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSubmit: vi.fn((fn) => (e: any) => {
    e?.preventDefault?.()
    fn({ batchletClass: 'com.test.TestBatchlet' })
  }),
  control: createMockFormControl(),
  formState: { errors: {}, isSubmitting: false, isValidating: false },
  register: vi.fn(() => ({})),
  getValues: vi.fn(() => ({})),
  setValue: vi.fn(),
  watch: vi.fn(),
  reset: vi.fn(),
  trigger: vi.fn(),
  clearErrors: vi.fn(),
  setError: vi.fn()
})