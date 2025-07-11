
  import { type ReactNode } from 'react';
  import { useFormStore} from '@/lib/jsr352batchjobstore'

interface FormLayoutProps {
      children: ReactNode;
      currentStep?: number
}

 export const FormLayout: React.FC<FormLayoutProps>  =
 ({
    children,
    currentStep,
  }) => {
     const storeCurrentStep = useFormStore((state) => state.currentStep)
    const formData = useFormStore((state) => state.formData)
    const getLastestState = useFormStore((state) => state.getLastestState )

    return (
      <div className="min-h-screen  bg-[hsl(35, 38%,97%) relative flex flex-col">
          {children}
        </div>
    );
  };