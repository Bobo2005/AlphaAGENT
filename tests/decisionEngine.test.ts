import { decisionEngine } from '../src/services/decisionEngine';
import { EpisodeRecord, StatusRecord, LessonRecord } from '../src/lib/walrusClient';

function createEpisode(
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

async function testDecisionEngine() {
  console.log('🧪 [Test] Verifying Decision Engine & The 5-0 Refusal Logic...');

  // =========================================================================
  // TEST 1: The Signature 5-0 Lucky Streak Refusal
  // =========================================================================
  console.log('\n1️⃣ Test 1: The 5-0 Lucky Novice Refusal (WATCH)');
  const episodes5_0: EpisodeRecord[] = [
    createEpisode('1', 0.60, 0.50, 'win'),
    createEpisode('2', 0.65, 0.52, 'win'),
    createEpisode('3', 0.58, 0.48, 'win'),
    createEpisode('4', 0.62, 0.51, 'win'),
    createEpisode('5', 0.59, 0.49, 'win'),
  ];

  const verdict5_0 = decisionEngine.evaluate(episodes5_0, []);
  console.log(`   - Stated Record: 5-0 (100% Win Rate)`);
  console.log(`   - Verdict: [ ${verdict5_0.verdict} ]`);
  console.log(`   - Headline: "${verdict5_0.headline}"`);
  console.log(`   - Missing Criteria:`, verdict5_0.missingCriteria);

  if (verdict5_0.verdict !== 'WATCH') {
    throw new Error(`Expected WATCH for 5-0 record, got: ${verdict5_0.verdict}`);
  }
  if (!verdict5_0.headline.includes('5-0 REFUSAL')) {
    throw new Error(`Expected 5-0 REFUSAL headline, got: ${verdict5_0.headline}`);
  }
  const hasSampleMissing = verdict5_0.missingCriteria.some((c) => c.includes('Needs 10 more resolved picks'));
  if (!hasSampleMissing) {
    throw new Error('Missing criteria must indicate 10 more picks needed!');
  }
  console.log('   ✅ 5-0 Refusal verified: Agent strictly said NO with explicit mathematical rationale.');

  // =========================================================================
  // TEST 2: The 30-Pick Verified Master (FOLLOW)
  // =========================================================================
  console.log('\n2️⃣ Test 2: The 30-Pick Proven Pro (FOLLOW)');
  const episodes30: EpisodeRecord[] = [];
  for (let i = 0; i < 30; i++) {
    const isWin = i < 22; // 22 of 30 wins
    episodes30.push(createEpisode(`pro_${i}`, isWin ? 0.68 : 0.45, 0.50, isWin ? 'win' : 'loss', 'NBA'));
  }

  const verdict30 = decisionEngine.evaluate(episodes30, [], 'NBA');
  console.log(`   - Stated Record: 22-8 (73.3% Win Rate across 30 picks)`);
  console.log(`   - Verdict: [ ${verdict30.verdict} ]`);
  console.log(`   - Shrunk BSS: ${verdict30.profile.bssShrunk}`);
  console.log(`   - All Gates Passed: ${verdict30.gates.every((g) => g.passed)}`);

  if (verdict30.verdict !== 'FOLLOW') {
    throw new Error(`Expected FOLLOW for 30-pick pro, got: ${verdict30.verdict}`);
  }
  console.log('   ✅ FOLLOW verdict verified for mathematically proven edge.');

  // =========================================================================
  // TEST 3: Cherry-Picking Fraud with Forfeits (SKIP)
  // =========================================================================
  console.log('\n3️⃣ Test 3: Cherry-Picking Tipster with Abandoned Commits (SKIP)');
  const statuses: StatusRecord[] = [
    { type: 'STATUS', version: 'v1', forecaster: '0xTest', commitTx: 'tx_f1', state: 'forfeited', reason: 'late', ts: 1730248000 },
    { type: 'STATUS', version: 'v1', forecaster: '0xTest', commitTx: 'tx_f2', state: 'forfeited', reason: 'unrevealed', ts: 1730248100 },
    { type: 'STATUS', version: 'v1', forecaster: '0xTest', commitTx: 'tx_f3', state: 'forfeited', reason: 'unrevealed', ts: 1730248200 },
  ];

  const verdictFraud = decisionEngine.evaluate(episodes30.slice(0, 15), statuses);
  console.log(`   - Commits: 18 (15 resolved, 3 forfeited = 16.7% forfeit rate)`);
  console.log(`   - Verdict: [ ${verdictFraud.verdict} ]`);
  console.log(`   - Headline: "${verdictFraud.headline}"`);

  if (verdictFraud.verdict !== 'SKIP') {
    throw new Error(`Expected SKIP for cherry-picker, got: ${verdictFraud.verdict}`);
  }
  console.log('   ✅ Fraud gate verified: High forfeit rate triggers immediate SKIP.');

  // =========================================================================
  // TEST 4: Walrus Memory LESSON Behavioral Override (SKIP)
  // =========================================================================
  console.log('\n4️⃣ Test 4: Walrus Memory LESSON Dynamic Override');
  const activeLessons: LessonRecord[] = [
    {
      type: 'LESSON',
      version: 'v1',
      forecaster: '0xTestForecaster',
      category: 'NBA',
      band: 'underdog (<=40%)',
      finding: '0 of 5 underdogs won, raw BSS -0.42',
      rule: 'SKIP underdog NBA picks until n>=8 and BSS>0',
      triggerN: 10,
      ts: 1730302000,
    },
  ];

  const verdictLessonOverride = decisionEngine.evaluate(episodes30, [], 'NBA', activeLessons);
  console.log(`   - Pro Record Overridden by Lesson: [ ${verdictLessonOverride.verdict} ]`);
  console.log(`   - Active Lesson Rule: "${verdictLessonOverride.activeLessonRule}"`);

  if (verdictLessonOverride.verdict !== 'SKIP' || !verdictLessonOverride.activeLessonRule) {
    throw new Error('Active memory lesson failed to override verdict to SKIP!');
  }
  console.log('   ✅ Memory that visibly matters verified: Lesson rule dynamically altered verdict.');

  console.log('\n🎉 Decision Engine tests passed successfully!');
}

testDecisionEngine().catch((err) => {
  console.error('❌ Decision engine test failure:', err);
  process.exit(1);
});

