import { render } from '@testing-library/react';
import React from 'react';

/**
 * Custom render function for testing components that may need providers
 * Extend this as needed for your application's context providers
 */
export function renderWithProviders(ui, options = {}) {
  const { wrapper, ...renderOptions } = options;
  
  // Default wrapper (you can add providers here as needed)
  const Wrapper = ({ children }) => {
    if (wrapper) {
      const CustomWrapper = wrapper;
      return <CustomWrapper>{children}</CustomWrapper>;
    }
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';




