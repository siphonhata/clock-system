import type { Employee, ClockingLog } from './types';

export const employees: Employee[] = [
  { id: '1', name: 'Alice Johnson', fingerprintId: 'fp_1', status: 'active' },
  { id: '2', name: 'Bob Williams', fingerprintId: null, status: 'pending' },
  { id: '3', name: 'Charlie Brown', fingerprintId: 'fp_3', status: 'active' },
  { id: '4', name: 'Diana Miller', fingerprintId: 'fp_4', status: 'inactive' },
];

export const initialLogs: ClockingLog[] = [
  {
    id: 'log1',
    employeeId: '1',
    employeeName: 'Alice Johnson',
    clockInTime: new Date('2024-07-30T09:01:00').toISOString(),
    clockOutTime: new Date('2024-07-30T17:05:00').toISOString(),
    anomaly: null,
  },
  {
    id: 'log2',
    employeeId: '2',
    employeeName: 'Bob Williams',
    clockInTime: new Date('2024-07-30T08:55:00').toISOString(),
    clockOutTime: new Date('2024-07-30T12:30:00').toISOString(),
    anomaly: {
      isAnomaly: true,
      type: 'Unusually short shift',
      explanation: 'Shift was only 3.5 hours, which is significantly shorter than the typical 8-hour shift for this employee.',
    },
  },
  {
    id: 'log3',
    employeeId: '3',
    employeeName: 'Charlie Brown',
    clockInTime: new Date('2024-07-30T09:15:00').toISOString(),
    clockOutTime: new Date('2024-07-30T17:30:00').toISOString(),
    anomaly: null,
  },
  {
    id: 'log4',
    employeeId: '1',
    employeeName: 'Alice Johnson',
    clockInTime: new Date('2024-07-29T09:00:00').toISOString(),
    clockOutTime: new Date('2024-07-29T21:00:00').toISOString(),
     anomaly: {
      isAnomaly: true,
      type: 'Unusually long shift',
      explanation: 'Shift was 12 hours long, exceeding the standard work hours significantly.',
    },
  },
];

    