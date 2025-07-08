// ABOUTME: Goal setting component for users to create and manage their focus goals
// ABOUTME: Supports different goal types, progress tracking, and provides goal templates
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  Zap
} from 'lucide-react';
import { AnalyticsService, UserGoal } from '@/lib/analytics';

interface GoalFormData {
  type: 'daily' | 'weekly' | 'monthly';
  target: string;
  unit: 'minutes' | 'sessions' | 'streak';
  description: string;
}

interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  unit: 'minutes' | 'sessions' | 'streak';
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'beginner-daily',
    name: 'Beginner: 1 hour daily',
    description: 'Focus for 1 hour daily',
    type: 'daily',
    target: 60,
    unit: 'minutes'
  },
  {
    id: 'intermediate-daily',
    name: 'Intermediate: 2 hours daily',
    description: 'Focus for 2 hours daily',
    type: 'daily',
    target: 120,
    unit: 'minutes'
  },
  {
    id: 'advanced-daily',
    name: 'Advanced: 4 hours daily',
    description: 'Focus for 4 hours daily',
    type: 'daily',
    target: 240,
    unit: 'minutes'
  },
  {
    id: 'weekly-consistency',
    name: 'Weekly Consistency: 5 sessions',
    description: 'Complete 5 sessions per week',
    type: 'weekly',
    target: 5,
    unit: 'sessions'
  },
  {
    id: 'streak-builder',
    name: 'Streak Builder: 21 days',
    description: 'Maintain 21-day streak',
    type: 'monthly',
    target: 21,
    unit: 'streak'
  }
];

