import {
  type FieldValues,
  FormProvider,
  type UseFormReturn,
} from 'react-hook-form';
import { WizardProvider } from './wizard-context';
import { type WizardStepData } from './wizard.types';

interface WizardProps<FormValues extends FieldValues, ContextValues> {
  steps: WizardStepData[];
  currentStep: number;
  form: UseFormReturn<FormValues>;
  context?: ContextValues;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const Wizard = <FormValues extends FieldValues, ContextValues>({
  steps,
  currentStep,
  form,
  context,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting,
}: WizardProps<FormValues, ContextValues>) => {
  const step = steps[currentStep];
  const StepComponent = step.component;

  return (
    <FormProvider {...form}>
      <WizardProvider
        value={{
          context,
          onNext,
          onPrevious,
          onSubmit,
          isSubmitting,
        }}
      >
        <StepComponent {...step.props} />
      </WizardProvider>
    </FormProvider>
  );
};
