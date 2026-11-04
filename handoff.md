# AlphaAgent: Engineering Handoff & Runbook

**Audience:** Core Engineers, Subagents, and Code Reviewers  
**Target Repository:** `AlphaAgent`  
**Runtime:** Node.js v20+ / TypeScript 5+ / Next.js 14+ / Sui Move CLI  
**Package Manager:** `pnpm`  

---

## 1. Environment Configuration (`.env.local`)

Create `.env.local` in the project root. **Never commit this file.**

```ini
# ==========================================
# TATUM GATEWAY (Sui Testnet)
# ==========================================
TATUM_API_KEY="t-65a4b7...YOUR_TATUM_KEY"
TATUM_ACCOUNT_ID="act_88b9c...YOUR_ACCOUNT_ID"
TATUM_SUI_RPC_URL="https://api.tatum.io/v3/blockchain/node/sui-testnet"

# ==========================================
# WALRUS MEMORY (Mainnet Relayer)
# ==========================================
MEMWAL_AGENT_ID="0xDelegatePublicKeyFromWalrusDashboard..."
WALRUS_DELEGATE_PRIVATE_KEY="suiprivkey1...SERVER_ONLY_DELEGATE_KEY"
WALRUS_RELAYER_ENDPOINT="https://walrus-memory-mainnet.relayer.io"

# ==========================================
# SUI ON-CHAIN CONTRACT (Testnet)
# ==========================================
SUI_NETWORK="testnet"
PACKAGE_ID="0xYourDeployedMovePackageId..."
MODULE_NAME="alphaagent::commits"
MASTER_FAUCET_PRIVATE_KEY="suiprivkey1...KEY_TO_FUND_GUEST_MODE"

# ==========================================
# DATA & ODDS ORACLES
# ==========================================
ODDS_API_KEY="your_odds_api_v4_key"
POLYMARKET_API_URL="https://clob.polymarket.com"

# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=3000
NODE_ENV="development"
JWT_SECRET="super_secret_ephemeral_jwt_key"
```

---

## 2. Directory Structure

```text
AlphaAgent/
├── contracts/                  # Sui Move Smart Contracts
│   ├── Move.toml               # Sui package manifest
│   └── sources/
│       └── commits.move        # alphaagent::commits entry point
├── src/
│   ├── app/                    # Next.js App Router (ai.tatum.io shell)
│   │   ├── page.tsx            # Landing Page & 1-Click Judge Mode Hero
│   │   ├── pick/page.tsx       # Forecaster Commit Portal
│   │   ├── agent/page.tsx      # Agent Dashboard & Monitored Forecasters
│   │   ├── verify/page.tsx     # Verifiable Completeness Reconciliation Table
│   │   ├── proof/page.tsx      # Cryptographic Proofs & Database Wipe Trigger
│   │   └── api/
│   │       ├── judge-mode/     # Ephemeral wallet funding & commit route
│   │       ├── commit/         # Pick hashing & baseline odds capture
│   │       ├── resolve/        # 2-source agreement resolution engine
│   │       └── verdict/        # Paid x402 verdict endpoint
│   ├── lib/
│   │   ├── tatumClient.ts      # Rate-paced Tatum Sui RPC Client with LRU Cache
│   │   ├── walrusClient.ts     # @mysten-incubation/memwal integration
│   │   ├── scoringEngine.ts    # Brier Skill Score & Prior Shrinkage (k=10)
│   │   ├── oddsEngine.ts       # De-vigging & market probability normalizer
│   │   └── luckSimulator.ts    # Monte Carlo 10,000 forecaster luck simulation
│   └── components/             # Reusable Design System components
│       ├── VerdictBadge.tsx    # High-contrast FOLLOW / WATCH / SKIP badge
│       ├── RefusalCard.tsx     # 5-0 refusal evidence card
│       ├── AuditTable.tsx      # Sui vs Walrus reconciliation table
│       └── LuckLabSlider.tsx   # Interactive simulator widget
├── scripts/                    # Automated CLI Runners & Test Suites
│   ├── spikes/                 # Day 1 Spikes A through E validation
│   ├── buyer-agent.ts          # Autonomous bot executing x402 Sui payment
│   ├── wipe-and-rebuild.ts     # The Database Wipe Disaster Recovery Test
│   └── seed-cohort.ts          # Seed synthetic fixtures and test cohorts
└── package.json
```

---

## 3. Quick Start & Setup Instructions

### 3.1 Install Dependencies
```powershell
pnpm install
```

### 3.2 Compile and Deploy Move Contract (Sui Testnet)
```powershell
cd contracts
sui move build
sui client publish --gas-budget 50000000
# Copy published package ID into .env.local PACKAGE_ID
cd ..
```

### 3.3 Run Local Development Server
```powershell
pnpm dev
# Server boots on http://localhost:3000
```

---

## 4. Key CLI Test Commands & Runbook

### 4.1 Run Day 1 Spikes Validation
Validates Tatum RPC, Walrus Memory write/read, Move contract events, and Odds API.
```powershell
pnpm test:spikes
```

### 4.2 Execute the Database Wipe Test (`The Killer Walrus Proof`)
This command deletes the local SQLite cache, cold-boots the agent, queries Walrus Mainnet, and verifies 100% bit-for-bit verdict restoration:
```powershell
pnpm test:wipe-rebuild
```

### 4.3 Run Autonomous Buyer Agent (x402 Protocol Test)
Spins up a headless buyer bot that queries `/api/verdict`, handles `HTTP 402`, signs a testnet Sui micropayment, and unlocks the signed verdict bundle:
```powershell
pnpm test:x402-buyer
```

### 4.4 Run Monte Carlo Luck Simulation
Generates 10,000 zero-skill simulated forecasters and outputs the comparative survival rate between naive rules (70%+ win rate) vs AlphaAgent:
```powershell
pnpm simulate:luck
```

### 4.5 One-Command Hackathon Proof
Runs an automated health check verifying all Sui digests, Walrus blob IDs, and Mainnet write counts ($\ge 10$):
```powershell
pnpm prove
```

---

## 5. Troubleshooting & Common Pitfalls

| Issue | Symptom | Immediate Resolution |
| :--- | :--- | :--- |
| **Tatum 429 Too Many Requests** | RPC requests fail intermittently | Check `src/lib/tatumClient.ts`. Ensure concurrency is limited to 1 and request interval is $\ge 350\text{ms}$. |
| **Walrus Write Throttling** | Writes rejected by relayer | Enforce a 2000ms pause between sequential memory writes. Batch initial fixture seeding. |
| **Guest Mode Faucet Exhaustion** | Judge Mode throws "Insufficient Gas" | Ensure `MASTER_FAUCET_PRIVATE_KEY` holds at least 0.5 testnet SUI. Refill from official Sui Discord faucet. |
| **Odds API Quota Reached** | Baseline odds return null | Odds API free tier has 500 monthly requests. Use in-memory cache for game odds or switch to mock fixtures during dev. |
| **x402 Nonce Mismatch** | Server rejects payment digest | Ensure `scripts/buyer-agent.ts` injects the exact nonce returned in the 402 challenge into the Sui transaction memo. |

