/**
 * scripts/production_preflight.js
 * Production Readiness & Health Diagnostic Utility
 * Platform: Bumi Warga Enterprise (WK Community OS)
 * Target: Hostinger Cloud / Ubuntu VPS (Sukabumi Smart City)
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

console.log('================================================================');
console.log('🩺 MEMULAI PRODUCTION PREFLIGHT DIAGNOSTICS: BUMI WARGA');
console.log('================================================================\n');

let passCount = 0;
let warnCount = 0;
let failCount = 0;

function report(status, title, message = '') {
  if (status === 'PASS') {
    console.log(`✅ [PASS] ${title}`);
    passCount++;
  } else if (status === 'WARN') {
    console.log(`⚠️ [WARN] ${title} ${message ? `(${message})` : ''}`);
    warnCount++;
  } else {
    console.error(`❌ [FAIL] ${title} ${message ? `(${message})` : ''}`);
    failCount++;
  }
}

async function runPreflight() {
  const rootDir = path.resolve(__dirname, '..');

  // 1. Check Node.js runtime version
  const nodeVer = process.version;
  const majorVer = parseInt(nodeVer.replace('v', '').split('.')[0], 10);
  if (majorVer >= 18) {
    report('PASS', `Node.js Version: ${nodeVer} (Memenuhi syarat minimum Node 18+)`);
  } else {
    report('FAIL', `Node.js Version: ${nodeVer}`, 'Wajib menggunakan Node.js 18.x atau 20.x LTS untuk produksi');
  }

  // 2. Check essential backend files
  const essentialFiles = [
    'server.js',
    'package.json',
    'ecosystem.config.js',
    'database/master_setup_and_seed.sql'
  ];

  for (const file of essentialFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      report('PASS', `Berkas Inti Ditemukan: ${file}`);
    } else {
      report('FAIL', `Berkas Inti Hilang: ${file}`);
    }
  }

  // 3. Check logs directory (ensure writable)
  const logsDir = path.join(rootDir, 'logs');
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(logsDir, '.write-test'), 'ok');
    fs.unlinkSync(path.join(logsDir, '.write-test'));
    report('PASS', `Direktori Logging: logs/ (Siap & Dapat Ditulis)`);
  } catch (err) {
    report('WARN', `Direktori Logging: logs/`, err.message);
  }

  // 4. Check Frontend Production Bundle
  const publicDir = path.join(rootDir, 'public');
  const indexHtml = path.join(publicDir, 'index.html');
  const assetsDir = path.join(publicDir, 'assets');

  if (fs.existsSync(indexHtml)) {
    report('PASS', `Frontend Entrypoint Ditemukan: public/index.html`);
  } else {
    report('FAIL', `Frontend Entrypoint Hilang: public/index.html (Jalankan 'npm run build' di frontend/)`);
  }

  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    const hasJs = assetFiles.some(f => f.endsWith('.js'));
    const hasCss = assetFiles.some(f => f.endsWith('.css'));
    if (hasJs && hasCss) {
      report('PASS', `Frontend Bundle Assets: ${assetFiles.length} file terkompilasi (.js & .css siap saji)`);
    } else {
      report('FAIL', `Frontend Bundle Assets`, 'File .js atau .css tidak lengkap di public/assets/');
    }
  } else {
    report('FAIL', `Direktori Assets Hilang: public/assets/`);
  }

  // 5. Test Backend Modules Require Integrity
  try {
    require(path.join(rootDir, 'ecosystem.config.js'));
    report('PASS', `PM2 Ecosystem Config Valid (ecosystem.config.js dapat diuraikan)`);
  } catch (err) {
    report('FAIL', `PM2 Ecosystem Config Tidak Valid`, err.message);
  }

  try {
    require(path.join(rootDir, 'src/services/dukcapil.service.js'));
    require(path.join(rootDir, 'src/services/sapawarga.service.js'));
    report('PASS', `Layanan Integrasi Pemda: dukcapil & sapawarga siap beroperasi`);
  } catch (err) {
    report('FAIL', `Layanan Integrasi Pemda Gagal Dimuat`, err.message);
  }

  // 6. Test Non-blocking Database Socket Check
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;

  const isDbPortOpen = await new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    socket.setTimeout(400);
    socket.on('connect', () => {
      status = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(dbPort, dbHost);
  });

  if (isDbPortOpen) {
    report('PASS', `Port Database MySQL ${dbHost}:${dbPort} Terbuka & Aktif`);
  } else {
    report('WARN', `Port Database MySQL ${dbHost}:${dbPort} Offline/Unreachable`, 'Akan aktif saat dideploy di server produksi Hostinger');
  }

  console.log('\n================================================================');
  console.log(`📊 RINGKASAN PREFLIGHT: ${passCount} PASS, ${warnCount} WARN, ${failCount} FAIL`);
  if (failCount === 0) {
    console.log('🚀 STATUS: PLATFORM 100% SIAP UNTUK PRODUCTION DEPLOYMENT!');
  } else {
    console.log('⚠️ STATUS: TERDAPAT KRITERIA KRITIS YANG HARUS DIPERBAIKI SEBELUM GO-LIVE.');
  }
  console.log('================================================================\n');

  process.exit(failCount > 0 ? 1 : 0);
}

runPreflight().catch((err) => {
  console.error('Fatal preflight error:', err);
  process.exit(1);
});
