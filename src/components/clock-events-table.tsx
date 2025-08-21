
'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import type { ClockingLog } from '@/lib/types';

interface ClockEventsTableProps {
    logs: ClockingLog[];
}

export function ClockEventsTable({ logs }: ClockEventsTableProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ScrollArea className="h-96">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Event</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {logs.map((log) => (
                <React.Fragment key={log.id}>
                    <TableRow>
                        <TableCell className="font-medium">{log.employeeName}</TableCell>
                        <TableCell>{isClient ? format(new Date(log.clockInTime), 'p') : ''}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">Clock In</Badge>
                        </TableCell>
                    </TableRow>
                    {log.clockOutTime && (
                        <TableRow>
                            <TableCell className="font-medium">{log.employeeName}</TableCell>
                            <TableCell>{isClient ? format(new Date(log.clockOutTime), 'p') : ''}</TableCell>
                            <TableCell>
                                <Badge variant="outline">Clock Out</Badge>
                            </TableCell>
                        </TableRow>
                    )}
                </React.Fragment>
            ))}
            </TableBody>
        </Table>
    </ScrollArea>
  );
}

    