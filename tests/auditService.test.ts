import { auditService } from '../src/services/auditService';
import { walrusClient, MemoryCodec, EpisodeRecord, StatusRecord } from '../src/lib/walrusClient';
import { episodeLogger } from '../src/services/episodeLogger';

async function testAuditService() {
  console.log('🧪 [Test] Verifying Completeness Audit & Reconciliation Engine...');

  const forecaster = '0xAuditTestForecasterAddress123';
  const namespace = episodeLogger.getForecasterNamespace(forecaster);

  // 1. Seed Walrus Records: 2 resolved episodes + 1 forfeit status
  const ep1: EpisodeRecord = {
    type: 'EPISODE',
    version: 'v1',
    forecaster,
    category: 'NBA',
    eventId: 'nba_lal_gsw_1',
    pick: 'LAL',
    forecast: 0.65,
    market: 0.52,
    marketSource: 'OddsAPI',
    marketTs: 1730246400,
    outcome: 'win',
    commitTx: 'tx_commit_01',
    commitTs: 1730246400,
    sourcesAgree: '2/2',
    resolvedTs: 1730300000,
  };

  const ep2: EpisodeRecord = {
    type: 'EPISODE',
    version: 'v1',
    forecaster,
    category: 'NBA',
    eventId: 'nba_bos_nyk_2',
    pick: 'BOS',
    forecast: 0.60,
    market: 0.50,
    marketSource: 'OddsAPI',
    marketTs: 1730246400,
    outcome: 'loss',
    commitTx: 'tx_commit_02',
    commitTs: 1730246400,
    sourcesAgree: '2/2',
    resolvedTs: 1730300000,
  };

  const st1: StatusRecord = {
    type: 'STATUS',
    version: 'v1',
    forecaster,
    commitTx: 'tx_commit_03',
    state: 'forfeited',
    reason: 'unrevealed by kickoff',
    ts: 1730248000,
  };

  await walrusClient.writeMemory(namespace, MemoryCodec.serializeEpisode(ep1));
  await walrusClient.writeMemory(namespace, MemoryCodec.serializeEpisode(ep2));
  await walrusClient.writeMemory(namespace, MemoryCodec.serializeStatus(st1));

  // 2. Define On-Chain Sui Commits (3 commits matching the 3 above)
  const mockSuiCommits = [
    { txDigest: 'tx_commit_01', committedAtTs: 1730246400 },
    { txDigest: 'tx_commit_02', committedAtTs: 1730246400 },
    { txDigest: 'tx_commit_03', committedAtTs: 1730248000 },
  ];

  console.log('\n📊 Reconciling 3 Sui commits against Walrus Memory...');
  const report = await auditService.reconcileForecaster(forecaster, mockSuiCommits);

  console.log(`   - Total Commits on Sui: ${report.totalCommitsOnSui}`);
  console.log(`   - Resolved Episodes: ${report.resolvedEpisodesCount}`);
  console.log(`   - Forfeited Count: ${report.forfeitedCount}`);
  console.log(`   - Completeness Rate: ${report.completenessRate}%`);
  console.log(`   - Forfeit Rate: ${report.forfeitRate}%`);
  console.log(`   - Is Fully Reconciled: ${report.isFullyReconciled}`);

  if (report.totalCommitsOnSui !== 3) {
    throw new Error(`Expected 3 commits on Sui, got: ${report.totalCommitsOnSui}`);
  }
  if (report.resolvedEpisodesCount !== 2 || report.forfeitedCount !== 1) {
    throw new Error('Reconciliation count mismatch!');
  }
  if (report.completenessRate !== 100.0 || !report.isFullyReconciled) {
    throw new Error('Expected 100% completeness rate!');
  }
  console.log('✅ Invariant verified: 3 Commits on Sui === 2 Episodes + 1 Forfeit in Walrus.');

  // 3. Test Discrepancy Detection: Add an unaccounted commit on Sui
  console.log('\n⚠️ Testing Unaccounted Commit Detection (Discrepancy)...');
  const mockWithUnaccounted = [
    ...mockSuiCommits,
    { txDigest: 'tx_commit_04_ghost', committedAtTs: 1730250000 },
  ];

  const reportDiscrepancy = await auditService.reconcileForecaster(forecaster, mockWithUnaccounted);
  console.log(`   - Unaccounted Count: ${reportDiscrepancy.unaccountedCount}`);
  console.log(`   - Completeness Rate: ${reportDiscrepancy.completenessRate}%`);
  console.log(`   - Is Fully Reconciled: ${reportDiscrepancy.isFullyReconciled}`);

  if (reportDiscrepancy.unaccountedCount !== 1 || reportDiscrepancy.isFullyReconciled) {
    throw new Error('Failed to detect unaccounted commit!');
  }
  console.log('✅ Ghost/unaccounted commit correctly flagged as DISCREPANCY.');

  console.log('\n🎉 Completeness Audit & Reconciliation Engine tests passed successfully!');
}

testAuditService().catch((err) => {
  console.error('❌ Audit service test error:', err);
  process.exit(1);
});

