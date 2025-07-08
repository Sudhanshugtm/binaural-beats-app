// ABOUTME: Test suite for the GoalSetting component covering all goal management features
// ABOUTME: Tests goal creation, editing, progress tracking, and validation
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import GoalSetting from '../GoalSetting';

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => 
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
}));

vi.mock('../ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>
}));

vi.mock('../ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" aria-valuenow={value}></div>
}));

vi.mock('../ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}));

vi.mock('../ui/label', () => ({
  Label: ({ children }: any) => <label data-testid="label">{children}</label>
}));

vi.mock('../ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />
}));

vi.mock('../ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <option data-testid="select-item" value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>
}));

vi.mock('../ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>
}));

vi.mock('../ui/tabs', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: any) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: any) => <button data-testid="tabs-trigger">{children}</button>
}));

vi.mock('../ui/alert', () => ({
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>
}));

// Mock analytics engine
const mockAnalytics = {
  setGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
  getGoals: vi.fn(),
  getGoalProgress: vi.fn(),
  checkGoalCompletion: vi.fn()
};

vi.mock('../../lib/analytics', () => ({
  AnalyticsEngine: vi.fn().mockImplementation(() => mockAnalytics)
}));

describe('GoalSetting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockAnalytics.getGoals.mockReturnValue([
      {
        id: 'goal1',
        type: 'daily',
        target: 120,
        current: 90,
        unit: 'minutes',
        description: 'Focus for 2 hours daily',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-31'),
        isActive: true
      },
      {
        id: 'goal2',
        type: 'weekly',
        target: 5,
        current: 3,
        unit: 'sessions',
        description: 'Complete 5 sessions per week',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        isActive: true
      }
    ]);

    mockAnalytics.getGoalProgress.mockReturnValue({
      overall: 72.5,
      goals: [
        { id: 'goal1', percentage: 75 },
        { id: 'goal2', percentage: 60 }
      ]
    });
  });

  describe('Goal Display', () => {
    it('should render existing goals', () => {
      render(<GoalSetting />);

      expect(screen.getByText('Focus for 2 hours daily')).toBeInTheDocument();
      expect(screen.getByText('Complete 5 sessions per week')).toBeInTheDocument();
      expect(screen.getByText('90 / 120 minutes')).toBeInTheDocument();
      expect(screen.getByText('3 / 5 sessions')).toBeInTheDocument();
    });

    it('should show progress bars for goals', () => {
      render(<GoalSetting />);

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(2);
      expect(progressBars[0]).toHaveAttribute('aria-valuenow', '75');
      expect(progressBars[1]).toHaveAttribute('aria-valuenow', '60');
    });

    it('should display goal completion status', () => {
      mockAnalytics.getGoals.mockReturnValue([
        {
          id: 'completed-goal',
          type: 'daily',
          target: 60,
          current: 60,
          unit: 'minutes',
          description: 'Focus for 1 hour daily',
          isActive: true,
          completed: true
        }
      ]);

      render(<GoalSetting />);

      expect(screen.getByText('Completed!')).toBeInTheDocument();
      expect(screen.getByTestId('completed-badge')).toBeInTheDocument();
    });
  });

  describe('Goal Creation', () => {
    it('should open goal creation form', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      expect(screen.getByText('Create New Goal')).toBeInTheDocument();
      expect(screen.getByLabelText('Goal Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Target')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should create a daily focus time goal', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      await userEvent.selectOptions(screen.getByLabelText('Goal Type'), 'daily');
      await userEvent.selectOptions(screen.getByLabelText('Unit'), 'minutes');
      await userEvent.type(screen.getByLabelText('Target'), '180');
      await userEvent.type(screen.getByLabelText('Description'), 'Focus for 3 hours daily');

      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      expect(mockAnalytics.setGoal).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'daily',
        target: 180,
        current: 0,
        unit: 'minutes',
        description: 'Focus for 3 hours daily',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        isActive: true
      });
    });

    it('should create a weekly session goal', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      await userEvent.selectOptions(screen.getByLabelText('Goal Type'), 'weekly');
      await userEvent.selectOptions(screen.getByLabelText('Unit'), 'sessions');
      await userEvent.type(screen.getByLabelText('Target'), '10');
      await userEvent.type(screen.getByLabelText('Description'), 'Complete 10 sessions weekly');

      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      expect(mockAnalytics.setGoal).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'weekly',
        target: 10,
        current: 0,
        unit: 'sessions',
        description: 'Complete 10 sessions weekly',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        isActive: true
      });
    });

    it('should create a monthly streak goal', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      await userEvent.selectOptions(screen.getByLabelText('Goal Type'), 'monthly');
      await userEvent.selectOptions(screen.getByLabelText('Unit'), 'streak');
      await userEvent.type(screen.getByLabelText('Target'), '30');
      await userEvent.type(screen.getByLabelText('Description'), 'Maintain 30-day streak');

      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      expect(mockAnalytics.setGoal).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'monthly',
        target: 30,
        current: 0,
        unit: 'streak',
        description: 'Maintain 30-day streak',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        isActive: true
      });
    });
  });

  describe('Goal Validation', () => {
    it('should validate required fields', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      expect(screen.getByText('Target is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('should validate target must be positive', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      await userEvent.type(screen.getByLabelText('Target'), '-10');
      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      expect(screen.getByText('Target must be greater than 0')).toBeInTheDocument();
    });

    it('should validate description length', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      await userEvent.type(screen.getByLabelText('Description'), 'A');
      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      expect(screen.getByText('Description must be at least 5 characters')).toBeInTheDocument();
    });

    it('should validate reasonable targets', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      await userEvent.selectOptions(screen.getByLabelText('Goal Type'), 'daily');
      await userEvent.selectOptions(screen.getByLabelText('Unit'), 'minutes');
      await userEvent.type(screen.getByLabelText('Target'), '1500'); // 25 hours

      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      expect(screen.getByText('Daily focus time should not exceed 12 hours')).toBeInTheDocument();
    });
  });

  describe('Goal Editing', () => {
    it('should open edit form for existing goal', async () => {
      render(<GoalSetting />);

      const editButton = screen.getAllByText('Edit')[0];
      await userEvent.click(editButton);

      expect(screen.getByText('Edit Goal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Focus for 2 hours daily')).toBeInTheDocument();
      expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    });

    it('should update goal when saved', async () => {
      render(<GoalSetting />);

      const editButton = screen.getAllByText('Edit')[0];
      await userEvent.click(editButton);

      const targetField = screen.getByDisplayValue('120');
      await userEvent.clear(targetField);
      await userEvent.type(targetField, '150');

      const saveButton = screen.getByText('Save Changes');
      await userEvent.click(saveButton);

      expect(mockAnalytics.updateGoal).toHaveBeenCalledWith('goal1', {
        target: 150,
        description: 'Focus for 2 hours daily'
      });
    });

    it('should cancel editing without saving', async () => {
      render(<GoalSetting />);

      const editButton = screen.getAllByText('Edit')[0];
      await userEvent.click(editButton);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(mockAnalytics.updateGoal).not.toHaveBeenCalled();
      expect(screen.queryByText('Edit Goal')).not.toBeInTheDocument();
    });
  });

  describe('Goal Deletion', () => {
    it('should show confirmation dialog when deleting', async () => {
      render(<GoalSetting />);

      const deleteButton = screen.getAllByText('Delete')[0];
      await userEvent.click(deleteButton);

      expect(screen.getByText('Delete Goal')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this goal?')).toBeInTheDocument();
    });

    it('should delete goal when confirmed', async () => {
      render(<GoalSetting />);

      const deleteButton = screen.getAllByText('Delete')[0];
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete');
      await userEvent.click(confirmButton);

      expect(mockAnalytics.deleteGoal).toHaveBeenCalledWith('goal1');
    });

    it('should cancel deletion', async () => {
      render(<GoalSetting />);

      const deleteButton = screen.getAllByText('Delete')[0];
      await userEvent.click(deleteButton);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(mockAnalytics.deleteGoal).not.toHaveBeenCalled();
    });
  });

  describe('Goal Templates', () => {
    it('should provide pre-defined goal templates', async () => {
      render(<GoalSetting />);

      const templatesButton = screen.getByText('Use Template');
      await userEvent.click(templatesButton);

      expect(screen.getByText('Goal Templates')).toBeInTheDocument();
      expect(screen.getByText('Beginner: 1 hour daily')).toBeInTheDocument();
      expect(screen.getByText('Intermediate: 2 hours daily')).toBeInTheDocument();
      expect(screen.getByText('Advanced: 4 hours daily')).toBeInTheDocument();
      expect(screen.getByText('Weekly Consistency: 5 sessions')).toBeInTheDocument();
    });

    it('should create goal from template', async () => {
      render(<GoalSetting />);

      const templatesButton = screen.getByText('Use Template');
      await userEvent.click(templatesButton);

      const beginnerTemplate = screen.getByText('Beginner: 1 hour daily');
      await userEvent.click(beginnerTemplate);

      expect(mockAnalytics.setGoal).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'daily',
        target: 60,
        current: 0,
        unit: 'minutes',
        description: 'Focus for 1 hour daily',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        isActive: true
      });
    });
  });

  describe('Goal Insights', () => {
    it('should show goal achievement insights', () => {
      mockAnalytics.getGoals.mockReturnValue([
        {
          id: 'streak-goal',
          type: 'weekly',
          target: 7,
          current: 5,
          unit: 'streak',
          description: 'Maintain 7-day streak',
          isActive: true,
          insights: {
            onTrack: true,
            daysRemaining: 2,
            averageDaily: 0.8,
            recommendation: 'You\'re doing great! Keep up the momentum.'
          }
        }
      ]);

      render(<GoalSetting />);

      expect(screen.getByText('You\'re doing great! Keep up the momentum.')).toBeInTheDocument();
      expect(screen.getByText('On track')).toBeInTheDocument();
    });

    it('should show warning for off-track goals', () => {
      mockAnalytics.getGoals.mockReturnValue([
        {
          id: 'behind-goal',
          type: 'weekly',
          target: 10,
          current: 2,
          unit: 'sessions',
          description: 'Complete 10 sessions weekly',
          isActive: true,
          insights: {
            onTrack: false,
            daysRemaining: 2,
            averageDaily: 0.3,
            recommendation: 'You need to increase your daily sessions to meet this goal.'
          }
        }
      ]);

      render(<GoalSetting />);

      expect(screen.getByText('Behind schedule')).toBeInTheDocument();
      expect(screen.getByText('You need to increase your daily sessions to meet this goal.')).toBeInTheDocument();
    });
  });

  describe('Goal History', () => {
    it('should show completed goals history', async () => {
      render(<GoalSetting />);

      const historyTab = screen.getByText('History');
      await userEvent.click(historyTab);

      expect(screen.getByText('Completed Goals')).toBeInTheDocument();
    });

    it('should filter goals by completion status', async () => {
      mockAnalytics.getGoals.mockReturnValue([
        {
          id: 'completed-goal',
          description: 'Completed daily goal',
          completed: true,
          completedAt: new Date('2024-01-10'),
          isActive: false
        }
      ]);

      render(<GoalSetting />);

      const historyTab = screen.getByText('History');
      await userEvent.click(historyTab);

      expect(screen.getByText('Completed daily goal')).toBeInTheDocument();
      expect(screen.getByText('Completed on Jan 10, 2024')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<GoalSetting />);

      expect(screen.getByLabelText('Goals dashboard')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    it('should be keyboard navigable', async () => {
      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      addButton.focus();
      
      expect(document.activeElement).toBe(addButton);

      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByText('Use Template'));
    });

    it('should announce progress updates to screen readers', () => {
      render(<GoalSetting />);

      const progressBar = screen.getAllByRole('progressbar')[0];
      expect(progressBar).toHaveAttribute('aria-label', 'Goal progress: 75% complete');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(<GoalSetting />);

      const container = screen.getByTestId('goal-setting-container');
      expect(container).toHaveClass('mobile-layout');
    });

    it('should stack goal cards on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(<GoalSetting />);

      const goalCards = screen.getAllByTestId('goal-card');
      goalCards.forEach(card => {
        expect(card).toHaveClass('w-full');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle goal creation errors', async () => {
      mockAnalytics.setGoal.mockRejectedValue(new Error('Storage full'));

      render(<GoalSetting />);

      const addButton = screen.getByText('Add New Goal');
      await userEvent.click(addButton);

      await userEvent.selectOptions(screen.getByLabelText('Goal Type'), 'daily');
      await userEvent.type(screen.getByLabelText('Target'), '120');
      await userEvent.type(screen.getByLabelText('Description'), 'Test goal');

      const saveButton = screen.getByText('Create Goal');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create goal. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle analytics loading errors', () => {
      mockAnalytics.getGoals.mockImplementation(() => {
        throw new Error('Failed to load goals');
      });

      render(<GoalSetting />);

      expect(screen.getByText('Unable to load goals')).toBeInTheDocument();
      expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
    });
  });
});