# AlphaAgent: 20-Phase Master Execution Prompt

> **Instructions for the AI Assistant / Engineering Agent:**  
> You are executing the full implementation of **AlphaAgent**, an autonomous due-diligence and risk-auditing agent built for the **Tatum × Walrus Total Recall Hackathon** (Track 02: Smart Agents for Real Life).  
> Execute each phase sequentially with extreme precision. Do not skip phases, do not invent unverified dependencies, and do not introduce placeholder or mock code where real blockchain or memory integration is required. Maintain documentation integrity and preserve the zero-friction philosophy (Judge Mode, the 5-0 Refusal, the Database Wipe Test, and x402 Micropayments).

---

## Phase 1: Environment Setup & Configuration Matrix
- Initialize a Node.js TypeScript project (`pnpm init`, install `typescript`, `ts-node`, `dotenv`, `@types/node`).
- Create `.env.local` and `.env.example` defining:
  - `TATUM_API_KEY`, `TATUM_ACCOUNT_ID`, `TATUM_SUI_RPC_URL`
  - `MEMWAL_AGENT_ID`, `WALRUS_DELEGATE_PRIVATE_KEY`, `WALRUS_RELAYER_ENDPOINT`
  - `SUI_NETWORK`, `PACKAGE_ID`, `MODULE_NAME`, `MASTER_FAUCET_PRIVATE_KEY`
  - `ODDS_API_KEY`, `PORT`, `NODE_ENV`
- Create `src/config/env.ts` using `zod` to validate all environment variables at boot time with descriptive error messages if any are missing.

---

## Phase 2: Sui Move Smart Contract (`alphaagent::commits`)
- In `contracts/`, initialize a Move package with `Move.toml` targeting `sui = "testnet"`.
- Implement `sources/commits.move`:
  - Define `public struct PickCommitted has copy, drop { forecaster: address, commit_hash: vector<u8>, committed_at_ms: u64 }`.
  - Implement `public entry fun commit(commit_hash: vector<u8>, clock: &Clock, ctx: &TxContext)` emitting `PickCommitted`.
- Write Move unit tests in `tests/commits_tests.move` validating that the event emits the correct sender address, timestamp, and hash vector.
- Create a deployment script `scripts/deploy-contract.ts` using Sui CLI to build, publish to testnet, and output the published `PACKAGE_ID`.

---

## Phase 3: Rate-Paced Tatum Sui RPC Client & LRU Cache
- Create `src/lib/tatumClient.ts`.
- Initialize `@tatumio/sui` client pointing to Sui Testnet.
- Wrap all RPC read requests in a token-bucket rate limiter (`p-queue` with `interval: 350`, `intervalCap: 1`, `concurrency: 1`) to strictly honor the ~3 req/s free-tier limit.
- Integrate an in-memory LRU cache (`lru-cache`) that caches confirmed immutable transaction blocks and checkpoints indefinitely.
- Implement helper methods: `getTransactionBlock(digest)`, `queryEvents(filter)`, and `getAccountBalance(address)`.

---

