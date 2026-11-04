# AlphaAgent: Build Plan v3

Total Recall (Tatum × Walrus) · Track 02, Smart Agents for Real Life · Sui testnet + Walrus Memory · Submit by Nov 10, 17:00 UTC (18:00 in Lagos)

## 1. The pitch, and where it can beat the field

AlphaAgent is a due-diligence agent for anyone who follows someone else’s calls. Before it trusts a forecaster, it checks three things: the picks were locked on Sui before the event, the record is complete, and the skill is distinguishable from luck. It keeps what it learns in Walrus Memory and can rebuild every reputation from that memory alone.

The real-life problem is tipster fraud: deleted losing picks, backdated screenshots, lucky streaks sold as skill. Sports is the first dataset; the engine works for any “I called it” claim.

In a quick public search I found at least six entries with the same skeleton (pick logging, Walrus, Tatum, Brier-style scoring): Previs, Receipts, RightCall, Veto, RogueTrader and MarketRecall AI, plus Anchor, which already does x402 stakes on Sui. Private repos are invisible to me, so assume more exist. You cannot win on the skeleton. Win on four things I did not see anyone lead with:

1. **Refusal as the headline.** The agent says no to a lucky 5-0 record and shows the math.
2. **Completeness proof.** The number of commits on Sui must reconcile with the records in memory, and commits that are never revealed count against the forecaster.
3. **Memory that visibly matters.** Wipe the database, restart, and the agent rebuilds every verdict from Walrus with identical results.
4. **Honesty as a feature.** Labeled fixtures, a published luck simulation, and a list of what is not solved.

## 2. Honest odds

No plan can guarantee 1st place. This one maximizes your chances by making every claim in the demo real and checkable, making the Walrus and Tatum integrations deep and visible, and landing the story in one beat: “it said no, and here is why.” Expect rivals with Move packages, test suites and MCP servers. Your edge is rigor and clarity, not feature count. Top 3 and the Walrus Memory bonus are plausible; 1st needs flawless execution and some luck. Do not budget the prize money.

The official page confirms the weights: Walrus and Tatum integration 30%, technical quality 30%, creativity 20%, presentation 20%, plus an optional social-share bonus. Each track pays $500, $300 and $200 for the top three, and the three special awards (Best Walrus Memory, Best Tatum AI Builder app, Best Use of Agent Payments) pay $500 each on top of track prizes. A realistic target is 1st in the track plus Best Walrus Memory ($1,000), along with Best Use of Agent Payments ($500) via integrated x402 ($1,500 total). The build window opened Oct 20, so rivals have a 10-day head start. Judging runs Nov 11 to 16 and winners are announced Nov 17.

## 3. What the product does

- **Judge Mode (Zero-Friction Guest Access):** A prominent button on the landing page: `[⚡ Test as Guest (1-Click)]`. It spins up an ephemeral testnet key on the backend, pre-funds it with faucet SUI, and lets a judge log a pick, evaluate credibility, and test the agent in under 30 seconds without installing any wallet extensions.
- **Forecaster** logs a pick from a wallet: event, side, probability. The pick is committed to Sui testnet before the event starts.
- **Agent** answers “should I follow this forecaster on this kind of pick?” with one of three verdicts: **FOLLOW**, **WATCH** (not enough evidence, and it says exactly what is missing) or **SKIP** (the evidence is enough and says no, or a gate failed).
- **Buyer Agent (x402 Agent Payments)** asks programmatically: *"Is forecaster 0x… reliable on NBA games?"* Sends `GET /api/verdict`, handles HTTP 402 by paying a micro-fee on Sui testnet, and receives the signed verdict bundle.
- **Auditor** opens the verify page for any address and sees the full reconciliation: Sui commits, Walrus records, recomputed score, and every gate with pass or fail.
- **Follower rules** (P2): max stake and allowed categories. Execution is paper only; see section 9.

