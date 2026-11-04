// Rebuild of the live app's stylesheet (src/server.ts renderPageLayout),
// scoped under .aa. Brand tokens applied (Sui Alpha Blue accent, 12px radius,
// Inter + JetBrains Mono). `.aa.m` reproduces the app's own ≤640px media rules.
export const APP_CSS = `
.aa{--ink:#0f172a;--muted:#4b5563;--line:#e5e7eb;--line-strong:#9ca3af;--bg:#ffffff;--panel:#f3f4f6;
--accent:#0b4f9c;--accent-ink:#ffffff;--follow-bg:#e3effc;--follow-ink:#0b4f9c;--watch-bg:#fdf0d5;--watch-ink:#b45309;
--skip-bg:#fbe4e4;--skip-ink:#dc2626;--radius:12px;--radius-sm:8px;--tap:44px;
--font:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;--mono:'JetBrains Mono',ui-monospace,monospace;
font:15px/1.55 var(--font);color:var(--ink);background:var(--bg);position:relative;overflow:hidden;width:100%;height:100%;
-webkit-font-smoothing:antialiased;}
.aa *{box-sizing:border-box;}
.aa a{color:var(--accent);text-decoration:none;}
.aa .mono{font-family:var(--mono);}
.aa .nav{flex-shrink:0;display:flex;align-items:center;gap:16px;padding:12px 28px;border-bottom:1px solid var(--line);background:var(--bg);position:relative;z-index:5;box-shadow:0 1px 3px rgba(0,0,0,0.02);}
.aa .nav-brand-wrap{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.aa .brand{font-size:18px;font-weight:800;letter-spacing:-0.02em;color:var(--ink);white-space:nowrap;}
.aa .nav-net-badge{font-size:11px;background:#eff6ff;color:#0b4f9c;border:1px solid #bfdbfe;border-radius:999px;padding:2px 8px;font-weight:600;white-space:nowrap;}
.aa .nav-links-wrap{display:flex;align-items:center;flex:1 1 auto;min-width:0;overflow:hidden;}
.aa .nav-links{display:flex;align-items:center;gap:16px;padding:2px 0;}
.aa .nav-links span{color:var(--muted);padding:6px 2px;border-bottom:2px solid transparent;font-weight:500;font-size:14px;white-space:nowrap;flex-shrink:0;}
.aa .nav-links span.on{color:var(--ink);border-bottom-color:var(--accent);font-weight:600;}
.aa .nav-wallet{margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;}
.aa .pill{position:relative;border:1px solid var(--line-strong);border-radius:999px;padding:8px 14px;font-size:13px;background:var(--bg);color:var(--ink);min-height:38px;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;gap:8px;}
.aa .note{background:var(--panel);font-size:13px;padding:8px 28px;color:#374151;border-bottom:1px solid var(--line);white-space:nowrap;overflow:hidden;}
.aa .wrap{max-width:1080px;width:100%;margin:0 auto;padding:32px 24px;}
.aa .foot{max-width:1080px;margin:0 auto;padding:20px 24px 44px;color:var(--muted);font-size:13px;text-align:center;}
.aa h1{font-size:34px;line-height:1.25;margin:0 0 10px;letter-spacing:-0.015em;font-weight:700;}
.aa h2{font-size:20px;line-height:1.35;margin:0 0 10px;font-weight:700;}
.aa .mut{color:var(--muted);} .aa .small{font-size:14px;} .aa .flush{margin:0;}
.aa .lead{max-width:640px;margin:0 0 20px;font-size:15px;line-height:1.6;}
.aa .big{font-size:28px;font-weight:700;margin:0;}
.aa .stack{margin-top:28px;}
.aa .card{position:relative;border:1px solid var(--line);border-radius:var(--radius);padding:20px;background:var(--bg);}
.aa .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:16px;width:100%;}
.aa .row>*{min-width:0;}
.aa .btn,.aa .btn2{position:relative;border-radius:var(--radius-sm);padding:11px 18px;font:inherit;min-height:var(--tap);display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;gap:8px;}
.aa .btn{background:var(--accent);color:var(--accent-ink);border:1px solid var(--accent);font-weight:500;}
.aa .btn2{background:var(--bg);color:var(--ink);border:1px solid var(--line-strong);}
.aa .actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;align-items:center;}
.aa .link{color:var(--accent);text-decoration:underline;}
.aa .b{display:inline-block;border-radius:6px;padding:2px 10px;font-size:13px;font-weight:600;white-space:nowrap;}
.aa .f{background:var(--follow-bg);color:var(--follow-ink);} .aa .w{background:var(--watch-bg);color:var(--watch-ink);}
.aa .s{background:var(--skip-bg);color:var(--skip-ink);} .aa .n{background:#e5e7eb;color:#1f2937;}
.aa .scroll{overflow:hidden;width:100%;border-radius:var(--radius-sm);}
.aa .t{width:100%;border-collapse:collapse;text-align:left;}
.aa .t td,.aa .t th{padding:10px 10px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:middle;}
.aa .t th{font-weight:600;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;}
.aa .search{display:flex;gap:8px;width:100%;}
.aa .input{position:relative;flex:1 1 240px;min-width:0;padding:11px 14px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);min-height:var(--tap);background:#fff;white-space:nowrap;overflow:hidden;display:flex;align-items:center;}
.aa .input.focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(11,79,156,.18);}
.aa .ph{color:#9ca3af;}
.aa .sides{display:flex;gap:12px;margin-bottom:20px;width:100%;}
.aa .sides .btn,.aa .sides .btn2{flex:1 1 50%;}
.aa .warn{background:var(--watch-bg);color:var(--watch-ink);border-radius:var(--radius-sm);padding:10px 14px;margin:16px 0;}
.aa .overlay{position:absolute;inset:0;background:rgba(15,23,42,0.6);display:flex;align-items:center;justify-content:center;padding:16px;z-index:20;}
.aa .modal-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:24px;max-width:500px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);}
.aa .label{font-size:13px;font-weight:600;display:block;margin-bottom:6px;}
.aa .field{position:relative;width:100%;padding:10px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:space-between;min-height:44px;background:#fff;}
.aa .field.focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(11,79,156,.18);}
@keyframes none{}
/* ── mobile: the app's own @media (max-width:960px) + (max-width:640px) rules ── */
.aa.m .nav{flex-wrap:wrap;padding:8px 12px;gap:10px;}
.aa.m .nav-links-wrap{order:3;width:100%;border-top:1px solid var(--line);padding-top:8px;margin-top:2px;}
.aa.m .nav-net-badge{display:none;}
.aa.m .pill{padding:6px 10px;font-size:12px;min-height:36px;}
.aa.m .wallet-badge-note{display:none;}
.aa.m .note{padding:8px 14px;font-size:12px;}
.aa.m .wrap{padding:20px 14px;}
.aa.m .card{padding:16px 14px;}
.aa.m .row{gap:12px;grid-template-columns:1fr;}
.aa.m h1{font-size:26px;}
.aa.m h2{font-size:18px;}
.aa.m .big{font-size:24px;}
.aa.m .search{flex-wrap:wrap;}
.aa.m .search .input,.aa.m .search .btn{flex:1 1 100%;width:100%;}
.aa.m .actions .btn,.aa.m .actions .btn2{flex:1 1 130px;}
.aa.m .sides{gap:8px;}
.aa.m .overlay{padding:8px;align-items:flex-end;}
.aa.m .modal-card{padding:18px 14px;border-radius:12px 12px 0 0;}
`;
