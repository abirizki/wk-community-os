import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('--- TEST KEBIJAKAN SANDI & KREDENSIAL STANDAR ---');

let passed = 0;
let failed = 0;

function assert(condition, desc) {
  if (condition) {
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
    failed++;
  }
}

// 1. Uji Regex Password BSSN
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_-])[A-Za-z\d@$!%*?&#^_-]{8,}$/;

assert(!passwordRegex.test('123456'), 'Menolak password angka 6 digit (123456)');
assert(!passwordRegex.test('password123'), 'Menolak password tanpa huruf besar dan simbol (password123)');
assert(!passwordRegex.test('Password123'), 'Menolak password tanpa simbol khusus (Password123)');
assert(!passwordRegex.test('Pass!1'), 'Menolak password kurang dari 8 karakter (Pass!1)');
assert(passwordRegex.test('Sukabumi@Juara2026'), 'Menerima password kuat standar Walikota (Sukabumi@Juara2026)');
assert(passwordRegex.test('Kebonjati@Hebat2026'), 'Menerima password kuat standar Kelurahan (Kebonjati@Hebat2026)');
assert(passwordRegex.test('Guyub01@Kbj2026'), 'Menerima password kuat standar Ketua RT (Guyub01@Kbj2026)');
assert(passwordRegex.test('Warga@0003#2026'), 'Menerima password kuat standar Warga (Warga@0003#2026)');

// 2. Uji Berkas Slip Kredensial
const slipPath = path.join(root, 'docs', 'DISTRIBUSI_KREDENSIAL_PILOT.md');
assert(fs.existsSync(slipPath), 'Berkas docs/DISTRIBUSI_KREDENSIAL_PILOT.md tersedia');
const slipContent = fs.readFileSync(slipPath, 'utf8');
assert(slipContent.includes('walikota.sukabumi'), 'Slip memuat akun walikota.sukabumi');
assert(slipContent.includes('lurah.kebonjati'), 'Slip memuat akun lurah.kebonjati');
assert(slipContent.includes('rw01_kebonjati'), 'Slip memuat akun rw01_kebonjati');
assert(slipContent.includes('rt01_rw01_kbj'), 'Slip memuat akun rt01_rw01_kbj');
assert(slipContent.includes('posyandu.melati_rw01'), 'Slip memuat akun posyandu.melati_rw01');

// 3. Uji Komponen ForceChangePasswordModal
const modalPath = path.join(root, 'frontend', 'src', 'components', 'ForceChangePasswordModal.jsx');
assert(fs.existsSync(modalPath), 'Komponen ForceChangePasswordModal.jsx tersedia');
const modalContent = fs.readFileSync(modalPath, 'utf8');
assert(modalContent.includes('change-initial-password'), 'Modal terintegrasi dengan endpoint /auth/change-initial-password');

console.log(`\nRINGKASAN: ${passed} PASSED, ${failed} FAILED`);
if (failed > 0) process.exit(1);
process.exit(0);

