import { Transaction } from '@mysten/sui/transactions';
import crypto from 'crypto';
import { env } from '../config/env';

export interface CanonicalPick {
  eventId: string;
  category: 'NBA' | 'NFL';
  side: string;
  probability: number; // e.g. 0.6500
  salt: string;        // 32-byte hex string
}

export interface HashPickResult {
  canonicalJson: string;
  hashHex: string;
  hashBytes: Uint8Array;
}

export interface CommitReceipt {
  digest: string;
  commitHash: string;
  forecaster: string;
  explorerUrl: string;
  network: string;
  timestamp: number;
}

export const SUI_CLOCK_OBJECT_ID = '0x0000000000000000000000000000000000000000000000000000000000000006';

/**
 * Generates a cryptographically secure 32-byte random hex salt
 */
export function generateRandomSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Deterministic JSON stringifier with sorted keys to guarantee identical hashes
 */
export function serializeCanonicalPick(pick: CanonicalPick): string {
  if (pick.probability <= 0 || pick.probability >= 1) {
    throw new Error(`Probability must be strictly between 0 and 1, got: ${pick.probability}`);
  }

  // Sorted alphabetical keys for canonical representation
  const canonicalObj = {
    category: pick.category.trim().toUpperCase(),
    eventId: pick.eventId.trim(),
    probability: parseFloat(pick.probability.toFixed(4)),
    salt: pick.salt.trim().toLowerCase(),
    side: pick.side.trim().toUpperCase(),
  };

  return JSON.stringify(canonicalObj);
}

/**
 * Computes the SHA-256 commitment hash of a canonical pick
 */
export function hashPick(pick: CanonicalPick): HashPickResult {
  const canonicalJson = serializeCanonicalPick(pick);
  const hash = crypto.createHash('sha256').update(canonicalJson, 'utf-8').digest();
  
  return {
    canonicalJson,
    hashHex: hash.toString('hex'),
    hashBytes: new Uint8Array(hash),
  };
}

/**
 * Builds the Programmable Transaction Block (PTB) calling alphaagent::commits::commit
 */
export function buildCommitTransaction(hashBytes: Uint8Array, packageId = env.PACKAGE_ID): Transaction {
  const tx = new Transaction();
  const target = `${packageId}::commits::commit`;

  tx.moveCall({
    target: target as `${string}::${string}::${string}`,
    arguments: [
      tx.pure.vector('u8', Array.from(hashBytes)),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

/**
 * Generates a verifiable explorer receipt for the UI
 */
export function getExplorerReceipt(digest: string, commitHash: string, forecaster: string): CommitReceipt {
  return {
    digest,
    commitHash,
    forecaster,
    explorerUrl: `https://testnet.suivision.xyz/txblock/${digest}`,
    network: 'Sui Testnet',
    timestamp: Math.floor(Date.now() / 1000),
  };
}

