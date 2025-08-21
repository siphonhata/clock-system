'use client';

import * as React from 'react';
import type { ClockingLog, Employee } from '@/lib/types';
import { AppSidebar } from '@/components/app-sidebar';
import { LogsTableView } from '@/components/logs-table-view';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddLogDialog } from '@/components/add-log-dialog';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LogsPage() {
  const [logs, setLogs] = React.useState<ClockingLog[]>([]);
  const [employeesList, setEmployeesList] = React.useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Fetch initial logs and employees
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Employees for AddLogDialog
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('active', true);
        if (empError) console.error('Error fetching employees:', empError.message || empError);
        else setEmployeesList(empData || []);

        // Clock logs
        const { data: logData, error: logError } = await supabase
          .from('clock_logs')
          .select('*')
          .order('id', { ascending: false }); // use 'id' or timestamp column
        if (logError) console.error('Error fetching logs:', logError.message || logError);
        else setLogs(logData || []);
      } catch (err) {
        console.error('Unexpected fetch error:', err);
      }
    };

    fetchData();

    // Realtime subscription to new clock logs
    const logChannel = supabase
      .channel('clock_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clock_logs' },
        (payload) => setLogs(prev => [payload.new as ClockingLog, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logChannel);
    };
  }, []);

  // Handle log added from dialog
  const addLog = (log: ClockingLog) => {
    setLogs(prev => [log, ...prev]);
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
          <LogsTableView logs={logs} />
        </div>
      </main>

      <AddLogDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        employees={employeesList}
        onLogAdded={addLog}
      />
    </>
  );
}
