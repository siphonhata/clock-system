
'use client';

import * as React from 'react';
import type { ClockingLog } from '@/lib/types';
import { initialLogs, employees } from '@/lib/data';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { StatsCards } from '@/components/stats-cards';
import { LogsTableView } from '@/components/logs-table-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { AddLogDialog } from '@/components/add-log-dialog';

export default function DashboardPage() {
  const [logs, setLogs] = React.useState<ClockingLog[]>(initialLogs);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const addLog = (log: ClockingLog) => {
    setLogs((prevLogs) => [log, ...prevLogs]);
  };
  
  const onDutyCount = React.useMemo(() => {
    // This is a mock value, in a real app you would fetch this data
    return employees.length - logs.filter(log => log.clockOutTime !== null).length;
  }, [logs]);

  const anomaliesCount = React.useMemo(() => {
    return logs.filter(log => log.anomaly !== null).length;
  }, [logs]);

  return (
    <>
      <AppSidebar />
      <main className="flex-1 md:pl-[--sidebar-width-icon] lg:pl-[--sidebar-width]">
        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardHeader 
            onAddLog={() => setIsDialogOpen(true)}
          />
          <StatsCards 
            totalEmployees={employees.length}
            onDuty={onDutyCount}
            anomalies={anomaliesCount}
          />
          <div className="flex justify-end mb-4">
            <Button asChild variant="link">
              <Link href="/logs">
                View All Logs <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <LogsTableView 
            logs={logs.slice(0, 5)} 
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
