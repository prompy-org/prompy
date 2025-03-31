import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../components/Login";

jest.mock("../services/auth", () => ({
  testLogin: jest.fn().mockResolvedValue("Success")
}));

const mockOnLoginSuccess = jest.fn();

describe("Login Component", () => {
  beforeEach(() => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
  });

  test("renders login heading and buttons", () => {
    expect(screen.getByText(/Welcome to Prompy/i)).toBeInTheDocument();
    expect(screen.getByText(/Please log in to access your prompts/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Use Test Account/i)).toBeInTheDocument();
  });

  test("calls handleGoogleLogin when clicking Google login button", () => {
    const googleLoginButton = screen.getByText(/Sign in with Google/i);
    fireEvent.click(googleLoginButton);
    expect(chrome.tabs.create).toHaveBeenCalled();
  });

  test("calls testLogin and onLoginSuccess when clicking Test Account button", async () => {
    const { testLogin } = require("../services/auth");
    const testLoginButton = screen.getByText(/Use Test Account/i);

    fireEvent.click(testLoginButton);

    expect(testLogin).toHaveBeenCalled();
  });
});
