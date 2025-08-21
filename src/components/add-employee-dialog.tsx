import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Employee } from '@/lib/types';

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEmployeeAdded: (employee: Omit<Employee, 'id' | 'status'>) => void;
  piConnected: boolean;
}

export function AddEmployeeDialog({ isOpen, onOpenChange, onEmployeeAdded, piConnected }: AddEmployeeDialogProps) {
  const [isEnrolling, setIsEnrolling] = React.useState(false);
  const [fingerprintId, setFingerprintId] = React.useState<string | null>(null);
  const form = useForm<{ name: string }>({ defaultValues: { name: '' } });

  const PI_HOST = process.env.NEXT_PUBLIC_PI_HOST;

  const handleEnrollFingerprint = async () => {
    const name = form.getValues('name');
    if (!name) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Enter employee name first.' });
      return;
    }
    if (!piConnected) {
      toast({ variant: 'destructive', title: 'Pi Not Connected', description: 'Cannot enroll fingerprint.' });
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await fetch(`${PI_HOST}/enroll-fingerprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_name: name, finger_slot: 1 }),
      });
      const data = await res.json();
      setFingerprintId(data.fingerprint_id);
      toast({ title: 'Fingerprint Enrolled', description: `Finger ID: ${data.fingerprint_id}` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Enrollment Failed', description: 'Could not contact Pi.' });
    } finally {
      setIsEnrolling(false);
    }
  };

  const onSubmit = async (values: { name: string }) => {
    if (!fingerprintId) {
      toast({ variant: 'destructive', title: 'Fingerprint Required', description: 'Enroll a fingerprint first.' });
      return;
    }

    onEmployeeAdded({ name: values.name, fingerprintId });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Full Name" {...form.register('name')} disabled={isEnrolling} />
          <Button type="button" onClick={handleEnrollFingerprint} disabled={isEnrolling || !form.getValues('name')}>
            {isEnrolling ? 'Enrolling...' : 'Enroll Finger'}
          </Button>
          <Button type="submit" disabled={!fingerprintId || isEnrolling}>Add Employee</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
