/**
 * Application API Configuration
 *
 * In local development, defaults to 'http://localhost:5000/api'.
 * For staging/production deployment, set VITE_API_BASE_URL in your .env or host environment:
 *   VITE_API_BASE_URL=https://api.yourdomain.com/api
 */
const envApiUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = envApiUrl
  ? envApiUrl.replace(/\/+$/, '')
  : (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

if (import.meta.env.PROD && !envApiUrl) {
  console.warn(
    '[AppointEase] Warning: VITE_API_BASE_URL is not defined in production environment variables. Requests will fall back to relative path /api.'
  )
}

export default API_BASE_URL
