import { judgeModeService } from '../src/services/judgeModeService';

async function testJudgeMode() {
  console.log('🧪 [Test] Verifying Judge Mode (Zero-Friction 1-Click Access)...');

  const start = Date.now();
  const session = await judgeModeService.provisionGuestWallet();
  const duration = Date.now() - start;

  console.log(`⏱️ Guest wallet provisioned in ${duration}ms (Threshold: < 300ms)`);
  console.log(`   - Address: ${session.address}`);
  console.log(`   - Balance: ${session.balanceSui} SUI (${session.balanceMist} MIST)`);
  console.log(`   - Session ID: ${session.sessionId}`);
  console.log(`   - Faucet Mode: ${session.isSimulatedFaucet ? 'Simulated Instant' : 'Live Testnet'}`);

  if (duration > 300) {
    console.warn(`⚠️ Warning: Provisioning took ${duration}ms, exceeding 300ms SLA target.`);
  } else {
    console.log('✅ SLA Verified: Instant guest onboarding < 300ms.');
  }

  // 1. Verify Address Format
  if (!session.address.startsWith('0x') || session.address.length < 60) {
    throw new Error(`Invalid Sui address generated: ${session.address}`);
  }
  console.log('✅ Sui address format verified.');

  // 2. Verify Session Retrieval
  const retrieved = judgeModeService.getSession(session.sessionId);
  if (!retrieved || retrieved.address !== session.address) {
    throw new Error('Session retrieval failed!');
  }
  console.log('✅ In-memory session lookup verified.');

  // 3. Verify Transaction Signing
  const dummyPayload = new TextEncoder().encode('alphaagent_test_commit_hash_123');
  const signature = await judgeModeService.signTransaction(session.sessionId, dummyPayload);
  if (!signature || signature.length === 0) {
    throw new Error('Transaction signing failed with guest keypair!');
  }
  console.log(`✅ Ephemeral Ed25519 signature generated (${signature.length} bytes).`);

  console.log('🎉 Judge Mode tests passed successfully!');
}

testJudgeMode().catch((err) => {
  console.error('❌ Judge Mode test error:', err);
  process.exit(1);
});

