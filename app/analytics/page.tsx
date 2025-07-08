// ABOUTME: Analytics page component that displays the comprehensive analytics dashboard
// ABOUTME: Provides users with detailed insights into their focus sessions and productivity trends

import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/player">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft size={16} />
                <span>Back to Player</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Analytics</h1>
              <p className="text-gray-600">Track your focus sessions and productivity insights</p>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
      </div>
    </div>
  );
}