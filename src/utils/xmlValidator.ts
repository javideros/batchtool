// XML validation utilities for JSR-352 compliance

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'structure' | 'content' | 'attribute' | 'namespace';
  message: string;
  line?: number;
  element?: string;
}

export interface ValidationWarning {
  type: 'best-practice' | 'performance' | 'compatibility';
  message: string;
  element?: string;
}

export const validateJSR352XML = (xml: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    // Basic XML structure validation
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    
    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      errors.push({
        type: 'structure',
        message: 'Invalid XML structure: ' + parseError.textContent,
      });
      return { isValid: false, errors, warnings };
    }

    // JSR-352 specific validations
    validateJSR352Structure(doc, errors, warnings);
    validateJSR352Content(doc, errors, warnings);
    validateJSR352Attributes(doc, errors, warnings);
    validateJSR352BestPractices(doc, warnings);

  } catch (error) {
    errors.push({
      type: 'structure',
      message: 'XML parsing failed: ' + (error instanceof Error ? error.message : String(error)),
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const validateJSR352Structure = (doc: Document, errors: ValidationError[], warnings: ValidationWarning[]) => {
  const root = doc.documentElement;

  // Check root element
  if (root.tagName !== 'job') {
    errors.push({
      type: 'structure',
      message: 'Root element must be <job>',
      element: root.tagName
    });
    return;
  }

  // Check namespace
  const namespace = root.getAttribute('xmlns');
  if (namespace !== 'http://xmlns.jcp.org/xml/ns/javaee') {
    errors.push({
      type: 'namespace',
      message: 'Invalid or missing JSR-352 namespace',
      element: 'job'
    });
  }

  // Check version
  const version = root.getAttribute('version');
  if (version !== '1.0') {
    errors.push({
      type: 'attribute',
      message: 'JSR-352 version must be "1.0"',
      element: 'job'
    });
  }

  // Validate job structure
  validateJobStructure(root, errors, warnings);
};

const validateJobStructure = (jobElement: Element, errors: ValidationError[], warnings: ValidationWarning[]) => {
  const allowedChildren = ['properties', 'listeners', 'step', 'decision', 'flow', 'split'];
  const children = Array.from(jobElement.children);

  children.forEach(child => {
    if (!allowedChildren.includes(child.tagName)) {
      errors.push({
        type: 'structure',
        message: `Invalid child element <${child.tagName}> in <job>`,
        element: child.tagName
      });
    }
  });

  // Validate step elements
  const steps = jobElement.querySelectorAll('step');
  steps.forEach(step => validateStepElement(step, errors));

  // Validate chunk elements
  const chunks = jobElement.querySelectorAll('chunk');
  chunks.forEach(chunk => validateChunkElement(chunk, errors, warnings));

  // Validate flow elements
  const flows = jobElement.querySelectorAll('flow');
  flows.forEach(flow => validateFlowElement(flow, errors, warnings));
};

const validateStepElement = (stepElement: Element, errors: ValidationError[]) => {
  // Check required id attribute
  const id = stepElement.getAttribute('id');
  if (!id) {
    errors.push({
      type: 'attribute',
      message: 'Step element must have an "id" attribute',
      element: 'step'
    });
  }

  // Check step content
  const hasImplementation = stepElement.querySelector('batchlet') || stepElement.querySelector('chunk');
  if (!hasImplementation) {
    errors.push({
      type: 'content',
      message: 'Step must contain either <batchlet> or <chunk> element',
      element: 'step'
    });
  }

  // Note: Transition validation could be added here if needed
};

const validateChunkElement = (chunkElement: Element, errors: ValidationError[]) => {
  // Check required reader and writer
  const reader = chunkElement.querySelector('reader');
  const writer = chunkElement.querySelector('writer');

  if (!reader) {
    errors.push({
      type: 'content',
      message: 'Chunk must contain a <reader> element',
      element: 'chunk'
    });
  }

  if (!writer) {
    errors.push({
      type: 'content',
      message: 'Chunk must contain a <writer> element',
      element: 'chunk'
    });
  }

  // Validate checkpoint policy
  const checkpointPolicy = chunkElement.getAttribute('checkpoint-policy');
  if (checkpointPolicy && !['item', 'custom'].includes(checkpointPolicy)) {
    errors.push({
      type: 'attribute',
      message: 'Invalid checkpoint-policy. Must be "item" or "custom"',
      element: 'chunk'
    });
  }

  // Validate item-count for item policy
  if (checkpointPolicy === 'item') {
    const itemCount = chunkElement.getAttribute('item-count');
    if (itemCount && (isNaN(Number(itemCount)) || Number(itemCount) < 1)) {
      errors.push({
        type: 'attribute',
        message: 'item-count must be a positive integer',
        element: 'chunk'
      });
    }
  }
};

const validateFlowElement = (flowElement: Element, errors: ValidationError[]) => {
  // Check required id attribute
  const id = flowElement.getAttribute('id');
  if (!id) {
    errors.push({
      type: 'attribute',
      message: 'Flow element must have an "id" attribute',
      element: 'flow'
    });
  }

  // Note: Flow step validation could be added here if needed
};

const validateJSR352Content = (doc: Document, errors: ValidationError[]) => {
  // Check for duplicate IDs
  const ids = new Set<string>();
  const elementsWithIds = doc.querySelectorAll('[id]');
  
  elementsWithIds.forEach(element => {
    const id = element.getAttribute('id');
    if (id) {
      if (ids.has(id)) {
        errors.push({
          type: 'content',
          message: `Duplicate ID "${id}" found`,
          element: element.tagName
        });
      }
      ids.add(id);
    }
  });

  // Validate class references
  const classRefs = doc.querySelectorAll('[ref]');
  classRefs.forEach(element => {
    const ref = element.getAttribute('ref');
    if (ref && !isValidJavaClassName(ref)) {
      errors.push({
        type: 'content',
        message: `Invalid Java class name: "${ref}"`,
        element: element.tagName
      });
    }
  });
};

const validateJSR352Attributes = (doc: Document, errors: ValidationError[]) => {
  // Validate boolean attributes
  const booleanAttrs = doc.querySelectorAll('[restartable], [abstract], [allow-start-if-complete]');
  booleanAttrs.forEach(element => {
    ['restartable', 'abstract', 'allow-start-if-complete'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && !['true', 'false'].includes(value)) {
        errors.push({
          type: 'attribute',
          message: `Attribute "${attr}" must be "true" or "false"`,
          element: element.tagName
        });
      }
    });
  });

  // Validate numeric attributes
  const numericAttrs = doc.querySelectorAll('[start-limit], [item-count], [time-limit]');
  numericAttrs.forEach(element => {
    ['start-limit', 'item-count', 'time-limit'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && (isNaN(Number(value)) || Number(value) < 1)) {
        errors.push({
          type: 'attribute',
          message: `Attribute "${attr}" must be a positive integer`,
          element: element.tagName
        });
      }
    });
  });
};

