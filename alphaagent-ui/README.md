# AlphaAgent UI

Next.js (App Router, TypeScript) frontend for AlphaAgent. Read `CLAUDE.md` for the product spec and design rules.

```
npm install
npm run dev
```

## What is real and what is mocked
Everything is mocked. `lib/api.ts` returns sample data from `lib/data.ts` with short delays. Nothing talks to Sui, Tatum or Walrus yet. "Try as guest" only creates a random local address: it is not funded and signs nothing.

To go live, replace the functions in `lib/api.ts` (keep the signatures): `listTipsters`, `getReport`, `lockPick`, `getMemoryStats`, `rebuildFromMemory`. Keep API keys in server route handlers, see `.env.example`.
