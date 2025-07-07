// ABOUTME: Vitest setup file for testing environment configuration
// ABOUTME: Provides global test utilities and mocks for localStorage

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Create a proper localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});