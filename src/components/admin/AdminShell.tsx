'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="grid min-h-screen md:grid-cols-[16rem_1fr]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-50 border-r transition-transform duration-200 md:relative md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 md:hidden">
            <span className="font-bold">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm text-gray-500">Administration</span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
