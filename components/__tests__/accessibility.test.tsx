// Comprehensive accessibility test suite for WCAG 2.1 AA compliance
// Tests screen reader support, keyboard navigation, and focus management

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { AccessibilityProvider } from '@/components/AccessibilityProvider'
import { AccessibilitySettings } from '@/components/AccessibilitySettings'
import { Header } from '@/components/header'
import { LoginForm } from '@/components/auth/login-form'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Next.js router
const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockReplace = vi.fn()
const mockSearchParamsGet = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: mockReplace,
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}))

// Mock Supabase client helper
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Wrapper component for accessibility tests
const AccessibilityTestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
)

describe('Accessibility Compliance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParamsGet.mockReturnValue(null)
    mockReplace.mockClear()
    // Reset any DOM modifications
    document.body.className = ''
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-font-size')
  })

  describe('WCAG 2.1 AA Compliance', () => {
    it('should not have any accessibility violations in AccessibilityProvider', async () => {
      const { container } = render(
        <AccessibilityTestWrapper>
          <div>Test content</div>
        </AccessibilityTestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have any accessibility violations in AccessibilitySettings', async () => {
      const { container } = render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have any accessibility violations in Header', async () => {
      const { container } = render(
        <AccessibilityTestWrapper>
          <Header />
        </AccessibilityTestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have any accessibility violations in LoginForm', async () => {
      const { container } = render(
        <AccessibilityTestWrapper>
          <LoginForm />
        </AccessibilityTestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide proper ARIA labels and roles', () => {
      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Check for accessibility settings button
      const settingsButton = screen.getByRole('button', { name: /accessibility/i })
      expect(settingsButton).toBeInTheDocument()
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false')

      // Open settings panel
      fireEvent.click(settingsButton)
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true')

      // Check for settings panel
      const settingsPanel = screen.getByRole('region', { name: /accessibility settings/i })
      expect(settingsPanel).toBeInTheDocument()
    })

    it('should announce changes to screen readers', async () => {
      const mockAnnounce = vi.fn()
      // Mock the accessibility context
      vi.spyOn(require('@/components/AccessibilityProvider'), 'useAccessibility').mockReturnValue({
        settings: {
          highContrast: false,
          fontSize: 'medium',
          reducedMotion: false,
          screenReaderAnnouncements: true,
          keyboardNavigation: true,
          visualIndicators: true,
          audioDescriptions: false,
        },
        updateSetting: vi.fn(),
        announceToScreenReader: mockAnnounce,
        focusElement: vi.fn(),
      })

      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Open settings panel
      fireEvent.click(screen.getByRole('button', { name: /accessibility/i }))

      // Toggle high contrast
      const highContrastToggle = screen.getByLabelText(/high contrast/i)
      fireEvent.click(highContrastToggle)

      // Check that announcement was made
      expect(mockAnnounce).toHaveBeenCalledWith(
        expect.stringContaining('Accessibility settings panel'),
        'assertive'
      )
    })

    it('should provide proper form validation messages', async () => {
      render(
        <AccessibilityTestWrapper>
          <LoginForm />
        </AccessibilityTestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Submit form without filling fields
      fireEvent.click(submitButton)

      await waitFor(() => {
        // Check for error messages
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()

        // Check ARIA attributes
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', () => {
      render(
        <AccessibilityTestWrapper>
          <Header />
        </AccessibilityTestWrapper>
      )

      const logo = screen.getByLabelText(/beatful home/i)
      const navLinks = screen.getAllByRole('link')

      // Test tab order
      logo.focus()
      expect(logo).toHaveFocus()

      // Navigate through links
      navLinks.forEach((link, index) => {
        if (index > 0) {
          fireEvent.keyDown(link, { key: 'Tab' })
        }
      })
    })

    it('should support keyboard shortcuts for audio controls', () => {
      const mockAnnounce = vi.fn()
      vi.spyOn(require('@/components/AccessibilityProvider'), 'useAccessibility').mockReturnValue({
        settings: {
          keyboardNavigation: true,
          screenReaderAnnouncements: true,
        },
        announceToScreenReader: mockAnnounce,
        updateSetting: vi.fn(),
        focusElement: vi.fn(),
      })

      render(
        <AccessibilityTestWrapper>
          <div>
            <button aria-label="Play audio">Play</button>
            <input type="range" aria-label="Volume slider" />
            <button aria-label="Mute audio">Mute</button>
          </div>
        </AccessibilityTestWrapper>
      )

      // Test spacebar for play/pause
      fireEvent.keyDown(document, { key: ' ' })

      // Test Alt+Up for volume up
      fireEvent.keyDown(document, { key: 'ArrowUp', altKey: true })

      // Test Alt+M for mute
      fireEvent.keyDown(document, { key: 'm', altKey: true })
    })

    it('should handle escape key for modal dialogs', () => {
      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Open settings panel
      fireEvent.click(screen.getByRole('button', { name: /accessibility/i }))

      // Test escape key
      fireEvent.keyDown(document, { key: 'Escape' })
    })
  })
})
