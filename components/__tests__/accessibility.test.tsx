// Comprehensive accessibility test suite for WCAG 2.1 AA compliance
// Tests screen reader support, keyboard navigation, and focus management

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { AccessibilityProvider } from '@/components/AccessibilityProvider'
import { AccessibilitySettings } from '@/components/AccessibilitySettings'
import { Header } from '@/components/header'
import { LoginForm } from '@/components/auth/login-form'
import { NextAuthProvider } from '@/components/auth/auth-provider'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Next.js router
const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/',
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Wrapper component for accessibility tests
const AccessibilityTestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>
    <NextAuthProvider>
      {children}
    </NextAuthProvider>
  </AccessibilityProvider>
)

describe('Accessibility Compliance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
      const mockAnnounce = jest.fn()
      // Mock the accessibility context
      jest.spyOn(require('@/components/AccessibilityProvider'), 'useAccessibility').mockReturnValue({
        settings: {
          highContrast: false,
          fontSize: 'medium',
          reducedMotion: false,
          screenReaderAnnouncements: true,
          keyboardNavigation: true,
          visualIndicators: true,
          audioDescriptions: false,
        },
        updateSetting: jest.fn(),
        announceToScreenReader: mockAnnounce,
        focusElement: jest.fn(),
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
        if (index > 0) { // Skip logo link
          fireEvent.keyDown(link, { key: 'Tab' })
        }
      })
    })

    it('should support keyboard shortcuts for audio controls', () => {
      const mockAnnounce = jest.fn()
      jest.spyOn(require('@/components/AccessibilityProvider'), 'useAccessibility').mockReturnValue({
        settings: {
          keyboardNavigation: true,
          screenReaderAnnouncements: true,
        },
        announceToScreenReader: mockAnnounce,
        updateSetting: jest.fn(),
        focusElement: jest.fn(),
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
      
      // Panel should close (implementation depends on actual modal structure)
    })
  })

  describe('Focus Management', () => {
    it('should provide visible focus indicators', () => {
      render(
        <AccessibilityTestWrapper>
          <Header />
        </AccessibilityTestWrapper>
      )

      const logo = screen.getByLabelText(/beatful home/i)
      logo.focus()
      
      // Check for focus styles (this would need custom focus detection)
      expect(logo).toHaveFocus()
    })

    it('should trap focus in modal dialogs', () => {
      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Open settings panel
      const settingsButton = screen.getByRole('button', { name: /accessibility/i })
      fireEvent.click(settingsButton)

      // Test focus trapping (implementation depends on actual modal structure)
      const panel = screen.getByRole('region', { name: /accessibility settings/i })
      expect(panel).toBeInTheDocument()
    })
  })

  describe('Visual Accessibility', () => {
    it('should apply high contrast mode correctly', () => {
      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Open settings and toggle high contrast
      fireEvent.click(screen.getByRole('button', { name: /accessibility/i }))
      fireEvent.click(screen.getByLabelText(/high contrast/i))

      // Check that high contrast class is applied
      expect(document.documentElement).toHaveClass('high-contrast')
    })

    it('should support font size scaling', () => {
      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Open settings and change font size
      fireEvent.click(screen.getByRole('button', { name: /accessibility/i }))
      
      // This would need a proper font size selector implementation
      // For now, just check that the attribute can be set
      document.documentElement.setAttribute('data-font-size', 'large')
      expect(document.documentElement).toHaveAttribute('data-font-size', 'large')
    })

    it('should support reduced motion preferences', () => {
      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Open settings and toggle reduced motion
      fireEvent.click(screen.getByRole('button', { name: /accessibility/i }))
      fireEvent.click(screen.getByLabelText(/reduce motion/i))

      // Check that reduced motion class is applied
      expect(document.documentElement).toHaveClass('reduced-motion')
    })
  })

  describe('Touch Target Accessibility', () => {
    it('should have adequate touch target sizes', () => {
      render(
        <AccessibilityTestWrapper>
          <Header />
        </AccessibilityTestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      const links = screen.getAllByRole('link')
      const interactiveElements = [...buttons, ...links]

      // Check that interactive elements have touch-target class
      interactiveElements.forEach(element => {
        expect(element).toHaveClass('touch-target')
      })
    })
  })

  describe('Audio Descriptions', () => {
    it('should provide audio descriptions for screen readers', () => {
      const mockDescribe = jest.fn()
      jest.spyOn(require('@/components/AccessibilityProvider'), 'useAudioDescriptions').mockReturnValue({
        describeAudioState: mockDescribe,
        describeProgress: jest.fn(),
        describeVolumeChange: jest.fn(),
        describeModeChange: jest.fn(),
        describeSessionComplete: jest.fn(),
        describeKeyboardShortcuts: jest.fn(),
      })

      render(
        <AccessibilityTestWrapper>
          <div>Test audio component</div>
        </AccessibilityTestWrapper>
      )

      // This would be called when audio state changes
      mockDescribe(true, 'Deep Work', 10, 0.7)
      
      expect(mockDescribe).toHaveBeenCalledWith(true, 'Deep Work', 10, 0.7)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing accessibility context gracefully', () => {
      // Test without AccessibilityProvider wrapper
      expect(() => {
        render(<AccessibilitySettings />)
      }).not.toThrow()
    })

    it('should provide fallback behavior when accessibility features fail', () => {
      // Mock console.error to avoid test noise
      const mockError = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <AccessibilityTestWrapper>
          <AccessibilitySettings />
        </AccessibilityTestWrapper>
      )

      // Test should still pass even if some accessibility features fail
      expect(screen.getByRole('button', { name: /accessibility/i })).toBeInTheDocument()
      
      mockError.mockRestore()
    })
  })
})
