import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock(
  "react-router-dom",
  () => ({
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

test("renders the home fraud analysis page", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /Financial Fraud Detection Analysis/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Open Dashboard/i })).toBeInTheDocument();
});
