import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from './App';
import axios from 'axios';

expect.extend(matchers);

vi.mock('axios');

beforeEach(() => {
  axios.get.mockReset();
});

test('renders header', () => {
  axios.get.mockResolvedValue({ data: [] });
  render(<App />);
  expect(screen.getByText(/GitPLM/i)).toBeInTheDocument();
});

test('handles non-array parts response', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 'RES', name: 'Resistors' }] });
  axios.get.mockResolvedValueOnce({ data: { error: 'oops' } });
  render(<App />);
  fireEvent.click(await screen.findByText('RES - Resistors'));
  await waitFor(() => {
    expect(screen.getByText('Parts for RES')).toBeInTheDocument();
  });
});
