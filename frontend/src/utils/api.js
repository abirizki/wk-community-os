/**
 * api.js
 * Centralized API utility for WK Community OS.
 * Defaults to relative path '/api' for Monolith deployment,
 * with fallback support for VITE_API_BASE_URL if specified.
 */

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = rawBaseURL
  ? (rawBaseURL.replace(/\/+$/, '').endsWith('/api')
      ? rawBaseURL.replace(/\/+$/, '')
      : `${rawBaseURL.replace(/\/+$/, '')}/api`)
  : '/api';

export const api = {
  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/api/')
      ? endpoint.replace(/^\/api/, '')
      : endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    const url = `${API_BASE}${cleanEndpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || data.error || 'Terjadi kesalahan pada server.',
          data: data,
        };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;

      throw {
        status: 0,
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        originalError: error,
      };
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

