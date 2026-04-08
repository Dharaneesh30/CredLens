import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the CredLens landing page', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /CredLens/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Predict Risk/i })).toBeInTheDocument();
});
