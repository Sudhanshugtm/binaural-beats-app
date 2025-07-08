// ABOUTME: Test suite for OnboardingFlow component ensuring proper step progression and completion
// ABOUTME: Validates user interaction flows and callback handling for onboarding experience

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OnboardingFlow } from '../OnboardingFlow';

// Mock UI components
vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => 
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
}));

vi.mock('../ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>
}));

describe('OnboardingFlow', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  it('renders the first onboarding step', () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Welcome to FocusBeats Pro')).toBeInTheDocument();
    expect(screen.getByText('Your personal focus enhancement system')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('progresses through all onboarding steps', () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // First step
    expect(screen.getByText('Welcome to FocusBeats Pro')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Get Started'));
    
    // Second step
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Science meets simplicity')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Continue'));
    
    // Third step
    expect(screen.getByText('Immediate Benefits')).toBeInTheDocument();
    expect(screen.getByText('Feel the difference instantly')).toBeInTheDocument();
    expect(screen.getByText('Try Your First Session')).toBeInTheDocument();
  });

  it('shows progress indicators correctly', () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Check that progress dots are rendered
    const progressDots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('rounded-full') && el.className.includes('w-3')
    );
    expect(progressDots).toHaveLength(3);
  });

  it('displays step-specific content', () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Move to step 2 which has special content
    fireEvent.click(screen.getByText('Get Started'));
    
    expect(screen.getByText('2-90 min')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Instant')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Backed')).toBeInTheDocument();
  });

  it('calls onComplete after the last step', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Progress through all steps
    fireEvent.click(screen.getByText('Get Started'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Try Your First Session'));
    
    // Should show completion screen
    expect(screen.getByText("You're All Set!")).toBeInTheDocument();
    expect(screen.getByText("Let's begin your focus journey")).toBeInTheDocument();
    
    // Wait for the completion callback
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });
  });

  it('shows completion animation', () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Complete all steps
    fireEvent.click(screen.getByText('Get Started'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Try Your First Session'));
    
    // Check for completion elements
    expect(screen.getByText("You're All Set!")).toBeInTheDocument();
    
    // Check for animated dots
    const animatedDots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('animate-bounce')
    );
    expect(animatedDots.length).toBeGreaterThan(0);
  });
});