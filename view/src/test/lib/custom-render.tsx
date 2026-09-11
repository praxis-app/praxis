import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement } from 'react';
import { AllProviders } from './all-providers';

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });
