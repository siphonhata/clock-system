
'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { initialLogs, employees } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { AddEmployeeDialog } from '@/components/add-employee-dialog';
import { EmployeeList } from '@/components/employee-list';
import type { Employee, ClockingLog } from '@/lib/types';
import { ClockEventsTable } from '@/components/clock-events-table';

export default function EmployeesPage() {
  const [employeeList, setEmployeeList] = React.useState<Employee[]>(employees);
  const [clockingLogs, setClockingLogs] = React.useState<ClockingLog[]>(initialLogs);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [piConnected, setPiConnected] = React.useState(true); // Mock status

  const handleAddEmployee = (newEmployee: Omit<Employee, 'id' | 'status'>) => {
    const employee: Employee = {
      ...newEmployee,
      id: `emp_${Date.now()}`,
      status: 'pending',
    };
    setEmployeeList((prev) => [...prev, employee]);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployeeList((prev) => 
        prev.map((e) => e.id === updatedEmployee.id ? updatedEmployee : e)
    );
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployeeList((prev) => prev.filter((e) => e.id !== employeeId));
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
                  <CardDescription>Enroll, activate, or remove employees from the system.</CardDescription>
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
        
        <AddEmployeeDialog 
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onEmployeeAdded={handleAddEmployee}
        />
      </main>
    </>
  );
}

    