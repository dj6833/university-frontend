/**
 * VERCEL EDGE REVERSE PROXY MIDDLEWARE
 *
 * PURPOSE:
 * To resolve Safari / Incognito mode cross-site (3rd-party) cookie blocking:
 * This file acts as a runtime proxy gateway specifically on Vercel infrastructure
 * (Vercel CLI locally or Vercel Edge Networks in the cloud). It routes frontend requests starting
 * with `/api` directly to the backend, transforming the request into a 1st-party
 * same-origin context.
 * Below approach ensures no hardcoding of backend URLs by accessing environment variables, so works across all environments
 *
 * NOTE: This file is natively intercepted by Vercel. It does NOT affect local standalone Vite builds
 * unless running through Vercel's wrapper (e.g., `npx vercel dev`).
 */
export const config = {
    matcher: ['/api/:path*'],
};

export default function middleware(request: Request) {
    const url = new URL(request.url);
    //Uncomment to see every incoming network request hitting the proxy:
    //console.log(`[Proxy Intercept] Incoming path: ${url.pathname}${url.search}`);

    const backendBaseUrl = process.env.VITE_BACKEND_BASE_URL;

    if (!backendBaseUrl) {
        console.error(`[Proxy Error] Missing VITE_BACKEND_BASE_URL environment variable!`);
        return new Response(
            JSON.stringify({ error: 'Missing VITE_BACKEND_BASE_URL configuration.' }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
    }

    // Clean the path (remove '/api') and stitch the request seamlessly to the dynamic backend target
    const cleanPath = url.pathname.replace(/^\/api/, '');
    const targetUrl = new URL(`${backendBaseUrl.replace(/\/$/, '')}${cleanPath}${url.search}`);

    //Uncomment to see exactly what final destination URL Vercel is sending the request to
    //console.log(`[Proxy Forwarding] Rewriting request to: ${targetUrl.toString()}`);

    // Setup Vercel-native middleware routing headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-middleware-rewrite', targetUrl.toString());

    return new Response(null, {
        headers: requestHeaders,
    });
}