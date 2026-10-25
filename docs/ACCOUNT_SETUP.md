# NutriPlay Accounts: Local Setup and Deployment Limits

## Configure local development

1. Copy `.env.example` to `.env.local`.
2. Generate a session signing secret from PowerShell:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

   Put the generated value in `NUTRIPLAY_SESSION_SECRET`. It must be at least 32 bytes; do not commit it or expose it to browser code. Changing it invalidates all existing sessions.
3. Optionally set `NUTRIPLAY_DATA_DIR` to an absolute, private, writable directory outside the public web root. The default is `.nutriplay-data` in the repository root and is git-ignored.
4. Run `npm run dev` and open `http://localhost:3000`.

Create an account, save the athlete profile, and enter the current session. Sign in again to load the account-linked profile. The profile editor shows its last update time. The weather key remains optional; when live weather is unavailable, NutriPlay identifies its climatological estimate.

## Storage and security model

The current app had no authentication provider or database. This implementation uses Node's built-in scrypt password hashing, a server-side JSON store, signed `HttpOnly`/`SameSite=Lax` cookies, seven-day expiring sessions with server-side revocation, same-origin checks for mutations, and account ownership derived from the verified session. Account credentials, profiles, and sessions are stored as separate records. The data file is never served as a public asset.

## Important deployment limitation

This file-backed store is intended for local development or a trusted, single-instance deployment with a durable private filesystem. It does not provide cross-process write locking, encrypted-at-rest profile data, backup/restore operations, authentication rate limiting, or a shared store for serverless/multi-instance hosting. Filesystem permission modes are best-effort and Windows access control lists still need to be configured for the service account. **Do not treat this implementation as production-ready for sensitive athlete data or expose it to an untrusted public deployment.**

Before production use, move account/profile/session records to a managed persistent database and established authentication/session infrastructure, with encryption at rest, transactional ownership constraints, rate limiting, operational backups, and deployment-specific security review. Keep `NUTRIPLAY_SESSION_SECRET` in the deployment secret manager and mount `NUTRIPLAY_DATA_DIR` only if using the current single-instance store.

## Calculation limitations shown in the app

- Biological sex is required by the current Mifflin–St Jeor and ICMR reference implementation; NutriPlay does not infer it.
- Unlisted sports use an explicitly labelled generic estimate, not a sport-specific model.
- Match/competition/recovery distinctions and the selected start time are recorded, but existing calculations use duration and intensity and do not apply type-specific or clock-time adjustments.
- The food dataset filters known allergy and dietary tags but cannot verify undeclared ingredients or cross-contact. Verify food packaging and preparation, especially for allergies and vegan diets.
- Historical plans are not stored. Future calculations load the latest profile, and older outputs are not rewritten.
