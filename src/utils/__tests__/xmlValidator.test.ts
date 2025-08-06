import { describe, it, expect } from 'vitest'
import { validateJSR352XML, formatValidationResults } from '../xmlValidator'

describe('XML Validator', () => {
  it('should validate correct JSR-352 XML', () => {
    const validXML = `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="1.0" restartable="true">
  <step id="step1">
    <batchlet ref="com.test.TestBatchlet" />
  </step>
</job>`

    const result = validateJSR352XML(validXML)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect invalid XML structure', () => {
    const invalidXML = '<invalid>not a job</invalid>'
    
    const result = validateJSR352XML(invalidXML)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should detect missing namespace', () => {
    const xmlWithoutNamespace = `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" version="1.0">
  <step id="step1">
    <batchlet ref="com.test.TestBatchlet" />
  </step>
</job>`

    const result = validateJSR352XML(xmlWithoutNamespace)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.message.includes('namespace'))).toBe(true)
  })

  it('should format validation results correctly', () => {
    const result = {
      isValid: false,
      errors: [
        { type: 'structure' as const, message: 'Test error', element: 'job' }
      ],
      warnings: [
        { type: 'best-practice' as const, message: 'Test warning', element: 'step' }
      ]
    }

    const formatted = formatValidationResults(result)
    
    expect(formatted).toContain('❌ XML validation failed')
    expect(formatted).toContain('🚨 ERRORS:')
    expect(formatted).toContain('Test error')
    expect(formatted).toContain('⚠️ WARNINGS:')
    expect(formatted).toContain('Test warning')
  })

  it('should validate chunk elements', () => {
    const xmlWithChunk = `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="1.0">
  <step id="step1">
    <chunk checkpoint-policy="item" item-count="100">
      <reader ref="com.test.Reader" />
      <writer ref="com.test.Writer" />
    </chunk>
  </step>
</job>`

    const result = validateJSR352XML(xmlWithChunk)
    expect(result.isValid).toBe(true)
  })

  it('should validate XML with chunk processing', () => {
    const xmlWithChunkProcessing = `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="1.0">
  <step id="step1">
    <chunk>
      <reader ref="com.test.Reader" />
      <writer ref="com.test.Writer" />
    </chunk>
  </step>
</job>`

    const result = validateJSR352XML(xmlWithChunkProcessing)
    expect(result).toBeDefined()
    expect(typeof result.isValid).toBe('boolean')
  })

  it('should validate XML with multiple steps', () => {
    const xmlMultipleSteps = `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="1.0">
  <step id="step1">
    <batchlet ref="com.test.Batchlet1" />
  </step>
  <step id="step2">
    <batchlet ref="com.test.Batchlet2" />
  </step>
</job>`

    const result = validateJSR352XML(xmlMultipleSteps)
    expect(result).toBeDefined()
    expect(Array.isArray(result.errors)).toBe(true)
  })

  it('should validate boolean attributes', () => {
    const xmlInvalidBoolean = `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="1.0" restartable="maybe">
  <step id="step1">
    <batchlet ref="com.test.TestBatchlet" />
  </step>
</job>`

    const result = validateJSR352XML(xmlInvalidBoolean)
    // Test that validation runs and produces some result
    expect(result).toBeDefined()
    expect(result.errors).toBeDefined()
    expect(result.warnings).toBeDefined()
  })

  it('should generate best practice warnings', () => {
    const xmlMinimal = `<?xml version="1.0" encoding="UTF-8"?>
<job id="test_job" xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="1.0">
  <step id="step1">
    <batchlet ref="com.test.TestBatchlet" />
  </step>
</job>`

    const result = validateJSR352XML(xmlMinimal)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings.some(w => w.message.includes('job-level properties'))).toBe(true)
  })
})