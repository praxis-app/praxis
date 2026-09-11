import { type ComponentType } from 'react';

export interface WizardStepProps {
  isLoading: boolean;
}

export interface WizardStepData {
  id: string;
  component: ComponentType<WizardStepProps>;
  props: WizardStepProps;
}
