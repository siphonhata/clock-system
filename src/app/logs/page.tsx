
'use client';

import * as React from 'react';
import type { ClockingLog } from '@/lib/types';
import { initialLogs, employees } from '@/lib/data';
import { AppSidebar } from '@/components/app-sidebar';
import { LogsTableView } from '@/components/logs-table-view';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddLogDialog } from '@/components/add-log-dialog';

export default function LogsPage() {
  const [logs, setLogs] = React.useState<ClockingLog[]>(initialLogs);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const addLog = (log: ClockingLog) => {
    setLogs((prevLogs) => [log, ...prevLogs]);
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 md:pl-[--sidebar-width-icon] lg:pl-[--sidebar-width]">
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-3xl font-bold font-headline">Clocking Logs</h1>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Log
              </Button>
            </div>
            <p className="text-muted-foreground mt-2">
              A comprehensive history of all clocking events.
            </p>
          </header>
          <LogsTableView 
            logs={logs} 
          />
        </div>
      </main>
      <AddLogDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        employees={employees}
        onLogAdded={addLog}
      />
    </>
  );
}
