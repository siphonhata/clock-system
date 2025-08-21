import type { DetectClockingAnomalyOutput } from "@/ai/flows/clocking-anomaly-detection";

export interface Employee {
  id: string;
  name: string;
  fingerprintId?: string | null;
  status: 'active' | 'inactive' | 'pending';
}

export interface ClockingLog {
  id: string;
  employeeId: string;
  employeeName: string;
  clockInTime: string;
  clockOutTime: string | null;
  anomaly: (DetectClockingAnomalyOutput & { type?: string }) | null;
}

    