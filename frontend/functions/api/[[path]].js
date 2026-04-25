/**
 * Cloudflare Pages Function — API proxy
 *
 * Routes all /api/* requests to the Railway backend, preserving:
 *   - HTTP method
 *   - Request headers (including Authorization and Cookie)
 *   - Request body (for POST/PUT/PATCH)
 *   - Query parameters
 *   - Response headers (including Set-Cookie for httpOnly refresh token)
 */

const BACKEND = 'https://backend-production-de36.up.railway.app'

export async function onRequest(context) {
  const { request, params } = context
  const url = new URL(request.url)

  // params.path is an array of path segments after /api/
  // e.g. /api/v1/auth/login → ['v1', 'auth', 'login']
  const pathSegments = params.path ?? []
  const targetUrl = `${BACKEND}/api/${pathSegments.join('/')}${url.search}`

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    redirect: 'follow',
    duplex: 'half',
  })

  return fetch(proxyRequest)
}
