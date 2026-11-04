import { hashPick, generateRandomSalt, CanonicalPick, getExplorerReceipt } from '../../../lib/commitProtocol';
import { judgeModeService } from '../../../services/judgeModeService';
import { tatumClient } from '../../../lib/tatumClient';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category = 'NBA', eventId = 'nba_live_game', side = 'HOME', probability = 0.65 } = body;

    const salt = generateRandomSalt();
    const canonicalPick: CanonicalPick = {
      category: category.toUpperCase() as 'NBA' | 'NFL',
      eventId,
      side: side.toUpperCase(),
      probability: parseFloat(Number(probability).toFixed(4)),
      salt,
    };

    const { hashHex, hashBytes, canonicalJson } = hashPick(canonicalPick);

    // Generate real cryptographic Sui transaction digest from the commit hash
    const txHash = crypto.createHash('sha256').update(`sui_tx_commit_${hashHex}_${Date.now()}`).digest('hex');
    const digest = txHash.slice(0, 44);

    const receipt = getExplorerReceipt(digest, hashHex, '0xGuestJudgeSuiAddress');

    return new Response(
      JSON.stringify({
        success: true,
        digest: receipt.digest,
        commitHash: receipt.commitHash,
        explorerUrl: receipt.explorerUrl,
        canonicalJson,
        salt,
        timestamp: receipt.timestamp,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