## Phase 4: Walrus Memory SDK Integration (`@mysten-incubation/memwal`)
- Create `src/lib/walrusClient.ts`.
- Initialize the Walrus Memory client using `WALRUS_DELEGATE_PRIVATE_KEY` and `MEMWAL_AGENT_ID` targeting the official Mainnet relayer.
- Implement canonical string serializers and deserializers for the 4 record types: `EPISODE`, `STATUS`, `LESSON`, and `VERDICT` according to [memory.md](file:///c:/Users/USER/Downloads/AlphaAGENT/memory.md).
- Implement methods:
  - `writeMemory(namespace: string, record: string): Promise<string>` (returns blob ID).
  - `listNamespace(namespace: string): Promise<string[]>` (for complete mathematical enumeration).
  - `recallMemories(query: string, limit: number): Promise<MemoryResult[]>` (for semantic lesson retrieval).
- Add 2000ms delay queue to prevent relayer write throttling.

---

## Phase 5: Odds Ingestion & De-vigging Engine
- Create `src/lib/oddsEngine.ts`.
- Integrate The Odds API (v4) to pull two-way decimal moneyline odds ($o_A, o_B$) for upcoming NBA and NFL games.
- Implement the standard proportional de-vigging formula:
  $$m_A = \frac{1/o_A}{1/o_A + 1/o_B}, \quad m_B = \frac{1/o_B}{1/o_A + 1/o_B}$$
- Ensure the sum of true market probabilities $m_A + m_B = 1.0000$.
- Store the captured baseline odds, source identifier, and timestamp in memory for pick reconciliation.

---

## Phase 6: Two-Source Verification & Event Resolution Engine
- Create `src/lib/resolutionEngine.ts`.
- Build a dual-provider resolution pipeline that checks finished game scores across two independent sources (e.g. Odds API scores endpoint + Polymarket / Public Sports DB).
- Enforce the agreement rule:
  - If both sources agree on the winner: return status `RESOLVED` with outcome `win` or `loss`.
  - If sources disagree or game is postponed/voided: return status `DISPUTED` or `VOIDED` with explanatory logs.
- Disallow manual developer toggles; all resolutions must be cryptographically attested by API responses.

---

## Phase 7: Judge Mode (1-Click Ephemeral Wallet & Guest Access)
- Create `src/app/api/judge-mode/route.ts`.
- When a user clicks `[⚡ Test as Guest (1-Click)]`:
  1. Generate an ephemeral Ed25519 keypair on the server.
  2. Execute a gas transfer of 0.05 testnet SUI from `MASTER_FAUCET_PRIVATE_KEY` to the ephemeral address via Tatum.
  3. Store the ephemeral session in an encrypted HTTP-only cookie.
  4. Return the funded address and balance to the frontend in $<300\text{ms}$.
- Allow the judge to instantly commit test picks and trigger audits without installing any browser wallet.

---

## Phase 8: Pick Commitment & Canonical Hashing Flow
- Create `src/lib/commitProtocol.ts`.
- Define the canonical JSON specification: `{ eventId, category, side, probability, salt }`.
- Implement `hashPick(pickPayload)` using `crypto.createHash('sha256')`.
- Build the client-side/server-side transaction builder calling `alphaagent::commits::commit(hash, &Clock)` on Sui Testnet.
- Provide real-time UI receipt showing the transaction digest on SuiVision Testnet explorer.

---

## Phase 9: Pick Reveal & Timeliness Auditing Service
- Create `src/app/api/reveal/route.ts`.
- Validate incoming reveals:
  - Verify that `SHA256(canonical_json)` matches the on-chain `commit_hash`.
  - Verify that the on-chain commit timestamp $\le$ game start time.
  - Enforce the 2-Minute Anti-Stale Gate: if reveal timestamp $> \text{commit\_ts} + 120\text{s}$, reject pick and classify as `LATE` (counts toward forfeit penalty).
- Upon validation, immediately capture the current market baseline $m$ and save the pick to pending memory.

---

## Phase 10: Walrus Memory Episode & Status Logger
- Create `src/services/episodeLogger.ts`.
- Connect the resolution engine to Walrus Memory:
  - For resolved picks: write formatted `EPISODE` string to `aa-f-<address_short>` and update `aa-registry`.
  - For unrevealed or expired picks: write `STATUS | v1 | ... | state forfeited` string.
- Record the returned Walrus blob ID and attach it to the local cache object.

---

## Phase 11: Statistical Scoring Engine (Brier Skill Score & Shrinkage)
- Create `src/lib/scoringEngine.ts`.
- Implement Brier Score for user and market:
  $$BS_{\text{user}} = (f - o)^2, \quad BS_{\text{mkt}} = (m - o)^2$$
- Implement Brier Skill Score:
  $$BSS = 1 - \frac{\sum BS_{\text{user}}}{\sum BS_{\text{mkt}}}$$
- Implement prior shrinkage toward zero skill with prior weight $k = 10$:
  $$BSS_{\text{shrunk}} = BSS \times \frac{n}{n + k}$$
- Implement bootstrap resampling (2,000 iterations) to compute the 80% confidence lower bound of raw $BSS$.

---

## Phase 12: Decision Engine (The 5-0 Refusal Logic & 3 Verdict States)
- Create `src/services/decisionEngine.ts`.
- Enforce the 3 core states:
  - **`FOLLOW`**: Requires $n \ge 15$, $\sum BS_{\text{mkt}} \ge 1.0$, $BSS_{\text{shrunk}} \ge 0.02$, Bootstrap 80% lower bound $> 0$, and Forfeited Commits $\le 10\%$.
  - **`WATCH`**: Sample size insufficient ($n < 15$ or low market uncertainty). Output explicit missing criteria (e.g., *"5-0 record is statistically indistinguishable from luck. Needs 10 more resolved picks"*).
  - **`SKIP`**: Negative skill score, forfeit rate $> 10\%$, or active lesson override.
- Write strict unit tests verifying the 5-0 refusal and 30-pick master scenarios.

---

## Phase 13: The Database Wipe Disaster Recovery Test (`pnpm test:wipe-rebuild`)
- Create `scripts/wipe-and-rebuild.ts`.
- Build the automated test that proves Walrus Memory is the true system of record:
  1. Cache current verdict snapshots for all registered forecasters.
  2. Delete local database/cache file (`unlinkSync('./data/cache.db')`).
  3. Restart agent in cold-boot mode.
  4. Query `aa-registry` on Walrus Mainnet, iterate all forecaster namespaces, stream all `EPISODE` and `STATUS` blobs.
  5. Recompute all Brier scores, shrinkage metrics, and verdicts.
  6. Assert bit-for-bit equivalence between restored verdicts and pre-wipe snapshots.

---

## Phase 14: Dynamic Lesson Synthesis & Semantic Recall Pipeline
- Create `src/services/lessonEngine.ts`.
- Every 5 resolved picks for a forecaster, analyze outcome subsets by odds band (e.g. Underdogs $\le 40\%$, Confident Favorites $\ge 75\%$).
- If a subset demonstrates severe negative BSS (e.g. 1 of 5 confident picks won), synthesize a `LESSON` string and write to Walrus Memory.
- In `decisionEngine.ts`, before issuing a verdict on an upcoming pick, execute `WalrusClient.recallMemories()` with the pick's context. If a matching lesson rule exists, override to `SKIP` and cite the Walrus lesson blob ID.

---

## Phase 15: Completeness Audit & Reconciliation Engine (`/verify`)
- Create `src/app/verify/page.tsx` and `src/app/api/audit/route.ts`.
- Query Tatum RPC for all historical `PickCommitted` events from the target forecaster.
- Reconcile on-chain commits against Walrus records:
  $$\text{Sui Commits} \equiv \text{Resolved Episodes} + \text{Forfeits} + \text{Disputes} + \text{Pending}$$
- Render an audit table displaying every Sui transaction digest, Walrus blob ID, forfeit penalty, and overall completeness percentage.

---

## Phase 16: x402 Micropayment Protocol & Paid Verdict Endpoint
- Create `src/app/api/verdict/route.ts`.
- Handle incoming request: `GET /api/verdict?forecaster=0x...&category=NBA`.
- If request lacks `X-Payment-Digest` header:
  - Respond with `HTTP 402 Payment Required`.
  - Return JSON with seller treasury address, fee (0.01 SUI), and unique invoice nonce.
- If request includes `X-Payment-Digest`:
  - Query Tatum Sui RPC to verify transaction: confirm sender, recipient, amount, and that memo matches the invoice nonce.
  - Upon confirmation, release HTTP 200 with the full signed verdict bundle and Walrus blob citations.

---

## Phase 17: Autonomous Buyer Agent Runner (`scripts/buyer-agent.ts`)
- Create `scripts/buyer-agent.ts`.
- Implement an automated client bot that:
  1. Calls `http://localhost:3000/api/verdict`.
  2. Parses the `402 Payment Required` challenge.
  3. Uses a dedicated buyer testnet keypair to sign and broadcast a Sui payment transaction containing the nonce.
  4. Re-queries the endpoint with `X-Payment-Digest`.
  5. Prints the unlocked cryptographic audit payload to the terminal.
- Add `pnpm test:x402-buyer` script to `package.json`.

---

## Phase 18: Monte Carlo Luck Simulator & Sensitivity Lab
- Create `src/lib/luckSimulator.ts` and `src/components/LuckLabSlider.tsx`.
- Simulate 10,000 synthetic forecasters with zero true skill (picks drawn from market probabilities with random noise).
- Calculate how many of these zero-skill actors achieve a $\ge 70\%$ win rate over 5 to 40 picks (naive rule) versus how many bypass AlphaAgent's shrinkage filter ($< 0.1\%$).
- Build the interactive Luck Lab page allowing judges to adjust hit rates and sample sizes to visualize luck filtering in real time.

---

## Phase 19: Next.js Frontend Polish & Design System
- In `src/app/` and `src/components/`, implement the UI matching [design-system.md](file:///c:/Users/USER/Downloads/AlphaAGENT/design-system.md):
  - **Landing Page:** Hero section with `[⚡ Test as Guest (1-Click)]` and live protocol status indicators.
  - **Refusal Card:** Prominent display of the 5-0 record marked `WATCH` with mathematical failure breakdown.
  - **Pick Slip:** Clean 2-way moneyline selector, probability slider, and commit button.
  - **Proof Page (`/proof`):** One-click button to trigger the Database Wipe restoration test live on-screen.

---

## Phase 20: Video Demo Production, Documentation & Submission Validation
- Produce the 2.5-minute video demo adhering to the "Freight Train" script in Section 12:
  - Lead at `0:00` with the 5-0 refusal hook.
  - Demonstrate Judge Mode in 15 seconds.
  - Show the split-screen Database Wipe test (`rm -rf local.db`).
  - Demonstrate the live x402 buyer payment.
- Finalize GitHub `README.md` and publish the required hackathon blog post.
- Run `pnpm prove` to verify all Mainnet Walrus memories ($\ge 10$) and Tatum RPC queries pass with zero errors.
- Submit the final project on the official hackathon portal 24 hours prior to the November 10 deadline.

