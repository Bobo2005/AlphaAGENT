import { episodeLogger } from '../src/services/episodeLogger';
import { walrusClient, MemoryCodec } from '../src/lib/walrusClient';
import { PendingPick } from '../src/services/revealService';
import { ResolutionResult } from '../src/lib/resolutionEngine';

async function testEpisodeLogger() {
  console.log('🧪 [Test] Verifying Walrus Memory Episode & Status Logger...');

  const forecaster = '0x7b2f3491a98bc19da082';
  const expectedNamespace = episodeLogger.getForecasterNamespace(forecaster);
  console.log(`📌 Forecaster Partition: ${expectedNamespace}`);

  // 1. Mock Pending Pick
  const mockPick: PendingPick = {
    id: 'pick_test_123',
    forecaster,
    category: 'NBA',
    eventId: 'nba_lal_gsw_20261102',
    side: 'LAL',
    probability: 0.65,
    salt: 'salt123',
    commitTxDigest: '5XyZ8aLpQ9mNk4Jr7bVw2c1d3f',
    commitTs: 1730246400,
    revealTs: 1730246430,
    marketBaselineProb: 0.52,
    marketSource: 'The Odds API',
    status: 'PENDING',
  };

  // 2. Mock Resolution Result
  const mockResolution: ResolutionResult = {
    eventId: 'nba_lal_gsw_20261102',
    pickedSide: 'LAL',
    status: 'RESOLVED',
    winningSide: 'LAL',
    outcome: 'win',
    source1: { sourceName: 'OddsAPI', completed: true, winner: 'LAL', timestamp: 1730300000 },
    source2: { sourceName: 'Polymarket', completed: true, winner: 'LAL', timestamp: 1730300000 },
    agreementRatio: '2/2',
    resolvedAt: 1730300000,
  };

  // 3. Test logResolvedPick
  console.log('💾 Testing logResolvedPick (EPISODE write)...');
  const episodeResult = await episodeLogger.logResolvedPick(mockPick, mockResolution);

  if (!episodeResult.blobId) {
    throw new Error('Episode logging did not return a valid blob ID!');
  }
  console.log(`   ✅ Episode written to ${episodeResult.namespace} with Blob ID: ${episodeResult.blobId}`);

  // 4. Test logForfeitedCommit
  console.log('⚠️ Testing logForfeitedCommit (STATUS write)...');
  const statusResult = await episodeLogger.logForfeitedCommit(
    forecaster,
    '3KjM9aBcDeFgHiJkLmNoPqRsTuVw',
    'never revealed by kickoff'
  );

  if (!statusResult.blobId) {
    throw new Error('Status logging did not return a valid blob ID!');
  }
  console.log(`   ✅ Status written to ${statusResult.namespace} with Blob ID: ${statusResult.blobId}`);

  // 5. Verify records in Walrus Memory
  console.log('🔍 Enumerating partition from Walrus Memory...');
  const partitionRecords = await walrusClient.listNamespace(expectedNamespace);
  console.log(`   Found ${partitionRecords.length} record(s) in ${expectedNamespace}:`);
  partitionRecords.forEach((r, idx) => console.log(`   [${idx + 1}] ${r.slice(0, 70)}...`));

  if (partitionRecords.length < 2) {
    throw new Error(`Expected at least 2 records in ${expectedNamespace}, found: ${partitionRecords.length}`);
  }

  // 6. Verify Registry
  const registered = await episodeLogger.getRegisteredForecasters();
  console.log(`   Registered forecasters count: ${registered.length}`);
  if (!registered.includes(forecaster.toLowerCase())) {
    throw new Error(`Forecaster ${forecaster} not found in aa-registry!`);
  }
  console.log('✅ Forecaster discovered in global aa-registry.');

  console.log('🎉 Episode & Status Logger tests passed successfully!');
}

testEpisodeLogger().catch((err) => {
  console.error('❌ Episode logger test error:', err);
  process.exit(1);
});

