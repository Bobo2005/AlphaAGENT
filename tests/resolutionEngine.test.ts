import { resolutionEngine, SourceReport } from '../src/lib/resolutionEngine';

async function testResolutionEngine() {
  console.log('🧪 [Test] Verifying Two-Source Resolution Engine...');

  // 1. Test Consensus: Both sources agree on LAL -> Pick was LAL (Win)
  console.log('1️⃣ Testing unanimous consensus (Win)...');
  const resWin = await resolutionEngine.resolveEvent('nba_lal_gsw_20261102', 'LAL');
  if (resWin.status !== 'RESOLVED' || resWin.outcome !== 'win' || resWin.agreementRatio !== '2/2') {
    throw new Error(`Expected RESOLVED (win) with 2/2 agreement, got: ${JSON.stringify(resWin)}`);
  }
  console.log(`   ✅ Status: ${resWin.status}, Outcome: ${resWin.outcome}, Agreement: ${resWin.agreementRatio}`);

  // 2. Test Consensus: Both sources agree on LAL -> Pick was GSW (Loss)
  console.log('2️⃣ Testing unanimous consensus (Loss)...');
  const resLoss = await resolutionEngine.resolveEvent('nba_lal_gsw_20261102', 'GSW');
  if (resLoss.status !== 'RESOLVED' || resLoss.outcome !== 'loss' || resLoss.agreementRatio !== '2/2') {
    throw new Error(`Expected RESOLVED (loss) with 2/2 agreement, got: ${JSON.stringify(resLoss)}`);
  }
  console.log(`   ✅ Status: ${resLoss.status}, Outcome: ${resLoss.outcome}, Agreement: ${resLoss.agreementRatio}`);

  // 3. Test Discrepancy: Source 1 says LAL, Source 2 says GSW -> DISPUTED
  console.log('3️⃣ Testing source discrepancy (DISPUTED)...');
  const mockS1: SourceReport = {
    sourceName: 'Primary Sports DB',
    completed: true,
    winner: 'LAL',
    homeScore: 110,
    awayScore: 108,
    timestamp: 1730300000,
  };
  const mockS2: SourceReport = {
    sourceName: 'Secondary Oracle',
    completed: true,
    winner: 'GSW',
    homeScore: 108,
    awayScore: 110,
    timestamp: 1730300000,
  };

  const resDispute = await resolutionEngine.resolveEvent('disputed_game_1', 'LAL', {
    source1: mockS1,
    source2: mockS2,
  });

  if (resDispute.status !== 'DISPUTED' || resDispute.agreementRatio !== '1/2') {
    throw new Error(`Expected DISPUTED with 1/2 agreement, got: ${JSON.stringify(resDispute)}`);
  }
  console.log(`   ✅ Status: ${resDispute.status}, Agreement: ${resDispute.agreementRatio}, Reason: "${resDispute.reason}"`);

  // 4. Test Postponed / Canceled Game -> VOIDED
  console.log('4️⃣ Testing postponed game (VOIDED)...');
  const mockPostponed: SourceReport = {
    sourceName: 'Official League Feed',
    completed: false,
    postponed: true,
    timestamp: 1730300000,
  };

  const resVoid = await resolutionEngine.resolveEvent('postponed_game_1', 'LAL', {
    source1: mockPostponed,
    source2: mockS2,
  });

  if (resVoid.status !== 'VOIDED') {
    throw new Error(`Expected VOIDED, got: ${JSON.stringify(resVoid)}`);
  }
  console.log(`   ✅ Status: ${resVoid.status}, Reason: "${resVoid.reason}"`);

  console.log('🎉 Two-Source Resolution Engine tests passed successfully!');
}

testResolutionEngine().catch((err) => {
  console.error('❌ Resolution engine test failure:', err);
  process.exit(1);
});

