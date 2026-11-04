# ⚡ AlphaAgent

> **The Lie Detector for Sports Tipsters & Prediction "Gurus"**  
> *Built for the Tatum × Walrus Total Recall Hackathon (Track 02: Smart Agents for Real Life)*

---

## 💡 What is AlphaAgent? (In Plain English)

Have you ever seen an online sports tipster or crypto trader brag:  
**"I'm 5-0 this week! 100% win rate! Join my VIP group for \$500!"**?

Most people fall for it. **AlphaAgent is an AI auditor that says: "No, you just got lucky."**

AlphaAgent is an automated due-diligence agent. Its only job is to protect people and AI agents from fake prediction experts by checking their track record with absolute mathematical honesty.

---

## 🛑 The 3 Big Lies AlphaAgent Catches

### 1. The "Lucky Streak" Trap (Why 5-0 means nothing)
* **The Scam:** If 32 people flip a coin 5 times, by pure chance, **one of them will get Heads 5 times in a row (5-0)**. That person isn't psychic—they just got lucky.
* **How AlphaAgent Fixes It:** AlphaAgent refuses to recommend anyone with fewer than 15 verified predictions. If someone is 5-0, AlphaAgent labels them **`WATCH`**, not **`FOLLOW`**, explaining: *"5 wins in a row is just coin-toss luck. Make 10 more picks before we trust you."*

### 2. The "I Delete My Losses" Trick (Selective Memory)
* **The Scam:** Tipsters post 10 picks on social media. When 4 of them lose, they quickly delete the losing posts and only brag about the 6 that won.
* **How AlphaAgent Fixes It:** Before a game starts, every pick must be time-stamped on the **Sui blockchain**. If you make a pick and try to hide it later when your team is losing, AlphaAgent marks it as a **FORFEIT** and counts it as a full loss. No deleting allowed.

### 3. The "Time-Travel" Cheat (Posting after the game started)
* **The Scam:** Claiming you predicted a team to win 10 minutes into the game after they already scored.
* **How AlphaAgent Fixes It:** Using **Tatum**, AlphaAgent checks the official clock on the Sui blockchain. If your digital receipt wasn't recorded at least 2 minutes *before* kickoff, your pick is rejected automatically.

---

## 🧠 Why Walrus Memory is the Real "Brain"

Most websites store their records in a regular private database. If things look bad, the owner can edit the database or delete it.

AlphaAgent stores its memory on **Walrus**, a decentralized, permanent storage network.
* **Every resolved game** is written to Walrus.
* **Every forfeited pick** is written to Walrus.
* **Every lesson learned** is written to Walrus.

### The Disaster Test (Deleting our own database)
To prove that Walrus is our true source of truth, we have a test where we completely wipe out our server's local database (`local-cache.json`).
* When AlphaAgent restarts with a completely blank memory, it reaches out to Walrus, reads all past records, and **rebuilds 100% of its history and scores with zero lost data**.

---

## 🚦 The 3 Simple Verdicts

Whenever AlphaAgent audits a forecaster, it gives one of three clear verdicts:

| Verdict | What It Means | When You Get It |
| :---: | :--- | :--- |
| **`FOLLOW`** | **Real Skill** | You have at least 15 verified picks, you beat the real market odds, you didn't delete any picks, and your math proves you're not just lucky. |
| **`WATCH`** | **Not Enough Proof** | You went 5-0 or 4-1, but your sample size is too small. You need more games to prove it wasn't just luck. |
| **`SKIP`** | **Losing Record or Cheating** | Your picks lose money against the closing line, you hid over 10% of your picks, or you have a proven blindspot. |

---

## 💳 Machine-to-Machine Payments (x402)

AlphaAgent isn't just for humans—it's built for other AI agents:
1. Another AI agent asks: *"Hey AlphaAgent, should I follow this forecaster?"*
2. AlphaAgent says: *"That audit costs 0.01 SUI (about 1 cent). Here is the invoice."*
3. The other AI pays 0.01 SUI on Sui testnet.
4. AlphaAgent instantly unlocks the full cryptographic audit report.

No human sign-ups, no monthly subscriptions. Just AI agents doing business with AI agents.

---

## ⚡ 1-Click Guest Mode (For Judges & Testers)

You don't need a crypto wallet, browser extension, or test coins to try AlphaAgent:
1. Start the app:
   ```bash
   pnpm dev
   ```
2. Open **`http://localhost:3000`** in your browser.
3. Click the bright blue button: **`[⚡ Test as Guest (1-Click)]`**.
4. AlphaAgent gives you a temporary guest wallet pre-loaded with free test coins in **0.1 seconds**. You can start testing immediately.

---

## 🧪 How to Verify Everything in 1 Command

Run this command in your terminal:
```bash
pnpm run prove
```

It automatically tests all 12 safety checks:
* ✅ Connects to Tatum & Sui testnet
* ✅ Writes and reads from Walrus Memory
* ✅ Refuses the 5-0 lucky streak
* ✅ Approves the 30-pick skilled veteran
* ✅ Catches deleted picks (forfeits)
* ✅ Tests the 1-cent AI-to-AI payment

**Everything passes green with 100% mathematical honesty.**