const validateJSR352BestPractices = (doc: Document, warnings: ValidationWarning[]) => {
  // Check for job-level properties
  const jobProperties = doc.querySelector('job > properties');
  if (!jobProperties) {
    warnings.push({
      type: 'best-practice',
      message: 'Consider adding job-level properties for configuration',
      element: 'job'
    });
  }

  // Check for listeners
  const listeners = doc.querySelector('job > listeners');
  if (!listeners) {
    warnings.push({
      type: 'best-practice',
      message: 'Consider adding job listeners for monitoring and logging',
      element: 'job'
    });
  }

  // Check for checkpoint configuration in chunks
  const chunksWithoutCheckpoint = doc.querySelectorAll('chunk:not([checkpoint-policy])');
  if (chunksWithoutCheckpoint.length > 0) {
    warnings.push({
      type: 'performance',
      message: 'Consider configuring checkpoint policy for better performance and restart capability',
      element: 'chunk'
    });
  }

  // Check for exception handling in processors
  const processors = doc.querySelectorAll('processor');
  processors.forEach(processor => {
    const chunk = processor.closest('chunk');
    if (chunk && !chunk.querySelector('skippable-exception-classes, retryable-exception-classes')) {
      warnings.push({
        type: 'best-practice',
        message: 'Consider adding exception handling for robust processing',
        element: 'chunk'
      });
    }
  });
};

const isValidJavaClassName = (className: string): boolean => {
  // Basic Java class name validation
  const javaClassRegex = /^([a-z][a-z0-9_]*\.)+[A-Z][A-Za-z0-9_]*$/;
  return javaClassRegex.test(className);
};

export const formatValidationResults = (result: ValidationResult): string => {
  let output = '';
  
  if (result.isValid) {
    output += '✅ XML is valid JSR-352 format\n\n';
  } else {
    output += '❌ XML validation failed\n\n';
  }

  if (result.errors.length > 0) {
    output += '🚨 ERRORS:\n';
    result.errors.forEach((error, index) => {
      output += `${index + 1}. [${error.type.toUpperCase()}] ${error.message}`;
      if (error.element) output += ` (${error.element})`;
      output += '\n';
    });
    output += '\n';
  }

  if (result.warnings.length > 0) {
    output += '⚠️ WARNINGS:\n';
    result.warnings.forEach((warning, index) => {
      output += `${index + 1}. [${warning.type.toUpperCase()}] ${warning.message}`;
      if (warning.element) output += ` (${warning.element})`;
      output += '\n';
    });
  }

  return output;
};