import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('--- RUNNING PWA & OFFLINE FIRST VALIDATION TEST ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Check Manifest in public and frontend/public
const manifestPath = path.join(root, 'public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'public/manifest.json exists');

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.name && manifest.name.includes('Bumi Warga'), 'Manifest has correct name: ' + manifest.name);
  assert(manifest.short_name === 'Bumi Warga', 'Manifest short_name is Bumi Warga');
  assert(manifest.display === 'standalone', 'Manifest display mode is standalone');
  assert(manifest.start_url === '/', 'Manifest start_url is /');
  assert(manifest.theme_color === '#1b4332', 'Manifest theme_color is #1b4332');
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 4, 'Manifest has 4+ icons defined');

  // Verify all icon paths exist
  for (const icon of manifest.icons) {
    const iconFile = path.join(root, 'public', icon.src.replace(/^\//, ''));
    const exists = fs.existsSync(iconFile);
    const size = exists ? fs.statSync(iconFile).size : 0;
    assert(exists && size > 0, `Icon exists & non-empty: ${icon.src} (${size} bytes)`);
  }
} catch (e) {
  assert(false, 'Manifest JSON parsing failed: ' + e.message);
}

// 2. Check Service Worker (sw.js)
const swPath = path.join(root, 'public', 'sw.js');
assert(fs.existsSync(swPath), 'public/sw.js exists');

const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('STATIC_CACHE') && swContent.includes('DYNAMIC_CACHE'), 'Service worker configures cache tiers');
assert(swContent.includes('offline.html'), 'Service worker references offline fallback page');
assert(swContent.includes('addEventListener(\'fetch\''), 'Service worker registers fetch listener');
assert(swContent.includes('addEventListener(\'sync\''), 'Service worker handles background sync');

// 3. Check Offline Fallback HTML
const offlineHtmlPath = path.join(root, 'public', 'offline.html');
assert(fs.existsSync(offlineHtmlPath), 'public/offline.html exists');
const offlineHtml = fs.readFileSync(offlineHtmlPath, 'utf8');
assert(offlineHtml.includes('Koneksi Internet Terputus'), 'Offline HTML has user-friendly title');
assert(offlineHtml.includes('Mode Luar Jaringan (Offline)'), 'Offline HTML has status badge');

// 4. Check Frontend index.html PWA tags
const indexHtmlPath = path.join(root, 'frontend', 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
assert(indexHtml.includes('rel="manifest" href="/manifest.json"'), 'frontend/index.html includes manifest link');
assert(indexHtml.includes('name="theme-color" content="#1b4332"'), 'frontend/index.html includes theme-color meta');
assert(indexHtml.includes('name="apple-mobile-web-app-capable"'), 'frontend/index.html includes iOS PWA meta');

// 5. Check OfflineStorage utility
const offlineStoragePath = path.join(root, 'frontend', 'src', 'utils', 'offlineStorage.js');
assert(fs.existsSync(offlineStoragePath), 'frontend/src/utils/offlineStorage.js exists');
const offlineStorageContent = fs.readFileSync(offlineStoragePath, 'utf8');
assert(offlineStorageContent.includes('enqueueOfflineAction'), 'offlineStorage exports enqueueOfflineAction');
assert(offlineStorageContent.includes('getPendingQueue'), 'offlineStorage exports getPendingQueue');
assert(offlineStorageContent.includes('flushOfflineQueue'), 'offlineStorage exports flushOfflineQueue');
assert(offlineStorageContent.includes('cacheData'), 'offlineStorage exports cacheData');
assert(offlineStorageContent.includes('getCachedData'), 'offlineStorage exports getCachedData');

// 6. Check UI Components
const offlineIndicatorPath = path.join(root, 'frontend', 'src', 'components', 'OfflineIndicator.jsx');
assert(fs.existsSync(offlineIndicatorPath), 'OfflineIndicator.jsx exists');

const pwaInstallPromptPath = path.join(root, 'frontend', 'src', 'components', 'PWAInstallPrompt.jsx');
assert(fs.existsSync(pwaInstallPromptPath), 'PWAInstallPrompt.jsx exists');

console.log(`\n--- SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PWA & OFFLINE-FIRST TESTS PASSED!\n');
  process.exit(0);
}

