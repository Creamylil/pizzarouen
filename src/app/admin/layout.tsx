import AdminShell from '@/components/admin/AdminShell';
import { Toaster } from 'sonner';
import '../(public)/globals.css';

export const metadata = {
  title: 'Admin - Back-office',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AdminShell>{children}</AdminShell>
        <Toaster />
      </body>
    </html>
  );
}
