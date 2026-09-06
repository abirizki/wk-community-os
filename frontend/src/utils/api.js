/**
 * api.js
 * Centralized API utility for WK Community OS.
 * Supports absolute base URL from Vite environment variable.
 */

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '';
const normalizedBase = rawBaseURL ? rawBaseURL.replace(/\/+$/, '') : '';
const API_BASE = normalizedBase
  ? (normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`)
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
};
