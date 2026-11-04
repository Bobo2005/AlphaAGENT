import {
  generateRandomSalt,
  serializeCanonicalPick,
  hashPick,
  buildCommitTransaction,
  getExplorerReceipt,
  CanonicalPick,
} from '../src/lib/commitProtocol';

async function testCommitProtocol() {
  console.log('🧪 [Test] Verifying Commit Protocol & Canonical Hashing...');

  // 1. Test Salt Generation
  const salt = generateRandomSalt();
  if (salt.length !== 64) {
    throw new Error(`Salt must be 64 hex characters (32 bytes), got: ${salt.length}`);
  }
  console.log(`✅ Salt generated: ${salt.slice(0, 16)}...`);

  // 2. Test Canonical JSON Determinism
  const pickA: CanonicalPick = {
    eventId: 'nba_lal_gsw_20261102',
    category: 'NBA',
    side: 'LAL',
    probability: 0.65,
    salt,
  };

  const pickB: CanonicalPick = {
    salt,
    side: 'lal',
    probability: 0.65,
    category: 'NBA',
    eventId: 'nba_lal_gsw_20261102',
  };

  const hashA = hashPick(pickA);
  const hashB = hashPick(pickB);

  console.log('📄 Canonical JSON:\n  ', hashA.canonicalJson);
  console.log('🔑 SHA-256 Hash:\n  ', hashA.hashHex);

  if (hashA.hashHex !== hashB.hashHex) {
    throw new Error('Canonical JSON determinism failure: hashes must match regardless of object property order!');
  }
  console.log('✅ Deterministic hashing verified: identical hashes across variations.');

  // 3. Test PTB Transaction Construction
  console.log('🔨 Testing Move Transaction builder...');
  const tx = buildCommitTransaction(hashA.hashBytes, '0x1234567890abcdef');
  const txData = tx.getData();
  
  if (!txData.commands || txData.commands.length === 0) {
    throw new Error('Transaction block contains no commands!');
  }
  console.log('✅ Move call command alphaagent::commits::commit constructed successfully.');

  // 4. Test UI Explorer Receipt Generation
  const dummyDigest = '5XyZ8aLpQ9mNk4Jr7bVw2c1d3f';
  const receipt = getExplorerReceipt(dummyDigest, hashA.hashHex, '0x7b2f...');
  if (!receipt.explorerUrl.includes('testnet.suivision.xyz')) {
    throw new Error('Explorer URL mismatch!');
  }
  console.log(`✅ Receipt generated: ${receipt.explorerUrl}`);

  console.log('🎉 Commit Protocol tests passed successfully!');
}

testCommitProtocol().catch((err) => {
  console.error('❌ Commit protocol test error:', err);
  process.exit(1);
});

