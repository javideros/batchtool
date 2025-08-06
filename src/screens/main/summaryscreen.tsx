import React from 'react';
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useStepNavigation } from "@/hooks/use-step-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateJSR352XML, downloadXML, copyToClipboard } from "@/utils/xmlGenerator";
import { validateJSR352XML, formatValidationResults } from "@/utils/xmlValidator";
import { useState, useMemo } from "react";

const functionalAreaMap = {
  'ED': 'Eligibility',
  'DC': 'Data Collection',
  'FN': 'Finance',
  'IN': 'Interfaces'
};

const frequencyMap = {
  'DLY': 'Daily',
  'WKY': 'Weekly',
  'MTH': 'Monthly',
  'YRL': 'Yearly'
};

const SummaryScreen: React.FC<{ stepNumber: number }> = ({ stepNumber }) => {
  const { formData, setCurrentStep, resetForm } = useFormStore();
  const stepItems = formData.stepItems || [];
  const [showXMLPreview, setShowXMLPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Create a dummy form object for navigation hook (summary doesn't have actual form)
  const dummyForm = { getValues: () => ({}) };
  const { handleBack } = useStepNavigation(stepNumber, undefined);
  
  // Generate XML
  const generatedXML = generateJSR352XML(formData);
  
  // Validate XML
  const validationResult = useMemo(() => {
    return validateJSR352XML(generatedXML);
  }, [generatedXML]);

  // Validate step transitions
  const validateTransitions = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validationErrors: any[] = [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stepItems.forEach((item: any, index: number) => {
      if (item.transitions && item.transitions.length > 0) {
        // Get all step names that exist before this step (for forward references)
        // and all step names in the job (for backward references)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allStepNames = stepItems.map((step: any) => step.stepName).filter(Boolean);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item.transitions.forEach((transition: any, tIndex: number) => {
          if (transition.action === 'next' && transition.to) {
            if (!allStepNames.includes(transition.to)) {
              validationErrors.push({
                stepIndex: index,
                stepName: item.stepName,
                transitionIndex: tIndex,
                error: `Target step "${transition.to}" does not exist`,
                transition
              });
            }
          }
        });
      }
    });
    
    return validationErrors;
  };
  
  const transitionErrors = validateTransitions();

  const handleFinish = () => {
    resetForm();
    setCurrentStep(0);
  };
  
  const handleDownloadXML = () => {
    const filename = `${formData.batchName || 'batch-job'}.xml`;
    downloadXML(generatedXML, filename);
  };
  
  const handleCopyXML = async () => {
    const success = await copyToClipboard(generatedXML);
    setCopySuccess(success);
    if (success) {
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };



  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          📋 Configuration Summary
        </h1>
        <p className="text-muted-foreground">Review your batch job configuration</p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚙️ Batch Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">Batch Name:</span>
                <span className="font-semibold">{formData.batchName}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">Functional Area:</span>
                <span>{functionalAreaMap[formData.functionalAreaCd as keyof typeof functionalAreaMap] || formData.functionalAreaCd}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">Frequency:</span>
                <span>{frequencyMap[formData.frequency as keyof typeof frequencyMap] || formData.frequency}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">Package Name:</span>
                <span>{formData.packageName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Batch Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg font-semibold">
                <span>Name</span>
                <span>Description</span>
                <span>Type</span>
              </div>
              
              {/* Required asOfDate property */}
              {formData.batchProperties?.asOfDate && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">asOfDate</span>
                    <span>{formData.batchProperties.asOfDate.description}</span>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Date</span>
                  </div>
                </div>
              )}
              
              {/* Optional pageSize property */}
              {formData.batchProperties?.pageSize?.enabled && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">pageSize</span>
                    <span>{formData.batchProperties.pageSize.description}</span>
                    <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">Number</span>
                  </div>
                  {formData.batchProperties.pageSize.defaultValue && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Default: {formData.batchProperties.pageSize.defaultValue}
                    </div>
                  )}
                </div>
              )}
              
              {/* Optional inputFilePattern property */}
              {formData.batchProperties?.inputFilePattern?.enabled && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">inputFilePattern</span>
                    <span>{formData.batchProperties.inputFilePattern.description}</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded">String</span>
                  </div>
                  {formData.batchProperties.inputFilePattern.defaultValue && (
                    <div className="text-xs text-gray-600 mt-1">
                      Default: {formData.batchProperties.inputFilePattern.defaultValue}
                    </div>
                  )}
                </div>
              )}
              
              {/* Custom properties */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {formData.batchProperties?.customProperties && formData.batchProperties.customProperties.map((prop: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">{prop.name}</span>
                    <span>{prop.description}</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded">{prop.type}</span>
                  </div>
                  {prop.defaultValue && (
                    <div className="text-xs text-gray-600 mt-1">
                      Default: {prop.defaultValue}
                    </div>
                  )}
                  {prop.required && (
                    <div className="text-xs text-red-600 mt-1">
                      Required
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {formData.batchListeners && formData.batchListeners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎧 Batch Listeners ({formData.batchListeners.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {formData.batchListeners.map((listener: any, index: number) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{listener.listenerName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔄 Job Restart Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.jobRestartConfig ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Job Restartable:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      formData.jobRestartConfig.restartable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {formData.jobRestartConfig.restartable ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Step Restartable:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      formData.jobRestartConfig.stepRestartConfig.restartable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {formData.jobRestartConfig.stepRestartConfig.restartable ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Start Limit:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {formData.jobRestartConfig.stepRestartConfig.startLimit} attempts
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Allow Start If Complete:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      formData.jobRestartConfig.stepRestartConfig.allowStartIfComplete 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formData.jobRestartConfig.stepRestartConfig.allowStartIfComplete ? '⚠️ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Using default restart configuration (restartable=true, startLimit=3)</p>
            )}
          </CardContent>
        </Card>

        {stepItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔧 Step Items ({stepItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {stepItems.map((item: any, index: number) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                          Step {index + 1}
                        </span>
                        <span className="text-lg font-semibold">{item.stepName}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">Type:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.type === 'A' ? 'bg-purple-100 text-purple-800' :
                          item.type === 'B' ? 'bg-orange-100 text-orange-800' :
                          item.type === 'C' ? 'bg-red-100 text-red-800' :
                          item.type === 'DECISION' ? 'bg-yellow-100 text-yellow-800' :
                          item.type === 'SPLIT' ? 'bg-cyan-100 text-cyan-800' :
                          item.type === 'FLOW' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.type === 'A' ? '🔨 Batchlet' : 
                           item.type === 'B' ? '📊 Chunk' : 
                           item.type === 'C' ? '🔄 Chunk with Partition' :
                           item.type === 'DECISION' ? '🤔 Decision' :
                           item.type === 'SPLIT' ? '🔄 Split/Parallel' :
                           item.type === 'FLOW' ? '🌊 Flow' : item.type}
                        </span>
                        {item.addProcessor && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ Processor Enabled
                          </span>
                        )}
                      </div>
                      
                      {/* Implementation Classes */}
                      <div className="mt-3 p-3 bg-card rounded border">
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Implementation Classes:
                        </div>
                        <div className="space-y-1">
                          {item.batchletClass && (
                            <div className="text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                              <span className="font-medium">Batchlet:</span> {item.batchletClass}
                            </div>
                          )}
                          {item.deciderClass && (
                            <div className="text-sm bg-yellow-100 px-2 py-1 rounded">
                              <span className="font-medium">Decider:</span> {item.deciderClass}
                            </div>
                          )}
                          {item.flows && (
                            <div className="text-sm bg-cyan-100 px-2 py-1 rounded">
                              <span className="font-medium">Parallel Flows:</span> {item.flows.length} flows
                              <div className="mt-1 space-y-1">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {item.flows.map((flow: any, flowIndex: number) => (
                                  <div key={flowIndex} className="text-xs bg-cyan-50 px-2 py-1 rounded border-l-2 border-cyan-200">
                                    <span className="font-medium text-cyan-700">{flow.flowName}:</span> {flow.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.type === 'FLOW' && (
                            <div className="text-sm bg-teal-100 px-2 py-1 rounded">
                              <span className="font-medium">Flow:</span> {item.description}
                              {item.nextStep && (
                                <div className="text-xs bg-teal-50 px-2 py-1 rounded mt-1 border-l-2 border-teal-200">
                                  <span className="font-medium text-teal-700">Next Step:</span> {item.nextStep}
                                </div>
                              )}
                            </div>
                          )}
                          {item.readerClass && (
                            <div className="space-y-1">
                              <div className="text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                <span className="font-medium">Reader:</span> {item.readerClass}
                              </div>
                              {item.readerTableName && (
                                <div className="text-xs bg-green-50 px-2 py-1 rounded ml-4 border-l-2 border-green-200">
                                  <span className="font-medium text-green-700">Table:</span> {item.readerTableName}
                                </div>
                              )}
                            </div>
                          )}
                          {item.processorClass && (
                            <div className="space-y-1">
                              <div className="text-sm bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                <span className="font-medium">Processor:</span> {item.processorClass}
                              </div>
                              {item.skipExceptionClasses && item.skipExceptionClasses.length > 0 && (
                                <div className="text-xs bg-orange-50 px-2 py-1 rounded ml-4 border-l-2 border-orange-200">
                                  <span className="font-medium text-orange-700">Skip Exceptions:</span> {item.skipExceptionClasses.join(', ')}
                                  {item.skipLimit && <span className="ml-2 text-orange-600">(limit: {item.skipLimit})</span>}
                                </div>
                              )}
                              {item.skipExcludeClasses && item.skipExcludeClasses.length > 0 && (
                                <div className="text-xs bg-red-50 px-2 py-1 rounded ml-4 border-l-2 border-red-200">
                                  <span className="font-medium text-red-700">Skip Excludes:</span> {item.skipExcludeClasses.join(', ')}
                                </div>
                              )}
                              {item.retryExceptionClasses && item.retryExceptionClasses.length > 0 && (
                                <div className="text-xs bg-blue-50 px-2 py-1 rounded ml-4 border-l-2 border-blue-200">
                                  <span className="font-medium text-blue-700">Retry Exceptions:</span> {item.retryExceptionClasses.join(', ')}
                                  {item.retryLimit && <span className="ml-2 text-blue-600">(limit: {item.retryLimit})</span>}
                                </div>
                              )}
                              {item.retryExcludeClasses && item.retryExcludeClasses.length > 0 && (
                                <div className="text-xs bg-red-50 px-2 py-1 rounded ml-4 border-l-2 border-red-200">
                                  <span className="font-medium text-red-700">Retry Excludes:</span> {item.retryExcludeClasses.join(', ')}
                                </div>
                              )}
                              {item.noRollbackExceptionClasses && item.noRollbackExceptionClasses.length > 0 && (
                                <div className="text-xs bg-purple-50 px-2 py-1 rounded ml-4 border-l-2 border-purple-200">
                                  <span className="font-medium text-purple-700">No-Rollback Exceptions:</span> {item.noRollbackExceptionClasses.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                          {item.writerClass && (
                            <div className="space-y-1">
                              <div className="text-sm bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                                <span className="font-medium">Writer:</span> {item.writerClass}
                              </div>
                              {item.writerTableName && (
                                <div className="text-xs bg-red-50 px-2 py-1 rounded ml-4 border-l-2 border-red-200">
                                  <span className="font-medium text-red-700">Table:</span> {item.writerTableName}
                                </div>
                              )}
                            </div>
                          )}
                          {item.partitionerClass && (
                            <div className="text-sm bg-indigo-100 px-2 py-1 rounded">
                              <span className="font-medium">Partitioner:</span> {item.partitionerClass}
                            </div>
                          )}
                          {item.advancedPartitionConfig && item.advancedPartitionConfig.enabled && (
                            <div className="text-sm bg-indigo-100 px-2 py-1 rounded">
                              <span className="font-medium">Advanced Partitioning:</span> ✅ Enabled
                              <div className="mt-1 space-y-1">
                                {item.advancedPartitionConfig.mapperClass && (
                                  <div className="text-xs bg-indigo-50 px-2 py-1 rounded border-l-2 border-indigo-200">
                                    <span className="font-medium text-indigo-700">🗺️ Mapper:</span> {item.advancedPartitionConfig.mapperClass}
                                  </div>
                                )}
                                {item.advancedPartitionConfig.partitionCount && (
                                  <div className="text-xs bg-indigo-50 px-2 py-1 rounded border-l-2 border-indigo-200">
                                    <span className="font-medium text-indigo-700">🔢 Partitions:</span> {item.advancedPartitionConfig.partitionCount}
                                  </div>
                                )}
                                {item.advancedPartitionConfig.collectorClass && (
                                  <div className="text-xs bg-indigo-50 px-2 py-1 rounded border-l-2 border-indigo-200">
                                    <span className="font-medium text-indigo-700">📦 Collector:</span> {item.advancedPartitionConfig.collectorClass}
                                  </div>
                                )}
                                {item.advancedPartitionConfig.analyzerClass && (
                                  <div className="text-xs bg-indigo-50 px-2 py-1 rounded border-l-2 border-indigo-200">
                                    <span className="font-medium text-indigo-700">🔍 Analyzer:</span> {item.advancedPartitionConfig.analyzerClass}
                                  </div>
                                )}
                                {item.advancedPartitionConfig.reducerClass && (
                                  <div className="text-xs bg-indigo-50 px-2 py-1 rounded border-l-2 border-indigo-200">
                                    <span className="font-medium text-indigo-700">🤝 Reducer:</span> {item.advancedPartitionConfig.reducerClass}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Checkpoint Configuration */}
                      {item.checkpointConfig && item.checkpointConfig.enabled && (
                        <div className="mt-3 p-3 bg-card rounded border">
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Checkpoint Configuration:
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm bg-blue-100 px-2 py-1 rounded">
                              <span className="font-medium">Enabled:</span> ✅ Yes
                              {item.checkpointConfig.itemCount && (
                                <span className="ml-2">(📊 Every {item.checkpointConfig.itemCount} items)</span>
                              )}
                              {item.checkpointConfig.timeLimit && (
                                <span className="ml-2">(⏱️ Every {item.checkpointConfig.timeLimit}s)</span>
                              )}
                            </div>
                            {item.checkpointConfig.customPolicy && (
                              <div className="text-xs bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-200">
                                <span className="font-medium text-blue-700">Custom Policy:</span> {item.checkpointConfig.customPolicy}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step Transitions */}
                      {item.transitions && item.transitions.length > 0 && (
                        <div className="mt-3 p-3 bg-card rounded border">
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Step Transitions ({item.transitions.length}):
                          </div>
                          <div className="space-y-1">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {item.transitions.map((transition: any, transitionIndex: number) => {
                              const hasError = transitionErrors.some(err => 
                                err.stepIndex === index && err.transitionIndex === transitionIndex
                              );
                              return (
                                <div key={transitionIndex} className={`text-sm px-2 py-1 rounded ${
                                  hasError ? 'bg-red-100 border border-red-300' : 'bg-purple-100'
                                }`}>
                                  <span className="font-medium">On {transition.on}:</span> {transition.action}
                                  {transition.to && (
                                    <span className={`ml-1 ${
                                      hasError ? 'text-red-700 font-medium' : ''
                                    }`}>
                                      → {transition.to}
                                      {hasError && <span className="ml-1">⚠️</span>}
                                    </span>
                                  )}
                                  {transition.exitStatus && <span className="ml-1 text-purple-700">(exit: {transition.exitStatus})</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {item.listeners && Array.isArray(item.listeners) && item.listeners.length > 0 && (
                        <div className="mt-3 p-3 bg-card rounded border">
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Step Listeners ({item.listeners.length}):
                          </div>
                          <div className="space-y-1">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {item.listeners.map((listener: any, listenerIndex: number) => (
                              <div key={listenerIndex} className="text-sm bg-blue-100 px-2 py-1 rounded">
                                {listener}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* XML Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📄 Generated JSR-352 XML
            </CardTitle>
            <CardDescription>
              Your complete batch job configuration in JSR-352 XML format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* XML Validation Status */}
              <div className={`p-3 rounded-lg border ${
                validationResult.isValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg ${
                    validationResult.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationResult.isValid ? '✅' : '❌'}
                  </span>
                  <span className={`font-semibold ${
                    validationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.isValid ? 'Valid JSR-352 XML' : 'XML Validation Failed'}
                  </span>
                </div>
                
                {validationResult.errors.length > 0 && (
                  <div className="text-sm text-red-700">
                    <div className="font-medium mb-1">😨 Errors ({validationResult.errors.length}):</div>
                    <ul className="list-disc list-inside space-y-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {validationResult.errors.slice(0, 3).map((error: any, index: number) => (
                        <li key={index}>{error.message}</li>
                      ))}
                      {validationResult.errors.length > 3 && (
                        <li className="text-red-600">...and {validationResult.errors.length - 3} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <div className="text-sm text-yellow-700 mt-2">
                    <div className="font-medium mb-1">⚠️ Warnings ({validationResult.warnings.length}):</div>
                    <ul className="list-disc list-inside space-y-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {validationResult.warnings.slice(0, 2).map((warning: any, index: number) => (
                        <li key={index}>{warning.message}</li>
                      ))}
                      {validationResult.warnings.length > 2 && (
                        <li className="text-yellow-600">...and {validationResult.warnings.length - 2} more warnings</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* XML Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowXMLPreview(!showXMLPreview)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {showXMLPreview ? '🙈 Hide' : '👁️ Preview'} XML
                </Button>
                <Button
                  onClick={handleDownloadXML}
                  disabled={!validationResult.isValid}
                  className={`flex items-center gap-2 ${
                    validationResult.isValid 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  💾 Download XML
                </Button>
                <Button
                  onClick={handleCopyXML}
                  variant="outline"
                  className={`flex items-center gap-2 ${
                    copySuccess ? 'bg-green-50 border-green-300 text-green-700' : ''
                  }`}
                >
                  {copySuccess ? '✅ Copied!' : '📋 Copy XML'}
                </Button>
                
                {/* Validation Details Button */}
                <Button
                  onClick={() => {
                    const validationText = formatValidationResults(validationResult);
                    navigator.clipboard.writeText(validationText);
                  }}
                  variant="outline"
                  className="flex items-center gap-2 text-sm"
                >
                  📋 Copy Validation Report
                </Button>
              </div>
              
              {/* XML Preview */}
              {showXMLPreview && (
                <div className="mt-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      <code>{generatedXML}</code>
                    </pre>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    📝 <strong>File:</strong> {formData.batchName || 'batch-job'}.xml
                    <span className="ml-4">📊 <strong>Size:</strong> {new Blob([generatedXML]).size} bytes</span>
                  </div>
                </div>
              )}
              
              {/* XML Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 About Your JSR-352 XML:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• <strong>Validation Status:</strong> {validationResult.isValid ? '✅ Valid' : '❌ Invalid'} JSR-352 format</div>
                  <div>• <strong>Errors Found:</strong> {validationResult.errors.length} structural/content errors</div>
                  <div>• <strong>Warnings:</strong> {validationResult.warnings.length} best practice suggestions</div>
                  <div>• <strong>Production Ready:</strong> {validationResult.isValid ? '✅ Yes' : '❌ Fix errors first'}</div>
                  <div>• <strong>File Size:</strong> {new Blob([generatedXML]).size} bytes</div>
                  <div>• <strong>Namespace:</strong> Uses official Java EE namespace</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Validation Errors */}
        {transitionErrors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Validation Errors ({transitionErrors.length})
              </CardTitle>
              <CardDescription>
                The following issues need to be resolved before generating the batch job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {transitionErrors.map((error: any, index: number) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">⚠️</span>
                      <div>
                        <div className="font-medium text-red-800">
                          Step "{error.stepName}" - Transition Error
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          {error.error}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          Transition: On "{error.transition.on}" → {error.transition.action} → "{error.transition.to}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleBack(dummyForm)}
          className="w-full sm:w-auto "
        >
          ← Back
        </Button>
        <Button 
          onClick={handleFinish}
          variant="outline"
          className="w-full sm:w-auto "
        >
          🎉 Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default SummaryScreen;