**Monitor mode (P0 Core).** The agent watches the forecasters you follow, evaluates each new commit as it lands on Sui and logs a verdict. This is what cements AlphaAgent as a Track 02 autonomous agent rather than a Track 01 pick journal.

**Strategic Track Choice: Locked to Track 02 (Smart Agents for Real Life).** Track 01 is an overcrowded commodity trap with at least 6 clone projects logging picks. We submit under **Track 02**, framing AlphaAgent as an *autonomous due-diligence and risk auditor agent* that protects capital by learning source credibility over time. Sports betting is simply the first test dataset; the agent's core capability is evaluating whether human or machine forecasters have real skill vs. luck before taking financial action.

## 4. Architecture

- **Sui testnet:** a small Move package with one function that emits a commit event. Faucet SUI only, no real money.
- **Tatum:** every Sui read goes through one paced client (commit read-back, completeness queries, payment verification). The free tier is about 3 requests per second with no batch JSON-RPC, so cache aggressively.
- **Walrus Memory:** the system of record for episodes, lessons, statuses and the forecaster registry. The relayer that entrants’ READMEs describe is mainnet, so your memories are mainnet even while Sui is testnet. Say that plainly in the README, and confirm the rules accept the split (another entry uses the same one).
- **Backend:** TypeScript routes for baseline capture, reveal verification, resolution, scoring and verdicts. A local database is a cache only and must be disposable.
- **Frontend:** a Next.js shell generated with ai.tatum.io, three screens: Pick, Agent, Verify. The Best Tatum AI Builder award goes to the best product built primarily with ai.tatum.io. AlphaAgent’s core (Move package, engine, memory) is hand-built, so do not chase it; still generate the shell there and say so in the README.
- **Secrets:** the delegate key and Tatum key live server-side only, never in the repo.

## 5. Trust model

### 5.1 Commit, reveal, verify

1. The forecaster chooses an event, a side and a probability. The client supplies no market data.
2. The pick record is canonical JSON: event id, side, probability, category, random salt. Its SHA-256 hash is the commitment.
3. The forecaster’s wallet signs a Sui testnet transaction calling `commit(hash)`. The transaction sender is the identity, so no separate signature scheme is needed.
4. The UI sends the full record and salt to the agent. The agent reads the transaction back through Tatum, checks that the event hash and sender match and that the on-chain timestamp precedes the event start, then accepts the pick and immediately captures the current de-vigged market probability as the baseline (source and time stored). A reveal arriving more than 2 minutes after the commit timestamp is marked LATE: it is excluded from scoring and counts toward the forfeit rate. This closes a real hole in the earlier flow, where a forecaster could commit against a stale line.
5. Mismatched or late commits are rejected and logged visibly.

Move sketch (compile and test on Day 1):

```
module alphaagent::commits;
use sui::clock::Clock;
use sui::event;
public struct PickCommitted has copy, drop { forecaster: address, commit_hash: vector<u8>, committed_at_ms: u64 }
public entry fun commit(commit_hash: vector<u8>, clock: &Clock, ctx: &TxContext) {
    event::emit(PickCommitted { forecaster: ctx.sender(), commit_hash, committed_at_ms: clock.timestamp_ms() });
}
```

### 5.2 Resolution without a bypass switch

A result counts only when two independent sources agree (for example the odds provider’s scores plus a second public source). If they disagree, the pick is marked DISPUTED and excluded from scoring, with the reason shown. Voided or postponed games are excluded. There is no hidden dev toggle and no time travel. The demo uses real picks made and resolved on earlier days.

### 5.3 Completeness

Query Sui for every commit event from the forecaster’s address. Each commit must end up as resolved, disputed, voided, pending or forfeited. A commit never revealed by event start is forfeited. If more than 10% of a forecaster’s commits are forfeited, the verdict is SKIP. The verify page prints the reconciliation (for example, “22 commits on Sui, 22 accounted for”). This is the answer to selective logging and selective reveal.

