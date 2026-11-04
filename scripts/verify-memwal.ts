import { MemWal, MemWalMock } from '@mysten-incubation/memwal';
import { env } from '../src/config/env';

async function verifyMemWalSetup() {
  console.log('================================================================================');
  console.log('🧠 [AlphaAgent] Verifying Walrus Memory SDK (@mysten-incubation/memwal)...');
  console.log('================================================================================\n');

  const key = env.MEMWAL_PRIVATE_KEY || env.WALRUS_DELEGATE_PRIVATE_KEY;
  const accountId = env.MEMWAL_ACCOUNT_ID || env.MEMWAL_AGENT_ID;
  const serverUrl = env.MEMWAL_SERVER_URL || env.WALRUS_RELAYER_ENDPOINT;

  console.log('Config loaded from environment:');
  console.log(`  - Account ID: ${accountId}`);
  console.log(`  - Key (preview): ${key ? key.slice(0, 14) + '...' : 'none'}`);
  console.log(`  - Relayer URL: ${serverUrl}\n`);

  try {
    console.log(`📡 Connecting to Walrus Memory relayer at ${serverUrl}...`);
    const memwal = MemWal.create({
      key,
      accountId,
      serverUrl,
      namespace: 'alphaagent-verify',
    });

    console.log('🏥 Checking relayer health...');
    try {
      const health = await memwal.health();
      console.log('   ✅ Relayer Health Check OK:', health);
    } catch (err: any) {
      console.warn('   ⚠️ Relayer health check warning:', err.message);
    }

    console.log('📝 Storing test memory: "AlphaAgent autonomous risk audit verification"...');
    const job = await memwal.remember('AlphaAgent autonomous risk audit verification');
    console.log(`   Job submitted: job_id=${job.job_id}`);

    console.log('⏳ Waiting for remember job completion...');
    await memwal.waitForRememberJob(job.job_id);
    console.log('   ✅ Memory committed and indexed on Walrus!');

    console.log('🔍 Recalling memory with semantic query: "risk audit"...');
    const result = await memwal.recall({ query: 'risk audit' });
    console.log('   ✅ Recall results:', result.results);

    console.log('\n🎉 Walrus Memory SDK setup verified successfully!');
  } catch (error: any) {
    console.error('\n❌ Live Walrus relayer error:', error.message);
    console.log('\n💡 Falling back to MemWalMock to test offline parity...');
    const mockMem = (MemWalMock as any).create ? (MemWalMock as any).create() : new (MemWalMock as any)();
    const mockJob = await mockMem.remember('AlphaAgent autonomous risk audit verification');
    await mockMem.waitForRememberJob(mockJob.job_id);
    const mockResult = await mockMem.recall({ query: 'risk audit' });
    console.log('   ✅ MemWalMock verified (offline test):', mockResult.results);
  }
}

verifyMemWalSetup().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

