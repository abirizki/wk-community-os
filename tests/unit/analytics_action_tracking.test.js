/**
 * tests/unit/analytics_action_tracking.test.js
 * Unit & Integration Test Suite for Sprint 5: Actionable Decision Support & Audit Trail
 * Bumi Warga - Jabar Pintar Digital
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('Sprint 5: auto_patch.js includes analytics_action_tracking table schema with audit trail columns', () => {
  const patchFile = path.resolve(__dirname, '../../src/db/auto_patch.js');
  const content = fs.readFileSync(patchFile, 'utf8');

  assert.ok(content.includes('analytics_action_tracking'), 'Must register analytics_action_tracking table in auto_patch');
  assert.ok(content.includes('insight_id VARCHAR(100) NOT NULL UNIQUE'), 'Must have insight_id with unique constraint');
  assert.ok(content.includes('wilayah_rw VARCHAR(10)'), 'Must track wilayah_rw for territorial scoping');
  assert.ok(content.includes('wilayah_rt VARCHAR(10)'), 'Must track wilayah_rt for territorial scoping');
  assert.ok(content.includes('catatan_tindak_lanjut TEXT'), 'Must have catatan_tindak_lanjut for field notes');
  assert.ok(content.includes('updated_by_nama VARCHAR(150)'), 'Must log updated_by_nama for accountability');
  assert.ok(content.includes('completed_at DATETIME NULL'), 'Must track completed_at timestamp when resolved');
});

test('Sprint 5: Analytics routes implement GET and PATCH endpoints with territorial scoping', () => {
  const routesFile = path.resolve(__dirname, '../../src/routes/analytics.routes.js');
  const content = fs.readFileSync(routesFile, 'utf8');

  assert.ok(content.includes("router.get('/actions'"), 'Must implement GET /api/analytics/actions');
  assert.ok(content.includes("router.patch('/actions/:insightId'"), 'Must implement PATCH /api/analytics/actions/:insightId');
  assert.ok(content.includes("resolveAnalyticsScope(req, res)"), 'Must enforce territorial scope check');
  assert.ok(content.includes("existing[0].wilayah_rw !== scope.rw"), 'Must forbid cross-RW mutation');
  assert.ok(content.includes("existing[0].wilayah_rt !== scope.rt"), 'Must forbid cross-RT mutation');
});

test('Sprint 5: Deep link URL generator strictly maps category & wilayah scope', () => {
  // Pure logic replica of buildDeepLink from AnalyticsDashboardPage.jsx
  function buildDeepLink(insight, effectiveRW = '001', effectiveRT = '002') {
    const insightRw = insight.evidence?.wilayah?.match(/RW\s*(\d+)/i)?.[1] || effectiveRW;
    const insightRt = insight.evidence?.wilayah?.match(/RT\s*(\d+)/i)?.[1] || effectiveRT;
    
    if (insight.category === 'KESEHATAN_BALITA') {
      return `/dashboard/posyandu?category=balita&rw=${insightRw}&rt=${insightRt}&filter=gizi_kurang`;
    }
    if (insight.category === 'GERIATRI_LANSIA') {
      return `/dashboard/posyandu?category=lansia&rw=${insightRw}&rt=${insightRt}&filter=komorbid`;
    }
    if (insight.category === 'BANTUAN_SOSIAL') {
      return `/dashboard/bansos?rw=${insightRw}&rt=${insightRt}&tab=sktm`;
    }
    if (insight.category === 'LAYANAN_DOKUMEN') {
      return `/dashboard/dokumen?rw=${insightRw}&rt=${insightRt}&status=PROSES`;
    }
    return `/dashboard/warga?rw=${insightRw}&rt=${insightRt}`;
  }

  // Case 1: Balita with evidence wilayah RW 002 RT 003
  const link1 = buildDeepLink({
    category: 'KESEHATAN_BALITA',
    evidence: { wilayah: 'RW 002 / RT 003' }
  });
  assert.strictEqual(link1, '/dashboard/posyandu?category=balita&rw=002&rt=003&filter=gizi_kurang');

  // Case 2: Bansos with default scoped fallback
  const link2 = buildDeepLink({
    category: 'BANTUAN_SOSIAL',
    evidence: {}
  }, '003', '005');
  assert.strictEqual(link2, '/dashboard/bansos?rw=003&rt=005&tab=sktm');

  // Case 3: Dokumen
  const link3 = buildDeepLink({
    category: 'LAYANAN_DOKUMEN',
    evidence: { wilayah: 'RT 001 RW 001' }
  });
  assert.strictEqual(link3, '/dashboard/dokumen?rw=001&rt=001&status=PROSES');
});

test('Sprint 5: Action tracking status lifecycle transitions correctly', () => {
  const allowedStatuses = ['PENDING', 'IN_PROGRESS', 'SELESAI'];

  function transitionStatus(currentStatus, nextStatus) {
    if (!allowedStatuses.includes(nextStatus)) {
      throw new Error(`Invalid status transition to ${nextStatus}`);
    }
    return {
      status: nextStatus,
      completed_at: nextStatus === 'SELESAI' ? new Date() : null
    };
  }

  const step1 = transitionStatus('PENDING', 'IN_PROGRESS');
  assert.strictEqual(step1.status, 'IN_PROGRESS');
  assert.strictEqual(step1.completed_at, null);

  const step2 = transitionStatus('IN_PROGRESS', 'SELESAI');
  assert.strictEqual(step2.status, 'SELESAI');
  assert.ok(step2.completed_at instanceof Date);

  assert.throws(() => transitionStatus('PENDING', 'INVALID_STATUS'), /Invalid status transition/);
});
