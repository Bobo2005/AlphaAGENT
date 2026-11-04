# AlphaAgent Design System & UI Specification

**Aesthetic Concept:** "Verifiable Terminal" (Bloomberg Terminal meets Cryptographic Ledger)  
**Tone:** Institutional, Mathematically Rigorous, Zero Hype, Uncompromisingly Honest  
**Primary Framework:** Tailwind CSS + Radix UI / Shadcn UI + Lucide Icons  

---

## 1. Visual Philosophy & Core Pillars

AlphaAgent does not look like a playful consumer casino or flashy degen betting site. It looks like an **institutional risk engine and audit terminal**:
1. **Mathematical Clarity over Hype:** Probabilities, Brier scores, sample sizes, and forfeit rates take precedence over flashy celebratory banners.
2. **Every Claim Has a Receipt:** Every verdict displays direct, clickable on-chain transaction digests and Walrus blob identifiers.
3. **High-Contrast Decision States:** The three core agent states (`FOLLOW`, `WATCH`, `SKIP`) are unmistakably differentiated across the entire interface.

---

## 2. Color Palette & Theming

```css
:root {
  /* Surface & Base */
  --bg-primary: #0a0d14;         /* Void black / Deep slate */
  --bg-surface: #111726;         /* Elevated panel card */
  --bg-surface-hover: #182238;   /* Interactive hover state */
  --border-subtle: #1e293b;      /* Clean structural divider */
  --border-active: #334155;      /* Focused element border */

  /* The 3 Core Agent Decision States */
  --verdict-follow: #10b981;     /* Emerald 500 (Verified Edge) */
  --verdict-follow-glow: rgba(16, 185, 129, 0.15);
  --verdict-watch: #f59e0b;      /* Amber 500 (Insufficient Sample) */
  --verdict-watch-glow: rgba(245, 158, 11, 0.15);
  --verdict-skip: #ef4444;       /* Crimson 500 (Negative Skill / Fraud) */
  --verdict-skip-glow: rgba(239, 68, 68, 0.15);

  /* Protocol Identifiers */
  --sui-cyan: #38bdf8;           /* Sui Testnet Accent */
  --walrus-purple: #a855f7;      /* Walrus Memory Accent */
  --tatum-blue: #2563eb;         /* Tatum RPC Accent */

  /* Typography Colors */
  --text-primary: #f8fafc;       /* 95% Pure white headings */
  --text-secondary: #94a3b8;     /* Slate 400 descriptions */
  --text-muted: #64748b;         /* Slate 500 timestamps & hashes */
}
```

---

## 3. Typography & Hierarchy

* **Display & Body Font:** `Inter` or `Geist Sans` (Crisp, clean legibility at small sizes).
* **Code, Hashes & Metrics Font:** `JetBrains Mono` or `Geist Mono` (Tabular numerals, perfect alignment for statistical tables and blockchain digests).

| Style | Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | 36px / 2.25rem | Bold (700) | -0.025em | Main headline / Refusal headline |
| **Section Header** | 20px / 1.25rem | SemiBold (600) | -0.015em | Panel card titles |
| **Verdict Badge** | 18px / 1.125rem | Bold (700) | +0.05em | `FOLLOW` / `WATCH` / `SKIP` badges |
| **Body Standard** | 14px / 0.875rem | Regular (400) | Normal | Explanatory text & rationale |
| **Monospace Data** | 13px / 0.8125rem| Medium (500) | Normal | Transaction digests, Walrus Blobs, math formulas |

---

## 4. Key UI Components & Wireframes

### 4.1 Judge Mode 1-Click Banner (`[⚡ Test as Guest]`)
Placed prominently in the global navigation bar and hero section:

