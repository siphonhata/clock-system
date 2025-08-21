'use server';

import { detectClockingAnomaly } from '@/ai/flows/clocking-anomaly-detection';
import { employees } from '@/lib/data';
import type { ClockingLog } from '@/lib/types';
import { z } from 'zod';

const actionSchema = z.object({
  employeeId: z.string(),
  clockInTime: z.string(),
  clockOutTime: z.string(),
});

export async function detectAnomalyAction(formData: {
  employeeId: string;
  clockInTime: string;
  clockOutTime: string;
}): Promise<{ log?: ClockingLog; error?: string }> {
  const validatedFields = actionSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data.',
    };
  }
  
  const { employeeId, clockInTime, clockOutTime } = validatedFields.data;

  try {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) {
      return { error: 'Employee not found.' };
    }

    const anomalyResult = await detectClockingAnomaly({
      employeeId,
      clockInTime: new Date(clockInTime).toISOString(),
      clockOutTime: new Date(clockOutTime).toISOString(),
    });
    
    const newLog: ClockingLog = {
      id: `log_${Date.now()}`,
      employeeId,
      employeeName: employee.name,
      clockInTime: new Date(clockInTime).toISOString(),
      clockOutTime: new Date(clockOutTime).toISOString(),
      anomaly: anomalyResult.isAnomaly
        ? {
            isAnomaly: true,
            type: anomalyResult.anomalyType,
            explanation: anomalyResult.explanation,
          }
        : null,
    };

    return { log: newLog };
  } catch (error) {
    console.error('Error in detectAnomalyAction:', error);
    return { error: 'Failed to analyze clocking data.' };
  }
}