### 5.4 What is not solved (put this in the README)

- One person can use many wallets and promote the lucky one. A bond or identity link is out of scope on testnet, where SUI is free.
- The agent is the trusted writer to memory. Omissions are detectable through the completeness check, but memory reads are server-mediated, not public.
- The baseline is only as trustworthy as the odds provider.
- Small samples remain noisy. That is why the engine says WATCH instead of guessing.

## 6. Scoring and decision engine

```
m = de-vigged market probability that side A wins, captured at commit time
    (two-way decimal odds: m = (1/oA) / (1/oA + 1/oB))
f = forecaster probability that side A wins
o = 1 if side A won, else 0

BS_user = (f - o)^2        BS_mkt = (m - o)^2
BSS = 1 - sum(BS_user) / sum(BS_mkt)          over resolved picks
BSS_shrunk = BSS * n / (n + k)                k = 10
```

Name it correctly: this is shrinkage toward zero skill with a fixed prior weight, not Laplace smoothing. A judge who knows statistics will notice.

FOLLOW requires all of the following:

- n ≥ 15 resolved picks.
- Information guard: the sum of BS\_mkt is at least 1.0, so the markets were uncertain enough to measure skill.
- BSS\_shrunk ≥ 0.02.
- The 80% bootstrap lower bound of raw BSS is above 0 (resample picks 2,000 times).
- Forfeited commits ≤ 10%.
- For the requested category: at least 8 resolved picks and positive BSS\_shrunk.

WATCH means evidence is insufficient, and the output states what is missing, such as “needs 9 more resolved NBA picks.” SKIP means the evidence is sufficient and negative, or the forfeit or category gate failed.

Discipline on parameters: k, the thresholds and the confidence level are chosen now and written in the README before you see cohort results. Tune only on labeled fixtures. Publish a sensitivity table (k = 5, 10, 20 against thresholds) and say honestly if any verdict flips.

Luck simulator (P1, high value): simulate 10,000 forecasters with zero true skill (forecast equals market plus noise, outcomes drawn from market probabilities), each making 5 to 40 picks. Report the share a naive rule (for example, win rate of at least 70% over 5+ picks) would follow versus the share AlphaAgent follows. Publish the measured numbers, and do not quote any figure until you have run it.

## 7. Walrus Memory design

Constraints to verify on Day 1: memory is append-only with no upsert, namespaces are flat exact-match strings, and recall is semantic similarity rather than a lookup. Design around them.

**Namespaces**

- `aa-registry`: one memory per registered forecaster.
- `aa-f-<address prefix>`: one namespace per forecaster, holding episodes, lessons and statuses.
- `aa-fixtures-<name>`: labeled synthetic scenarios, kept apart from real data and flagged on screen.

**EPISODE** (written at resolution; the Sui anchor already proves pick timing, which saves write budget):

```
EPISODE | v1 | forecaster 0x7b2…9a | category NFL | event KC vs LV | pick KC | forecast 80% | market 65% (source, de-vigged, captured 1730246400) | outcome win | commit_tx 5XyZ… | commit_ts 1730246400 | sources agree 2/2 | resolved 1730300000
```

**STATUS** (one line each for forfeited, disputed and voided commits, so a rebuild reproduces the full reconciliation; pending commits are visible on Sui):

```
STATUS | v1 | forecaster 0x7b2…9a | commit_tx 5XyZ… | state forfeited | reason never revealed by event start
```

**LESSON** (generated deterministically after every 5 resolved picks, in plain sentences with a machine-readable tail):

```
LESSON | v1 | forecaster 0x7b2…9a | category NBA | band confident (≥75%) | finding: 1 of 5 confident picks won, raw BSS -0.31 | rule: SKIP confident NBA picks until n≥8 and BSS>0
```

**Retrieval rules**

