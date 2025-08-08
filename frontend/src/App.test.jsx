import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from './App';

expect.extend(matchers);

test('renders header', () => {
  render(<App />);
  expect(screen.getByText(/GitPLM/i)).toBeInTheDocument();
});

test('renders search bar and filter button', () => {
  render(<App />);
  const inputs = screen.getAllByPlaceholderText(/Search categories/i);
  expect(inputs.length).toBeGreaterThan(0);
  const buttons = screen.getAllByRole('button', { name: /filter/i });
  expect(buttons.length).toBeGreaterThan(0);
});
