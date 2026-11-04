import {
  walrusClient,
  MemoryCodec,
  EpisodeRecord,
  StatusRecord,
  LessonRecord,
  VerdictRecord,
} from '../src/lib/walrusClient';

async function testWalrusClient() {
  console.log('🧪 [Test] Verifying WalrusClient serializers and memory operations...');

  // 1. Test EPISODE Serialization & Deserialization
  const testEpisode: EpisodeRecord = {
    type: 'EPISODE',
    version: 'v1',
    forecaster: '0x7b2f3491a98bc19d',
    category: 'NBA',
    eventId: 'LAL_vs_GSW_20261102',
    pick: 'LAL',
    forecast: 0.65,
    market: 0.52,
    marketSource: 'OddsAPI',
    marketTs: 1730246400,
    outcome: 'win',
    commitTx: '5XyZ8aLpQ9...',
    commitTs: 1730246400,
    sourcesAgree: '2/2',
    resolvedTs: 1730300000,
  };

  const serializedEpisode = MemoryCodec.serializeEpisode(testEpisode);
  console.log('📝 Serialized Episode:\n  ', serializedEpisode);

  const parsedEpisode = MemoryCodec.parseEpisode(serializedEpisode);
  if (!parsedEpisode || parsedEpisode.eventId !== testEpisode.eventId || parsedEpisode.forecast !== 0.65) {
    throw new Error('Episode parse mismatch!');
  }
  console.log('✅ Episode serialization & parsing verified.');

  // 2. Test STATUS Serialization & Deserialization
  const testStatus: StatusRecord = {
    type: 'STATUS',
    version: 'v1',
    forecaster: '0x7b2f3491a98bc19d',
    commitTx: '3KjM9...',
    state: 'forfeited',
    reason: 'unrevealed by kickoff',
    ts: 1730248000,
  };
  const serializedStatus = MemoryCodec.serializeStatus(testStatus);
  const parsedStatus = MemoryCodec.parseStatus(serializedStatus);
  if (!parsedStatus || parsedStatus.state !== 'forfeited') {
    throw new Error('Status parse mismatch!');
  }
  console.log('✅ Status serialization & parsing verified.');

  // 3. Test LESSON Serialization & Deserialization
  const testLesson: LessonRecord = {
    type: 'LESSON',
    version: 'v1',
    forecaster: '0x7b2f3491a98bc19d',
    category: 'NBA',
    band: 'underdog (<=40%)',
    finding: '0 of 5 underdogs won, raw BSS -0.42',
    rule: 'SKIP underdog NBA picks until n>=8 and BSS>0',
    triggerN: 10,
    ts: 1730302000,
  };
  const serializedLesson = MemoryCodec.serializeLesson(testLesson);
  const parsedLesson = MemoryCodec.parseLesson(serializedLesson);
  if (!parsedLesson || parsedLesson.triggerN !== 10) {
    throw new Error('Lesson parse mismatch!');
  }
  console.log('✅ Lesson serialization & parsing verified.');

  // 4. Test VERDICT Serialization & Deserialization
  const testVerdict: VerdictRecord = {
    type: 'VERDICT',
    version: 'v1',
    forecaster: '0x7b2f3491a98bc19d',
    stateTransition: 'WATCH -> SKIP',
    category: 'NBA',
    score: -0.1425,
    sampleN: 15,
    citedLessons: ['blob_1a2b', 'blob_3c4d'],
    ts: 1730302500,
  };
  const serializedVerdict = MemoryCodec.serializeVerdict(testVerdict);
  const parsedVerdict = MemoryCodec.parseVerdict(serializedVerdict);
  if (!parsedVerdict || parsedVerdict.stateTransition !== 'WATCH -> SKIP') {
    throw new Error('Verdict parse mismatch!');
  }
  console.log('✅ Verdict serialization & parsing verified.');

  // 5. Test Memory Write & Namespace Enumeration
  console.log('💾 Testing writeMemory & listNamespace...');
  const testNs = 'aa-f-0x7b2f';
  const blobId = await walrusClient.writeMemory(testNs, serializedEpisode);
  console.log(`   Written to Walrus Memory! Identifier: ${blobId}`);

  const records = await walrusClient.listNamespace(testNs);
  if (records.length !== 1 || records[0] !== serializedEpisode) {
    throw new Error('Namespace enumeration record count mismatch!');
  }
  console.log(`✅ Namespace enumeration verified: ${records.length} record(s) found in ${testNs}.`);

  // 6. Test Semantic Recall
  console.log('🔍 Testing semantic recall...');
  const recallHits = await walrusClient.recallMemories('LAL vs GSW prediction', 3, testNs);
  console.log(`   Recalled ${recallHits.length} hit(s).`);
  console.log('🎉 All WalrusClient tests passed successfully!');
}

testWalrusClient().catch((err) => {
  console.error('❌ WalrusClient test failure:', err);
  process.exit(1);
});

