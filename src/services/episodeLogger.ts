import {
  walrusClient,
  MemoryCodec,
  EpisodeRecord,
  StatusRecord,
} from '../lib/walrusClient';
import { PendingPick } from './revealService';
import { ResolutionResult } from '../lib/resolutionEngine';

export interface LoggedEpisodeResult {
  episode: EpisodeRecord;
  blobId: string;
  namespace: string;
  serializedText: string;
}

export interface LoggedStatusResult {
  status: StatusRecord;
  blobId: string;
  namespace: string;
  serializedText: string;
}

/**
 * Walrus Memory Episode & Status Logger
 * Connects the two-source resolution engine to immutable Walrus Memory storage.
 */
export class EpisodeLogger {
  private readonly registryNamespace = 'aa-registry';
  private registeredForecasters: Set<string> = new Set();

  /**
   * Derives canonical namespace partition: aa-f-<address_prefix>
   */
  getForecasterNamespace(address: string): string {
    const cleanAddr = address.toLowerCase();
    const prefix = cleanAddr.startsWith('0x') ? cleanAddr.slice(0, 10) : `0x${cleanAddr.slice(0, 8)}`;
    return `aa-f-${prefix}`;
  }

  /**
   * Ensures the forecaster's address is stored in the global aa-registry on Walrus Memory
   */
  async ensureForecasterRegistered(forecaster: string): Promise<string | null> {
    const cleanAddr = forecaster.toLowerCase();
    if (this.registeredForecasters.has(cleanAddr)) {
      return null;
    }

    const registryRecord = `REGISTRY | v1 | forecaster ${cleanAddr} | registered_at ${Math.floor(Date.now() / 1000)}`;
    const blobId = await walrusClient.writeMemory(this.registryNamespace, registryRecord);
    this.registeredForecasters.add(cleanAddr);
    console.log(`📋 [Registry] Forecaster ${cleanAddr.slice(0, 10)}... registered in ${this.registryNamespace} (Blob ID: ${blobId})`);
    return blobId;
  }

  /**
   * Log a fully resolved outcome as an immutable EPISODE record in Walrus Memory
   */
  async logResolvedPick(
    pick: PendingPick,
    resolution: ResolutionResult
  ): Promise<LoggedEpisodeResult> {
    if (resolution.status !== 'RESOLVED' || !resolution.outcome) {
      throw new Error(`Cannot log pick as EPISODE with non-resolved status: ${resolution.status}`);
    }

    // 1. Ensure forecaster is logged in registry
    await this.ensureForecasterRegistered(pick.forecaster);

    // 2. Format canonical EPISODE record
    const episode: EpisodeRecord = {
      type: 'EPISODE',
      version: 'v1',
      forecaster: pick.forecaster,
      category: pick.category,
      eventId: pick.eventId,
      pick: pick.side,
      forecast: pick.probability,
      market: pick.marketBaselineProb,
      marketSource: pick.marketSource,
      marketTs: pick.commitTs,
      outcome: resolution.outcome,
      commitTx: pick.commitTxDigest,
      commitTs: pick.commitTs,
      sourcesAgree: resolution.agreementRatio,
      resolvedTs: resolution.resolvedAt,
    };

    const serializedText = MemoryCodec.serializeEpisode(episode);
    const namespace = this.getForecasterNamespace(pick.forecaster);

    // 3. Write to Walrus Memory (with 2000ms delay queue)
    const blobId = await walrusClient.writeMemory(namespace, serializedText);

    console.log(`💾 [Walrus Memory] Logged EPISODE to ${namespace} (Blob ID: ${blobId}): ${episode.eventId} -> ${episode.outcome.toUpperCase()}`);

    return {
      episode,
      blobId,
      namespace,
      serializedText,
    };
  }

  /**
   * Log an unrevealed, expired, or forfeited commit as an immutable STATUS record
   */
  async logForfeitedCommit(
    forecaster: string,
    commitTxDigest: string,
    reason = 'never revealed by event kickoff'
  ): Promise<LoggedStatusResult> {
    // 1. Ensure forecaster in registry
    await this.ensureForecasterRegistered(forecaster);

    // 2. Format canonical STATUS record
    const statusRecord: StatusRecord = {
      type: 'STATUS',
      version: 'v1',
      forecaster,
      commitTx: commitTxDigest,
      state: 'forfeited',
      reason,
      ts: Math.floor(Date.now() / 1000),
    };

    const serializedText = MemoryCodec.serializeStatus(statusRecord);
    const namespace = this.getForecasterNamespace(forecaster);

    // 3. Write to Walrus Memory
    const blobId = await walrusClient.writeMemory(namespace, serializedText);

    console.log(`⚠️ [Walrus Memory] Logged FORFEIT STATUS to ${namespace} (Blob ID: ${blobId}): tx ${commitTxDigest.slice(0, 10)}...`);

    return {
      status: statusRecord,
      blobId,
      namespace,
      serializedText,
    };
  }

  /**
   * List all forecasters discovered in the registry
   */
  async getRegisteredForecasters(): Promise<string[]> {
    const rawRecords = await walrusClient.listNamespace(this.registryNamespace);
    const addresses: string[] = [];

    for (const record of rawRecords) {
      const match = record.match(/forecaster\s+(0x[a-fA-F0-9]+)/);
      if (match) {
        addresses.push(match[1]);
      }
    }

    return Array.from(new Set(addresses));
  }
}

export const episodeLogger = new EpisodeLogger();

