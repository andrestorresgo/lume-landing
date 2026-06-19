import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from './lib/supabaseServer';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.url);
  const pathname = url.pathname;

  // Check if target is an admin route
  if (pathname.startsWith('/admin')) {
    // Exclude the login page itself to prevent infinite redirection
    if (pathname === '/admin/login') {
      // If user is already logged in as admin, redirect them from login to dashboard
      const { client, accessToken, refreshToken } = createServerClient(context.cookies);
      if (accessToken) {
        try {
          const { data: { session } } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          if (session?.user) {
            const { data: profile } = await client
              .from('users')
              .select('is_admin')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile?.is_admin) {
              return context.redirect('/admin/products');
            }
          }
        } catch (e) {
          // Ignore, let them see the login form
        }
      }
      return next();
    }

    const { client, accessToken, refreshToken } = createServerClient(context.cookies);

    if (!accessToken) {
      return context.redirect('/admin/login');
    }

    // Set and validate the session
    const { data: { session }, error: sessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });

    if (sessionError || !session?.user) {
      // Clear invalid cookies
      context.cookies.delete('sb-access-token', { path: '/' });
      context.cookies.delete('sb-refresh-token', { path: '/' });
      return context.redirect('/admin/login');
    }

    // Refresh cookies in the browser if the session tokens changed
    if (session.access_token !== accessToken) {
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      context.cookies.set('sb-access-token', session.access_token, {
        path: '/',
        maxAge,
        secure: true,
        sameSite: 'lax',
      });
      context.cookies.set('sb-refresh-token', session.refresh_token || '', {
        path: '/',
        maxAge,
        secure: true,
        sameSite: 'lax',
      });
    }

    // Check database to verify the user has the is_admin flag set to true
    const { data: profile, error: profileError } = await client
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError || !profile?.is_admin) {
      return new Response('Forbidden: Acceso de administrador requerido.', { status: 403 });
    }

    // User is authorized as admin, allow request to proceed
    return next();
  }

  // Allow non-admin paths to proceed normally
  return next();
});
