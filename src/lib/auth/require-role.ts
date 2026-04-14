import { redirect } from 'next/navigation';
import { getSessionRole, type SessionInfo } from './get-session-role';

/**
 * Exige un rôle admin. Redirige vers /admin/crm si commercial, /admin/login sinon.
 */
export async function requireAdmin(): Promise<SessionInfo & { role: 'admin' }> {
  const session = await getSessionRole();
  if (!session) {
    redirect('/admin/login');
  }
  if (session.role !== 'admin') {
    redirect('/admin/crm');
  }
  return session as SessionInfo & { role: 'admin' };
}

/**
 * Exige une authentification (admin ou commercial). Redirige vers /admin/login sinon.
 */
export async function requireAuth(): Promise<NonNullable<SessionInfo>> {
  const session = await getSessionRole();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}
