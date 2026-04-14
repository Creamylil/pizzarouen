'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Pizza,
  MapPin,
  ArrowRightLeft,
  CreditCard,
  ClipboardList,
  Store,
  Users,
  ExternalLink,
  LogOut,
  Calculator,
} from 'lucide-react';
import { hasPermission, type PermissionKey, type Permissions } from '@/lib/permissions';
import { logoutAction } from '@/app/admin/actions/auth';

const dataNav = [
  { title: 'Villes', href: '/admin/cities', icon: Building2, permission: 'cities' as PermissionKey },
  { title: 'Pizzerias', href: '/admin/pizzerias', icon: Pizza, permission: 'pizzerias' as PermissionKey },
  { title: 'Secteurs', href: '/admin/sectors', icon: MapPin, permission: 'sectors' as PermissionKey },
  { title: 'Redirects', href: '/admin/redirects', icon: ArrowRightLeft, permission: 'redirects' as PermissionKey },
  { title: 'Formules', href: '/admin/pricing', icon: CreditCard, permission: 'pricing' as PermissionKey },
];

const commercialNav = [
  { title: 'Fiches commerciales', href: '/admin/crm/fiches', icon: Store, permission: 'fiches' as PermissionKey },
  { title: 'Pipeline CRM', href: '/admin/crm', icon: ClipboardList, permission: 'pipeline' as PermissionKey },
  { title: 'Équipe', href: '/admin/commercials', icon: Users, permission: 'team' as PermissionKey },
];

const simulateurNav = { title: 'Simulateur', href: '/admin/simulateur', icon: Calculator, permission: 'simulateur' as PermissionKey };

interface AdminSidebarProps {
  onNavigate?: () => void;
  userRole: 'admin' | 'commercial';
  permissions: Permissions | null;
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  // /admin/crm/fiches → only "Fiches commerciales" active
  if (href === '/admin/crm/fiches') return pathname.startsWith('/admin/crm/fiches');
  // /admin/crm → active for /admin/crm and /admin/crm/[uuid], but NOT /admin/crm/fiches
  if (href === '/admin/crm') return pathname.startsWith('/admin/crm') && !pathname.startsWith('/admin/crm/fiches');
  return pathname.startsWith(href);
}

export default function AdminSidebar({ onNavigate, userRole, permissions }: AdminSidebarProps) {
  const pathname = usePathname();

  const canAccess = (key: PermissionKey) => hasPermission(userRole, permissions, key);

  const visibleDataNav = dataNav.filter((item) => canAccess(item.permission));
  const visibleCommercialNav = [
    ...commercialNav.filter((item) => canAccess(item.permission)),
    ...(canAccess(simulateurNav.permission) ? [simulateurNav] : []),
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <Link
          href={userRole === 'commercial' ? '/admin/crm' : '/admin'}
          onClick={onNavigate}
          className="flex items-center gap-2 font-bold text-lg"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Back-office</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-4">
        {visibleDataNav.length > 0 && (
          <>
            <div className="px-3 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Données
              </span>
            </div>
            <ul className="space-y-1 px-2">
              {visibleDataNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'bg-gray-200 font-medium text-gray-900'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="my-3 mx-3 border-t" />
          </>
        )}

        {visibleCommercialNav.length > 0 && (
          <>
            <div className="px-3 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Commercial
              </span>
            </div>
            <ul className="space-y-1 px-2">
              {visibleCommercialNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'bg-gray-200 font-medium text-gray-900'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-2 space-y-1">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span>Voir le site</span>
        </Link>
        <button
          onClick={async () => {
            await logoutAction();
          }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
