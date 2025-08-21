
'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const handleSaveChanges = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 md:pl-[--sidebar-width-icon] lg:pl-[--sidebar-width]">
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="mb-8">
             <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-3xl font-bold font-headline">Settings</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Customize your application settings.
            </p>
          </header>
          <div className="grid gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="anomaly-notifications" className="flex flex-col space-y-1">
                    <span>Anomaly Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive notifications for detected clocking anomalies.
                    </span>
                  </Label>
                  <Switch id="anomaly-notifications" defaultChecked />
                </div>
                 <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive a daily summary via email.
                    </span>
                  </Label>
                  <Switch id="email-notifications" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
              </Header>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                     <Select defaultValue="system">
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </CardContent>
            </Card>

             <div className="flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
