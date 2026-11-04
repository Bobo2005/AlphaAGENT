import { revealService, RevealPayload } from '../src/services/revealService';
import { hashPick, CanonicalPick, generateRandomSalt } from '../src/lib/commitProtocol';

async function testRevealService() {
  console.log('🧪 [Test] Verifying Pick Reveal & Timeliness Auditing Service...');

  const salt = generateRandomSalt();
  const eventId = 'nba_lal_gsw_20261102';
  const category = 'NBA';
  const side = 'LAL';
  const probability = 0.65;
  const now = Math.floor(Date.now() / 1000);
  const futureKickoff = now + 3600; // 1 hour in future

  const canonicalPick: CanonicalPick = { eventId, category, side, probability, salt };
  const { hashHex: onChainHashHex } = hashPick(canonicalPick);

  // 1. Test Valid Reveal (Within 120 seconds, before kickoff)
  console.log('1️⃣ Testing valid on-time reveal (ACCEPTED)...');
  const validPayload: RevealPayload = {
    eventId,
    category,
    side,
    probability,
    salt,
    commitTxDigest: '5XyZ_digest_valid',
    gameStartTimeTs: futureKickoff,
  };

  const resValid = await revealService.validateAndAcceptReveal(validPayload, {
    onChainHashHex,
    onChainCommitTs: now - 30, // committed 30 seconds ago
    sender: '0x7b2f3491a98bc19d',
  });

  if (!resValid.success || resValid.status !== 'ACCEPTED') {
    throw new Error(`Expected ACCEPTED, got: ${JSON.stringify(resValid)}`);
  }
  console.log(`   ✅ Status: ${resValid.status}, Market Baseline Captured: ${resValid.pendingPick?.marketBaselineProb}`);

  // 2. Test Hash Mismatch (Tampering with probability)
  console.log('2️⃣ Testing hash mismatch / parameter tampering (HASH_MISMATCH)...');
  const tamperedPayload: RevealPayload = {
    ...validPayload,
    probability: 0.75, // Altered probability!
  };

  const resTampered = await revealService.validateAndAcceptReveal(tamperedPayload, {
    onChainHashHex,
    onChainCommitTs: now - 30,
    sender: '0x7b2f3491a98bc19d',
  });

  if (resTampered.success || resTampered.status !== 'HASH_MISMATCH') {
    throw new Error(`Expected HASH_MISMATCH, got: ${JSON.stringify(resTampered)}`);
  }
  console.log(`   ✅ Status: ${resTampered.status}, Reason: "${resTampered.reason}"`);

  // 3. Test After-Kickoff Commitment
  console.log('3️⃣ Testing post-kickoff commit rejection (AFTER_KICKOFF)...');
  const pastKickoff = now - 600; // kickoff was 10 mins ago
  const resPast = await revealService.validateAndAcceptReveal(validPayload, {
    onChainHashHex,
    onChainCommitTs: now - 30, // committed after kickoff
    sender: '0x7b2f3491a98bc19d',
  });

  const resKickoff = await revealService.validateAndAcceptReveal({
    ...validPayload,
    gameStartTimeTs: pastKickoff,
  }, {
    onChainHashHex,
    onChainCommitTs: now - 30,
    sender: '0x7b2f3491a98bc19d',
  });

  if (resKickoff.success || resKickoff.status !== 'AFTER_KICKOFF') {
    throw new Error(`Expected AFTER_KICKOFF, got: ${JSON.stringify(resKickoff)}`);
  }
  console.log(`   ✅ Status: ${resKickoff.status}, Reason: "${resKickoff.reason}"`);

  // 4. Test 2-Minute Anti-Stale Gate (LATE)
  console.log('4️⃣ Testing 2-Minute Anti-Stale Gate (LATE)...');
  const resLate = await revealService.validateAndAcceptReveal(validPayload, {
    onChainHashHex,
    onChainCommitTs: now - 300, // committed 5 minutes ago (> 120s delay)
    sender: '0x7b2f3491a98bc19d',
  });

  if (resLate.success || resLate.status !== 'LATE') {
    throw new Error(`Expected LATE, got: ${JSON.stringify(resLate)}`);
  }
  console.log(`   ✅ Status: ${resLate.status}, Reason: "${resLate.reason}"`);

  console.log('🎉 Reveal & Timeliness Auditing tests passed successfully!');
}

testRevealService().catch((err) => {
  console.error('❌ Reveal service test failure:', err);
  process.exit(1);
});

