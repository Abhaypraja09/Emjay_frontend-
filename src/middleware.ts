import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const user = request.cookies.get('user')?.value; // In Next.js App Router, cookies are preferred for server-side middleware
  // However, local auth in this project uses localStorage (Client Side).
  // For standard Middleware, we'd check cookies.
  
  // Since we're using Client Side auth (localStorage), 
  // we handle the redirects in the components (as implemented in page.tsx and Dashboard).
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/inventory/:path*', '/production/:path*', '/sales/:path*', '/reports/:path*'],
};
