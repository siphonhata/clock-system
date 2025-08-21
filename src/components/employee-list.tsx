
'use client';

import * as React from 'react';
import type { Employee } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { MoreHorizontal, UserPlus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface EmployeeListProps {
  employees: Employee[];
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const statusVariant: Record<Employee['status'], 'default' | 'secondary' | 'destructive'> = {
    active: 'default',
    pending: 'secondary',
    inactive: 'destructive',
}

export function EmployeeList({ employees, onUpdateEmployee, onDeleteEmployee }: EmployeeListProps) {
    const [deleteTarget, setDeleteTarget] = React.useState<Employee | null>(null);

    const handleEnroll = (employee: Employee) => {
        // In a real app, this would trigger the Pi enrollment process
        console.log(`Triggering enrollment for ${employee.name}`);
        toast({
            title: 'Enrollment Triggered',
            description: `Please follow the instructions on the Raspberry Pi device to enroll a fingerprint for ${employee.name}.`,
        });
    };

    const handleToggleActive = (employee: Employee) => {
        const newStatus = employee.status === 'active' ? 'inactive' : 'active';
        onUpdateEmployee({ ...employee, status: newStatus });
        toast({
            title: `Employee ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
            description: `${employee.name} is now ${newStatus}.`
        });
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            onDeleteEmployee(deleteTarget.id);
            toast({
                title: 'Employee Deleted',
                description: `${deleteTarget.name} has been removed from the system.`
            });
            setDeleteTarget(null);
        }
    }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Fingerprint ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className={employee.status === 'pending' ? 'bg-yellow-100/50' : ''}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {employee.name}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{employee.fingerprintId || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[employee.status]} className="capitalize">{employee.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {employee.status === 'pending' ? (
                     <Button variant="outline" size="sm" onClick={() => handleEnroll(employee)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Enroll Fingerprint
                    </Button>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleActive(employee)}>
                                {employee.status === 'active' ? (
                                    <ToggleLeft className="mr-2 h-4 w-4" />
                                ) : (
                                    <ToggleRight className="mr-2 h-4 w-4" />
                                )}
                                <span>{employee.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setDeleteTarget(employee)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete <strong>{deleteTarget?.name}</strong> and all associated data from the servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
                    Yes, delete employee
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
