# NutriPlay Project Status

## Current phase

Phase 5 — Account-based athlete workflow implemented; final verification and hardening in progress.

## Implementation and verification

- Added email/password registration and sign-in, scrypt password hashes, signed expiring HttpOnly sessions, server-side session revocation, and same-origin checks. Authentication is **not production-ready**: see [Account setup and deployment limits](./docs/ACCOUNT_SETUP.md).
- Added persistent account-linked athlete profiles, ownership-derived profile reads/writes, onboarding, profile editing, and timestamped updates.
- Replaced the four-preset-only entry flow with account and profile onboarding plus session-only plan inputs. The existing demo presets remain in the repository.
- Connected authenticated session data and saved profile values to the existing energy, meal, hydration, weather, and safety engines. Unknown sports use an explicit generic fallback; vegan filtering and input/data-limit warnings were added.
- Verified: baseline tests before implementation passed (54 tests); isolated account-store tests passed (4 tests); post-change `npm run typecheck` passed; the full post-change suite passed (61 tests across 12 files). Production build, lint, and interactive browser flow have not yet been verified.

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

Run lint and production build, then exercise the authenticated browser flow with a temporary local data directory and secret. Update this file and `docs/PROGRESS.md` with the actual outcomes before committing only feature-owned files.