- The math always runs on records obtained by enumerating the forecaster’s namespace, so every episode is counted.
- Semantic recall is used for lessons. The agent builds a query from the upcoming pick (“0x7b2 NBA confident favorite”), cites the recalled lesson blobs and applies their rule. If recall misses, the enumeration-based gates still run, so recall can sharpen a verdict but cannot silently flip the math.
- Records are versioned (`v1`) and parsed with a strict regex. A parse failure is logged, never skipped.

**The Database Wipe Test (The Killer Walrus Proof):** Snapshot all verdicts, run `rm -rf local.db` on terminal, restart the backend server, and watch the agent query Walrus Memory on Mainnet and rebuild every forecaster verdict, lesson, and metric identically. This automated test (`pnpm test:wipe-rebuild`) is a featured sequence in the demo video. It proves Walrus Memory is the genuine, immutable system of record (not an ornamental cache), directly targeting the **Best Walrus Memory ($500)** award.

**Verdict timeline (the learning story):** write one VERDICT memory whenever a forecaster’s verdict changes (for example WATCH to SKIP after a lesson fires), with the metrics and the lessons it cites. The verify page draws the history, and the required blog post uses it to show how the agent learned over time. It is also your case for Best Walrus Memory, which rewards memories that visibly change the product.

**Write budget:** other entrants mention a Walrus Memory hourly write budget. Measure it in Spike A, use bulk writes for fixtures, and write fixtures early. The official minimum is 10 memories on Mainnet. The registry plus real episodes should clear it, and the delegate public key from the Memory dashboard is the MEMWAL\_AGENT\_ID on the submission form.

## 8. Data rules

- Version 1 covers two-way markets only (NBA and NFL moneylines). Skip soccer draws.
- Baseline sources, in order: Tatum’s prediction or data API if it covers your events, then The Odds API, then Polymarket public data. Always store which source was used.
- Check Odds API free quotas now. Historical odds are paid, so never plan on backfilling real history.
- Fixtures are generated locally, labeled SYNTHETIC in the namespace name and in the UI, and never presented as real people.

## 9. x402 Agent Payments and the execution claim

The x402 feature is AlphaAgent's paid verdict endpoint, integrated as a core capability in this phase. It enables machine-to-machine commerce where external autonomous agents (such as betting bots or risk allocators) query: `GET /api/verdict?forecaster=0x…&category=NBA` (i.e. *"Hey, is tipster 0x... reliable on NBA games?"*).

1. **Protocol Flow:**
   - The buyer agent sends a request to `/api/verdict` and receives `HTTP 402 Payment Required` along with payment metadata (seller Sui address, micro-fee amount in SUI, and payment challenge/nonce).
   - The buyer agent (`scripts/buyer-agent.ts`) executes an on-chain micropayment transaction on Sui testnet.
   - The server verifies and settles the payment transaction through Tatum.
   - Once verified, the server serves the signed payload: verdict (FOLLOW, WATCH, or SKIP), metrics, Walrus episode blob IDs, and Sui commit digests.
2. **Award Strategy:** This directly secures the **Best Use of Agent Payments ($500)** special award by demonstrating a real economic transaction between two autonomous agents unlocking verified memory data.
3. **Execution Context:** Sports bet execution is paper only (sports markets are not on Sui testnet; the agent records a signed follow intent). The paid transaction is for the *due diligence verification bundle* itself. A Move escrow that settles against the Tatum-read outcome is a P2 stretch.

## 10. Day 1 spikes (Fri Oct 30)

Each spike has a pass condition and a fallback.

