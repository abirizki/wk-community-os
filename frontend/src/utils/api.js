/**
 * api.js
 * Centralized API utility for WK Community OS.
 * Automatically prefixes requests with /api/ and handles global errors.
 */

const API_BASE = '/api';

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Default headers
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
        // Construct standard error object
        throw {
          status: response.status,
          message: data.message || data.error || 'Terjadi kesalahan pada server.',
          data: data
        };
      }

      return data;
    } catch (error) {
      // Re-throw if it's already a formatted error object
      if (error.status) throw error;
      
      // Handle network errors
      throw {
        status: 0,
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        originalError: error
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
  }
};

