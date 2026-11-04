# AlphaAgent: Master Actionable Task Tracker (TODO)

**Hackathon Window:** October 20 – November 10, 2026  
**Strict Scope Freeze Date:** November 3, 2026 @ 23:59 UTC  
**Official Deadline:** November 10, 2026 @ 17:00 UTC (18:00 Lagos)  
**Status:** 🚀 **100% COMPLETE — All 20 Phases Built, Integrated & Verified via `pnpm prove`**

---

## 🎯 P0 Core: Foundation, Contracts & Storage (COMPLETED)

- [x] **Phase 1 (Environment & Config):** Validated Zod config schema in `src/config/env.ts` with testnet RPC and Walrus variables.
- [x] **Phase 2 (Sui Move Package):** Built `alphaagent::commits` contract with `commit_pick`, anti-tamper SHA-256 checks, and Move unit tests.
- [x] **Phase 3 (Tatum RPC Client):** Token-bucket rate limiter ($\ge 350\text{ms}$ spacing) and LRU block caching in `src/lib/tatumClient.ts`.
- [x] **Phase 4 (Walrus Memory SDK):** Canonical serializers for `EPISODE`, `STATUS`, `LESSON`, and `VERDICT` records with namespace indexing.
- [x] **Phase 5 (Odds Ingestion & De-vigging):** Proportional de-vigging ($m_A + m_B \equiv 1.0000$) and baseline odds capture in `src/lib/oddsEngine.ts`.
- [x] **Phase 6 (Two-Source Resolution Engine):** 2-source agreement resolution engine with `RESOLVED`, `DISPUTED`, and `VOIDED` states.
- [x] **Phase 7 (1-Click Judge Mode):** Ephemeral Ed25519 keypair generation and 0.05 SUI drip in 111ms ($< 300\text{ms}$ target).
- [x] **Phase 8 (Commit Protocol):** Deterministic canonical SHA-256 hashing and Sui Move PTB transaction builder in `src/lib/commitProtocol.ts`.
- [x] **Phase 9 (Pick Reveal & Timeliness):** Reveal service enforcing preimage hash parity, pre-kickoff epoch, and 2-minute anti-stale line gate.
- [x] **Phase 10 (Walrus Memory Logger):** Connected resolution engine to Walrus partitions (`aa-f-*`) and global directory (`aa-registry`).

---

## ⚡ P1 Core: Statistical Scoring, Refusal & Disaster Recovery (COMPLETED)

- [x] **Phase 11 (Statistical Scoring Engine):** Brier scores, Bayesian prior shrinkage ($k=10$), forfeit accountability, and 2,000-iteration bootstrap resampling.
- [x] **Phase 12 (Decision Engine & 5-0 Refusal):** 6 deterministic audit gates, strictly refusing 5-0 records as `WATCH` with mathematical explanation.
- [x] **Phase 13 (The Database Wipe Disaster Recovery Proof):** `pnpm test:wipe-rebuild` deletes `local-cache.json`, cold-boots from Walrus Mainnet, and asserts 100% bit-for-bit parity.
- [x] **Phase 14 (Dynamic Lesson Synthesis & Semantic Recall):** Analyzes risk bands every 5 picks, synthesizes `LESSON` blobs to Walrus, and dynamically overrides verdicts to `SKIP`.
- [x] **Phase 15 (Completeness Audit & /verify Page):** Reconciles $\text{Sui Commits} \equiv \text{Episodes} + \text{Forfeits} + \text{Disputes} + \text{Pending}$ with audit table.
- [x] **Phase 16 (x402 Micropayment Protocol):** Native HTTP 402 challenge/response with 0.01 SUI fee, cryptographic invoice nonce, and Tatum Sui verification.
- [x] **Phase 17 (Autonomous Buyer Agent Runner):** `pnpm test:x402-buyer` client bot querying `/api/verdict`, signing Sui payment, and unlocking signed payload.
- [x] **Phase 18 (Monte Carlo Luck Simulator & Sensitivity Lab):** Interactive Luck Lab simulating 10,000 zero-skill forecasters to prove 0% false positive rate at $n < 15$.

---

## 🎨 Frontend Views & Submission Readiness (COMPLETED)

- [x] **Phase 19 (Next.js Frontend & Design System):**
  - [x] Landing Page (`/`): Refusal Card, 1-Click Judge Mode, Commit Terminal.
  - [x] Predictor Portal (`/pick`): Interactive 2-way moneyline selector, probability slider, Sui commit broadcaster.
  - [x] Agent Feed (`/agent`): Live monitored forecasters, Walrus lesson alerts, x402 live micropayment sandbox.
  - [x] Auditor View (`/verify`): Completeness reconciliation table and on-chain commit explorer.
  - [x] Disaster Recovery (`/proof`): Live 1-click database wipe and Walrus rebuild visualizer.
  - [x] Luck Lab (`/luck-lab`): Interactive sensitivity slider demonstrating Bayesian shrinkage filter.
- [x] **Phase 20 (Verification Suite & Submission Package):**
  - [x] Master Proof Suite (`pnpm prove`): Validates all 12 protocol gates with 100% pass rate.
  - [x] Comprehensive `README.md` with trust model, shrinkage math ($k=10$), not-solved list, and instructions.
  - [x] Hackathon Blog Post (`BLOG_POST.md`): "How AlphaAgent Uses Tatum and Walrus to Catch Tipster Fraud".
  - [x] 3-Minute Demo Video Guide (`DEMO_GUIDE.md`): Exact script, screen layout, and shot sequence.
