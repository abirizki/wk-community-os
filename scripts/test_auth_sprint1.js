/**
 * Test script to verify Sprint 1 Security & Authentication Fixes
 */
const { requireRole, requireFamilyOrStaffScope } = require('../src/middleware/auth.middleware');

console.log('--- TEST 1: requireRole signature check ---');
try {
  const mw1 = requireRole('ketua_rt', 'ketua_rw');
  const mw2 = requireRole(['ketua_rt', 'ketua_rw']);

  let passed1 = false;
  let passed2 = false;

  mw1(
    { session: { user: { role: 'ketua_rt' } } },
    { status: () => ({ json: () => {} }) },
    () => { passed1 = true; }
  );

  mw2(
    { session: { user: { role: 'ketua_rw' } } },
    { status: () => ({ json: () => {} }) },
    () => { passed2 = true; }
  );

  console.log('requireRole variadic call passed:', passed1);
  console.log('requireRole array call passed:', passed2);
} catch (e) {
  console.error('requireRole test failed:', e);
}

console.log('\n--- TEST 2: Walikota not auto-elevated to superadmin ---');
try {
  const mwAdmin = requireRole(['superadmin']);
  let blocked = false;
  mwAdmin(
    { session: { user: { role: 'walikota' } } },
    { status: (code) => { if (code === 403) blocked = true; return { json: () => {} }; } },
    () => { console.log('ERROR: Walikota bypassed superadmin check!'); }
  );
  console.log('Walikota correctly blocked from superadmin-only action:', blocked);
} catch (e) {
  console.error('Walikota test failed:', e);
}

console.log('\n--- TEST 3: Anti-IDOR Scope Guard ---');
try {
  const idorKK = requireFamilyOrStaffScope('noKk');
  let idorBlocked = false;
  idorKK(
    { params: { noKk: '3272030101900105' }, query: {}, session: { user: { role: 'warga', no_kk: '3272030101900101' } } },
    { status: (code) => { if (code === 403) idorBlocked = true; return { json: () => {} }; } },
    () => { console.log('ERROR: Citizen bypassed cross-KK IDOR check!'); }
  );
  console.log('Cross-KK IDOR access correctly blocked (403):', idorBlocked);

  let ownKKAllowed = false;
  idorKK(
    { params: { noKk: '3272030101900101' }, query: {}, session: { user: { role: 'warga', no_kk: '3272030101900101' } } },
    { status: () => ({ json: () => {} }) },
    () => { ownKKAllowed = true; }
  );
  console.log('Own KK access correctly allowed:', ownKKAllowed);
} catch (e) {
  console.error('Anti-IDOR test failed:', e);
}

console.log('\n--- TEST 4: Seed Dataset Fallback Lookup ---');
try {
  const fs = require('fs');
  const path = require('path');
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/seed_dataset.json'), 'utf8'));

  const siti = seed.warga.find(w => w.nik === '3272034506860002');
  console.log('Siti Aminah found in seed dataset:', !!siti, siti ? `(Nama: ${siti.nama}, Lahir: ${siti.tanggal_lahir})` : '');

  const dewi = seed.warga.find(w => w.nik === '3272034506870006');
  console.log('Dewi Sartika found in seed dataset:', !!dewi, dewi ? `(Nama: ${dewi.nama}, Lahir: ${dewi.tanggal_lahir})` : '');
} catch (e) {
  console.error('Seed dataset lookup failed:', e);
}
