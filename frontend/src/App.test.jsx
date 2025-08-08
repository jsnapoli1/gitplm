import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from './App';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({})),
  },
}));

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

test('allows creating a part', async () => {
  axios.get
    .mockResolvedValueOnce({ data: [{ id: 'RES', name: 'Resistors' }] })
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: [{ id: 'RES-1234', name: 'My Resistor' }] });
  axios.post.mockResolvedValueOnce({});

  render(<App />);

  const categoryButton = await screen.findByRole('button', { name: /RES - Resistors/ });
  fireEvent.click(categoryButton);

  const idInput = await screen.findByPlaceholderText('Part ID');
  fireEvent.change(idInput, { target: { value: 'RES-1234' } });

  const nameInput = screen.getByPlaceholderText('Part Name');
  fireEvent.change(nameInput, { target: { value: 'My Resistor' } });

  fireEvent.click(screen.getByRole('button', { name: 'Create Part' }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/v1/parts.json',
      { id: 'RES-1234', name: 'My Resistor', category: 'RES' }
    );
  });

test('handles non-array parts response', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 'RES', name: 'Resistors' }] });
  axios.get.mockResolvedValueOnce({ data: { error: 'oops' } });
  render(<App />);
  fireEvent.click(await screen.findByText('RES - Resistors'));
  await waitFor(() => {
    expect(screen.getByText('Parts for RES')).toBeInTheDocument();
  });

  test('renders search bar and filter button', () => {
  render(<App />);
  const inputs = screen.getAllByPlaceholderText(/Search categories/i);
  expect(inputs.length).toBeGreaterThan(0);
  const buttons = screen.getAllByRole('button', { name: /filter/i });
  expect(buttons.length).toBeGreaterThan(0);
});
