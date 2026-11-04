# AlphaAgent UI: context for the coding agent

Read this first. Build the frontend exactly as described. Do not add features that are not listed here.

## What the product is
AlphaAgent is a due-diligence tool for people who follow sports tipsters. It checks that picks were locked on Sui before kickoff, that no bets were hidden, and that a record is long enough to separate skill from luck. It then gives one of three verdicts: FOLLOW, WATCH or SKIP.

Hackathon: Total Recall (Tatum x Walrus), Track 02. Sui runs on **testnet**. Walrus Memory writes go to **mainnet**. Say both plainly in the UI footer and README.

## Stack
- Next.js (App Router) + TypeScript. Plain CSS using `app/design-tokens.css`. No UI kit, no animation library.
- Wallet: Sui wallet standard via `@mysten/dapp-kit`. Guest mode creates a throwaway keypair in the browser.
- All Sui reads go through Tatum. Walrus Memory through its official SDK (check docs.wal.app/walrus-memory for the current package and API).
- The UI never holds secrets. Tatum key and Walrus delegate key stay server-side in route handlers.

## Routes
| Route | Page title | Job |
| --- | --- | --- |
| `/` | Home | One-line promise, two example verdict cards, three-step explainer, two buttons |
| `/pick` | Log pick | Choose side, set confidence, lock on Sui, show the receipt |
| `/tipsters` | Tipsters | Table of all tipsters with verdict and one-line reason; filter by verdict |
| `/check` | Check a tipster | Paste an address, see verdict, four numbers, why, and picks |
| `/memory` | Memory check | Erase local copy and rebuild from Walrus; show a step log |
| `/luck-lab` | Luck Lab | Two sliders; compare a simple rule against AlphaAgent |

Top nav on every page: brand, the six links (active one underlined), and a pill button "Try as guest, free testnet gas". Under the nav, a thin note: "Sui testnet. Sample data for design only, not real tipsters." Show it whenever any sample or synthetic data is on screen.

## Plain-English vocabulary (use the left column in the UI only)
| UI word | Internal term |
| --- | --- |
| Tipster | forecaster |
| Skill (shown as +5.9%) | shrunk Brier Skill Score vs market |
| Beginner’s luck penalty | shrinkage, `n / (n + k)`, k = 10 |
| Luck check | 80% bootstrap lower bound of raw BSS |
| Pre-kickoff stamp | commit transaction on Sui |
| Hidden bets | forfeited commits (locked, never revealed) |
| Permanent memory | Walrus Memory |
| Unlock report | x402 paid verdict endpoint (only if the spike passes; otherwise omit) |

Never show: BSS, Brier, shrinkage, bootstrap, hash, relayer, blob, x402. Technical detail may appear in a collapsed "Technical details" section.

## Verdicts and copy
- **FOLLOW** (blue badge): "Enough verified picks and a real edge."
- **WATCH** (amber badge): "Needs N more verified picks." Always say exactly what is missing.
- **SKIP** (red badge): give the specific reason, for example "Over 10% of locked picks never revealed" or "Strong in NFL, only 3 NBA picks."

FOLLOW requires all of: at least 15 verified picks, enough market uncertainty to measure skill, skill after the luck penalty of at least 2%, luck check passed, hidden bets at most 10%, and for the requested category at least 8 picks with positive skill. The verdict is computed by the backend. The UI only displays `Verdict`, `reason` and the gate list. Never recompute it in the browser, except the Luck Lab, which uses a labeled illustration.

## Design rules
- White ground, one blue accent, one system font. Tokens in `app/design-tokens.css`. No gradients, emoji or decorative icons.
- Badges always carry a text label. Never rely on color alone.
- Touch targets at least 44px. Text contrast at least 4.5:1. Real `<button>`, `<a>`, `<input>` with labels. Visible focus ring.
- Pages work at phone width: nav wraps, tables scroll inside their own container.
- Keep copy short and plain. No jargon in headings.

## States every page needs
- Loading: a simple text skeleton, not a spinner.
- Empty: say what to do next ("No picks yet. Log your first pick.").
- Error: say what failed and offer retry. For Tatum or Walrus errors show "Couldn’t reach Sui" or "Couldn’t reach memory" plus retry.
- Guest: after "Try as guest", the pill shows a short address and "0.05 SUI testnet".

## Data rules
- Anything synthetic carries `isSample: true` and shows a "Sample" tag next to the name. Never present synthetic tipsters as real people.
- Show numbers exactly as the backend returns them. No invented stats, no lorem ipsum.
- Types live in `lib/types.ts`. Do not widen them without asking.

## Page notes
- **/pick:** two side buttons, a probability slider (1 to 99) with a live line "The market says X%. You are Y points more confident." One button: "Lock pick on Sui testnet". Progress states: Locking, Confirming, Done. On success show the receipt card: matchup, side and chance, locked time, transaction id with explorer link, fingerprint. Explain that details stay private until revealed, and an unrevealed pick shows as a hidden bet. Reject picks after kickoff with a clear message.
- **/tipsters:** columns Tipster, Picks, Skill, Hidden bets, Verdict, Why. Filter buttons show counts. Rows link to `/check?address=...`.
- **/check:** search box, verdict header, four stat cards (Locked on Sui, Saved in memory, Hidden bets, Skill grade), "Why this verdict" gate table, picks table. If locked picks and saved picks differ, show a visible warning.
- **/memory:** three stat cards, one button "Erase local copy and rebuild", then a step log (Local copy erased, Registry read from Walrus, Records restored, Verdicts compared). The final line must show whether verdicts are identical. Never fake the result.
- **/luck-lab:** sliders for picks made (3 to 40) and share won (50% to 100%). Two cards: "Simple rule" (follow anyone who wins 70% or more over 5+ picks) and "AlphaAgent" (needs 15 verified picks). Include the coin-flip line: a 5-0 record is 1 in 32 if every game is a coin flip. Label the page "Illustration".

## Build order
1. Shared layout, nav, tokens, testnet note.
2. `/tipsters` and `/check` with mocked data matching `lib/types.ts`.
3. `/pick` with the real Sui commit flow.
4. `/memory`.
5. `/` and `/luck-lab`.
6. Guest mode.

Acceptance: each page renders with mocked data, passes keyboard-only use, and shows loading, empty and error states.

## Reference
The visual design lives in the Design canvas: https://claude.ai/artifact/TeXP6tTUnKXyv4vnWed4dt (six screens). If the canvas and this file disagree, this file wins.

## Repo layout (already built)
- `app/`: routes and global CSS. `components/`: Nav, guest context, small UI parts. `lib/types.ts`: data types. `lib/data.ts`: sample data. `lib/api.ts`: the only place that talks to data, currently mocked. Replace its functions with real Tatum and Walrus adapters, keeping the signatures.
- Run with `npm install` then `npm run dev`.
