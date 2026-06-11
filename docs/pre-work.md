# Workshop pre-work (≈15 minutes)

> **Who needs this:** developers who want to do the hands-on second half. If you're joining for the first half only (product / UX / design), you don't need to install anything — just come.
>
> Please do this **before the workshop** so we don't spend our time together on setup. If anything fails, reply to this email and we'll sort it out beforehand.

## 1. Install Node.js 20 or newer
Download the LTS from <https://nodejs.org> and install. Then check:
```bash
node --version
```
You should see `v20.x` or higher.

## 2. Install Claude Code and sign in
Follow <https://docs.claude.com/claude-code> to install, then run `claude` once and complete the login. You should reach the prompt without an auth error. (You'll use your existing company Claude access.)

## 3. Clone the repo
```bash
git clone https://github.com/tcarcao/ai-agentic-workshop-2026-06-12.git
cd ai-agentic-workshop-2026-06-12
```

## 4. Install dependencies
```bash
npm install
```

## 5. Create and seed the local database
The app uses a local SQLite file — no database server to install.
```bash
npm run db:setup
```

## 6. Run it
```bash
npm run dev
```
This starts the **API** (`http://localhost:3001`) and the **web app** (`http://localhost:5173`) together. Open <http://localhost:5173>. You should see a food-delivery app with several restaurants. Click into one, add a dish to your cart, and place an order — if the confirmation appears, you're fully set. ✅ Optionally, create an account (email + password) to see your favorites and order history sync across devices; ordering works without an account too.

## If something breaks
- Reply to this email with the error and your OS (most of you are on **Windows** — that's expected and supported).
- Worst case, you can pair with someone next to you on the day; we'll also have a couple of spare ready-to-go machines.

See you there!
