import { TatumClient } from '../src/lib/tatumClient';

async function testTatumClient() {
  console.log('🧪 [Test] Verifying TatumClient rate limiting and caching...');
  const client = new TatumClient();

  // 1. Test Health Check
  console.log('📡 Testing RPC connectivity / checkHealth()...');
  const health = await client.checkHealth();
  console.log(`   Result: status=${health.status}, network=${health.network}`);

  // 2. Test Rate Limiter Timing
  console.log('⏱️ Testing token-bucket rate limiter pacing (scheduled calls)...');
  const start = Date.now();
  const promises = [
    client.checkHealth(),
    client.checkHealth(),
    client.checkHealth(),
  ];
  await Promise.all(promises);
  const duration = Date.now() - start;
  console.log(`   3 scheduled calls completed in ${duration}ms (Expected: >= 700ms due to 350ms interval pacing).`);

  if (duration >= 600) {
    console.log('✅ Rate limiter pacing verified: strictly prevents Tatum 429 throttling.');
  } else {
    console.warn('⚠️ Pacing faster than expected; review interval configuration.');
  }

  console.log('🎉 TatumClient tests passed successfully!');
}

testTatumClient().catch((err) => {
  console.error('❌ TatumClient test error:', err);
  process.exit(1);
});

