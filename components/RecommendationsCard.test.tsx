// ABOUTME: Tests for the RecommendationsCard component
// ABOUTME: Tests rendering, user interactions, and recommendation display logic

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecommendationsCard } from './RecommendationsCard';
import { RecommendationEngine } from '../lib/recommendations';

// Mock the RecommendationEngine
vi.mock('../lib/recommendations', () => ({
  RecommendationEngine: vi.fn(),
}));

const mockRecommendationEngine = {
  getRecommendations: vi.fn(),
  trackUsage: vi.fn(),
  updatePreferences: vi.fn(),
};

describe('RecommendationsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (RecommendationEngine as any).mockImplementation(() => mockRecommendationEngine);
  });

  it('should render the recommendations card with title', async () => {
    mockRecommendationEngine.getRecommendations.mockReturnValue([
      { mode: 'deepWork', reason: 'Perfect for morning focus', confidence: 0.9 },
      { mode: 'creativeFlow', reason: 'Great for creative work', confidence: 0.8 },
      { mode: 'relaxation', reason: 'Unwind after work', confidence: 0.7 },
    ]);

    render(<RecommendationsCard onModeSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
      expect(screen.getByText('Based on your preferences and time of day')).toBeInTheDocument();
    });
  });

  it('should display all recommendations with proper formatting', async () => {
    mockRecommendationEngine.getRecommendations.mockReturnValue([
      { mode: 'deepWork', reason: 'Perfect for morning focus', confidence: 0.9 },
      { mode: 'creativeFlow', reason: 'Great for creative work', confidence: 0.8 },
      { mode: 'relaxation', reason: 'Unwind after work', confidence: 0.7 },
    ]);

    render(<RecommendationsCard onModeSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Deep Work')).toBeInTheDocument();
      expect(screen.getByText('Creative Flow')).toBeInTheDocument();
      expect(screen.getByText('Relaxation')).toBeInTheDocument();
      
      expect(screen.getByText('Perfect for morning focus')).toBeInTheDocument();
      expect(screen.getByText('Great for creative work')).toBeInTheDocument();
      expect(screen.getByText('Unwind after work')).toBeInTheDocument();
    });
  });

  it('should call onModeSelect when a recommendation is clicked', async () => {
    const mockOnModeSelect = vi.fn();
    mockRecommendationEngine.getRecommendations.mockReturnValue([
      { mode: 'deepWork', reason: 'Perfect for morning focus', confidence: 0.9 },
    ]);

    render(<RecommendationsCard onModeSelect={mockOnModeSelect} />);

    await waitFor(() => {
      const deepWorkButton = screen.getByText('Deep Work');
      fireEvent.click(deepWorkButton);
      expect(mockOnModeSelect).toHaveBeenCalledWith('deepWork');
    });
  });

  it('should handle empty recommendations gracefully', async () => {
    mockRecommendationEngine.getRecommendations.mockReturnValue([]);

    render(<RecommendationsCard onModeSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('No recommendations available')).toBeInTheDocument();
    });
  });

  it('should refresh recommendations when refresh button is clicked', async () => {
    mockRecommendationEngine.getRecommendations.mockReturnValue([
      { mode: 'deepWork', reason: 'Perfect for morning focus', confidence: 0.9 },
    ]);

    render(<RecommendationsCard onModeSelect={() => {}} />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      expect(mockRecommendationEngine.getRecommendations).toHaveBeenCalledTimes(2);
    });
  });
});