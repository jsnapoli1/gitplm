import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from './App';

expect.extend(matchers);

test('renders header', () => {
  render(<App />);
  expect(screen.getByText(/GitPLM/i)).toBeInTheDocument();
});
