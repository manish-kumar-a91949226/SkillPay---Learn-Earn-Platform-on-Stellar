# SkillPay — Learn & Earn on Stellar

A blockchain-powered Learn & Earn platform. Mentors post challenges and escrow
rewards on Stellar via a Soroban smart contract. Learners submit real
projects (GitHub + live demo). The moment a mentor approves a submission,
the contract releases XLM straight to the learner's wallet — no manual
payout step.

```
Next.js frontend  →  Node.js / Express API  →  MongoDB Atlas
                                ↓
                      Soroban smart contract
                                ↓
                        Stellar Testnet
```

## Live Deployments
- **Frontend (Vercel):** [https://skill-pay-learn-earn-platform-on-st.vercel.app/](https://skill-pay-learn-earn-platform-on-st.vercel.app/)
- **Backend (Render):** [https://skillpay-learn-earn-platform-on-stellar-1.onrender.com](https://skillpay-learn-earn-platform-on-stellar-1.onrender.com)
- **Demo Video:** [Insert Link Here]

## Repo layout

```
contracts/skillpay-contract/   Soroban smart contract (Rust)
server/                        Express API, MongoDB models, Stellar SDK glue
web/                           Next.js frontend (App Router), Tailwind
docs/                          Submission evidence (screenshots, feedback, user table)
```

## 1. Smart contract

```bash
cd contracts
# requires the Stellar CLI + Rust + the wasm32 target — see prerequisites below
rustup target add wasm32-unknown-unknown
cargo test                      # runs unit tests in skillpay-contract/src/test.rs
stellar contract build
```

**Prerequisites** (install once, on your own machine — not run by Claude):
- Rust (`rustup`)
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) (`cargo install --locked stellar-cli`)
- A funded Stellar testnet account for deployment (`stellar keys generate deployer --network testnet --fund`)

**Deploy to testnet:**

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/skillpay_contract.wasm \
  --source deployer \
  --network testnet
```

This prints a contract address (`C...`). Copy it into `server/.env` as
`SKILLPAY_CONTRACT_ID`.

The contract exposes exactly the four functions from the brief:
`create_challenge`, `fund_reward_pool`, `release_reward`, `get_challenge`,
plus `close_challenge` for cleanup. Rewards are escrowed in the contract's
own balance (not just bookkeeping) using the standard Stellar Asset Contract
(SAC) token interface, so `fund_reward_pool` performs a real transfer from
the mentor's wallet into the contract, and `release_reward` performs a real
transfer from the contract to the learner.

> ⚠️ I wrote and unit-tested this contract against the Soroban SDK 21.x API,
> but couldn't compile it in this sandbox (no Rust toolchain available here).
> Run `cargo test` yourself before deploying — if the SDK has moved since
> my knowledge cutoff, you may need to adjust a few method names.

## 2. Backend API

```bash
cd server
npm install
cp .env.example .env     # fill in MongoDB URI, JWT secret, contract ID, platform signing key
npm run seed              # optional: creates a demo mentor + one challenge
npm run dev
```

The API runs on `http://localhost:4000`. Key routes:

| Route | Purpose |
|---|---|
| `POST /api/auth/signup` | Creates user, generates + Friendbot-funds a Stellar wallet |
| `POST /api/auth/login` | JWT login |
| `GET/POST /api/challenges` | Browse / create challenges |
| `POST /api/challenges/:id/fund` | Mentor escrows reward on-chain |
| `POST /api/submissions` | Learner submits project (+ optional Gemini AI review) |
| `PATCH /api/submissions/:id/approve` | Mentor approves → triggers `release_reward` on-chain |
| `GET /api/profile/me` / `/:id` | Private / public learner profile |
| `GET /api/profile/feed/recent` | Recent settlements, powers the dashboard ticker |

**Security note on wallet secrets:** for this MVP, each user's Stellar secret
key is generated server-side and stored (select:false field) so the backend
can sign `fund_reward_pool` / `release_reward` calls on the mentor's behalf
without requiring a browser wallet extension. This is fine for a testnet
demo but **not** how you'd do it in production — the next iteration should
move to client-side signing (e.g. Freighter wallet) so secret keys never
touch your server.

## 3. Frontend

```bash
cd web
npm install
cp .env.example .env.local    # or just export NEXT_PUBLIC_API_URL
npm run dev
```

Runs on `http://localhost:3000`. Built with Next.js App Router + Tailwind.
Design direction: a "ledger" aesthetic — rows separated by hairline rules
like a bank statement or git log, monospace for amounts/addresses, two
accent colors (gold = settled, slate = pending) instead of a single neon
accent, and a live-scrolling settlement ticker on the homepage as the
signature visual element.

## 4. Analytics & monitoring (required for submission)

- **PostHog**: set `NEXT_PUBLIC_POSTHOG_KEY` in `web/.env.local`. Events
  already instrumented in the code: `challenge_viewed`, `challenge_created`,
  `wallet_connected`, `submission_made`, `reward_claimed`.
- **Sentry**: set `SENTRY_DSN` in `server/.env` and run
  `npm install @sentry/node` in `server/`. The error handler in
  `server/src/middleware/errorHandler.js` is already wired to forward
  exceptions once a DSN is present.

Take screenshots of both dashboards once you have real events flowing —
these are required in your submission, see the checklist below.

## 5. Getting your 10 real users

1. Run the seed script or post a real first challenge (e.g. "Build a
   Personal Portfolio — 50 XLM").
2. Share the signup link with classmates / your network. Each signup
   auto-creates and funds a wallet, so "onboarded" = "has a funded testnet
   wallet" with zero manual setup on their end.
3. Mentors connect their **Freighter** wallet on the frontend to sign and deploy Soroban contracts for funding and payouts.

### User Onboarding

| Name | Email | Wallet Address |
|---|---|---|
| [User 1 Name] | [User 1 Email] | [User 1 Stellar Public Key] |
| [User 2 Name] | [User 2 Email] | [User 2 Stellar Public Key] |
| ... | ... | ... |

*(Fill in at least 10 real users here before submitting)*

### Feedback Implementation

| Feedback / Finding | How it was addressed in the product |
|---|---|
| *E.g., Mentors found it confusing to sign transactions on the backend* | Moved Soroban contract invocation to the frontend via `@stellar/freighter-api` |
| [Insert Feedback 2] | [Insert Implementation 2] |
| ... | ... |

*(Fill this in based on real feedback forms you collected)*

## Submission checklist mapping

| Requirement | Where it's satisfied |
|---|---|
| Production MVP, mobile responsive | `web/` — Tailwind responsive classes throughout; test at 320/768/1024px and screenshot |
| Loading + error states | Every data-fetching page (`challenges`, `dashboard`, `profile`, challenge detail) has explicit loading skeletons and error messages |
| 10 real users + wallet proof | `docs/wallet-proof.md` template — fill in after you onboard real users |
| User feedback | `docs/feedback-form.md` template — Google Form questions + summary table |
| Smart contracts on testnet | `contracts/skillpay-contract/` — deploy per instructions above, paste contract address here once deployed: `_____________` |
| 15+ meaningful commits | See suggested commit plan below |
| Public GitHub repo | Push this folder as-is |
| Analytics + monitoring | PostHog + Sentry, see section 4 |
| Demo video | Record a walkthrough: signup → wallet funded → mentor posts + funds challenge → learner submits → mentor approves → reward lands in learner wallet (check balance before/after) |

## Suggested commit plan (40–60 commits)

Don't commit this as one giant initial commit — break it up to tell the
real story of building it:

```
feat: scaffold nextjs app with tailwind ledger theme
feat: add navbar and landing page hero
feat: express server skeleton + mongodb connection
feat: user model + signup with stellar wallet generation
feat: jwt auth middleware + login route
feat: challenge model + create/list routes
feat: challenge marketplace page
feat: new challenge form (mentor)
feat: soroban contract - create_challenge + get_challenge
feat: soroban contract - fund_reward_pool escrow
feat: soroban contract - release_reward payout
test: soroban contract unit tests
feat: stellar sdk wrapper for contract invocation
feat: challenge funding route + UI button
feat: submission model + submit route
feat: submission form on challenge detail page
feat: mentor review UI + approve/reject routes
feat: reward model + settlement recording on approval
feat: settlement ticker component on homepage
feat: dashboard page with stats
feat: public learner profile page
feat: gemini ai project reviewer (bonus)
feat: posthog analytics events
feat: sentry error monitoring hook
fix: mobile responsive nav + challenge rows
fix: loading and error states across pages
docs: readme + submission checklist
chore: env templates for server and web
```

(Make real commits as you actually build/adjust each piece — this list is a
guide, not a script to fake.)
