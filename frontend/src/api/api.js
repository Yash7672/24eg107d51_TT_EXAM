import axios from 'axios';

/**
 * One Axios instance for the whole application.
 *
 * The base URL comes from the environment variable VITE_API_BASE_URL, so the
 * same code works locally (http://localhost:8080) and in production
 * (the Render URL) without changing a single line of code.
 *
 * The URL must contain the origin only, for example
 * https://my-backend.onrender.com - the endpoints below already start with
 * "/api", so writing "/api" twice would produce a wrong URL.
 */
const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

export const API_BASE_URL = (configuredBaseUrl || 'http://localhost:8080').replace(/\/+$/, '');

/** True when VITE_API_BASE_URL is really set in the build. */
export const API_BASE_URL_CONFIGURED = configuredBaseUrl.length > 0;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Turns every failure into a readable message.
 * The frontend never shows a raw stack trace or "[object Object]".
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';

    if (error.code === 'ECONNABORTED') {
      message = 'The request timed out. The backend may be starting up or unreachable.';
    } else if (error.response) {
      message = error.response.data?.message || `Request failed with status ${error.response.status}.`;
    } else if (error.request) {
      message = `Cannot reach the backend at ${API_BASE_URL}. Check VITE_API_BASE_URL and that the backend is running.`;
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({ message, status: error.response?.status ?? null, error });
  },
);

/**
 * Endpoints of the starter. Add your own API groups here during the exam,
 * for example:  export const productApi = { list: () => api.get('/api/products') };
 */
export const healthApi = {
  check: () => api.get('/api/health'),
};

export default api;
