# Ringkasan Konfigurasi `bumiwarga.online`

**Tanggal:** 14 September 2026  
**Jenis aplikasi:** Node.js Web App  
**Server baru:** `46.202.138.186`  
**Database:** `u466444476_bumiwarga`

## Tujuan

Menghubungkan `bumiwarga.online` ke server baru dan memastikan aplikasi Node.js dapat mengakses database MySQL melalui koneksi remote.

## Tindakan yang sudah dilakukan

### 1. CDN dinonaktifkan

CDN untuk `bumiwarga.online` berhasil dinonaktifkan.

Dampak:

- Website akan dilayani langsung dari server asal.
- Perubahan dapat memerlukan waktu hingga sekitar 5 menit untuk diterapkan.

### 2. Koneksi remote MySQL dibuat

Koneksi remote MySQL berhasil dibuat dengan konfigurasi berikut:

| Parameter | Nilai |
|---|---|
| Database | `u466444476_bumiwarga` |
| IP server yang diizinkan | `46.202.138.186` |
| Port MySQL | `3306` |
| Status | Berhasil dibuat |

## Konfigurasi DNS yang perlu dipastikan

Pastikan record DNS berikut mengarah ke server baru:

| Tipe | Nama/Host | Nilai |
|---|---|---|
| A | `@` | `46.202.138.186` |
| A | `www` | `46.202.138.186` |

Jika `www` masih menggunakan CNAME dan memang diperlukan oleh konfigurasi domain, jangan menggantinya tanpa memastikan struktur DNS aplikasi terlebih dahulu.

## Langkah lanjutan

1. Pastikan DNS `@` dan `www` sudah mengarah ke `46.202.138.186`.
2. Periksa variabel lingkungan aplikasi Node.js, terutama:
   - Host database
   - Nama database: `u466444476_bumiwarga`
   - Nama pengguna database
   - Kata sandi database
   - Port: `3306`
3. Jika aplikasi masih menggunakan IP server lama, ganti konfigurasi tersebut ke `46.202.138.186`.
4. Jalankan redeploy aplikasi Node.js.
5. Uji koneksi database dan akses website.
6. Jika perubahan belum terlihat, tunggu propagasi DNS lalu lakukan hard refresh:
   - Windows: `Ctrl + F5`
   - macOS: `Cmd + Shift + R`

## Catatan keamanan

- Jangan menyimpan kata sandi database di repository Git.
- Gunakan environment variables untuk kredensial database.
- Jangan membagikan kata sandi database di chat atau dokumentasi publik.
- Setelah website berjalan, batasi akses database hanya dari IP server yang diperlukan.

## Status akhir

- [x] CDN dinonaktifkan
- [x] Remote MySQL dibuat untuk `u466444476_bumiwarga`
- [x] IP `46.202.138.186` diizinkan
- [ ] DNS diverifikasi
- [ ] Konfigurasi environment aplikasi diverifikasi
- [ ] Redeploy aplikasi dilakukan
- [ ] Koneksi database dan website diuji