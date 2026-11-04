import { oddsEngine } from '../src/lib/oddsEngine';

async function testOddsEngine() {
  console.log('🧪 [Test] Verifying OddsEngine de-vigging math and baseline capture...');

  // 1. Test proportional de-vigging with typical market odds
  // Odds: 1.75 vs 2.15 (Overround: (1/1.75 + 1/2.15) = 0.5714 + 0.4651 = 1.0365 -> 3.65% vig)
  const homeOdds = 1.75;
  const awayOdds = 2.15;
  const result = oddsEngine.devig(homeOdds, awayOdds, 'game_1', 'LAL', 'GSW', 'DraftKings');

  console.log(`📊 Odds: ${homeOdds} vs ${awayOdds}`);
  console.log(`   - Home Prob (m_A): ${(result.homeProb * 100).toFixed(2)}%`);
  console.log(`   - Away Prob (m_B): ${(result.awayProb * 100).toFixed(2)}%`);
  console.log(`   - Vig Margin: ${result.vigPercentage}%`);

  const sumProbs = parseFloat((result.homeProb + result.awayProb).toFixed(4));
  if (sumProbs !== 1.0) {
    throw new Error(`De-vigged probabilities sum must be exactly 1.0000, got: ${sumProbs}`);
  }
  console.log('✅ Mathematical property verified: m_A + m_B === 1.0000');

  // 2. Test Baseline Odds Capture & Retrieval
  console.log('💾 Testing captureBaseline and getBaseline...');
  const captured = oddsEngine.captureBaseline('nba_lal_gsw_2026', 'LAL', 'GSW', 1.8, 2.05, 'The Odds API');
  const retrieved = oddsEngine.getBaseline('nba_lal_gsw_2026');

  if (!retrieved || retrieved.homeProb !== captured.homeProb) {
    throw new Error('Baseline retrieval mismatch!');
  }
  console.log(`✅ Baseline successfully stored and retrieved for ${retrieved.eventId} (Source: ${retrieved.source}).`);

  // 3. Test Fixture Ingestion (NBA & NFL)
  console.log('🏀 Testing fetchLiveOdds for NBA...');
  const nbaFixtures = await oddsEngine.fetchLiveOdds('nba');
  console.log(`   Ingested ${nbaFixtures.length} NBA fixture(s). First match: ${nbaFixtures[0]?.homeTeam} vs ${nbaFixtures[0]?.awayTeam}`);

  console.log('🏈 Testing fetchLiveOdds for NFL...');
  const nflFixtures = await oddsEngine.fetchLiveOdds('nfl');
  console.log(`   Ingested ${nflFixtures.length} NFL fixture(s). First match: ${nflFixtures[0]?.homeTeam} vs ${nflFixtures[0]?.awayTeam}`);

  if (nbaFixtures.length === 0 || nflFixtures.length === 0) {
    throw new Error('Fixture ingestion returned empty list!');
  }

  console.log('🎉 OddsEngine unit tests passed successfully!');
}

testOddsEngine().catch((err) => {
  console.error('❌ OddsEngine test error:', err);
  process.exit(1);
});

