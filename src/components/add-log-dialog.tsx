'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { ClockingLog, Employee } from '@/lib/types';
import { detectAnomalyAction } from '@/app/actions';

const formSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required.'),
  clockInTime: z.string().min(1, 'Clock-in time is required.'),
  clockOutTime: z.string().min(1, 'Clock-out time is required.'),
});

type AddLogFormValues = z.infer<typeof formSchema>;

interface AddLogDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employees: Employee[];
  onLogAdded: (log: ClockingLog) => void;
}

export function AddLogDialog({
  isOpen,
  onOpenChange,
  employees,
  onLogAdded,
}: AddLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<AddLogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      clockInTime: '',
      clockOutTime: '',
    },
  });

  async function onSubmit(values: AddLogFormValues) {
    setIsSubmitting(true);
    try {
      const result = await detectAnomalyAction(values);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        return;
      }

      if (result.log) {
        onLogAdded(result.log);
        toast({
          title: 'Log Added',
          description: `Clocking for ${result.log.employeeName} has been successfully recorded.`,
        });
        if(result.log.anomaly) {
            toast({
                variant: 'destructive',
                title: `Anomaly Detected: ${result.log.anomaly.type || 'Anomaly'}`,
                description: result.log.anomaly.explanation,
            })
        }
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add Clocking Log</DialogTitle>
          <DialogDescription>
            Manually add a clocking event for an employee. The system will
            check for anomalies.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clockInTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clock-in Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clockOutTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clock-out Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
               <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Add and Analyze'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
