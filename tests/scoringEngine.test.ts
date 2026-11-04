import { scoringEngine } from '../src/lib/scoringEngine';
import { EpisodeRecord, StatusRecord } from '../src/lib/walrusClient';

function createMockEpisode(
  id: string,
  forecast: number,
  market: number,
  outcome: 'win' | 'loss',
  category = 'NBA'
): EpisodeRecord {
  return {
    type: 'EPISODE',
    version: 'v1',
    forecaster: '0xTestForecaster',
    category,
    eventId: `event_${id}`,
    pick: 'HOME',
    forecast,
    market,
    marketSource: 'OddsAPI',
    marketTs: 1730246400,
    outcome,
    commitTx: `tx_${id}`,
    commitTs: 1730246400,
    sourcesAgree: '2/2',
    resolvedTs: 1730300000,
  };
}

async function testScoringEngine() {
  console.log('🧪 [Test] Verifying Statistical Scoring Engine (Brier & Shrinkage)...');

  // =========================================================================
  // SCENARIO 1: The 5-0 Lucky Amateur
  // 5 wins out of 5 picks. Ordinary trackers say "100% Win Rate".
  // AlphaAgent shrinks score and shows lack of evidence.
  // =========================================================================
  console.log('\n1️⃣ Scenario 1: The 5-0 Lucky Streak (Coin Flip Novice)');
  const episodes5_0: EpisodeRecord[] = [
    createMockEpisode('1', 0.60, 0.50, 'win'),
    createMockEpisode('2', 0.65, 0.52, 'win'),
    createMockEpisode('3', 0.58, 0.48, 'win'),
    createMockEpisode('4', 0.62, 0.51, 'win'),
    createMockEpisode('5', 0.59, 0.49, 'win'),
  ];

  const profile5_0 = scoringEngine.computeProfile(episodes5_0, []);

  console.log(`   - Sample Size n: ${profile5_0.sampleSize}`);
  console.log(`   - Win Rate: ${(profile5_0.winRate * 100).toFixed(1)}%`);
  console.log(`   - Raw BSS: ${profile5_0.rawBss}`);
  console.log(`   - Shrunk BSS (k=10): ${profile5_0.bssShrunk} (Shrinkage factor: 5/15 = 0.33x)`);
  console.log(`   - Market Information Depth (sum BS_mkt): ${profile5_0.sumBsMkt}`);
  console.log(`   - 80% Bootstrap Lower Bound: ${profile5_0.bootstrapLowerBound80}`);

  if (profile5_0.sampleSize !== 5 || profile5_0.winRate !== 1.0) {
    throw new Error('5-0 profile calculation error!');
  }
  // Verify shrinkage: bssShrunk should be exactly rawBss * (5 / 15)
  const expectedShrunk = parseFloat((profile5_0.rawBss * (5 / 15)).toFixed(4));
  if (Math.abs(profile5_0.bssShrunk - expectedShrunk) > 0.001) {
    throw new Error(`Shrinkage math error: expected ${expectedShrunk}, got ${profile5_0.bssShrunk}`);
  }
  console.log('   ✅ Prior shrinkage toward zero skill verified for small sample!');

  // =========================================================================
  // SCENARIO 2: The 30-Pick Consistent Master
  // 30 resolved picks, beating market baseline consistently.
  // =========================================================================
  console.log('\n2️⃣ Scenario 2: The 30-Pick Proven Pro');
  const episodes30: EpisodeRecord[] = [];
  for (let i = 0; i < 30; i++) {
    // 21 wins out of 30 picks (70% win rate against 50% coinflips with sharp probability assessments)
    const isWin = i < 21;
    episodes30.push(
      createMockEpisode(
        `pro_${i}`,
        isWin ? 0.68 : 0.45,
        0.50,
        isWin ? 'win' : 'loss'
      )
    );
  }

  const profile30 = scoringEngine.computeProfile(episodes30, []);
  console.log(`   - Sample Size n: ${profile30.sampleSize}`);
  console.log(`   - Win Rate: ${(profile30.winRate * 100).toFixed(1)}%`);
  console.log(`   - Raw BSS: ${profile30.rawBss}`);
  console.log(`   - Shrunk BSS (k=10): ${profile30.bssShrunk} (Shrinkage factor: 30/40 = 0.75x)`);
  console.log(`   - 80% Bootstrap Lower Bound: ${profile30.bootstrapLowerBound80}`);

  if (profile30.bssShrunk <= 0 || profile30.bootstrapLowerBound80 <= 0) {
    throw new Error('30-pick pro should show positive shrunk BSS and positive bootstrap lower bound!');
  }
  console.log('   ✅ 30-pick pro statistical confidence verified.');

  // =========================================================================
  // SCENARIO 3: Forecaster with Cherry-Picked / Forfeited Commits
  // 10 resolved picks, but 3 unrevealed forfeited commits (forfeit rate = 23%)
  // =========================================================================
  console.log('\n3️⃣ Scenario 3: Cherry-Picking Tipster with Forfeits');
  const statuses: StatusRecord[] = [
    { type: 'STATUS', version: 'v1', forecaster: '0xTest', commitTx: 'tx_f1', state: 'forfeited', reason: 'late', ts: 1730248000 },
    { type: 'STATUS', version: 'v1', forecaster: '0xTest', commitTx: 'tx_f2', state: 'forfeited', reason: 'unrevealed', ts: 1730248100 },
    { type: 'STATUS', version: 'v1', forecaster: '0xTest', commitTx: 'tx_f3', state: 'forfeited', reason: 'unrevealed', ts: 1730248200 },
  ];

  const profileForfeits = scoringEngine.computeProfile(episodes30.slice(0, 10), statuses);
  console.log(`   - Total Commits: ${profileForfeits.totalCommits}`);
  console.log(`   - Forfeited Count: ${profileForfeits.forfeitedCount}`);
  console.log(`   - Forfeit Rate: ${(profileForfeits.forfeitRate * 100).toFixed(1)}% (Threshold: <= 10.0%)`);

  if (profileForfeits.forfeitRate <= 0.10) {
    throw new Error('Forfeit rate should exceed 10%!');
  }
  console.log('   ✅ Forfeit accountability verified.');

  console.log('\n🎉 Statistical Scoring Engine tests passed successfully!');
}

testScoringEngine().catch((err) => {
  console.error('❌ Scoring engine test error:', err);
  process.exit(1);
});

