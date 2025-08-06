import { describe, it, expect } from 'vitest'
import { generateJSR352XML } from '../xmlGenerator'
import type { FormData } from '@/types/batch'

describe('XML Generator', () => {
  const mockFormData: FormData = {
    batchName: 'test_job',
    functionalAreaCd: 'ED',
    frequency: 'DLY',
    packageName: 'com.test',
    batchProperties: [],
    batchListeners: [],
    stepItems: [],
    jobRestartConfig: {
      restartable: true,
      stepRestartConfig: {
        allowStartIfComplete: false,
        startLimit: 3,
        restartable: true
      }
    }
  }

  it('should generate basic job XML structure', () => {
    const xml = generateJSR352XML(mockFormData)
    
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<job id="test_job"')
    expect(xml).toContain('xmlns="http://xmlns.jcp.org/xml/ns/javaee"')
    expect(xml).toContain('version="1.0"')
    expect(xml).toContain('restartable="true"')
    expect(xml).toContain('</job>')
  })

  it('should generate batchlet step', () => {
    const formDataWithBatchlet = {
      ...mockFormData,
      stepItems: [{
        id: 'step1',
        type: 'A' as const,
        stepName: 'test_step',
        addProcessor: false,
        batchletClass: 'com.test.TestBatchlet',
        stepProperties: [
          { key: 'prop1', value: 'value1', type: 'String' as const }
        ],
        transitions: [
          { on: 'COMPLETED', action: 'end' as const }
        ]
      }]
    }
    
    const xml = generateJSR352XML(formDataWithBatchlet)
    
    expect(xml).toContain('<step id="test_step"')
    expect(xml).toContain('<batchlet ref="com.test.TestBatchlet" />')
    expect(xml).toContain('<property name="prop1" value="value1" />')
    expect(xml).toContain('<end on="COMPLETED" />')
  })

  it('should generate chunk step with checkpoint', () => {
    const formDataWithChunk = {
      ...mockFormData,
      stepItems: [{
        id: 'chunk1',
        type: 'B' as const,
        stepName: 'chunk_step',
        addProcessor: true,
        readerClass: 'com.test.Reader',
        processorClass: 'com.test.Processor',
        writerClass: 'com.test.Writer',
        checkpointConfig: {
          enabled: true,
          itemCount: 1000
        }
      }]
    }
    
    const xml = generateJSR352XML(formDataWithChunk)
    
    expect(xml).toContain('<chunk checkpoint-policy="item" item-count="1000">')
    expect(xml).toContain('<reader ref="com.test.Reader" />')
    expect(xml).toContain('<processor ref="com.test.Processor" />')
    expect(xml).toContain('<writer ref="com.test.Writer" />')
  })
})