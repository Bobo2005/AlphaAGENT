import { KellyCalculator } from '../src/lib/kellyCalculator';

function runKellyTests() {
  console.log('🧪 [Test] Verifying Fractional Kelly Criterion Calculator...');

  // Test 1: Positive Edge with Quarter Kelly
  // Bankroll: 100 SUI, Forecast: 65% (0.65), Market: 50% (0.50, Decimal Odds: 2.0)
  // Full Kelly: f* = (b*p - q)/b = (1 * 0.65 - 0.35) / 1 = 0.30 (30%)
  // Quarter Kelly: 0.30 * 0.25 = 0.075 (7.5%)
  // Max Cap: 2.5% (0.025) -> Capped to 2.5% = 2.5 SUI
  const res1 = KellyCalculator.calculate({
    bankrollSui: 100,
    forecastProb: 0.65,
    marketProb: 0.50,
    fractionalMultiplier: 0.25,
    maxBetPct: 0.025,
    minEdge: 0.015,
  });

  console.log('Test 1 - Positive Edge with Safety Cap:');
  console.log(`  Should bet: ${res1.shouldBet}`);
  console.log(`  Stake SUI: ${res1.stakeSui} SUI (${res1.stakePct}%)`);
  console.log(`  Edge: +${(res1.edge * 100).toFixed(1)}%`);
  console.log(`  Full Kelly: ${(res1.fullKellyFraction * 100).toFixed(1)}%`);
  if (res1.shouldBet && res1.stakeSui === 2.5 && res1.stakePct === 2.5) {
    console.log('  ✅ Test 1 Passed: Correctly applied Quarter Kelly and 2.5% max safety cap.');
  } else {
    throw new Error(`Test 1 Failed: Expected 2.5 SUI stake, got ${res1.stakeSui}`);
  }

  // Test 2: Uncapped Quarter Kelly (Small edge within cap)
  // Bankroll: 100 SUI, Forecast: 53% (0.53), Market: 50% (0.50, Odds: 2.0)
  // Full Kelly: f* = (1 * 0.53 - 0.47) / 1 = 0.06 (6.0%)
  // Quarter Kelly: 0.06 * 0.25 = 0.015 (1.5%) -> 1.5 SUI (under 2.5% cap)
  const res2 = KellyCalculator.calculate({
    bankrollSui: 100,
    forecastProb: 0.53,
    marketProb: 0.50,
    fractionalMultiplier: 0.25,
    maxBetPct: 0.05,
    minEdge: 0.02,
  });

  console.log('\nTest 2 - Uncapped Quarter Kelly:');
  console.log(`  Stake SUI: ${res2.stakeSui} SUI (${res2.stakePct}%)`);
  if (res2.shouldBet && res2.stakeSui === 1.5 && res2.stakePct === 1.5) {
    console.log('  ✅ Test 2 Passed: Exact mathematical stake computed.');
  } else {
    throw new Error(`Test 2 Failed: Expected 1.5 SUI stake, got ${res2.stakeSui}`);
  }

  // Test 3: Negative Edge (Forecaster worse than market)
  // Forecast: 45%, Market: 50% -> Edge: -5%
  const res3 = KellyCalculator.calculate({
    bankrollSui: 100,
    forecastProb: 0.45,
    marketProb: 0.50,
  });

  console.log('\nTest 3 - Negative Edge Rejection:');
  console.log(`  Should bet: ${res3.shouldBet} (${res3.reason})`);
  if (!res3.shouldBet && res3.stakeSui === 0) {
    console.log('  ✅ Test 3 Passed: Rejected position with negative expected value.');
  } else {
    throw new Error('Test 3 Failed: Should not bet with negative edge');
  }

  // Test 4: Insufficient Edge Gate (Below minEdge 1.5%)
  // Forecast: 51%, Market: 50% -> Edge: 1% (< 1.5%)
  const res4 = KellyCalculator.calculate({
    bankrollSui: 100,
    forecastProb: 0.51,
    marketProb: 0.50,
    minEdge: 0.015,
  });

  console.log('\nTest 4 - Insufficient Edge Gate:');
  console.log(`  Should bet: ${res4.shouldBet} (${res4.reason})`);
  if (!res4.shouldBet) {
    console.log('  ✅ Test 4 Passed: Insufficient edge properly rejected.');
  } else {
    throw new Error('Test 4 Failed: Should reject edge below minimum threshold');
  }

  console.log('\n🎉 All Kelly Calculator tests passed with 100% mathematical precision!');
}

runKellyTests();

