# 🎬 AlphaAgent Demo Video Guide (Simple & Clear)

> **Video Length:** 2.5 – 3 minutes  
> **Goal:** Show judges how AlphaAgent catches sports tipster scams using plain English and live demonstrations.

---

## 📺 Screen Setup
* **Left Side (Browser):** Open `http://localhost:3000`
* **Right Side (Terminal):** Keep terminal open ready to run commands

---

## ⏱️ Video Script (Word-for-Word)

### [0:00 – 0:35] The Hook: Why 5-0 Means Nothing
* **What to show on screen:** Look at the main page, zooming in on the **Refusal Card** that says `WATCH (5-0 Refusal)`.
* **What to say:**  
  *"Every online sports tipster has the same pitch: 'I'm 5-0 this week! 100% win rate! Join my VIP group!'*  
  *Most people get scammed by this. But if you flip a coin 5 times, someone is guaranteed to get 5 Heads in a row. That's just luck, not skill.*  
  *We built **AlphaAgent** for the Tatum and Walrus hackathon. AlphaAgent is a lie detector for predictions. While ordinary websites celebrate 5-0 records, AlphaAgent's main feature is **refusing** to follow them until they prove it over real time."*

---

### [0:35 – 1:10] 1-Click Guest Mode & Pre-Game Receipts
* **What to show on screen:** Click the blue **`[⚡ Test as Guest (1-Click)]`** button. Watch the guest address appear instantly.
* **What to say:**  
  *"Judges shouldn't have to install crypto wallets or beg for test coins. With our 1-Click Guest Mode, you click one button and AlphaAgent gives you a test wallet with free gas in under a tenth of a second.*  
  *Before any game starts, forecasters must lock their prediction into our blockchain contract. Because the blockchain clock proves the exact second you submitted, nobody can claim they 'called it' after the game already started. Time-traveling is mathematically impossible."*

---

### [1:10 – 1:50] The Memory Vault & The Disaster Test
* **What to show on screen:** Click over to the `/proof` tab and hit **`[💥 Wipe Database & Rebuild from Walrus]`**.
* **What to say:**  
  *"Where does AlphaAgent store what it knows? On **Walrus Memory**. Unlike a normal database that someone can edit or erase, Walrus is permanent.*  
  *Watch this: on our Proof page, we can simulate complete disaster. We wipe our server's internal database clean. The agent wakes up with total amnesia. It connects to Walrus, reads every past game and every deleted pick, and rebuilds 100% of its history without losing a single number."*

---

### [1:50 – 2:20] Catching Blindspots & Remembering Mistakes
* **What to show on screen:** Click over to `/agent`. Show the forecaster card with the red alert that says *"Memory Recall Override: SKIP underdog picks"*.
* **What to say:**  
  *"Walrus Memory actually changes how AlphaAgent behaves in the future. If a forecaster always loses when picking big underdogs, AlphaAgent synthesizes a permanent lesson rule on Walrus.*  
  *The next time that forecaster picks an underdog, AlphaAgent remembers the lesson and automatically changes the verdict to SKIP. It protects your money from known blindspots."*

---

### [2:20 – 2:45] AI-to-AI 1-Cent Payments
* **What to show on screen:** Click **`[Purchase Verdict (0.01 SUI)]`** on the live sandbox. Watch the payment execute in the terminal.
* **What to say:**  
  *"AlphaAgent is built for the AI economy. When another AI bot wants to check if a tipster is real, it doesn't buy a monthly subscription. It pays AlphaAgent a 1-cent micropayment directly on the Sui network.*  
  *AlphaAgent verifies the payment in real time and unlocks the signed report. Pure machine-to-machine commerce."*

---

### [2:45 – 3:00] Wrap Up & The Master Proof
* **What to show on screen:** Switch to terminal and run `pnpm run prove`. Show the 12 green checkmarks.
* **What to say:**  
  *"You can test the entire project yourself with one command: `pnpm run prove`. All 12 checks pass green.*  
  *AlphaAgent: An autonomous lie detector for predictive systems. Real skill, remembered forever on Walrus."*
