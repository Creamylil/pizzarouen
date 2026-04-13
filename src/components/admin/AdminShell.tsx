'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4 bg-white">
            <SidebarTrigger />
            <span className="text-sm text-gray-500">Administration</span>
          </header>
          <main className="p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
