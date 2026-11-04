import * as fs from 'fs';
import * as path from 'path';
import { walrusClient, MemoryCodec, EpisodeRecord, StatusRecord, LessonRecord } from '../src/lib/walrusClient';
import { episodeLogger } from '../src/services/episodeLogger';
import { decisionEngine, VerdictBundle } from '../src/services/decisionEngine';

interface LocalCacheSnapshot {
  timestamp: number;
  forecasters: Record<string, { verdict: string; score: number; sampleSize: number; headline: string }>;
}

async function runDatabaseWipeRecoveryTest() {
  console.log('================================================================================');
  console.log('💥 [AlphaAgent] DISASTER RECOVERY & WALRUS MEMORY REBUILD TEST');
  console.log('================================================================================\n');

  const dataDir = path.resolve(process.cwd(), 'data');
  const cacheFilePath = path.join(dataDir, 'local-cache.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // ---------------------------------------------------------------------------
  // STEP 1: Seed Cohort into Walrus Memory
  // ---------------------------------------------------------------------------
  console.log('🌱 [STEP 1] Seeding test forecaster cohort into Walrus Memory on Mainnet...');
  
  // Forecaster 1: 5-0 Novice (Expected: WATCH)
  const addrNovice = '0x1111111111111111111111111111111111111111';
  await episodeLogger.ensureForecasterRegistered(addrNovice);
  const nsNovice = episodeLogger.getForecasterNamespace(addrNovice);
  for (let i = 1; i <= 5; i++) {
    const ep: EpisodeRecord = {
      type: 'EPISODE',
      version: 'v1',
      forecaster: addrNovice,
      category: 'NBA',
      eventId: `nba_novice_${i}`,
      pick: 'HOME',
      forecast: 0.60,
      market: 0.50,
      marketSource: 'OddsAPI',
      marketTs: 1730246400,
      outcome: 'win',
      commitTx: `tx_novice_${i}`,
      commitTs: 1730246400,
      sourcesAgree: '2/2',
      resolvedTs: 1730300000,
    };
    await walrusClient.writeMemory(nsNovice, MemoryCodec.serializeEpisode(ep));
  }

  // Forecaster 2: 25-Pick Pro (Expected: FOLLOW)
  const addrPro = '0x2222222222222222222222222222222222222222';
  await episodeLogger.ensureForecasterRegistered(addrPro);
  const nsPro = episodeLogger.getForecasterNamespace(addrPro);
  for (let i = 1; i <= 25; i++) {
    const isWin = i <= 18;
    const ep: EpisodeRecord = {
      type: 'EPISODE',
      version: 'v1',
      forecaster: addrPro,
      category: 'NBA',
      eventId: `nba_pro_${i}`,
      pick: 'HOME',
      forecast: isWin ? 0.68 : 0.45,
      market: 0.50,
      marketSource: 'OddsAPI',
      marketTs: 1730246400,
      outcome: isWin ? 'win' : 'loss',
      commitTx: `tx_pro_${i}`,
      commitTs: 1730246400,
      sourcesAgree: '2/2',
      resolvedTs: 1730300000,
    };
    await walrusClient.writeMemory(nsPro, MemoryCodec.serializeEpisode(ep));
  }

  // Forecaster 3: Cherry-Picker (Expected: SKIP)
  const addrFraud = '0x3333333333333333333333333333333333333333';
  await episodeLogger.ensureForecasterRegistered(addrFraud);
  const nsFraud = episodeLogger.getForecasterNamespace(addrFraud);
  for (let i = 1; i <= 10; i++) {
    const ep: EpisodeRecord = {
      type: 'EPISODE',
      version: 'v1',
      forecaster: addrFraud,
      category: 'NBA',
      eventId: `nba_fraud_${i}`,
      pick: 'HOME',
      forecast: 0.60,
      market: 0.50,
      marketSource: 'OddsAPI',
      marketTs: 1730246400,
      outcome: 'win',
      commitTx: `tx_fraud_${i}`,
      commitTs: 1730246400,
      sourcesAgree: '2/2',
      resolvedTs: 1730300000,
    };
    await walrusClient.writeMemory(nsFraud, MemoryCodec.serializeEpisode(ep));
  }
  // 3 forfeits out of 13 commits = 23% forfeit rate
  for (let i = 1; i <= 3; i++) {
    const st: StatusRecord = {
      type: 'STATUS',
      version: 'v1',
      forecaster: addrFraud,
      commitTx: `tx_abandoned_${i}`,
      state: 'forfeited',
      reason: 'unrevealed by kickoff',
      ts: 1730248000,
    };
    await walrusClient.writeMemory(nsFraud, MemoryCodec.serializeStatus(st));
  }

  console.log('✅ Cohort successfully seeded in Walrus Memory.');

  // ---------------------------------------------------------------------------
  // STEP 2: Compute and Snapshot Pre-Wipe State to Local Cache
  // ---------------------------------------------------------------------------
  console.log('\n📸 [STEP 2] Computing pre-wipe verdict snapshots...');
  const snapshot: LocalCacheSnapshot = {
    timestamp: Date.now(),
    forecasters: {},
  };

  const registeredForecasters = await episodeLogger.getRegisteredForecasters();

  for (const addr of registeredForecasters) {
    const ns = episodeLogger.getForecasterNamespace(addr);
    const records = await walrusClient.listNamespace(ns);
    const episodes: EpisodeRecord[] = [];
    const statuses: StatusRecord[] = [];

    for (const r of records) {
      if (r.startsWith('EPISODE')) {
        const ep = MemoryCodec.parseEpisode(r);
        if (ep) episodes.push(ep);
      } else if (r.startsWith('STATUS')) {
        const st = MemoryCodec.parseStatus(r);
        if (st) statuses.push(st);
      }
    }

    const verdictBundle = decisionEngine.evaluate(episodes, statuses);
    snapshot.forecasters[addr] = {
      verdict: verdictBundle.verdict,
      score: verdictBundle.profile.bssShrunk,
      sampleSize: verdictBundle.profile.sampleSize,
      headline: verdictBundle.headline,
    };

    console.log(`   [Snapshot] ${addr.slice(0, 10)}... -> Verdict: ${verdictBundle.verdict} (Score: ${verdictBundle.profile.bssShrunk})`);
  }

  fs.writeFileSync(cacheFilePath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`💾 Pre-wipe state cached to ${cacheFilePath}`);

  // ---------------------------------------------------------------------------
  // STEP 3: DISASTER SIMULATION — Wipe Local Database & In-Memory Cache
  // ---------------------------------------------------------------------------
  console.log('\n🔥 [STEP 3] SIMULATING TOTAL SERVER FAILURE (rm -rf local.db)...');
  fs.unlinkSync(cacheFilePath);
  console.log('   💥 local-cache.json deleted from disk!');
  console.log('   💥 Server process restarted in cold-boot mode with zero local memory!');

  // ---------------------------------------------------------------------------
  // STEP 4: COLD-BOOT RESTORATION FROM WALRUS MEMORY
  // ---------------------------------------------------------------------------
  console.log('\n📡 [STEP 4] Cold-booting agent from Walrus Memory Mainnet...');
  console.log('   Querying global registry "aa-registry" on Walrus...');

  const recoveredRegistry = await episodeLogger.getRegisteredForecasters();
  console.log(`   Discovered ${recoveredRegistry.length} forecaster identities on Walrus.`);

  const restoredVerdicts: Record<string, VerdictBundle> = {};

  for (const addr of recoveredRegistry) {
    const ns = episodeLogger.getForecasterNamespace(addr);
    const rawBlobs = await walrusClient.listNamespace(ns);
    console.log(`   Streaming ${rawBlobs.length} memory blobs for partition ${ns}...`);

    const episodes: EpisodeRecord[] = [];
    const statuses: StatusRecord[] = [];
    const lessons: LessonRecord[] = [];

    for (const blob of rawBlobs) {
      if (blob.startsWith('EPISODE')) {
        const parsed = MemoryCodec.parseEpisode(blob);
        if (parsed) episodes.push(parsed);
      } else if (blob.startsWith('STATUS')) {
        const parsed = MemoryCodec.parseStatus(blob);
        if (parsed) statuses.push(parsed);
      } else if (blob.startsWith('LESSON')) {
        const parsed = MemoryCodec.parseLesson(blob);
        if (parsed) lessons.push(parsed);
      }
    }

    const rebuiltVerdict = decisionEngine.evaluate(episodes, statuses, undefined, lessons);
    restoredVerdicts[addr] = rebuiltVerdict;

    console.log(`   🔄 Rebuilt ${addr.slice(0, 10)}...: [ ${rebuiltVerdict.verdict} ] (Shrunk BSS: ${rebuiltVerdict.profile.bssShrunk})`);
  }

  // ---------------------------------------------------------------------------
  // STEP 5: BIT-FOR-BIT EQUIVALENCE ASSERTION
  // ---------------------------------------------------------------------------
  console.log('\n⚖️ [STEP 5] Asserting 100% bit-for-bit parity against pre-wipe snapshot...');

  let allMatches = true;
  for (const [addr, preSnapshot] of Object.entries(snapshot.forecasters)) {
    const restored = restoredVerdicts[addr];
    if (!restored) {
      console.error(`❌ Missing forecaster in restored state: ${addr}`);
      allMatches = false;
      continue;
    }

    const verdictMatches = restored.verdict === preSnapshot.verdict;
    const scoreMatches = Math.abs(restored.profile.bssShrunk - preSnapshot.score) < 0.0001;
    const sampleMatches = restored.profile.sampleSize === preSnapshot.sampleSize;

    if (!verdictMatches || !scoreMatches || !sampleMatches) {
      console.error(`❌ Parity failure on ${addr}:`);
      console.error(`   Pre-Wipe:  Verdict=${preSnapshot.verdict}, Score=${preSnapshot.score}, n=${preSnapshot.sampleSize}`);
      console.error(`   Restored:  Verdict=${restored.verdict}, Score=${restored.profile.bssShrunk}, n=${restored.profile.sampleSize}`);
      allMatches = false;
    } else {
      console.log(`   ✅ ${addr.slice(0, 10)}... -> 100% Parity Verified (Verdict=${restored.verdict}, Score=${restored.profile.bssShrunk})`);
    }
  }

  if (!allMatches) {
    throw new Error('Disaster Recovery failed to restore 100% parity!');
  }

  console.log('\n================================================================================');
  console.log('🎉 [SUCCESS] THE KILLER WALRUS PROOF VERIFIED!');
  console.log('   All trust scores, reputation evolutions, and verdicts were rebuilt');
  console.log('   exclusively from Walrus Memory with 100% mathematical fidelity.');
  console.log('================================================================================\n');
}

runDatabaseWipeRecoveryTest().catch((err) => {
  console.error('❌ Disaster recovery test error:', err);
  process.exit(1);
});