```
+-----------------------------------------------------------------------------------------+
| [⚡ Judge Mode: Test as Guest in 30s]  No wallet needed. Pre-funded ephemeral testnet SUI |
|                                                    [ Launch 1-Click Test Session -> ]  |
+-----------------------------------------------------------------------------------------+
```
* **State Behavior:** Clicking immediately provisions the ephemeral keypair, pulses with a subtle cyan glow, and replaces the "Connect Wallet" button with `Guest_0x8f2a (0.05 SUI Testnet)`.

### 4.2 The Refusal Card ("5-0 Record: WATCH")
The signature UI element demonstrating that AlphaAgent says NO to lucky streaks:

```
+-----------------------------------------------------------------------------------------+
| FORECASTER: 0x9a8f...4e1b                               STATUS: 5-0 (100% Win Rate)      |
|-----------------------------------------------------------------------------------------|
| VERDICT:  [ ⏳ WATCH ]  INSUFFICIENT SAMPLE SIZE (LUCK IMMATERIAL)                       |
|                                                                                         |
| ✖ Gate Failed: Sample Size n = 5 (Minimum required: n >= 15)                            |
| ✖ Gate Failed: Market Information Depth = 0.42 (Minimum required: >= 1.00)              |
| ✔ Gate Passed: Forfeit Rate = 0.0% (<= 10.0%)                                           |
|                                                                                         |
| Agent Explanation:                                                                      |
| "A 5-0 streak on coin-flip favorites occurs naturally in 3.1% of zero-skill random       |
| actors. True mathematical edge requires at least 10 more resolved picks."               |
+-----------------------------------------------------------------------------------------+
```

### 4.3 Verifiable Audit & Completeness Table (`/verify`)
A full cryptographic reconciliation between on-chain Sui commits and Walrus Memory:

```
+-----------------------------------------------------------------------------------------+
| RECONCILIATION AUDIT: 0x7b2f...9a1                                                      |
| Commits on Sui: 24  |  Walrus Records: 24  |  Forfeits: 1 (4.1%)  |  Status: RECONCILED  |
|-----------------------------------------------------------------------------------------|
| TIME (UTC)   | EVENT        | COMMIT TX   | WALRUS BLOB   | OUTCOME | SCORE CONTRIBUTION|
| 10/28 19:00  | LAL @ DEN    | 0x5a1b...   | blob_89af...  | WIN     | BSS: +0.042       |
| 10/27 21:30  | KC @ BUF     | 0x3e4c...   | blob_12cd...  | LOSS    | BSS: -0.015       |
| 10/26 18:00  | PHI @ BOS    | 0x99aa...   | blob_44ff...  | FORFEIT | Penalty applied   |
+-----------------------------------------------------------------------------------------+
```

### 4.4 x402 Micropayment Simulator Modal
Used during live demos to visualize machine-to-machine commerce:

```
+-----------------------------------------------------------------------------------------+
| M2M AGENT COMMERCE: x402 PROTOCOL SETTLEMENT                                            |
|-----------------------------------------------------------------------------------------|
| 1. Query:  GET /api/verdict?forecaster=0x7b2f...&category=NBA                          |
| 2. Server: HTTP 402 Payment Required (Price: 0.01 SUI | Nonce: inv_9921)                |
| 3. Client: Sui Testnet Transaction Broadcasted -> Digest: 0x88bb99cc...                 |
| 4. Status: [ Settled via Tatum RPC in 410ms ]                                           |
| 5. Output: Signed Verdict Payload Released (Cryptographic Seal: VALID)                  |
+-----------------------------------------------------------------------------------------+
```

---

## 5. UI Motion & Micro-Interactions

* **Fast Transitions (150ms ease-out):** All button hovers, modal popups, and dropdowns snap cleanly without sluggish animated delays.
* **Live Pulse Indicator:** A persistent green beacon in the footer: `● Tatum RPC: 100% Online | Walrus Mainnet: Connected`.
* **Disaster Rebuild Animation:** On `/proof`, a "Simulate Database Wipe" trigger displays an animated terminal log detailing the cold-boot scan and rapid restoration of verdicts in real time.

