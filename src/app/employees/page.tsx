'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { AddEmployeeDialog } from '@/components/add-employee-dialog';
import { EmployeeList } from '@/components/employee-list';
import { ClockEventsTable } from '@/components/clock-events-table';
import type { Employee, ClockingLog } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EmployeesPage() {
  const [employeeList, setEmployeeList] = React.useState<Employee[]>([]);
  const [clockingLogs, setClockingLogs] = React.useState<ClockingLog[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [piConnected, setPiConnected] = React.useState(false);

  // Fetch employees, logs, and Pi status
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Employees
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('active', true);

        if (empError) console.error('Error fetching employees:', empError.message || empError);
        else setEmployeeList(empData || []);

        // Recent clock logs
        const { data: logData, error: logError } = await supabase
          .from('clock_logs')
          .select('*')
          .order('id', { ascending: false })
          .limit(10);

        if (logError) console.error('Error fetching logs:', logError.message || logError);
        else setClockingLogs(logData || []);

        // Pi status
        const { data: piData, error: piError } = await supabase
          .from('pi_status')
          .select('connected')
          .eq('id', 'pi_1')
          .single();

        if (piError) console.error('Error fetching Pi status:', piError.message || piError);
        else setPiConnected(piData?.connected || false);
      } catch (err) {
        console.error('Unexpected fetch error:', err);
      }
    };

    fetchData();

    // Realtime subscriptions
    const empChannel = supabase
      .channel('employees_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        (payload) => {
          setEmployeeList(prev => {
            if (payload.eventType === 'INSERT') return [payload.new as Employee, ...prev];
            if (payload.eventType === 'UPDATE') return prev.map(e => e.id === payload.new.id ? (payload.new as Employee) : e);
            if (payload.eventType === 'DELETE') return prev.filter(e => e.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();

    const logChannel = supabase
      .channel('clock_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clock_logs' },
        (payload) => setClockingLogs(prev => [payload.new as ClockingLog, ...prev])
      )
      .subscribe();

    const piChannel = supabase
      .channel('pi_status_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pi_status' },
        (payload) => setPiConnected(payload.new.connected)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(empChannel);
      supabase.removeChannel(logChannel);
      supabase.removeChannel(piChannel);
    };
  }, []);

  // Add, update, delete employee handlers
  const handleAddEmployee = (newEmployee: Omit<Employee, 'id' | 'status'>) => {
    const employee: Employee = {
      ...newEmployee,
      id: `emp_${Date.now()}`,
      status: 'active',
    };
    setEmployeeList(prev => [employee, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployeeList(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployeeList(prev => prev.filter(e => e.id !== employeeId));
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
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  {piConnected ? (
                    <>
                      <Wifi className="h-5 w-5 text-green-500" />
                      <span className="text-muted-foreground">Pi Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-5 w-5 text-destructive" />
                      <span className="text-muted-foreground">Pi Disconnected</span>
                    </>
                  )}
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
              Manage employees, monitor enrollments, and view clocking events in real-time.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Employee Management</CardTitle>
                  <CardDescription>
                    Enroll, activate, or remove employees from the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeList
                    employees={employeeList}
                    onUpdateEmployee={handleUpdateEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Clock Events</CardTitle>
                  <CardDescription>Live feed of clock-in and clock-out events.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClockEventsTable logs={clockingLogs} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Employee Dialog */}
        <AddEmployeeDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onEmployeeAdded={handleAddEmployee}
          piConnected={piConnected} // Pass Pi status for button enable/disable
        />
      </main>
    </>
  );
}
