import { createContext, useContext } from 'react';

export interface WizardContextType<ContextValues> {
  context: ContextValues;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const WizardContext = createContext<
  WizardContextType<unknown> | undefined
>(undefined);

export const useWizardContext = <
  ContextValues,
>(): WizardContextType<ContextValues> => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context as WizardContextType<ContextValues>;
};
