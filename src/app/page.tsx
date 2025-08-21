'use client';

import * as React from 'react';
import type { ClockingLog, Employee } from '@/lib/types';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { StatsCards } from '@/components/stats-cards';
import { LogsTableView } from '@/components/logs-table-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { AddLogDialog } from '@/components/add-log-dialog';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [logs, setLogs] = React.useState<ClockingLog[]>([]);
  const [employeesList, setEmployeesList] = React.useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Fetch employees and logs + subscribe to realtime changes
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch active employees
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('active', true);

        if (empError) {
          console.error('Error fetching employees:', empError.message || empError);
          setEmployeesList([]);
        } else {
          setEmployeesList(empData || []);
        }

        // Fetch recent clocking logs
        const { data: logData, error: logError } = await supabase
          .from('clock_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (logError) {
          console.error('Error fetching logs:', logError.message || logError);
          setLogs([]);
        } else {
          setLogs(logData || []);
        }
      } catch (err) {
        console.error('Unexpected error during fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscription for new logs
    const channel = supabase
      .channel('clock_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clock_logs',
        },
        (payload) => {
          setLogs(prev => [payload.new as ClockingLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute on-duty employees and anomalies
  const onDutyCount = React.useMemo(() => {
    return employeesList.length - logs.filter(log => log.clockOutTime !== null).length;
  }, [logs, employeesList]);

  const anomaliesCount = React.useMemo(() => {
    return logs.filter(log => log.anomaly !== null).length;
  }, [logs]);

  // Handle log added from AddLogDialog
  const addLog = (log: ClockingLog) => {
    setLogs(prev => [log, ...prev]);
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 md:pl-[--sidebar-width-icon] lg:pl-[--sidebar-width]">
        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardHeader onAddLog={() => setIsDialogOpen(true)} />

          {loading ? (
            <p className="text-muted-foreground">Loading data...</p>
          ) : (
            <>
              <StatsCards
                totalEmployees={employeesList.length}
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

              <LogsTableView logs={logs.slice(0, 5)} />
            </>
          )}
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