export default function GoalSetting() {
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [goalProgress, setGoalProgress] = useState<Record<string, number>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<UserGoal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const [formData, setFormData] = useState<GoalFormData>({
    type: 'daily',
    target: '',
    unit: 'minutes',
    description: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    try {
      const analyticsData = AnalyticsService.getData();
      setGoals(analyticsData.goals || []);
      
      // Calculate goal progress
      const progress: Record<string, number> = {};
      (analyticsData.goals || []).forEach(goal => {
        progress[goal.id] = goal.current || 0;
      });
      setGoalProgress(progress);
      setError(null);
    } catch (err) {
      setError('Unable to load goals');
      console.error('Goal loading error:', err);
    }
  };

  const validateForm = (data: GoalFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.target || isNaN(Number(data.target)) || Number(data.target) <= 0) {
      errors.target = 'Target must be a positive number';
    }

    if (!data.description || data.description.length < 5) {
      errors.description = 'Description must be at least 5 characters';
    }

    // Validate reasonable targets
    const target = Number(data.target);
    if (data.type === 'daily' && data.unit === 'minutes' && target > 720) {
      errors.target = 'Daily focus time should not exceed 12 hours';
    }

    if (data.type === 'daily' && data.unit === 'sessions' && target > 10) {
      errors.target = 'Daily sessions should not exceed 10';
    }

    if (data.type === 'weekly' && data.unit === 'sessions' && target > 50) {
      errors.target = 'Weekly sessions should not exceed 50';
    }

    return errors;
  };

  const handleCreateGoal = async () => {
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const newGoal: UserGoal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: formData.type,
        target: Number(formData.target),
        current: 0,
        unit: formData.unit,
        description: formData.description,
        createdAt: Date.now(),
        startDate: new Date(),
        endDate: getGoalEndDate(formData.type),
        isActive: true
      };

      AnalyticsService.createGoal(newGoal);
      loadGoals();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to create goal. Please try again.');
    }
  };

  const handleEditGoal = async () => {
    if (!editingGoal) return;

    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      AnalyticsService.updateGoal(editingGoal.id, {
        target: Number(formData.target),
        description: formData.description
      });

      loadGoals();
      setEditingGoal(null);
      resetForm();
    } catch (err) {
      setError('Failed to update goal. Please try again.');
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;

    try {
      AnalyticsService.deleteGoal(deletingGoal.id);
      loadGoals();
      setDeletingGoal(null);
    } catch (err) {
      setError('Failed to delete goal. Please try again.');
    }
  };

  const handleUseTemplate = (template: GoalTemplate) => {
    const newGoal: UserGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      target: template.target,
      current: 0,
      unit: template.unit,
      description: template.description,
      createdAt: Date.now(),
      startDate: new Date(),
      endDate: getGoalEndDate(template.type),
      isActive: true
    };

    try {
      AnalyticsService.createGoal(newGoal);
      loadGoals();
      setIsTemplateModalOpen(false);
    } catch (err) {
      setError('Failed to create goal from template. Please try again.');
    }
  };

  const getGoalEndDate = (type: 'daily' | 'weekly' | 'monthly'): Date => {
    const endDate = new Date();
    switch (type) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }
    return endDate;
  };

  const resetForm = () => {
    setFormData({
      type: 'daily',
      target: '',
      unit: 'minutes',
      description: ''
    });
    setFormErrors({});
  };

  const startEdit = (goal: UserGoal) => {
    setEditingGoal(goal);
    setFormData({
      type: goal.type,
      target: goal.target.toString(),
      unit: goal.unit,
      description: goal.description
    });
    setFormErrors({});
  };

  const getGoalIcon = (goal: UserGoal) => {
    switch (goal.unit) {
      case 'minutes': return <Clock className="h-4 w-4" />;
      case 'sessions': return <Target className="h-4 w-4" />;
      case 'streak': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  const getInsightColor = (onTrack: boolean) => {
    return onTrack ? 'text-green-600' : 'text-red-600';
  };

  const activeGoals = goals.filter(goal => goal.isActive && !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-500 mb-4">Try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`space-y-6 ${isMobile ? 'mobile-layout' : ''}`}
      data-testid="goal-setting-container"
      aria-label="Goals dashboard"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1">Set and track your focus goals</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Use Template</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Goal Templates</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {GOAL_TEMPLATES.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleUseTemplate(template)}>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge variant="outline">{template.target} {template.unit}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>Add New Goal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal-type">Goal Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger id="goal-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="goal-unit">Unit</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value: 'minutes' | 'sessions' | 'streak') => 
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger id="goal-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="sessions">Sessions</SelectItem>
                        <SelectItem value="streak">Streak (days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal-target">Target</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className={formErrors.target ? 'border-red-500' : ''}
                  />
                  {formErrors.target && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.target}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={formErrors.description ? 'border-red-500' : ''}
                    placeholder="Describe your goal..."
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateGoal} className="flex-1">
                    Create Goal
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overall Progress */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>All Goals</span>
                <span>{goalProgress.overall}%</span>
              </div>
              <Progress 
                value={goalProgress.overall} 
                className="h-3"
                role="progressbar"
                aria-valuenow={goalProgress.overall}
                aria-label="Overall goal progress"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList role="tablist">
          <TabsTrigger value="active" role="tab">Active Goals ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="history" role="tab">History ({completedGoals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active goals</h3>
                <p className="text-gray-500 mb-6">Set your first goal to start tracking your progress</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                  <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
                
                return (
                  <Card key={goal.id} data-testid="goal-card" className={isMobile ? 'w-full' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getGoalIcon(goal)}
                          <Badge variant="outline" className="text-xs">
                            {goal.type}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(goal)}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingGoal(goal)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-2">{goal.description}</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>{goal.current} / {goal.target} {goal.unit}</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        
                        <Progress 
                          value={progress} 
                          className="h-2"
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-label={`Goal progress: ${progress}% complete`}
                        />

                        {goal.insights && (
                          <Alert className={goal.insights.onTrack ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                            <AlertDescription className={getInsightColor(goal.insights.onTrack ?? false)}>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={goal.insights.onTrack ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {goal.insights.onTrack ? 'On track' : 'Behind schedule'}
                                </Badge>
                                <span className="text-xs">
                                  {goal.insights.daysRemaining} days remaining
                                </span>
                              </div>
                              <p className="text-sm mt-2">{goal.insights.recommendation}</p>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Goals</CardTitle>
            </CardHeader>
            <CardContent>
              {completedGoals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No completed goals yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{goal.description}</h3>
                          <p className="text-sm text-gray-600">
                            Completed on {goal.completedAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className="bg-green-600">
                        {goal.target} {goal.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-target">Target</Label>
                <Input
                  id="edit-target"
                  type="number"
                  min="1"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className={formErrors.target ? 'border-red-500' : ''}
                />
                {formErrors.target && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.target}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditGoal} className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingGoal(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingGoal && (
        <Dialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete this goal? This action cannot be undone.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{deletingGoal.description}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {deletingGoal.target} {deletingGoal.unit} ({deletingGoal.type})
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="destructive" onClick={handleDeleteGoal} className="flex-1">
                  Yes, Delete
                </Button>
                <Button variant="outline" onClick={() => setDeletingGoal(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}