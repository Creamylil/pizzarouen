import AdminShell from '@/components/admin/AdminShell';
import { Toaster } from 'sonner';
import { getSessionRole } from '@/lib/auth/get-session-role';
import '../(public)/globals.css';

export const metadata = {
  title: 'Admin - Back-office',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionRole();
  const userRole = session?.role ?? 'admin';

  return (
    <html lang="fr">
      <body className="min-h-screen">
        <AdminShell userRole={userRole}>{children}</AdminShell>
        <Toaster />
      </body>
    </html>
  );
}
