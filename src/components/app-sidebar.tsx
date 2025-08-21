
'use client';

import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  History,
  Settings,
  LogOut,
  LogIn,
  RadioTower,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isAuthPage = pathname === '/login';

  // For now, let's assume we are not logged in.
  const isLoggedIn = false;

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <Link href="/" className='flex items-center gap-2'>
          <Icons.logo className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-headline font-bold text-primary group-data-[collapsible=icon]:hidden">
            ClockWise
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton
                tooltip="Dashboard"
                isActive={isActive('/')}
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/employees">
              <SidebarMenuButton
                tooltip="Employees"
                isActive={isActive('/employees')}
              >
                <Users />
                <span>Employees</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/logs">
              <SidebarMenuButton
                tooltip="Clocking Logs"
                isActive={isActive('/logs')}
              >
                <History />
                <span>Clocking Logs</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/pi-logs">
              <SidebarMenuButton
                tooltip="Pi Logs"
                isActive={isActive('/pi-logs')}
              >
                <RadioTower />
                <span>Pi Logs</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings">
              <SidebarMenuButton tooltip="Settings" isActive={isActive('/settings')}>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           {isLoggedIn ? (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Log Out">
                <LogOut />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
             <SidebarMenuItem>
              <Link href="/login">
                <SidebarMenuButton tooltip="Sign In" isActive={isActive('/login')}>
                  <LogIn />
                  <span>Sign In</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
