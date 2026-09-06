# FlyRank Expense Tracker

FlyRank Expense Tracker is a personal finance web app for people who want a simple way to record expenses, understand monthly spending, and keep an eye on their budget. It was built as a capstone project for the FlyRank Frontend AI Engineering track, combining a responsive Next.js interface with Firebase persistence and a natural-language spending assistant.

## Features

- Dashboard with monthly spending totals, transaction counts, category breakdowns, and budget tracking
- Add Expense form with configurable categories and currency support
- Searchable and filterable expense History grouped by date
- Firebase Authentication with email/password and Google Sign-In
- Profile page with account details and spending statistics
- Settings for currency, monthly budget, categories, and appearance
- AI spending assistant powered by Google Generative AI

## Setup

### Clone and install

```bash
git clone <repository-url>
cd capstone-project
npm install
```

### Configure environment variables

Create a `.env` file in the project root and add the following keys. Keep the values private and do not commit the file.

```env
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Enable the required Firebase services in the Firebase console:

- Authentication: Email/Password and Google providers
- Firestore Database

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

The project uses the Next.js App Router and TypeScript.

### `src/app`

Contains routes and page-level UI:

- `page.tsx`: Dashboard with monthly summaries, budget tracking, and charts
- `login/page.tsx`: Email/password and Google authentication
- `expenses/add/page.tsx`: Add expense workflow
- `history/page.tsx`: Filtered, searchable expense history grouped by date
- `settings/page.tsx`: Currency, budget, categories, theme, and data controls
- `profile/page.tsx`: Authenticated profile and account actions
- `chat/page.tsx`: AI spending assistant page
- `api/chat/route.ts`: Server-side AI chat endpoint and spending-summary tool

### `src/components`

Contains reusable client components such as the navigation bar, authentication provider, theme provider, expense form, AI chat interface, chat message renderer, and dashboard visualizations.

### `src/lib/firebase`

Contains Firebase initialization and data access helpers:

- `config.ts`: Initializes the shared Firebase app and exports Firestore and Auth instances
- `expenses.ts`: Reads and writes expenses, user settings, and expense deletion operations

Other shared utilities live in `src/lib`, including currency formatting and AI configuration.

## AI Integration

The app uses Google's Generative AI API through the `/api/chat` route. Users can ask natural-language questions about their spending, such as how much they spent in a category or what their biggest expenses were during a period.

When the assistant needs structured spending data, the route calls the `getSpendingSummary` tool. This tool queries the user's expense data from Firestore, applies the requested period and optional category filter, and returns a structured summary containing the total spent, transaction count, currency, and category breakdown. The client renders that result as a summary card in the chat interface.

## Known Limitations and Future Improvements

- Profile editing currently provides a UI flow but does not persist display-name or email changes to Firebase Auth.
- Expense editing is not fully implemented yet; the History edit action still needs a complete update workflow.
- Sign-out and authenticated route protection can be expanded with a centralized protected-route strategy across the app.
- Firebase data access currently uses shared user-preference and expense collections; production use should scope records explicitly to authenticated user IDs.
- More automated tests are needed for authentication flows, dashboard budget states, History filters, and Firestore error handling.
- The AI assistant depends on a configured Google Generative AI API key and an available Firestore connection.

## Development Commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm test          # Run unit tests
npm run test:e2e  # Run Playwright end-to-end tests
```
## Performance & Accessibility Audit

![Lighthouse Scores](./lighthouse-score.png)

- Performance: 78
- Accessibility: 98
- Best Practices: 100
- SEO: 60

**Deployment Checklist**

✅ Environment variables (Firebase + Google Generative AI keys) securely stored in Vercel dashboard, never committed to GitHub (.env in .gitignore)
✅ Production deployment tested and verified — live data loads correctly from Firebase (no mock/fallback data)
✅ CI pipeline (GitHub Actions) runs tests on every push
✅ All unit tests passing (8/8) before deployment
✅ Build verified successful on Vercel before considering deployment complete
✅ Authentication flow tested — unauthenticated users redirected to /login

Rollback plan: If a deployment breaks production, redeploy the last known-good commit from the Vercel Deployments tab (select the working deployment → Redeploy), or push a revert commit to the main branch on GitHub to trigger a fresh, correct deployment automatically.

Error handling: The AI chat feature shows a fallback error message when Firebase queries fail or return no data ("No spending data for that period"), instead of crashing. Auth errors show user-friendly messages (e.g. "The email or password is incorrect") rather than raw Firebase error codes.




**Reflection**

What was hardest? Why?
The hardest part wasn't writing code — it was understanding how deployment actually differs from local development. My app worked perfectly with npm run dev, but the production build kept failing with a Firebase: auth/invalid-api-key error. It took a while to realize that .env files aren't automatically available to Vercel just because they exist locally — they have to be manually added as environment variables in the deployment platform's settings. Even after fixing that, I hit a second, more confusing issue: clicking "Redeploy" on Vercel doesn't rebuild your latest code — it re-runs the exact commit it was originally built from. I had to specifically trigger a fresh deployment on my newest commit for the environment variables to actually take effect. Debugging this required reading build logs carefully instead of guessing, which was a new skill for me.

What would you do differently next time?
I'd test my environment variable setup on a real deployment much earlier in the project instead of only at the very end, so I'm not debugging deployment and Firebase integration under time pressure. I'd also write my component tests with findByRole (which waits for async actions) from the start, instead of getByRole (which checks immediately) — my "successful submission" test kept failing simply because it wasn't waiting for the async Firebase call to finish.

One thing you learned that surprised you.
I was surprised that a "successful" build locally means almost nothing about whether it will work in production. Two completely separate environments (local dev vs. CI vs. Vercel) can each fail for entirely different reasons — a Node version mismatch broke my CI tests, while a missing environment variable broke my Vercel build, even though my code itself never changed. Shipping software safely is as much about environment and configuration as it is about the code you write.
