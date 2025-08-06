import type { FormData as JSR352FormData } from '@/types/batch';

export const generateJSR352XML = (formData: JSR352FormData): string => {
  const lines: string[] = [];
  
  // XML Declaration and root element
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<job id="' + formData.batchName + '"');
  lines.push('     xmlns="http://xmlns.jcp.org/xml/ns/javaee"');
  lines.push('     version="1.0"');
  
  // Job-level restart configuration
  if (formData.jobRestartConfig) {
    lines.push('     restartable="' + formData.jobRestartConfig.restartable + '"');
  }
  lines.push('>');
  
  // Job Properties
  if (formData.batchProperties && Object.keys(formData.batchProperties).length > 0) {
    lines.push('  <properties>');
    
    // asOfDate (always present)
    if (formData.batchProperties.asOfDate) {
      lines.push('    <property name="asOfDate" value="#{jobParameters[\'asOfDate\']}" />');
    }
    
    // Optional properties
    if (formData.batchProperties.pageSize?.enabled) {
      const defaultValue = formData.batchProperties.pageSize.defaultValue || '100';
      lines.push('    <property name="pageSize" value="' + defaultValue + '" />');
    }
    
    if (formData.batchProperties.inputFilePattern?.enabled) {
      const defaultValue = formData.batchProperties.inputFilePattern.defaultValue || '*.csv';
      lines.push('    <property name="inputFilePattern" value="' + defaultValue + '" />');
    }
    
    if (formData.batchProperties.archiveFolder?.enabled) {
      const defaultValue = formData.batchProperties.archiveFolder.defaultValue || '/archive/#{jobParameters[\'asOfDate\']}';
      lines.push('    <property name="archiveFolder" value="' + defaultValue + '" />');
    }
    
    if (formData.batchProperties.outputFolder?.enabled) {
      const defaultValue = formData.batchProperties.outputFolder.defaultValue || '/output';
      lines.push('    <property name="outputFolder" value="' + defaultValue + '" />');
    }
    
    if (formData.batchProperties.timestampFormat?.enabled) {
      const defaultValue = formData.batchProperties.timestampFormat.defaultValue || 'yyyyMMdd_HHmmss';
      lines.push('    <property name="timestampFormat" value="' + defaultValue + '" />');
    }
    
    // Custom properties
    if (formData.batchProperties.customProperties) {
      formData.batchProperties.customProperties.forEach(prop => {
        const value = prop.defaultValue || '#{jobParameters[\'' + prop.name + '\']}';
        lines.push('    <property name="' + prop.name + '" value="' + value + '" />');
      });
    }
    
    lines.push('  </properties>');
  }
  
  // Batch Listeners
  if (formData.batchListeners && formData.batchListeners.length > 0) {
    lines.push('  <listeners>');
    formData.batchListeners.forEach(listener => {
      lines.push('    <listener ref="' + listener.listenerName + '" />');
    });
    lines.push('  </listeners>');
  }
  
  // Steps
  if (formData.stepItems && formData.stepItems.length > 0) {
    formData.stepItems.forEach(step => {
      generateStepXML(step, lines, formData);
    });
  }
  
  lines.push('</job>');
  
  return lines.join('\n');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateStepXML = (step: any, lines: string[], formData: JSR352FormData) => {
  const indent = '  ';
  
  if (step.type === 'DECISION') {
    // Decision Step
    lines.push(indent + '<decision id="' + step.stepName + '">');
    lines.push(indent + '  <decider ref="' + step.deciderClass + '" />');
    
    // Decision transitions
    if (step.transitions && step.transitions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      step.transitions.forEach((transition: any) => {
        if (transition.action === 'next' && transition.to) {
          lines.push(indent + '  <next on="' + transition.on + '" to="' + transition.to + '" />');
        } else if (transition.action === 'end') {
          lines.push(indent + '  <end on="' + transition.on + '" />');
        } else if (transition.action === 'fail') {
          lines.push(indent + '  <fail on="' + transition.on + '" />');
        } else if (transition.action === 'stop') {
          lines.push(indent + '  <stop on="' + transition.on + '" />');
        }
      });
    }
    
    lines.push(indent + '</decision>');
    
  } else if (step.type === 'SPLIT') {
    // Split Step
    lines.push(indent + '<split id="' + step.stepName + '">');
    
    if (step.flows && step.flows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      step.flows.forEach((flow: any) => {
        lines.push(indent + '  <flow id="' + flow.flowName + '">');
        // Note: Flow steps would be generated here in a full implementation
        lines.push(indent + '    <!-- Flow steps would be configured separately -->');
        lines.push(indent + '  </flow>');
      });
    }
    
    if (step.nextStep) {
      lines.push(indent + '  <next on="*" to="' + step.nextStep + '" />');
    }
    
    lines.push(indent + '</split>');
    
  } else if (step.type === 'FLOW') {
    // Flow Element
    let flowTag = indent + '<flow id="' + step.flowName + '"';
    
    // Flow execution context
    if (step.jslName) {
      flowTag += ' jsl-name="' + step.jslName + '"';
    }
    if (step.abstract) {
      flowTag += ' abstract="true"';
    }
    
    flowTag += '>';
    lines.push(flowTag);
    
    // Nested flow steps
    if (step.steps && step.steps.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      step.steps.forEach((flowStep: any) => {
        // Use increased indent for nested steps
        const nestedLines: string[] = [];
        generateStepXML(flowStep, nestedLines, formData);
        // Add proper indentation for nested steps
        nestedLines.forEach(line => {
          if (line.trim()) {
            lines.push('  ' + line);
          }
        });
      });
    } else {
      lines.push(indent + '  <!-- Flow: ' + step.description + ' -->');
      lines.push(indent + '  <!-- No steps configured for this flow -->');
    }
    
    lines.push(indent + '</flow>');
    
  } else {
    // Regular Step (Batchlet, Chunk, Chunk with Partition)
    let stepTag = indent + '<step id="' + step.stepName + '"';
    
    // Step-level restart configuration
    if (formData.jobRestartConfig?.stepRestartConfig) {
      const config = formData.jobRestartConfig.stepRestartConfig;
      stepTag += ' restartable="' + config.restartable + '"';
      stepTag += ' start-limit="' + config.startLimit + '"';
      stepTag += ' allow-start-if-complete="' + config.allowStartIfComplete + '"';
    }
    
    // Step execution context
    if (step.executionContext?.jslName) {
      stepTag += ' jsl-name="' + step.executionContext.jslName + '"';
    }
    if (step.executionContext?.abstract) {
      stepTag += ' abstract="true"';
    }
    
    stepTag += '>';
    lines.push(stepTag);
    
    // Step Properties
    if (step.stepProperties && step.stepProperties.length > 0) {
      lines.push(indent + '  <properties>');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      step.stepProperties.forEach((prop: any) => {
        lines.push(indent + '    <property name="' + prop.key + '" value="' + prop.value + '" />');
      });
      lines.push(indent + '  </properties>');
    }
    
    // Step Listeners
    if (step.listeners && step.listeners.length > 0) {
      lines.push(indent + '  <listeners>');
      step.listeners.forEach((listener: string) => {
        lines.push(indent + '    <listener ref="' + listener + '" />');
      });
      lines.push(indent + '  </listeners>');
    }
    
    // Step Implementation
    if (step.type === 'A') {
      // Batchlet
      lines.push(indent + '  <batchlet ref="' + step.batchletClass + '" />');
      
    } else if (step.type === 'B' || step.type === 'C') {
      // Chunk or Chunk with Partition
      let chunkTag = indent + '  <chunk';
      
      // Checkpoint configuration
      if (step.checkpointConfig?.enabled) {
        if (step.checkpointConfig.customPolicy) {
          chunkTag += ' checkpoint-policy="custom"';
        } else {
          chunkTag += ' checkpoint-policy="item"';
          if (step.checkpointConfig.itemCount) {
            chunkTag += ' item-count="' + step.checkpointConfig.itemCount + '"';
          }
          if (step.checkpointConfig.timeLimit) {
            chunkTag += ' time-limit="' + step.checkpointConfig.timeLimit + '"';
          }
        }
      }
      
      chunkTag += '>';
      lines.push(chunkTag);
      
      // Custom checkpoint algorithm
      if (step.checkpointConfig?.enabled && step.checkpointConfig.customPolicy) {
        lines.push(indent + '    <checkpoint-algorithm ref="' + step.checkpointConfig.customPolicy + '">');
        if (step.checkpointConfig.customPolicyProperties && step.checkpointConfig.customPolicyProperties.length > 0) {
          lines.push(indent + '      <properties>');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          step.checkpointConfig.customPolicyProperties.forEach((prop: any) => {
            lines.push(indent + '        <property name="' + prop.key + '" value="' + prop.value + '" />');
          });
          lines.push(indent + '      </properties>');
        }
        lines.push(indent + '    </checkpoint-algorithm>');
      }
      
      // Reader
      if (step.readerClass) {
        lines.push(indent + '    <reader ref="' + step.readerClass + '" />');
      }
      
      // Processor (if enabled)
      if (step.addProcessor && step.processorClass) {
        lines.push(indent + '    <processor ref="' + step.processorClass + '" />');
      }
      
      // Exception handling
      const hasSkipExceptions = step.skipExceptionClasses && step.skipExceptionClasses.length > 0;
      const hasSkipExcludes = step.skipExcludeClasses && step.skipExcludeClasses.length > 0;
      const hasRetryExceptions = step.retryExceptionClasses && step.retryExceptionClasses.length > 0;
      const hasRetryExcludes = step.retryExcludeClasses && step.retryExcludeClasses.length > 0;
      const hasNoRollbackExceptions = step.noRollbackExceptionClasses && step.noRollbackExceptionClasses.length > 0;
      
      if (hasSkipExceptions || hasSkipExcludes) {
        lines.push(indent + '    <skippable-exception-classes>');
        if (hasSkipExceptions) {
          step.skipExceptionClasses.forEach((exceptionClass: string) => {
            lines.push(indent + '      <include class="' + exceptionClass + '" />');
          });
        }
        if (hasSkipExcludes) {
          step.skipExcludeClasses.forEach((exceptionClass: string) => {
            lines.push(indent + '      <exclude class="' + exceptionClass + '" />');
          });
        }
        lines.push(indent + '    </skippable-exception-classes>');
      }
      
      if (hasRetryExceptions || hasRetryExcludes) {
        lines.push(indent + '    <retryable-exception-classes>');
        if (hasRetryExceptions) {
          step.retryExceptionClasses.forEach((exceptionClass: string) => {
            lines.push(indent + '      <include class="' + exceptionClass + '" />');
          });
        }
        if (hasRetryExcludes) {
          step.retryExcludeClasses.forEach((exceptionClass: string) => {
            lines.push(indent + '      <exclude class="' + exceptionClass + '" />');
          });
        }
        lines.push(indent + '    </retryable-exception-classes>');
      }
      
      if (hasNoRollbackExceptions) {
        lines.push(indent + '    <no-rollback-exception-classes>');
        step.noRollbackExceptionClasses.forEach((exceptionClass: string) => {
          lines.push(indent + '      <include class="' + exceptionClass + '" />');
        });
        lines.push(indent + '    </no-rollback-exception-classes>');
      }
      
      // Writer
      if (step.writerClass) {
        lines.push(indent + '    <writer ref="' + step.writerClass + '" />');
      }
      
      // Partition (for type C)
      if (step.type === 'C') {
        lines.push(indent + '    <partition>');
        
        if (step.advancedPartitionConfig?.enabled) {
          // Advanced partitioning
          if (step.advancedPartitionConfig.mapperClass) {
            lines.push(indent + '      <mapper ref="' + step.advancedPartitionConfig.mapperClass + '" />');
          } else if (step.advancedPartitionConfig.partitionCount) {
            lines.push(indent + '      <plan partitions="' + step.advancedPartitionConfig.partitionCount + '" />');
          }
          
          if (step.advancedPartitionConfig.collectorClass) {
            lines.push(indent + '      <collector ref="' + step.advancedPartitionConfig.collectorClass + '" />');
          }
          
          if (step.advancedPartitionConfig.analyzerClass) {
            lines.push(indent + '      <analyzer ref="' + step.advancedPartitionConfig.analyzerClass + '" />');
          }
          
          if (step.advancedPartitionConfig.reducerClass) {
            lines.push(indent + '      <reducer ref="' + step.advancedPartitionConfig.reducerClass + '" />');
          }
        } else {
          // Simple partitioning
          if (step.partitionerClass) {
            lines.push(indent + '      <partitioner ref="' + step.partitionerClass + '" />');
          }
        }
        
        lines.push(indent + '    </partition>');
      }
      
      lines.push(indent + '  </chunk>');
    }
    
    // Step Transitions
    if (step.transitions && step.transitions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      step.transitions.forEach((transition: any) => {
        if (transition.action === 'next' && transition.to) {
          lines.push(indent + '  <next on="' + transition.on + '" to="' + transition.to + '" />');
        } else if (transition.action === 'end') {
          lines.push(indent + '  <end on="' + transition.on + '" />');
        } else if (transition.action === 'fail') {
          lines.push(indent + '  <fail on="' + transition.on + '" />');
        } else if (transition.action === 'stop') {
          lines.push(indent + '  <stop on="' + transition.on + '" />');
        }
      });
    }
    
    lines.push(indent + '</step>');
  }
};

export const downloadXML = (xml: string, filename: string) => {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};