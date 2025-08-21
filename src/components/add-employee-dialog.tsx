
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
import { Input } from '@/components/ui/input';
import { Loader2, Fingerprint, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { Separator } from './ui/separator';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

type AddEmployeeFormValues = z.infer<typeof formSchema>;

type EnrollmentStatus = 'idle' | 'enrolling' | 'enrolled' | 'failed';

interface FingerprintState {
  id: number;
  status: EnrollmentStatus;
}

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEmployeeAdded: (employee: Omit<Employee, 'id' | 'status'>) => void;
}

const initialFingerprintState: FingerprintState[] = [
  { id: 1, status: 'idle' },
  { id: 2, status: 'idle' },
];

export function AddEmployeeDialog({
  isOpen,
  onOpenChange,
  onEmployeeAdded,
}: AddEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [fingerprints, setFingerprints] = React.useState<FingerprintState[]>(initialFingerprintState);

  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const simulateEnrollmentApi = (fingerId: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`Sending enrollment request for finger ${fingerId} to hardware...`);
      setTimeout(() => {
        if (Math.random() > 0.25) {
          const fingerprintId = `fp_${Date.now()}`;
          console.log(`Enrollment for finger ${fingerId} successful with ID: ${fingerprintId}.`);
          resolve(fingerprintId);
        } else {
          console.error(`Enrollment for finger ${fingerId} failed.`);
          reject(new Error('Failed to capture fingerprint. Please try again.'));
        }
      }, 2000);
    });
  };
  
  const handleEnrollment = async (fingerId: number) => {
    setFingerprints(prev => prev.map(f => f.id === fingerId ? { ...f, status: 'enrolling' } : f));
    try {
      const newFingerprintId = await simulateEnrollmentApi(fingerId);
      setFingerprints(prev => prev.map(f => f.id === fingerId ? { ...f, status: 'enrolled' } : f));
       toast({
        title: `Fingerprint ${fingerId} Enrolled`,
        description: 'The fingerprint has been successfully captured.',
      });
      // For simplicity, we'll just use the first enrolled fingerprint ID.
      // A real app might handle multiple IDs better.
      if (!form.getValues('fingerprintId')) {
        form.setValue('fingerprintId', newFingerprintId);
      }
    } catch (error: any) {
      setFingerprints(prev => prev.map(f => f.id === fingerId ? { ...f, status: 'failed' } : f));
      toast({
        variant: 'destructive',
        title: `Enrollment Failed`,
        description: error.message || 'An unknown error occurred.',
      });
    }
  };

  const handleRetry = (fingerId: number) => {
    handleEnrollment(fingerId);
  }

  const atLeastOneEnrolled = fingerprints.some(f => f.status === 'enrolled');

  async function onSubmit(values: AddEmployeeFormValues & { fingerprintId?: string }) {
    if (!atLeastOneEnrolled) {
      toast({
        variant: 'destructive',
        title: 'Enrollment Required',
        description: 'Please enroll at least one fingerprint before adding the employee.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      onEmployeeAdded({ name: values.name, fingerprintId: values.fingerprintId });
      toast({
        title: 'Employee Added',
        description: `${values.name} has been successfully added.`,
      });
      handleClose();
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

  const handleClose = () => {
    form.reset();
    setFingerprints(initialFingerprintState);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const isEnrolling = fingerprints.some(f => f.status === 'enrolling');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the employee's name and enroll up to two fingerprints.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. John Doe"
                      {...field}
                      disabled={isSubmitting || isEnrolling}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-3">
              <FormLabel>Fingerprint Enrollment</FormLabel>
              {fingerprints.map((finger) => (
                <div key={finger.id} className="p-3 border rounded-md flex items-center justify-between gap-4 bg-secondary/50">
                   <div className='flex items-center gap-3'>
                    {finger.status === 'idle' && <Fingerprint className="h-6 w-6 text-muted-foreground" />}
                    {finger.status === 'enrolling' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                    {finger.status === 'enrolled' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                    {finger.status === 'failed' && <XCircle className="h-6 w-6 text-destructive" />}

                    <div className='text-sm'>
                        <p className='font-medium'>Fingerprint {finger.id}</p>
                         <p className='text-muted-foreground'>
                            {finger.status === 'idle' && 'Ready to enroll.'}
                            {finger.status === 'enrolling' && 'Place finger on sensor...'}
                            {finger.status === 'enrolled' && 'Enrollment successful!'}
                            {finger.status === 'failed' && 'Enrollment failed.'}
                        </p>
                    </div>

                   </div>

                  <div>
                    {finger.status === 'idle' && (
                      <Button type="button" size="sm" onClick={() => handleEnrollment(finger.id)} disabled={isEnrolling}>
                        Enroll
                      </Button>
                    )}
                     {finger.status === 'failed' && (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleRetry(finger.id)} disabled={isEnrolling}>
                         <RefreshCw className="mr-2 h-4 w-4" /> Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting || isEnrolling}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isEnrolling || !atLeastOneEnrolled}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Employee'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    