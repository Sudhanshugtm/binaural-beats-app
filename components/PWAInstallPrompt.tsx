// ABOUTME: PWA install prompt component for encouraging app installation
// ABOUTME: Handles install banner display and native install prompt triggering

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after user has used the app for a bit
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 30000); // Show after 30 seconds
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 p-4 bg-white border-2 border-blue-500 shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Install App</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Install Binaural Beats for faster access, offline use, and notifications.
      </p>
      
      <div className="flex space-x-2">
        <Button 
          onClick={handleInstallClick}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Install
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDismiss}
          size="sm"
        >
          Not Now
        </Button>
      </div>
    </Card>
  );
}