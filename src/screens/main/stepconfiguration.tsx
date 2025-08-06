import React from 'react';
import { useFormStore } from '@/lib/jsr352batchjobstore';
import BatchletDefinitionScreen from '../dynamic-steps/batchletdefinition';
import ChunkReaderScreen from '../dynamic-steps/chunkreaderscreen';
import ChunkProcessorScreen from '../dynamic-steps/chunkprocessorscreen';
import ChunkWriterScreen from '../dynamic-steps/chunkwriterscreen';

interface StepConfigurationProps {
  stepNumber: number;
}

const StepConfiguration: React.FC<StepConfigurationProps> = ({ stepNumber }) => {
  const { dynamicStepsData } = useFormStore();
  const currentStepData = dynamicStepsData.currentStep;
  const chunkPhase = dynamicStepsData.chunkPhase || 'reader';

  if (!currentStepData) {
    // If no current step data, redirect back to step definition
    const { setCurrentStep } = useFormStore();
    React.useEffect(() => {
      setCurrentStep(4);
    }, [setCurrentStep]);
    
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Redirecting to step definition...</p>
      </div>
    );
  }

  // Render appropriate configuration screen based on step type and phase
  switch (currentStepData.type) {
    case 'A': // Batchlet
      return <BatchletDefinitionScreen stepNumber={stepNumber} />;
    case 'B': // Chunk
    case 'C': // Chunk with Partition
      switch (chunkPhase) {
        case 'reader':
          return <ChunkReaderScreen stepNumber={stepNumber} />;
        case 'processor':
          return <ChunkProcessorScreen stepNumber={stepNumber} />;
        case 'writer':
          return <ChunkWriterScreen stepNumber={stepNumber} />;
        default:
          return <ChunkReaderScreen stepNumber={stepNumber} />;
      }
    default:
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Configuration for step type "{currentStepData.type}" is not yet implemented.</p>
        </div>
      );
  }
};

export default StepConfiguration;