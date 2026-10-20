/**
 * privacy.js
 * Utility pemformatan dan sensor data sensitif sesuai UU PDP No. 27/2022
 * Bumi Warga - Jabar Pintar Digital
 */

/**
 * Masking NIK (16 digit) -> 327203******0001
 * Menjaga 6 digit awal (kode wilayah) dan 4 digit akhir, menyensor 6 digit tengah (tanggal lahir)
 */
export function maskNIK(nik, isMasked = true) {
  if (!nik) return '-';
  const str = String(nik).trim();
  if (!isMasked) return str;
  if (str.length === 16) {
    return `${str.slice(0, 6)}******${str.slice(12)}`;
  }
  if (str.length > 8) {
    return `${str.slice(0, 4)}****${str.slice(-4)}`;
  }
  return str;
}

/**
 * Masking No. Kartu Keluarga (16 digit) -> 327203******0001
 */
export function maskKK(noKK, isMasked = true) {
  if (!noKK) return '-';
  const str = String(noKK).trim();
  if (!isMasked) return str;
  if (str.length === 16) {
    return `${str.slice(0, 6)}******${str.slice(12)}`;
  }
  if (str.length > 8) {
    return `${str.slice(0, 4)}****${str.slice(-4)}`;
  }
  return str;
}

/**
 * Masking Nomor Telepon / HP -> 0812****7890
 */
export function maskPhone(phone, isMasked = true) {
  if (!phone) return '-';
  const str = String(phone).trim();
  if (!isMasked) return str;
  if (str.length >= 10) {
    return `${str.slice(0, 4)}****${str.slice(-4)}`;
  }
  return str;
}

