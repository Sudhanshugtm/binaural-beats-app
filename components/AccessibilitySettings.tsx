// ABOUTME: Accessibility settings panel for user customization of accessibility features
// ABOUTME: Provides controls for contrast, font size, motion, and screen reader options

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from './AccessibilityProvider';
import { 
  Eye, 
  Type, 
  Volume2, 
  Keyboard, 
  MousePointer, 
  Settings,
  Info,
  CheckCircle
} from 'lucide-react';

interface AccessibilitySettingsProps {
  className?: string;
}

export function AccessibilitySettings({ className }: AccessibilitySettingsProps) {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const handleTogglePanel = () => {
    setIsOpen(!isOpen);
    announceToScreenReader(
      isOpen ? 'Accessibility settings panel closed' : 'Accessibility settings panel opened',
      'assertive'
    );
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small', description: '14px' },
    { value: 'medium', label: 'Medium', description: '16px (Default)' },
    { value: 'large', label: 'Large', description: '18px' },
    { value: 'extra-large', label: 'Extra Large', description: '22px' }
  ];

  const presetConfigurations = [
    {
      name: 'Low Vision',
      description: 'High contrast, large text, reduced motion',
      settings: {
        highContrast: true,
        fontSize: 'large' as const,
        reducedMotion: true,
        visualIndicators: true
      }
    },
    {
      name: 'Motor Impairment',
      description: 'Enhanced keyboard navigation, visual indicators',
      settings: {
        keyboardNavigation: true,
        visualIndicators: true,
        reducedMotion: true
      }
    },
    {
      name: 'Screen Reader',
      description: 'Optimized for screen reader users',
      settings: {
        screenReaderAnnouncements: true,
        audioDescriptions: true,
        keyboardNavigation: true
      }
    }
  ];

  const applyPreset = (presetSettings: Partial<typeof settings>) => {
    Object.entries(presetSettings).forEach(([key, value]) => {
      updateSetting(key as keyof typeof settings, value);
    });
    
    announceToScreenReader('Accessibility preset applied', 'assertive');
  };

  return (
    <div className={className}>
      {/* Toggle Button */}
      <Button
        onClick={handleTogglePanel}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
        aria-expanded={isOpen}
        aria-controls="accessibility-settings-panel"
      >
        <Settings className="h-4 w-4" />
        <span>Accessibility</span>
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <Card 
          id="accessibility-settings-panel"
          className="mt-4 w-full max-w-2xl"
          role="region"
          aria-labelledby="accessibility-settings-title"
        >
          <CardHeader>
            <CardTitle id="accessibility-settings-title" className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Accessibility Settings</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Quick Presets */}
            <div>
              <Label className="text-base font-medium mb-3 block">Quick Setup</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {presetConfigurations.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={() => applyPreset(preset.settings)}
                  >
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {preset.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Visual</span>
              </Label>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <p className="text-sm text-gray-600">
                      Increases contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                    aria-describedby="high-contrast-desc"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Font Size</Label>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(value: typeof settings.fontSize) => 
                      updateSetting('fontSize', value)
                    }
                  >
                    <SelectTrigger aria-label="Select font size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="visual-indicators">Enhanced Visual Indicators</Label>
                    <p className="text-sm text-gray-600">
                      Shows additional visual cues for interactive elements
                    </p>
                  </div>
                  <Switch
                    id="visual-indicators"
                    checked={settings.visualIndicators}
                    onCheckedChange={(checked) => updateSetting('visualIndicators', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Motion Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center space-x-2">
                <MousePointer className="h-4 w-4" />
                <span>Motion & Animation</span>
              </Label>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reduced-motion">Reduce Motion</Label>
                    <p className="text-sm text-gray-600">
                      Minimizes animations and transitions
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center space-x-2">
                <Keyboard className="h-4 w-4" />
                <span>Navigation</span>
              </Label>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                    <p className="text-sm text-gray-600">
                      Improves keyboard-only navigation experience
                    </p>
                  </div>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Audio Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Audio & Screen Reader</span>
              </Label>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screen-reader">Screen Reader Announcements</Label>
                    <p className="text-sm text-gray-600">
                      Provides spoken feedback for actions and changes
                    </p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReaderAnnouncements}
                    onCheckedChange={(checked) => updateSetting('screenReaderAnnouncements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                    <p className="text-sm text-gray-600">
                      Describes audio playback states and progress
                    </p>
                  </div>
                  <Switch
                    id="audio-descriptions"
                    checked={settings.audioDescriptions}
                    onCheckedChange={(checked) => updateSetting('audioDescriptions', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="border-t pt-4">
              <Label className="text-base font-medium mb-3 block flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Active Features</span>
              </Label>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(settings)
                  .filter(([_, value]) => value === true)
                  .map(([key]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  ))}
                
                {settings.fontSize !== 'medium' && (
                  <Badge variant="secondary" className="text-xs">
                    Font Size: {settings.fontSize}
                  </Badge>
                )}
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Accessibility Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use Tab to navigate between elements</li>
                    <li>Press Space or Enter to activate buttons</li>
                    <li>Use arrow keys in menus and sliders</li>
                    <li>Press Escape to close modals or menus</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}