- **A, Walrus:** write 30 episodes across 3 namespaces, enumerate them (the count must equal 30), recall a lesson from a paraphrased query, and measure the write rate. Fallback if enumeration is missing: a local index plus `restore()` from Walrus.
- **B, Sui commit:** publish the Move package to testnet, call it from a wallet, and read back sender, hash, timestamp and checkpoint through Tatum. Try gRPC or GraphQL first, since Sui is moving away from JSON-RPC. Fallback: public fullnode reads, disclosed (this lowers your Tatum score).
- **C, Data:** pull one live moneyline and de-vig it; pull one finished game’s result from two sources.
- **D, x402:** validate the buyer-seller testnet micropayment loop (`scripts/buyer-agent.ts` -> HTTP 402 -> Sui payment -> Tatum verification -> signed verdict bundle returned).
- **E, Rules and accounts:** ask on Tatum’s Discord whether Sui testnet is accepted for the Tatum RPC criterion and for x402 payments settled on Sui; create a Tatum API key and note the dashboard account id; create a Walrus Memory agent in the dashboard (its delegate public key is the MEMWAL\_AGENT\_ID on the form); get faucet SUI for five testnet wallets.

## 11. Schedule (12 calendar days)

- **Fri Oct 30:** Spikes A to E. Repo and CI set up.
- **Sat Oct 31:** UI shell from ai.tatum.io. Commit flow end to end. Onboard five friends with wallets and ask each for three real picks a day. First picks logged tonight.
- **Sun Nov 1:** Baseline capture and de-vig. Resolution engine with two-source agreement. Episode writer and registry. Implement Judge Mode (`[⚡ Test as Guest (1-Click)]`).
- **Mon Nov 2:** Scoring, gates, verdicts, strict parser, unit tests (include the 5-0 case failing and a clean 30-pick case).
- **Tue Nov 3:** **SCOPE FREEZE MILESTONE (Narrow Slice End-to-End Complete).** The core loop is running: **Commit → Resolve → Walrus Episode → Verdict → x402 Paid Settlement**. The Database Wipe Test (`rm -rf local.db` -> rebuild from Walrus) passes. From this point forward, no new fundamental architectural scope is added.
- **Wed Nov 4:** Verify page completeness reconciliation, lessons recall, and labeled fixtures.
- **Thu Nov 5:** Luck simulator, sensitivity table, and polish x402 buyer agent script (`scripts/buyer-agent.ts`).
- **Fri Nov 6:** Hardening, caching, production deployment. Verify Mainnet Walrus count is well above 10.
- **Sat Nov 7:** Final documentation freeze: README, architecture diagram, and required submission blog post drafted.
- **Sun Nov 8:** Video production day: shoot the 2.5-minute demo video designed to hit judges like a freight train in the first 30 seconds.
- **Mon Nov 9:** Full submission dry run. Submit early tonight.
- **Tue Nov 10:** Buffer only. Submission closes 17:00 UTC (18:00 in Lagos).

Priorities. **P0 (Must ship by Nov 3):** commit and anchor, resolution, episodes in Walrus, scoring and verdicts, x402 Agent Payments, Judge Mode 1-click access, rebuild test. **P1:** lessons, luck simulator, verify reconciliation page. **P2:** follower rules, escrow, MCP. Cut from the bottom, never touch P0.

## 12. Demo script (2:30) — "Hits like a freight train"

1. **0:00 (The Punch):** No pleasantries. Instantly show a social tipster with a 5-0 record: *"Every betting app on the internet says follow this guy. AlphaAgent says NO. Here is why."* (5 seconds on luck vs skill).
2. **0:15 (Zero-Friction Judge Mode):** Click `[⚡ Test as Guest (1-Click)]`. Zero wallet setup, instant ephemeral Sui testnet address funded, commit signed and read back via Tatum RPC.
3. **0:35 (Resolution & Mainnet Walrus Anchor):** Two external sports oracles agree on the game score. The episode is written to Walrus Memory on Mainnet with its permanent blob ID.
4. **0:55 (The Decision Engine):** Explain why 5-0 failed the Brier score information guard and shrinkage formula (verdict: WATCH, with missing criteria displayed). Contrast with a proven pro: FOLLOW.
5. **1:30 (The Killer Walrus Proof — Database Wipe Test):** Split screen terminal: run `rm -rf local.db`, reboot the server. AlphaAgent queries Walrus Memory on Mainnet and rebuilds 100% of forecaster reputations and lessons with zero data loss.
6. **2:00 (Live x402 Micropayment):** A second autonomous buyer bot calls `GET /api/verdict`, handles `HTTP 402`, settles micro-SUI on testnet, and receives the cryptographically signed verdict bundle.
7. **2:20 (The Close):** Pan over the audit verify page showing 100% commit reconciliation, and the list of unsolved problems. End with repo and live link.

