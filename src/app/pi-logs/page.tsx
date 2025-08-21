'use client';

import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Wifi, WifiOff } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function RealtimeLogsPage() {
  const [logs, setLogs] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [piConnected, setPiConnected] = React.useState<boolean>(true); // Track Pi connectivity
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase environment variables are not set. Please check your .env.local file.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch initial logs
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('message, created_at')
        .order('created_at', { ascending: true });

      if (error) setError(`Error fetching initial logs: ${error.message}`);
      else if (data) setLogs(data.map(l => l.message));
    };

    fetchLogs();

    // Realtime subscription for logs
    const logsSubscription = supabase
      .channel('public:logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs' }, payload => {
        setLogs(prev => [...prev, (payload.new as { message: string }).message]);
      })
      .subscribe();

    // Optional: subscribe to Pi status changes if you have a pi_status table
    const piSubscription = supabase
      .channel('public:pi_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pi_status' }, payload => {
        const status = (payload.new as { connected: boolean }).connected;
        setPiConnected(status);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(logsSubscription);
      supabase.removeChannel(piSubscription);
    };
  }, []);

  React.useEffect(() => {
    // Auto-scroll to bottom whenever logs update
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [logs]);

  return (
    <>
      <AppSidebar />
      <main className="flex-1 md:pl-[--sidebar-width-icon] lg:pl-[--sidebar-width]">
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-3xl font-bold font-headline">Realtime Pi Logs</h1>
            </div>
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
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Log Stream</CardTitle>
              <CardDescription>Displaying real-time logs from the device.</CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-96 w-full rounded-md border bg-muted" ref={scrollAreaRef}>
                  <div className="p-4 font-mono text-sm">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
