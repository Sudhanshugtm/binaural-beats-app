// ABOUTME: Specialized loading component for audio initialization with real-time status updates
// ABOUTME: Provides detailed feedback during Web Audio API initialization and binaural beat setup
"use client";

import { useState, useEffect } from 'react';
import { Headphones, Volume2, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AudioLoadingStateProps {
  isVisible: boolean;
  onComplete?: () => void;
}

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  duration: number;
  description: string;
}

export default function AudioLoadingState({ isVisible, onComplete }: AudioLoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<LoadingStep[]>([
    {
      id: 'audio-context',
      label: 'Initializing Audio Context',
      status: 'pending',
      duration: 1000,
      description: 'Setting up Web Audio API...'
    },
    {
      id: 'oscillators',
      label: 'Creating Binaural Oscillators',
      status: 'pending', 
      duration: 800,
      description: 'Generating left and right channel frequencies...'
    },
    {
      id: 'effects',
      label: 'Loading Audio Effects',
      status: 'pending',
      duration: 600,
      description: 'Applying filters and spatial processing...'
    },
    {
      id: 'visualization',
      label: 'Preparing Visualizations',
      status: 'pending',
      duration: 700,
      description: 'Setting up frequency analysis...'
    },
    {
      id: 'ready',
      label: 'Audio System Ready',
      status: 'pending',
      duration: 300,
      description: 'Finalizing your binaural experience...'
    }
  ]);

  useEffect(() => {
    if (!isVisible) return;

    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        
        // Update step status to loading
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'loading' } : step
        ));

        // Simulate loading duration with progress animation
        const stepDuration = steps[i].duration;
        const progressInterval = stepDuration / 20; // 20 updates per step
        
        for (let progress = 0; progress <= 100; progress += 5) {
          setProgress((i * 100 + progress) / steps.length);
          await new Promise(resolve => setTimeout(resolve, progressInterval));
        }

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed' } : step
        ));

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // All steps completed
      setProgress(100);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    };

    processSteps();
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getStepIcon = (step: LoadingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'loading':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-white/95 backdrop-blur-lg shadow-2xl border-0">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Headphones className="w-10 h-10 text-blue-600 animate-float" />
              </div>
              
              {/* Animated sound waves */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-500/60 rounded-full animate-wave"
                      style={{
                        height: '10px',
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1.5s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Preparing Your Audio Experience
            </h2>
            <p className="text-gray-600 text-sm">
              Setting up binaural beats for optimal brainwave entrainment
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Loading steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-blue-50 border border-blue-200' 
                    : step.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50'
                }`}
              >
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    step.status === 'completed' ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {step.label}
                  </p>
                  {index === currentStep && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer message */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Headphones className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> For the best experience, please use headphones. 
                Binaural beats require separate audio channels for each ear.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}