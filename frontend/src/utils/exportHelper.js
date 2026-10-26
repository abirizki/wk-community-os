/**
 * frontend/src/utils/exportHelper.js
 * Universal Report Download Utility for Bumi Warga (WK Community OS).
 * Handles streaming blob downloads for Excel (.xlsx/.xls), CSV, and PDF.
 */

export async function downloadReport(endpoint, defaultFilename = 'laporan.xlsx') {
  try {
    const rawBaseURL = import.meta.env.VITE_API_BASE_URL;
    const API_BASE = rawBaseURL
      ? (rawBaseURL.replace(/\/+$/, '').endsWith('/api')
          ? rawBaseURL.replace(/\/+$/, '')
          : `${rawBaseURL.replace(/\/+$/, '')}/api`)
      : '/api';

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}${cleanEndpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || 'Gagal mengunduh berkas laporan.');
    }

    // Try reading filename from Content-Disposition header if available
    let filename = defaultFilename;
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(objectUrl);
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Download report error:', error);
    alert(error.message || 'Terjadi kesalahan saat mengunduh laporan.');
    return false;
  }
}

