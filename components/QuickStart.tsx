// ABOUTME: Quick start component for new users to easily begin their first session
// ABOUTME: Provides simplified mode selection with clear guidance and recommendations

"use client";

import { useState } from "react";
import { Play, Clock, Brain, Heart, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuickStartMode {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  frequency: number;
  description: string;
  recommended: boolean;
  benefits: string[];
}

const QUICK_START_MODES: QuickStartMode[] = [
  {
    id: "first-time",
    name: "First Time",
    icon: Heart,
    duration: 10,
    frequency: 6,
    description: "Perfect introduction to binaural beats with gentle, calming frequencies",
    recommended: true,
    benefits: ["Gentle introduction", "Stress relief", "Mental clarity"]
  },
  {
    id: "focus-boost",
    name: "Focus Boost",
    icon: Target,
    duration: 25,
    frequency: 10,
    description: "Enhanced concentration for work or study sessions",
    recommended: false,
    benefits: ["Enhanced focus", "Improved productivity", "Mental stamina"]
  },
  {
    id: "creative-flow",
    name: "Creative Flow",
    icon: Sparkles,
    duration: 30,
    frequency: 8,
    description: "Unlock creative potential with theta wave stimulation",
    recommended: false,
    benefits: ["Creative thinking", "Inspiration", "Problem solving"]
  },
  {
    id: "deep-calm",
    name: "Deep Calm",
    icon: Brain,
    duration: 15,
    frequency: 4,
    description: "Achieve deep relaxation and inner peace",
    recommended: false,
    benefits: ["Deep relaxation", "Stress reduction", "Inner peace"]
  }
];

interface QuickStartProps {
  onModeSelect: (mode: QuickStartMode) => void;
  onSkip: () => void;
}

export function QuickStart({ onModeSelect, onSkip }: QuickStartProps) {
  const [selectedMode, setSelectedMode] = useState<QuickStartMode | null>(
    QUICK_START_MODES.find(mode => mode.recommended) || null
  );

  const handleStart = () => {
    if (selectedMode) {
      onModeSelect(selectedMode);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-light text-primary tracking-wide">
          Choose Your First Journey
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Select a session designed to gently introduce you to the power of binaural beats
        </p>
      </div>

      <div className="grid gap-4">
        {QUICK_START_MODES.map((mode) => {
          const IconComponent = mode.icon;
          const isSelected = selectedMode?.id === mode.id;
          
          return (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => setSelectedMode(mode)}
            >
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      {mode.name}
                      {mode.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      {mode.duration} minutes
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {mode.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mode.benefits.map((benefit, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button
          onClick={handleStart}
          disabled={!selectedMode}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <Play className="w-5 h-5 mr-2" />
          Start {selectedMode?.name || "Session"}
        </Button>
        <Button
          onClick={onSkip}
          variant="outline"
          className="sm:w-auto px-6 py-3 text-base font-medium rounded-lg transition-all duration-300"
        >
          Skip to All Options
        </Button>
      </div>
    </div>
  );
}