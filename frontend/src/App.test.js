import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the CredLens landing page', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /AI-Powered Credit Risk Intelligence/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Launch Workspace/i })).toBeInTheDocument();
});
