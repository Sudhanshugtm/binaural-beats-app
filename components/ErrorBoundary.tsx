// ABOUTME: Professional error boundary component with recovery options and user-friendly messaging
// ABOUTME: Catches JavaScript errors and provides graceful fallback UI with retry functionality
"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-6">
              {/* Error icon with animation */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-red-200 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>

              {/* Error message */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
                <p className="text-gray-600">
                  We encountered an unexpected error while loading your binaural beats experience.
                </p>
              </div>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-50 p-4 rounded-lg border">
                  <summary className="cursor-pointer font-medium text-gray-700 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Debug Information
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong className="text-red-600">Error:</strong>
                      <pre className="text-xs text-gray-600 mt-1 overflow-auto">{this.state.error.message}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong className="text-red-600">Stack:</strong>
                        <pre className="text-xs text-gray-600 mt-1 overflow-auto max-h-32">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Retry information */}
              {this.state.retryCount > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    Retry attempt {this.state.retryCount} of {this.maxRetries}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Help text */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  If this problem persists, please ensure you're using a modern browser with JavaScript enabled.
                  For the best experience, we recommend using headphones.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/5 rounded-full animate-blob" style={{ animationDelay: '3s' }}></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;