Show the real cohort verdicts as they are, whatever they are. A real WATCH or SKIP on live data is a feature.

## 13. Deliverables checklist

- Public GitHub repo with a README covering the problem, architecture, trust model, scoring (with the shrinkage naming), the not-solved list, setup, and the testnet and mainnet split.
- Published blog post (required): what it does, how it uses Tatum and Walrus, and how it learned over time. Draw the last part from the verdict timeline.
- Demo video within the stated length limit.
- Deployed app link, the Tatum dashboard account id and the MEMWAL\_AGENT\_ID the form requests. Keep the app, keys and repo alive through judging (Nov 11 to 16).
- Evidence section: blob ids, Sui digests, the simulator output and the sensitivity table.
- Optional social post tagging @Tatum\_io and @WalrusFoundation.

## 14. Risks

- **Enumeration unavailable or limited:** local index plus `restore()`. Decide on Day 1.
- **Write budget throttling:** bulk writes, early fixtures, no write loops.
- **Tatum rate limits:** one paced, cached client; log usage.
- **Cohort too thin:** more picks per day, more friends, fixtures labeled as such.
- **x402 payment latency / faucet issues:** maintain pre-funded testnet wallets and fall back to direct Tatum tx-hash confirmation if facilitator latency occurs.
- **Scope creep:** the P0 list is the contract; anything else needs a P0 slot freed first.
- **Rules differ from assumptions:** the Day 1 read of the official page overrides this plan.

## 15. Judge Q&A, prepared answers

- **“Why not a database?”** The database is a cache. Delete it and the agent rebuilds all verdicts from Walrus. Lessons are recalled semantically and change decisions.
- **“Why trust the agent?”** You do not have to: every episode cites a Sui digest, and the completeness check reconciles commits on Sui against records in memory.
- **“Isn’t the shrinkage tuned?”** Parameters were fixed before cohort data, tuned only on labeled fixtures, and the sensitivity table shows what flips.
- **“Where is real execution?”** Paper by design, because sports markets are not on Sui testnet. The deliverable is the trust decision and its proof.
- **“Sybil?”** Not solved, and listed as such. A bond or identity link is the next step on mainnet.

## 16. Unverified assumptions to check on Day 1

Still unverified: whether Sui testnet is accepted for the Tatum RPC criterion and for Agent Payments settled on Sui (ask on Discord); namespace and enumeration behavior; write limits; Tatum’s testnet gRPC or GraphQL availability; an x402 facilitator on Sui; Odds API quotas. Confirmed from the official page: the judging weights, the prizes, that special awards stack on track prizes, the 10-memory Mainnet minimum, the required blog post, and the MEMWAL\_AGENT\_ID and Tatum account id fields on the form.

## 17. Upgrades for a top-1 attempt

These target the 60% of the score on integration and technical quality, and the 20% on presentation. More features alone do not raise your odds, so each upgrade is either under a day of work or replaces something.

| Upgrade | What it changes | Effort | Priority |
| --- | --- | --- | --- |
| Judge mode (no wallet) | Judges can use the app in 60 seconds without a wallet or testnet SUI | 0.5 day | P0 |
| Proof page and one-command proof | Blob ids, Sui digests, memory count and rebuild result in one place | 0.5 day | P0 |
| Reflexive audit | The agent commits its own verdicts on Sui and later scores them | 1 day | P1, high value |
| Closing line value (CLV) | A second skill signal that needs far fewer picks than outcomes | 0.5 day | P1 |
| Ask the agent | Chat answers that cite memory blob ids | 0.5 day | P1 |
| Calibration chart and Luck Lab | Per-forecaster reliability diagram; interactive slider page | 1 day | P1 |
| Wider cohort | 15 to 20 forecasters instead of 5, recruited from Discord | 1 hour a day | P1 |
| MCP tool | Verdicts callable from Claude or Codex; can be the paid x402 resource | 0.5 day | P2 |
| Build in public | Four posts and Discord presence | 1 hour a day | P1 |

