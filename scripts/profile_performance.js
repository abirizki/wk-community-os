/**
 * scripts/profile_performance.js
 * Performance and Memory Profiler for WK Community OS Analytics
 */

const aiEngineService = require('../src/services/ai_engine.service');
const dayaDukungService = require('../src/services/daya_dukung.service');
const analyticsRepo = require('../src/repositories/analytics.repository');

async function runBenchmark() {
  console.log('=== SPRINT 4: BACKEND PERFORMANCE & MEMORY PROFILING ===\n');

  const scope = { kelurahan: 'Kebonjati', rw: '001' };
  const mockSession = { role: 'admin_kelurahan', kelurahan: 'Kebonjati' };

  const tests = [
    {
      name: 'analyticsRepo.getDemographyStats',
      fn: () => analyticsRepo.getDemographyStats(scope)
    },
    {
      name: 'analyticsRepo.getBalitaNutritionByRT',
      fn: () => analyticsRepo.getBalitaNutritionByRT(scope)
    },
    {
      name: 'analyticsRepo.getLansiaHealthByRT',
      fn: () => analyticsRepo.getLansiaHealthByRT(scope)
    },
    {
      name: 'analyticsRepo.getBansosEquityByRT',
      fn: () => analyticsRepo.getBansosEquityByRT(scope)
    },
    {
      name: 'dayaDukungService.getComprehensiveCarryingCapacity',
      fn: () => dayaDukungService.getComprehensiveCarryingCapacity(scope)
    },
    {
      name: 'aiEngineService.getExecutiveSummary (Aggregated)',
      fn: () => aiEngineService.getExecutiveSummary(mockSession, scope)
    }
  ];

  const results = [];

  for (const test of tests) {
    // Warm up
    try { await test.fn(); } catch (e) {}

    const memBefore = process.memoryUsage().heapUsed;
    const start = performance.now();
    let data;
    try {
      data = await test.fn();
    } catch (e) {
      data = { error: e.message };
    }
    const end = performance.now();
    const memAfter = process.memoryUsage().heapUsed;

    const payloadBytes = Buffer.byteLength(JSON.stringify(data || {}));
    const durationMs = (end - start).toFixed(2);
    const memDeltaKb = ((memAfter - memBefore) / 1024).toFixed(1);

    results.push({
      Target: test.name,
      'Latency (ms)': `${durationMs} ms`,
      'Payload Size': `${(payloadBytes / 1024).toFixed(2)} KB`,
      'Heap Delta': `${memDeltaKb} KB`
    });
  }

  console.table(results);
  process.exit(0);
}

runBenchmark().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
