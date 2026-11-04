import {
  SuiJsonRpcClient,
  JsonRpcHTTPTransport,
  SuiTransactionBlockResponse,
} from '@mysten/sui/jsonRpc';
import { LRUCache } from 'lru-cache';
import { env } from '../config/env';

/**
 * Token-Bucket Rate Limiter to guarantee adherence to Tatum's ~3 req/sec free-tier limit.
 * Minimum interval between requests: 350ms (intervalCap: 1, concurrency: 1).
 */
class RateLimiter {
  private queue: (() => Promise<void>)[] = [];
  private lastExecuted = 0;
  private readonly intervalMs: number;
  private processing = false;

  constructor(intervalMs = 350) {
    this.intervalMs = intervalMs;
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLast = now - this.lastExecuted;
      if (timeSinceLast < this.intervalMs) {
        await new Promise((resolve) => setTimeout(resolve, this.intervalMs - timeSinceLast));
      }
      this.lastExecuted = Date.now();
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.processing = false;
  }
}

/**
 * Rate-Paced Tatum Sui RPC Client with LRU Cache & Public Fullnode Fallback
 */
export class TatumClient {
  private primaryClient: SuiJsonRpcClient;
  private fallbackClient: SuiJsonRpcClient;
  private limiter: RateLimiter;
  private txCache: LRUCache<string, SuiTransactionBlockResponse>;
  private eventCache: LRUCache<string, any[]>;

  constructor() {
    // 1. Primary: Tatum Sui RPC Gateway with API key header
    const tatumTransport = new JsonRpcHTTPTransport({
      url: env.TATUM_SUI_RPC_URL,
      headers: {
        'x-api-key': env.TATUM_API_KEY,
      },
    } as any);

    this.primaryClient = new SuiJsonRpcClient({
      network: 'testnet',
      transport: tatumTransport,
    });

    // 2. Fallback: Official Sui Testnet Fullnode
    this.fallbackClient = new SuiJsonRpcClient({
      network: 'testnet',
      transport: new JsonRpcHTTPTransport({
        url: 'https://fullnode.testnet.sui.io:443',
      }),
    });

    this.limiter = new RateLimiter(350);

    // Cache immutable transaction blocks indefinitely (max 10,000 entries)
    this.txCache = new LRUCache<string, SuiTransactionBlockResponse>({
      max: 10000,
    });

    // Cache event queries with 60-second TTL
    this.eventCache = new LRUCache<string, any[]>({
      max: 1000,
      ttl: 1000 * 60,
    });
  }

  /**
   * Helper that attempts primary Tatum client first, falling back to public fullnode if Tatum key is invalid, rate-limited, or returns protocol error
   */
  private async executeWithFallback<T>(operation: (client: SuiJsonRpcClient) => Promise<T>): Promise<T> {
    return this.limiter.schedule(async () => {
      try {
        return await operation(this.primaryClient);
      } catch (err: any) {
        // Transparently fall back to Sui testnet fullnode on any Tatum gateway or RPC error (e.g. 415, 401, 403, 404, 500, network)
        try {
          return await operation(this.fallbackClient);
        } catch (fallbackErr: any) {
          throw fallbackErr;
        }
      }
    });
  }

  /**
   * Fetch transaction block by digest with LRU cache & rate pacing
   */
  async getTransactionBlock(digest: string): Promise<SuiTransactionBlockResponse> {
    const cached = this.txCache.get(digest);
    if (cached) {
      return cached;
    }

    const response = await this.executeWithFallback((client) =>
      client.getTransactionBlock({
        digest,
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      })
    );

    if (response && response.digest) {
      this.txCache.set(digest, response);
    }
    return response;
  }

  /**
   * Query events on Sui Testnet (e.g. MoveEventType: alphaagent::commits::PickCommitted)
   */
  async queryEvents(filter: any): Promise<any[]> {
    const cacheKey = JSON.stringify(filter);
    const cached = this.eventCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const events = await this.executeWithFallback(async (client) => {
      const result = await client.queryEvents({
        query: filter,
      });
      return result.data || [];
    });

    this.eventCache.set(cacheKey, events);
    return events;
  }

  /**
   * Get SUI coin balance for an address
   */
  async getAccountBalance(address: string): Promise<{ totalBalance: string; coinObjectCount: number }> {
    return this.executeWithFallback(async (client) => {
      const balance = await client.getBalance({
        owner: address,
      });
      return {
        totalBalance: balance.totalBalance,
        coinObjectCount: balance.coinObjectCount,
      };
    });
  }

  /**
   * Health check / ping RPC endpoint
   */
  async checkHealth(): Promise<{ status: string; rpcUrl: string; network: string }> {
    try {
      const chainId = await this.executeWithFallback((client) => client.getChainIdentifier());
      return {
        status: 'online',
        rpcUrl: env.TATUM_SUI_RPC_URL,
        network: `Sui Testnet (${chainId})`,
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        rpcUrl: env.TATUM_SUI_RPC_URL,
        network: err.message,
      };
    }
  }
}

export const tatumClient = new TatumClient();
