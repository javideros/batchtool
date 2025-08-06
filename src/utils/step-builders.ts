import {
  StepListenersScreen,
  BatchletDefinitionScreen,
  ChunkReaderScreen,
  ChunkProcessorScreen,
  ChunkWriterScreen,
  ChunkPartitionScreen,
  StepTransitionsScreen,
  DecisionStepScreen,
  SplitFlowScreen,
  FlowElementScreen,
  FlowStepsScreen
} from "../screens/dynamic-steps";
import { SummaryScreen } from "../screens/main";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStepObject = (id: number, name: string, component: any, currentId: string) => ({
  id,
  name,
  component: component,
  insertedByDynamic: true,
  stepItemId: currentId,
});

const createBatchletSteps = (nextStepIndex: number, currentId: string) => [
  createStepObject(nextStepIndex + 1, "Batchlet Definition", BatchletDefinitionScreen, currentId),
  createStepObject(nextStepIndex + 2, "Step Transitions", StepTransitionsScreen, currentId),
  createStepObject(nextStepIndex + 3, "Dynamic Step Items", null, currentId),
  createStepObject(nextStepIndex + 4, "Summary", SummaryScreen, currentId)
];

const createDecisionSteps = (nextStepIndex: number, currentId: string) => [
  createStepObject(nextStepIndex + 1, "Decision Configuration", DecisionStepScreen, currentId),
  createStepObject(nextStepIndex + 2, "Dynamic Step Items", null, currentId),
  createStepObject(nextStepIndex + 3, "Summary", SummaryScreen, currentId)
];

const createSplitSteps = (nextStepIndex: number, currentId: string) => [
  createStepObject(nextStepIndex + 1, "Split Configuration", SplitFlowScreen, currentId),
  createStepObject(nextStepIndex + 2, "Dynamic Step Items", null, currentId),
  createStepObject(nextStepIndex + 3, "Summary", SummaryScreen, currentId)
];

const createFlowSteps = (nextStepIndex: number, currentId: string) => [
  createStepObject(nextStepIndex + 1, "Flow Configuration", FlowElementScreen, currentId),
  createStepObject(nextStepIndex + 2, "Flow Steps", FlowStepsScreen, currentId),
  createStepObject(nextStepIndex + 3, "Summary", SummaryScreen, currentId)
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createChunkSteps = (data: any, nextStepIndex: number, currentId: string) => {
  const steps = [createStepObject(nextStepIndex + 1, "Chunk Reader", ChunkReaderScreen, currentId)];
  let offset = 2;
  
  if (data.addProcessor) {
    steps.push(createStepObject(nextStepIndex + offset, "Chunk Processor", ChunkProcessorScreen, currentId));
    offset++;
  }
  
  steps.push(createStepObject(nextStepIndex + offset, "Chunk Writer", ChunkWriterScreen, currentId));
  offset++;
  
  if (data.type === "C") {
    steps.push(createStepObject(nextStepIndex + offset, "Partition", ChunkPartitionScreen, currentId));
    offset++;
  }
  
  steps.push(createStepObject(nextStepIndex + offset, "Step Transitions", StepTransitionsScreen, currentId));
  offset++;
  
  steps.push(createStepObject(nextStepIndex + offset, "Dynamic Step Items", null, currentId));
  steps.push(createStepObject(nextStepIndex + offset + 1, "Summary", SummaryScreen, currentId));
  
  return steps;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildSubSteps = (data: any, nextStepIndex: number, currentId: string) => {
  if (data.type === "D") {
    return createDecisionSteps(nextStepIndex, currentId);
  }
  
  if (data.type === "S") {
    return createSplitSteps(nextStepIndex, currentId);
  }
  
  if (data.type === "F") {
    return createFlowSteps(nextStepIndex, currentId);
  }
  
  const baseSteps = [createStepObject(nextStepIndex, "Step Listeners", StepListenersScreen, currentId)];
  
  if (data.type === "A") {
    return [...baseSteps, ...createBatchletSteps(nextStepIndex, currentId)];
  }
  
  if (data.type === "B" || data.type === "C") {
    return [...baseSteps, ...createChunkSteps(data, nextStepIndex, currentId)];
  }
  
  return [...baseSteps, createStepObject(nextStepIndex + 1, "Summary", SummaryScreen, currentId)];
};