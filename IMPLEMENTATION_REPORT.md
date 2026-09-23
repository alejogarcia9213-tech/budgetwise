# Google Wallet purchase suggestions — implementation report

## 1. What was implemented

- Additive **pending suggestion** model on each profile (`captureSuggestions`, `merchantCategoryRules`, `walletMethodMaps`).
- Store flag **`smartTransactionCapture`**, default **`false`**. When off, ingest is a no-op and the inbox is hidden.
- Notification **parser** (DE/EN/ES amounts, declined/refund, merchant normalize, fingerprint, last-four, currency).
- Confirm uses the existing **`addItem`** path (same merge/ledger behaviour as a manual expense).
- Settings → **Google Wallet purchase detection (Android)** with an honest explanation and a **sample** (not Google).
- Home inbox: Confirm / Edit / Not a purchase when the flag is on and items are pending.

## 2. What was not possible and why

Budget Wise in this environment is a **web PWA** (React + Vite + Zustand + IndexedDB). There is **no Android app, no Capacitor, no native module**.

- A browser cannot implement `NotificationListenerService`.
- Google Pay API is **merchant checkout**, not a personal purchase history.
- Google Wallet API is **passes**, not card-spend feeds.
- Accessibility scraping and Wallet UI scraping were rejected in the spec.

## 3. True detection source

**None on web.** Candidates can only enter via `ingestNotification()` (sample button or a future Android bridge). They are **not** read from Google.

## 4. Files added or changed

| File | Purpose |
| --- | --- |
| `src/lib/capture/types.ts` | Suggestion / mapping types |
| `src/lib/capture/parser.ts` | Notification parser |
| `src/components/capture/suggestion-inbox.tsx` | Review UI |
| `src/components/settings/wallet-capture.tsx` | Settings + sample |
| `src/lib/store.ts` | Flag, ingest, confirm/dismiss |
| `src/lib/types.ts` | Optional profile fields |
| `src/lib/i18n.ts` | Copy |
| `src/components/planner/planner-view.tsx` | Inbox |
| `src/components/settings/settings-view.tsx` | Settings panel |
| `src/lib/finance.test.ts` | Parser fixtures |
| `backups/budget-wise-pre-wallet-2026-08-26.tgz` | Pre-change checkpoint |

## 5. Schema / database

No SQL/Firebase. IndexedDB persist version **6**. New fields are optional arrays; `normalizeProfile` fills `[]`. Old backups import without those keys.

## 6. Permissions

None requested. Android `BIND_NOTIFICATION_LISTENER_SERVICE` is **not** in this web build.

## 7. Data retained

Local only, on the profile, after structured parse. No raw notification body stored. Nothing uploaded.

## 8. Tests / builds

- `npm run typecheck` — pass
- Finance + receipt + wallet parser tests — 24 pass
- Feature default off — existing flows unchanged

Native Android build: **not applicable**.

## 9. Manual Android steps still required

A future Capacitor/native shell must:

1. `NotificationListenerService` + allowlist (Wallet / bank packages).
2. In-app “Grant notification access” → system settings.
3. Bridge `title/text/package/postedAt` into `ingestNotification`.
4. Never write the ledger from the listener.

## 10. Known formats / gaps

Covered in tests: `23,90 €`, `$12.34`, `$ 45.000 COP`, declines. Real Wallet wording varies by issuer and is untested here (no device).

## 11. Rollback

- Turn the Settings switch **off** (flag false).
- Or restore `backups/budget-wise-pre-wallet-2026-08-26.tgz`.
- Accepted items stay normal expenses.

## 12. Remaining work before release

Native Android listener, package allowlist UI, real-device fixtures, Play data-safety form.
