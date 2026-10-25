# NutriPlay Project Status

## Current phase

Phase 5 — Account-based athlete workflow implemented and verified for the current single-instance file-backed deployment path.

## Implementation and verification

- Added email/password registration and sign-in, scrypt password hashes, signed expiring HttpOnly sessions, server-side session revocation, and same-origin checks. Authentication is **not production-ready**: see [Account setup and deployment limits](./docs/ACCOUNT_SETUP.md).
- Added persistent account-linked athlete profiles, ownership-derived profile reads/writes, onboarding, profile editing, and timestamped updates.
- Replaced the four-preset-only entry flow with account and profile onboarding plus session-only plan inputs. The existing demo presets remain in the repository.
- Connected authenticated session data and saved profile values to the existing energy, meal, hydration, weather, and safety engines. Unknown sports use an explicit generic fallback; vegan filtering and input/data-limit warnings were added.
- Verified: baseline suite passed (54 tests); final full suite passed (63 tests across 13 files); `npm run typecheck` passed; `npm run build` passed; a live production-server HTTP smoke test completed registration, profile save/reload, custom-sport plan generation with saved profile weight, and session revocation on logout.
- Browser review opened the auth page and exposed/fixed a hook-order error. The browser-control client disconnected before a complete interactive UI walkthrough; the route-level authenticated workflow integration test and live production HTTP flow passed.
- Standalone `npm run lint` is blocked because the repository has no ESLint configuration and `next lint` opens an interactive setup prompt. The production build completed Next.js's built-in lint/type validity step.

## Changed files and rationale

- `.env.example`, `.gitignore`, `docs/ACCOUNT_SETUP.md` — session secret, private data path, ignored local records, setup and deployment boundaries.
- `app/page.tsx`, `components/account/AccountWorkflow.tsx` — account, onboarding, profile-management, session forms, and existing plan dashboard integration.
- `app/api/auth/route.ts`, `app/api/profile/route.ts`, `app/api/plan/route.ts` — authentication, account-owned profile access, and authenticated plan generation.
- `lib/auth/accountStore.ts`, `lib/auth/http.ts` — persistent records, password hashing, sessions, and request identity.
- `lib/types/athlete.ts`, `lib/types/food.ts`, `lib/validation/athleteSchema.ts`, `data/reference/sportsData.ts`, `lib/nutrition/energyEngine.ts`, `lib/nutrition/nutrientEngine.ts`, `lib/nutrition/dietaryEngine.ts`, `lib/recommendations/recommendationService.ts`, `components/dashboard/AthleteSummaryCard.tsx` — profile/session model, dynamic-sport fallback, vegan tag filtering, and explicit assumptions.
- `tests/unit/accountStore.test.ts`, `tests/unit/athleteValidation.test.ts`, `tests/unit/dietaryFilter.test.ts`, `tests/unit/energyEngine.test.ts` — account isolation, persistence, extensible sport validation, vegan filtering, and fallback calculation coverage.
- `docs/PROGRESS.md` — chronological implementation and verification record.

Existing uncommitted edits in `README.md` and the pre-existing academic documentation files are preserved and were not intentionally changed by this implementation.

## Environment and setup

Set `NUTRIPLAY_SESSION_SECRET` to a generated random value of at least 32 bytes. Optionally set `NUTRIPLAY_DATA_DIR` to a private durable absolute directory. See [Account setup and deployment limits](./docs/ACCOUNT_SETUP.md) and `.env.example`.

## Remaining work / known limitations

- Complete the full test run, production build, and manual registration → onboarding → sign-out/sign-in → profile edit → plan flow.
- File storage is single-instance and does not encrypt profile data at rest, lock across processes, rate-limit login attempts, or provide operational backups.
- Weather for non-current training dates is not forecast; match/recovery and clock-time inputs do not currently modify calculation formulas. The app surfaces these constraints rather than inventing multipliers.
- The current calculation method requires an explicit male/female input for its sex-specific equations/references; it cannot calculate an individualized estimate when that input is unavailable.
- Food tags cannot certify ingredients or cross-contact; no historical plan store was added.

## Exact next task

For public production use, replace the local JSON store with managed transactional persistence/auth infrastructure, configure encryption, rate limits, backups, and conduct a security review. Until then, keep this implementation on a trusted single-instance deployment only. The remaining calculation limitations are documented in [Account setup and deployment limits](./docs/ACCOUNT_SETUP.md).
