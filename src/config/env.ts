import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env.local first, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  // Tatum Gateway
  TATUM_API_KEY: z.string().min(1, 'TATUM_API_KEY is required for Tatum Sui RPC gateway access'),
  TATUM_ACCOUNT_ID: z.string().min(1, 'TATUM_ACCOUNT_ID is required (needed on hackathon submission form)'),
  TATUM_SUI_RPC_URL: z.string().url('TATUM_SUI_RPC_URL must be a valid URL').default('https://api.tatum.io/v3/blockchain/node/sui-testnet'),

  // Walrus Memory (Supports official MemWal SDK names & aliases)
  MEMWAL_AGENT_ID: z.string().default(process.env.MEMWAL_ACCOUNT_ID || process.env.MEMWAL_AGENT_ID || '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  MEMWAL_ACCOUNT_ID: z.string().optional(),
  WALRUS_DELEGATE_PRIVATE_KEY: z.string().default(process.env.MEMWAL_PRIVATE_KEY || process.env.WALRUS_DELEGATE_PRIVATE_KEY || 'suiprivkey1placeholderforlocaldevelopment'),
  MEMWAL_PRIVATE_KEY: z.string().optional(),
  WALRUS_RELAYER_ENDPOINT: z.string().url().default(process.env.MEMWAL_SERVER_URL || process.env.WALRUS_RELAYER_ENDPOINT || 'https://relayer-staging.memory.walrus.xyz'),
  MEMWAL_SERVER_URL: z.string().optional(),

  // Sui On-Chain Contract
  SUI_NETWORK: z.enum(['testnet', 'mainnet', 'devnet', 'localnet']).default('testnet'),
  PACKAGE_ID: z.string().min(1, 'PACKAGE_ID is required (deployed alphaagent Move package address)'),
  MODULE_NAME: z.string().default('alphaagent::commits'),
  MASTER_FAUCET_PRIVATE_KEY: z.string().min(1, 'MASTER_FAUCET_PRIVATE_KEY is required for 1-Click Judge Mode guest wallet funding'),

  // Data & Server Configuration
  ODDS_API_KEY: z.string().min(1, 'ODDS_API_KEY is required to fetch two-way moneyline market baselines'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ [AlphaAgent Boot Error] Invalid or missing environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

if (require.main === module) {
  console.log('✅ [AlphaAgent] Environment configuration successfully validated:');
  console.log(`   - Network: ${env.SUI_NETWORK}`);
  console.log(`   - Tatum RPC: ${env.TATUM_SUI_RPC_URL}`);
  console.log(`   - Walrus Relayer: ${env.WALRUS_RELAYER_ENDPOINT}`);
  console.log(`   - Port: ${env.PORT} (${env.NODE_ENV})`);
}

