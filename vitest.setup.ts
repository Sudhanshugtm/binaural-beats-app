/// <reference types="vitest" />
// ABOUTME: Vitest setup file for testing environment configuration
// Provides global test utilities and mocks for localStorage, ResizeObserver, and other browser APIs
import { beforeEach } from 'vitest';
// ABOUTME: Provides global test utilities and mocks for localStorage, ResizeObserver, and other browser APIs

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

// Mock matchMedia used by components to detect reduced motion or color scheme
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(), // deprecated but kept for compatibility
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

(window as any).matchMedia = matchMediaMock;
(global as any).matchMedia = matchMediaMock;

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for animations
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});
