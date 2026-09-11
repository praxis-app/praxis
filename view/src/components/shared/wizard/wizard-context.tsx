import { type ReactNode } from 'react';
import { WizardContext, type WizardContextType } from './wizard-hooks';

interface WizardProviderProps<ContextValues> {
  children: ReactNode;
  value: WizardContextType<ContextValues>;
}

export const WizardProvider = <ContextValues,>({
  children,
  value,
}: WizardProviderProps<ContextValues>) => {
  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
};
