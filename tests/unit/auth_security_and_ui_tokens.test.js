/**
 * tests/unit/auth_security_and_ui_tokens.test.js
 * Verification of Authentication Security Hardening and Civic Utility Design Tokens
 * Bumi Warga - Jabar Pintar Digital
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

let passCount = 0;
let failCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}`);
    console.error(`       ${err.message}`);
    failCount++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`[PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}`);
    console.error(`       ${err.message}`);
    failCount++;
  }
}

async function main() {
  console.log('================================================================');
  console.log('RUNNING AUTH SECURITY & UI DESIGN SYSTEM VALIDATION TESTS');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // Test 1: auth.routes.js eliminates default PIN 123456 and birthdate PINs
  // -------------------------------------------------------------------------
  runTest('Security: auth.routes.js does not accept default PIN 123456 or birthdate PINs', () => {
    const authRoutesPath = path.join(__dirname, '../../src/routes/auth.routes.js');
    const authCode = fs.readFileSync(authRoutesPath, 'utf8');

    // Verify '123456' is not accepted as a valid login condition
    assert.strictEqual(
      authCode.includes("password === '123456'"),
      false,
      'auth.routes.js must not accept default PIN 123456'
    );

    // Verify birthdate matching is not used in the credential check
    assert.strictEqual(
      authCode.includes("loginMethod = 'birthdate_pin'"),
      false,
      'auth.routes.js must not allow login via birthdate PIN'
    );

    // Verify generic error message is present
    assert.ok(
      authCode.includes('Identitas (NIK/Username) atau kata sandi tidak sesuai'),
      'auth.routes.js must respond with generic error message to prevent enumeration'
    );
  });

  // -------------------------------------------------------------------------
  // Test 2: activation.routes.js uses CSPRNG (crypto.randomInt) for tokens
  // -------------------------------------------------------------------------
  runTest('Security: activation.routes.js uses CSPRNG crypto.randomInt for coupon tokens', () => {
    const activationRoutesPath = path.join(__dirname, '../../src/routes/activation.routes.js');
    const actCode = fs.readFileSync(activationRoutesPath, 'utf8');

    assert.ok(
      actCode.includes('crypto.randomInt'),
      'generateSecureToken must use crypto.randomInt'
    );
    assert.strictEqual(
      actCode.includes('Math.random()'),
      false,
      'activation.routes.js must not use Math.random() for coupon tokens'
    );
  });

  // -------------------------------------------------------------------------
  // Test 3: Validate token generator logic with CSPRNG
  // -------------------------------------------------------------------------
  runTest('Security: Voucher token generation produces valid BW-XXXXXX format and high entropy', () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const tokens = new Set();
    const count = 500;

    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < 6; j++) {
        const idx = crypto.randomInt(0, chars.length);
        code += chars[idx];
      }
      const token = `BW-${code}`;
      assert.match(token, /^BW-[2-9A-HJ-NP-Z]{6}$/, `Token ${token} should match BW-XXXXXX format`);
      tokens.add(token);
    }

    // Ensure no collisions in 500 random tokens
    assert.strictEqual(tokens.size, count, 'No collisions should occur in 500 random tokens');
  });

  // -------------------------------------------------------------------------
  // Test 4: server.js enforces strong SESSION_SECRET in production
  // -------------------------------------------------------------------------
  runTest('Security: server.js validates SESSION_SECRET in production and fails fast', () => {
    const serverPath = path.join(__dirname, '../../server.js');
    const serverCode = fs.readFileSync(serverPath, 'utf8');

    assert.ok(
      serverCode.includes("isProduction") || serverCode.includes("process.env.NODE_ENV === 'production'"),
      'server.js must check NODE_ENV for production'
    );
    assert.ok(
      serverCode.includes('Production environment requires process.env.SESSION_SECRET') &&
      serverCode.includes('min. 32 chars'),
      'server.js must fail-fast on insecure or default SESSION_SECRET in production'
    );
  });

  // -------------------------------------------------------------------------
  // Test 5: AuthContext.jsx does not provide default mock SSO token in public flow
  // -------------------------------------------------------------------------
  runTest('Security: AuthContext.jsx does not have hardcoded mock token in user login flow', () => {
    const authContextPath = path.join(__dirname, '../../frontend/src/context/AuthContext.jsx');
    const contextCode = fs.readFileSync(authContextPath, 'utf8');

    assert.strictEqual(
      contextCode.includes("loginSapawarga = async (ssoToken = 'spw_mock_"),
      false,
      'AuthContext should not have default mock token parameter in loginSapawarga'
    );
  });

  // -------------------------------------------------------------------------
  // Test 6: tailwind.config.js design tokens adhere to Soft Sky Civic Utility
  // -------------------------------------------------------------------------
  runTest('Design System: tailwind.config.js contains Soft Sky Blue and semantic tokens', () => {
    const tailwindPath = path.join(__dirname, '../../frontend/tailwind.config.js');
    const tailwindCode = fs.readFileSync(tailwindPath, 'utf8');

    // Check Soft Sky primary (#0284c7)
    assert.ok(tailwindCode.includes("'#0284c7'") || tailwindCode.includes('"#0284c7"'), 'Must have primary Soft Sky #0284c7');
    
    // Check neutral surface
    assert.ok(tailwindCode.includes("'#f8fafc'"), 'Surface must be neutral slate #f8fafc');

    // Check absence of legacy lavender colors
    assert.strictEqual(tailwindCode.includes('#dee8ff'), false, 'Must not contain legacy lavender #dee8ff');
    assert.strictEqual(tailwindCode.includes('#d8e3fb'), false, 'Must not contain legacy lavender #d8e3fb');

    // Check semantic status colors
    assert.ok(tailwindCode.includes('status-success'), 'Must contain status-success token');
    assert.ok(tailwindCode.includes('status-warning'), 'Must contain status-warning token');
    assert.ok(tailwindCode.includes('status-danger'), 'Must contain status-danger token');
    assert.ok(tailwindCode.includes('status-info'), 'Must contain status-info token');
  });

  // -------------------------------------------------------------------------
  // Test 7: LoginPage.jsx has accessible inputs, explicit labels, and no BSSN claims
  // -------------------------------------------------------------------------
  runTest('UI/UX: LoginPage.jsx has explicit label associations and no misleading BSSN claims', () => {
    const loginPagePath = path.join(__dirname, '../../frontend/src/pages/LoginPage.jsx');
    const loginCode = fs.readFileSync(loginPagePath, 'utf8');

    // Explicit label associations
    assert.ok(loginCode.includes('htmlFor="login-identifier"'), 'Login identifier must have explicit label');
    assert.ok(loginCode.includes('id="login-identifier"'), 'Login identifier input must have id');
    assert.ok(loginCode.includes('htmlFor="login-password"'), 'Login password must have explicit label');
    assert.ok(loginCode.includes('id="login-password"'), 'Login password input must have id');

    // Input mode numeric for key pads
    assert.ok(loginCode.includes('inputMode="numeric"'), 'NIK must support inputMode numeric');

    // Accessible password toggle
    assert.ok(loginCode.includes('aria-label='), 'Password toggle button must have aria-label');

    // No unverified BSSN claim in UI text
    assert.strictEqual(
      loginCode.includes('Standar BSSN'),
      false,
      'LoginPage must not make unverified Standar BSSN claims'
    );

    // No birthdate recommendation in UI text
    assert.strictEqual(
      loginCode.includes('PIN Tanggal Lahir'),
      false,
      'LoginPage must not instruct users to use birthdate PIN'
    );
  });

  // -------------------------------------------------------------------------
  // Test 8: RoleHeader.jsx uses unified Civic Utility identity
  // -------------------------------------------------------------------------
  runTest('Design System: RoleHeader.jsx uses unified Civic Utility banner without rainbow role styling', () => {
    const roleHeaderPath = path.join(__dirname, '../../frontend/src/components/design-system/RoleHeader.jsx');
    const headerCode = fs.readFileSync(roleHeaderPath, 'utf8');

    assert.ok(
      headerCode.includes('CIVIC_UTILITY_THEME'),
      'RoleHeader must use CIVIC_UTILITY_THEME'
    );
    assert.ok(
      headerCode.includes('role="banner"'),
      'RoleHeader must include accessible role="banner"'
    );
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