**Judge mode.** Judges will not install a Sui wallet. Add a guest button that creates a throwaway keypair in the browser, has your server fund it with a few testnet SUI, and submits the commit through Tatum if the gateway allows execution. Seed the guest view with the real cohort so the site is never empty during judging (Nov 11 to 16).

**Proof page.** A /proof route lists every blob id, Sui digest, the live count of Mainnet memories, the latest rebuild result and the luck-simulator output. `pnpm prove` prints the same and exits non-zero on failure. Several rivals already ship checks like this, so treat it as table stakes.

**Reflexive audit (your creative centerpiece).** Every FOLLOW or SKIP is a prediction that the forecaster’s next picks will or will not beat the market. Commit a hash of each verdict on Sui before those picks happen, score the verdicts when they resolve, and write VERDICT\_REVIEW memories. Report the agent’s own hit rate with its sample size, even if small or poor. The tagline writes itself: verify the forecaster, then verify the verifier. Be honest in 12 days: you will have a handful of reviewed verdicts, so present them as early evidence, not proof.

**Closing line value.** Capture a second market snapshot at event start. For each pick, CLV = (closing probability minus commit-time probability) × direction, where direction is +1 if the forecaster’s probability was above the market and −1 if below. Consistently positive CLV is the standard skill signal among sharp bettors and it converges in far fewer picks than outcomes do. Use it in WATCH messages (for example, “12 picks, CLV positive on 9, too few outcomes yet”) and as a corroboration gate for FOLLOW (mean CLV ≥ 0). Fixtures need CLV values too.

**Ask the agent.** A chat box: “Why did you skip this forecaster on NBA?” Use the Walrus Memory SDK’s ask feature if your version has it, or recall plus your own prompt. Pass the verdict fields as context and require every claim to cite a blob id. The verdict stays deterministic; the model only explains. This shows semantic memory doing real work, which the 30% integration score rewards.

**Calibration chart and Luck Lab.** Show a reliability diagram per forecaster on the verify page: stated probability bins against observed frequency. Luck Lab lets a visitor set the number of picks and the hit rate, then shows the verdict that record would get and how often zero-skill forecasters in your simulator match it. Interactive pages hold a judge’s attention better than screenshots.

**Wider cohort.** Other Total Recall builders already have wallets and are in Discord. Ask them to log picks. More forecasters means real variety (some lucky, some skilled), more memories and more visibility for your project.

**Build in public.** Post on day 1 (spike results), day 4 (first real picks), day 8 (the 5-0 refusal clip) and submission day, tagging @Tatum\_io and @WalrusFoundation. Ask your questions in Discord where judges can see how you build.

**Schedule changes.** Judge mode and the proof page go in with the commit flow on Nov 1 to 2. Core slice and scope freeze lock on Nov 3. If you are behind on Nov 3, cut in this order: MCP, Luck Lab, Ask, CLV. Never cut Judge Mode, the proof page, the rebuild test, or x402 Agent Payments.

**Thin vertical slice by Nov 3.** Before deepening anything, have commit, resolve, episode, verdict and verify page working end to end with real picks by the evening of Nov 3. A finished narrow project beats an unfinished deep one.

**Presentation.** Open the video with the refusal, not the problem: “This forecaster went 5-0. The agent said no.” Then explain why. Add captions, put the repo and blog links on the last frame, and record a second take after your final data. Illustrate the blog post with three visuals: the architecture, the verdict timeline and the luck-simulator result.
