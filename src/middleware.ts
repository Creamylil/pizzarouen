import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Admin uniquement disponible sur le site principal (rouen)
  if (process.env.CITY_SLUG !== 'rouen') {
    return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
  }

  return await updateSession(request);
}

export const config = {
  matcher: ['/admin/:path*'],
};
