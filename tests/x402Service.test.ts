import { x402Service } from '../src/services/x402Service';
import { walrusClient, MemoryCodec, EpisodeRecord } from '../src/lib/walrusClient';
import { episodeLogger } from '../src/services/episodeLogger';

async function testX402Service() {
  console.log('🧪 [Test] Verifying x402 Micropayment Protocol & Paid Verdict Engine...');

  const forecaster = '0xX402TargetForecasterAddress99';
  const category = 'NBA';
  const namespace = episodeLogger.getForecasterNamespace(forecaster);

  // 1. Seed some episodes in Walrus Memory for this forecaster
  const ep: EpisodeRecord = {
    type: 'EPISODE',
    version: 'v1',
    forecaster,
    category,
    eventId: 'nba_finals_game1',
    pick: 'HOME',
    forecast: 0.65,
    market: 0.50,
    marketSource: 'OddsAPI',
    marketTs: 1730246400,
    outcome: 'win',
    commitTx: 'tx_sui_commit_abc123',
    commitTs: 1730246400,
    sourcesAgree: '2/2',
    resolvedTs: 1730300000,
  };
  await walrusClient.writeMemory(namespace, MemoryCodec.serializeEpisode(ep));

  // 2. Test Unpaid Query -> HTTP 402 Challenge Creation
  console.log('\n1️⃣ Testing HTTP 402 Challenge Generation...');
  const invoice = x402Service.createInvoice(forecaster, category);

  console.log(`   - Status Code: ${invoice.status} (Payment Required)`);
  console.log(`   - Treasury Address: ${invoice.recipientTreasuryAddress}`);
  console.log(`   - Price: ${invoice.amountSui} SUI (${invoice.amountMist} MIST)`);
  console.log(`   - Invoice Nonce: ${invoice.nonce}`);

  if (invoice.status !== 402 || !invoice.nonce.startsWith('inv_')) {
    throw new Error('402 Challenge generation failed!');
  }
  console.log('✅ HTTP 402 challenge verified.');

  // 3. Test Payment Verification with Mock Sui Transaction
  console.log('\n2️⃣ Testing Payment Settlement & Verification...');
  const mockTxDigest = 'mock_tx_sui_payment_digest_7788';
  const verification = await x402Service.verifyPayment(mockTxDigest, invoice.nonce);

  if (!verification.verified) {
    throw new Error(`Payment verification failed: ${verification.reason}`);
  }
  console.log(`   ✅ Payment verified for digest: ${mockTxDigest}`);

  // 4. Test Replay Protection
  console.log('\n3️⃣ Testing Replay Attack Protection...');
  const replayAttempt = await x402Service.verifyPayment(mockTxDigest, invoice.nonce);
  if (replayAttempt.verified) {
    throw new Error('Replay attack vulnerability: payment digest was accepted twice!');
  }
  console.log(`   ✅ Replay correctly rejected: "${replayAttempt.reason}"`);

  // 5. Test Release of Paid Verdict Bundle
  console.log('\n4️⃣ Testing Paid Verdict Payload & Cryptographic Attestation...');
  const paidBundle = await x402Service.generatePaidVerdict(forecaster, category, mockTxDigest, invoice.nonce);

  console.log(`   - Verdict Released: [ ${paidBundle.verdict.verdict} ]`);
  console.log(`   - Cryptographic Signer: ${paidBundle.cryptographicAttestation.signer}`);
  console.log(`   - Attestation Signature: ${paidBundle.cryptographicAttestation.signatureHex.slice(0, 24)}...`);
  console.log(`   - Cited Sui Commits:`, paidBundle.suiCommitDigests);
  console.log(`   - Cited Walrus Memory Blobs:`, paidBundle.walrusMemoryBlobs);

  if (!paidBundle.cryptographicAttestation.signatureHex || paidBundle.suiCommitDigests.length === 0) {
    throw new Error('Invalid paid verdict payload!');
  }
  console.log('✅ Full cryptographic verdict bundle generated.');

  console.log('\n🎉 x402 Micropayment Protocol tests passed successfully!');
}

testX402Service().catch((err) => {
  console.error('❌ x402 service test error:', err);
  process.exit(1);
});

