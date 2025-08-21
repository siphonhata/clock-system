'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle, Fingerprint } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardHeaderProps {
  onAddLog: () => void;
}

export function DashboardHeader({ onAddLog }: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Fingerprint className="mr-2 h-4 w-4" />
            Trigger Enrollment
          </Button>
          <Button onClick={onAddLog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Log
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mt-2">
        Welcome back! Here's an overview of your team's activity.
      </p>
    </header>
  );
}
