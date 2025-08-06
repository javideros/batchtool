import '@testing-library/jest-dom'
import { vi } from 'vitest'
import './globalMocks'

// Mock crypto.randomUUID for consistent testing
// eslint-disable-next-line no-undef
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123')
  }
})

// Mock clipboard API
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve())
    },
    configurable: true
  })
}

// Mock DOMParser for XML validation tests
// eslint-disable-next-line no-undef
global.DOMParser = class MockDOMParser {
  parseFromString(xmlString: string) {
    // Check for basic XML errors
    if (!xmlString.includes('<job')) {
      return {
        querySelector: vi.fn((selector: string) => 
          selector === 'parsererror' ? { textContent: 'Invalid XML' } : null
        )
      }
    }
    
    // Check for missing namespace
    const hasNamespace = xmlString.includes('xmlns="http://xmlns.jcp.org/xml/ns/javaee"')
    
    const doc = {
      documentElement: {
        tagName: 'job',
        getAttribute: vi.fn((attr: string) => {
          if (attr === 'xmlns') return hasNamespace ? 'http://xmlns.jcp.org/xml/ns/javaee' : null
          if (attr === 'version') return '1.0'
          if (attr === 'id') return 'test-job'
          return null
        }),
        children: [],
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => [])
      },
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => [])
    }
    
    return doc
  }
}

// Mock URL.createObjectURL for file download tests
// eslint-disable-next-line no-undef
global.URL.createObjectURL = vi.fn(() => 'mock-url')
// eslint-disable-next-line no-undef
global.URL.revokeObjectURL = vi.fn()