import './App.css'
import { useEffect } from "react";
import * as React from "react";
import { useFormStore } from "@/lib/jsr352batchjobstore";
import { useTheme } from "@/hooks/use-theme";
import { ProgressIndicator, MobileProgressIndicator } from "@/components/ui/progress-indicator";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, RotateCcw } from "lucide-react";
import {
  BatchDetailsScreen,
  BatchPropertiesScreen,
  BatchListenersScreen,
  JobRestartScreen,
  DynamicStepsScreen
} from "./screens/main"
import { SkipLink } from "@/components/ui/skip-link"


import SummaryScreen from "./screens/main/summaryscreen";
import StepConfiguration from "./screens/main/stepconfiguration";

const initialSteps = [
  { id: 0, name: "Batch Details", component: BatchDetailsScreen },
  { id: 1, name: "Batch Properties", component: BatchPropertiesScreen },
  { id: 2, name: "Batch Listeners", component: BatchListenersScreen },
  { id: 3, name: "Job Restart", component: JobRestartScreen },
  { id: 4, name: "Step Definition", component: DynamicStepsScreen },
  { id: 5, name: "Step Configuration", component: StepConfiguration },
  { id: 6, name: "Summary", component: SummaryScreen },
];

const App = () => {
  const { theme, setTheme } = useTheme();
  const [sidebarVisible] = React.useState(true);

  // Session management - reset form data on new browser session
  useEffect(() => {
    const sessionId = sessionStorage.getItem('batchtool_session_id');
    const currentSessionId = Date.now().toString();
    
    // If no session ID exists or it's a new browser session, reset everything
    if (!sessionId) {
      sessionStorage.clear();
      sessionStorage.setItem('batchtool_session_id', currentSessionId);
      sessionStorage.setItem('batchtool_initialized', 'true');
    }
  }, []);

  const {
    steps,
    setSteps,
    currentStep,
    setCurrentStep,
    resetForm,
  } = useFormStore();

  // Reset form data when session starts
  useEffect(() => {
    const isNewSession = !sessionStorage.getItem('batchtool_session_active');
    if (isNewSession) {
      resetForm();
      sessionStorage.setItem('batchtool_session_active', 'true');
    }
  }, [resetForm]);

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  // Initialize steps on first load
  useEffect(() => {
    try {
      if (!steps || steps.length === 0) {
        setSteps(initialSteps);
        setCurrentStep(0);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize steps:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        currentSteps: steps,
        currentStepIndex: currentStep,
        timestamp: new Date().toISOString()
      });
      setSteps(initialSteps);
      setCurrentStep(0);
    }
  }, [steps, setSteps, setCurrentStep, currentStep]);
  // Render the current step
  const renderStep = () => {
    try {
      if (!steps || steps.length === 0 || currentStep < 0 || currentStep >= steps.length) {
        return <div className="text-destructive">No steps available or invalid step index.</div>;
      }
      
      const stepObj = steps[currentStep];
      
      if (!stepObj || !stepObj.component) {
        return <div className="text-destructive">Step component not found.</div>;
      }
      
      const StepComponent = stepObj.component;
      
      return (
        <div>
          <StepComponent stepNumber={currentStep}/>
        </div>  
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error rendering step:', error);
      return <div className="text-destructive">An error occurred while loading the step.</div>;
    }
  };
  // TypeScript expects a React component type, not an element.
  // Ensure that each step's `component` is a React component (not an element).
  // If you get a type error, you can cast as React.ComponentType<{ step: number }>
  // Example: const StepComponent = stepObj.component as React.ComponentType<{ step: number }>;   

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <div className="container mx-auto px-4 lg:px-6 xl:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">B</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">JSR-352 Batch Tool</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground" role="status" aria-live="polite">
              <span>Step {currentStep + 1} of {steps?.length || 0}</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to start a new session? This will clear all form data.')) {
                  sessionStorage.clear();
                  window.location.reload();
                }
              }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
              aria-label="Start new session"
              title="New Session"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={cycleTheme}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
              aria-label={`Current: ${theme} mode. Click to cycle themes`}
              title={`${theme} mode`}
            >
              {getThemeIcon()}
            </button>
          </div>
        </div>
      </header>
      
      <main id="main-content" className="flex-1 bg-muted/30 dark:bg-background transition-colors" role="main">
        {/* Desktop Layout - Column Based */}
        <div className="hidden lg:flex h-full">
          {/* Progress Column */}
          <div className={cn(
            "transition-all duration-300 bg-card border-r border-border",
            sidebarVisible ? "w-80" : "w-0 overflow-hidden"
          )}>
            <ProgressIndicator 
              isVisible={sidebarVisible} 
            />
          </div>
          
          {/* Main Content Column */}
          <div className="flex-1 flex justify-center items-start py-4 sm:py-6 lg:py-8">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
              {renderStep()}
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden py-4 sm:py-6">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
            <MobileProgressIndicator />
            {renderStep()}
          </div>
        </div>
      </main>
      
      <footer className="border-t bg-card py-3 sm:py-4 transition-colors" role="contentinfo">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">
            © 2024 JSR-352 Batch Configuration Tool - Streamline your batch job setup
          </p>
        </div>
      </footer>
    </div>
  )
};

export default App;
