
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import type { ClockingLog } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface LogsTableViewProps {
    logs: ClockingLog[];
}

const AnomalyIndicator = ({ anomaly }: { anomaly: ClockingLog['anomaly'] }) => {
  if (!anomaly || !anomaly.isAnomaly) return <Badge variant="secondary">Normal</Badge>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="destructive"
          className="cursor-pointer hover:bg-destructive/80 flex items-center gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          {anomaly.type || 'Anomaly'}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none font-headline text-destructive">
              Anomaly Detected
            </h4>
            <p className="text-sm text-muted-foreground">
              {anomaly.explanation}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function LogsTableView({ logs }: LogsTableViewProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDuration = (start: string, end: string | null) => {
    if (!isClient) {
      return null;
    }
     if (!end) return <Badge variant="outline">On Duty</Badge>;
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const hours = durationMs / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hours`;
  };

  const exportToCsv = () => {
    const headers = ['Employee ID', 'Employee Name', 'Clock In', 'Clock Out', 'Duration (hours)', 'Is Anomaly', 'Anomaly Type', 'Explanation'];
    const rows = logs.map(log => [
        log.employeeId,
        log.employeeName,
        format(new Date(log.clockInTime), 'yyyy-MM-dd HH:mm:ss'),
        log.clockOutTime ? format(new Date(log.clockOutTime), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
        log.clockOutTime ? ((new Date(log.clockOutTime).getTime() - new Date(log.clockInTime).getTime()) / 3600000).toFixed(2) : 'N/A',
        log.anomaly?.isAnomaly ? 'Yes' : 'No',
        log.anomaly?.type || 'N/A',
        log.anomaly?.explanation.replace(/,/g, '') || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clockwise_logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export successful", description: "Clocking logs have been exported to CSV." });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Recent Clocking Logs</CardTitle>
                <CardDescription>A view of the most recent clocking events and anomalies.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCsv}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.employeeName}</TableCell>
                  <TableCell>{isClient ? format(new Date(log.clockInTime), 'PPp') : ''}</TableCell>
                  <TableCell>{log.clockOutTime && isClient ? format(new Date(log.clockOutTime), 'PPp') : <Badge variant="outline">On Duty</Badge>}</TableCell>
                  <TableCell>{formatDuration(log.clockInTime, log.clockOutTime)}</TableCell>
                  <TableCell>
                    <AnomalyIndicator anomaly={log.anomaly} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
