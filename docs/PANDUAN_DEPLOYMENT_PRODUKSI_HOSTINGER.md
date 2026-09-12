# PANDUAN TEKNIS DEPLOYMENT SERVER PRODUKSI (HOSTINGER / VPS)
## PLATFORM PELAYANAN PUBLIK & TATA KELOLA DIGITAL "BUMI WARGA"
### PEMERINTAH KOTA SUKABUMI — JABAR PINTAR DIGITAL

---

## 1. IKHTISAR ARSITEKTUR PRODUKSI

Platform **Bumi Warga** dirancang dengan arsitektur monolitik modern berbasis Node.js & React (Vite) yang sangat efisien dan ringan:
- **Server Runtime**: Node.js v18+ LTS (direkomendasikan Node.js 20 atau 24).
- **Process Manager**: PM2 Cluster Mode (2 instans pekerja, auto-restart jika konsumsi memori > 500MB).
- **Reverse Proxy & TLS**: Nginx Web Server (TLS 1.2 / TLS 1.3, Let's Encrypt SSL, Rate Limiting).
- **Database Engine**: MySQL 8.0 / MariaDB 10.6+ di Hostinger Cloud.
- **Port Internal**: `localhost:3000` (diproxy dari port 80/443 oleh Nginx).

---

## 2. CHECKLIST PERSIAPAN PRODUKSI

Sebelum melakukan eksekusi deployment, pastikan data berikut telah tersedia dari panel kontrol Hostinger:
1. **Akses SSH Hostinger**: Alamat IP Server, Port SSH (biasanya 65002 atau 22), Username, dan Password / SSH Key.
2. **Kredensial Database Hostinger**:
   - Host: `localhost` (atau IP remote database hostinger).
   - Port: `3306`.
   - Nama Database: `u466444476_bumiwarga`.
   - Username Database: `u466444476_admin`.
   - Password Database: *(Password aman yang dibuat di panel Hostinger)*.
3. **Domain / Subdomain Resmi**:
   - Misal: `bumiwarga.sukabumikota.go.id` (atau domain pilot project).
   - DNS A Record diarahkan ke IP publik Server Hostinger.

---

## 3. LANGKAH-LANGKAH DEPLOYMENT (STEP-BY-STEP)

### Langkah 1: Kloning Repositori ke Direktori Server
Masuk ke terminal SSH server Hostinger Anda, lalu jalankan:

```bash
# Pindah ke direktori web root
cd /var/www  # Atau ~/public_html sesuai arsitektur VPS

# Kloning repositori GitHub resmi
git clone https://github.com/abirizki/wk-community-os.git bumi-warga
cd bumi-warga

# Pastikan berada di cabang main stabil
git checkout main
```

---

### Langkah 2: Instalasi Dependensi & Kompilasi Frontend

```bash
# 1. Pasang dependensi backend
npm install --production

# 2. Pasang dependensi frontend & lakukan build aset PWA
cd frontend
npm install
npm run build
cd ..

# Pastikan folder public/ telah terisi index.html, assets (.js, .css), manifest.json, dan sw.js
ls -la public/
```

---

### Langkah 3: Konfigurasi File Environment Produksi (`.env`)

Salin template produksi dan sesuaikan dengan kredensial database Hostinger:

```bash
cp .env.production.example .env
nano .env
```

Pastikan variabel-variabel kunci terisi:
```ini
NODE_ENV=production
PORT=3000

# Database Produksi Hostinger
DB_HOST=localhost
DB_PORT=3306
DB_USER=u466444476_admin
DB_PASSWORD=GantiDenganPasswordAsliHostinger123!
DB_NAME=u466444476_bumiwarga

# Keamanan Sesi & Kriptografi
SESSION_SECRET=a8f9c1b2e3d4f506172839405a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b
JWT_SECRET=f1e2d3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100

# WhatsApp Gateway (Fonnte / WAHA)
WA_PROVIDER=FONNTE
FONNTE_API_TOKEN=isi_token_fonnte_resmi_pemda
WA_SENDER_NUMBER=6281234567890
```

---

### Langkah 4: Migrasi Skema Database & Akun Standar

Jalankan perintah otomatis berikut untuk membuat seluruh 15 tabel dan memasukkan akun standar:

```bash
# 1. Inisialisasi skema tabel database (Idempotent)
npm run deploy:db

# 2. Terapkan akun standar aparatur (Walikota, Camat, Lurah, RT/RW, Posyandu)
npm run deploy:accounts
```

---

### Langkah 5: Menjalankan Aplikasi via PM2 Cluster Mode

```bash
# Jalankan cluster PM2
pm2 start ecosystem.config.js --env production

# Pastikan status 'online' dengan 2 worker instances
pm2 status

# Aktifkan autorun saat server reboot
pm2 save
pm2 startup
```

---

### Langkah 6: Konfigurasi Nginx Reverse Proxy & SSL (Let's Encrypt)

1. Salin template konfigurasi Nginx:
```bash
sudo cp nginx/wk-community-os.conf /etc/nginx/sites-available/bumiwarga.conf
sudo ln -s /etc/nginx/sites-available/bumiwarga.conf /etc/nginx/sites-enabled/

# Edit server_name dengan domain Anda
sudo nano /etc/nginx/sites-available/bumiwarga.conf
```

2. Pasang Sertifikat SSL HTTPS Gratis dari Let's Encrypt:
```bash
sudo certbot --nginx -d bumiwarga.sukabumikota.go.id

# Uji konfigurasi Nginx dan reload
sudo nginx -t
sudo systemctl reload nginx
```

---

### Langkah 7: Uji Diagnostik Pra-Rilis (*Production Preflight*)

Jalankan uji diagnostik preflight untuk memastikan seluruh 10 indikator kesehatan server berstatus **PASS**:

```bash
npm run preflight
```

Output yang diharapkan:
```
================================================================
🩺 PRODUCTION PREFLIGHT DIAGNOSTICS: BUMI WARGA
================================================================
✅ [PASS] Node.js Version: v24.x
✅ [PASS] Berkas Inti Ditemukan: server.js, package.json, ecosystem.config.js
✅ [PASS] Direktori Logging: logs/ (Siap & Dapat Ditulis)
✅ [PASS] Frontend Production Bundle: index.html & assets siap
✅ [PASS] PM2 Ecosystem Config Valid
✅ [PASS] Layanan Integrasi Pemda: dukcapil & sapawarga siap beroperasi
📊 RINGKASAN: 10 PASS, 0 FAIL (100% SIAP PRODUKSI)
================================================================
```

---

## 4. PROSEDUR PEMELIHARAAN & CADANGAN (BACKUP)

1. **Backup Database Harian Otomatis (Cron Job)**:
```bash
crontab -e
# Tambahkan baris berikut (backup setiap pukul 02:00 dini hari):
0 2 * * * mysqldump -u u466444476_admin -p'PASSWORD' u466444476_bumiwarga | gzip > /var/backups/bumiwarga_$(date +\%F).sql.gz
```

2. **Memantau Log Aplikasi Secara Real-Time**:
```bash
pm2 logs bumi-warga
```

3. **Memperbarui Kode Aplikasi (*Zero-Downtime Reload*)**:
```bash
git pull origin main
npm install --production
npm run build:frontend
pm2 reload bumi-warga
```

Platform **Bumi Warga** kini resmi beroperasi secara aman, tangguh, dan siap melayani seluruh masyarakat Kota Sukabumi!

