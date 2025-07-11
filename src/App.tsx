import { useEffect } from "react";
import { useFormStore } from "@/lib/jsr352batchjobstore";
import BatchDetailsScreen from "./steps/batchdetails";
import BatchPropertiesScreen from "./steps/batchproperties";

import DynamicStepsScreen from "./steps/dynamicsteps";
import BatchListenersScreen from "./steps/batchlisteners";

const App = () => {
  const {
    steps,
    setSteps,
    currentStep,
    setCurrentStep,
    pendingStep,
    setPendingStep,
    stepItems,
    setFormData,
  } = useFormStore();

  // Initialize steps on first load
  useEffect(() => {
    if (!steps || steps.length === 0) {
      setSteps([
        { id: 0, name: "Batch Details", components: BatchDetailsScreen },
        { id: 1, name: "Batch Properties", components: BatchPropertiesScreen },
        { id: 2, name: "Batch Listeners", components: BatchListenersScreen },
        { id: 3, name: "Dynamic Steps", components: DynamicStepsScreen },
      ]);
      setCurrentStep(0);
    }
  }, [steps, setSteps, setCurrentStep]);

  // Handle dynamic navigation
  useEffect(() => {
    if (
      pendingStep !== null &&
      steps[pendingStep]
    ) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  }, [pendingStep, steps, setCurrentStep, setPendingStep]);

  // Sync stepItems to formData
  useEffect(() => {
    setFormData({ stepItems });
  }, [stepItems, setFormData]);

  // Render the current step
  const renderStep = () => {
    if (
      !steps ||
      steps.length === 0 ||
      currentStep < 0 ||
      currentStep >= steps.length
    ) {
      return <div className="text-center text-red-500">No step to display.</div>;
    }
    const stepObj = steps[currentStep];
    const StepComponent = stepObj.components;

    console.log("Current step:", steps[currentStep]);

    if (stepObj.insertedByDynamic && stepObj.stepItemId) {
      return <StepComponent step={currentStep} stepItemId={stepObj.stepItemId} />;
    }
    return <StepComponent step={currentStep} />;
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Batch Tool</h1>
        </div>
      </header>
      <main className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-6xl p-4 sm:p-8 mx-auto">
          <div className="grid grid-cols-1 gap-8">
            <div>
              {renderStep()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;