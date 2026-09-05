# Personal Finance / Expense Tracker

Capstone project for the FlyRank Frontend AI Engineering internship. A personal expense tracking app with a dashboard, expense history, and settings — built with Next.js.

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Version control: Git + GitHub
- Deployment: Vercel
- AI-assisted development: Claude Code / GitHub Copilot

## Screens

- Dashboard — expense summary and charts
- Add Expense — form to log a new expense
- History — list of past expenses
- Settings — app preferences
- Profile — user profile
- Health — health-check page with live data fetch

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tool Contract

### Tool name

- `getSpendingSummary`

### Input schema

The tool accepts a JSON object with these fields:

- `category` (`string`, optional): Filter by an expense category such as `food` or `transport`. Omit it to summarize all categories.
- `period` (`"week" | "month" | "year"`): The time period to summarize.

### Output shape

The tool returns an object with:

- `period` (`string`): The selected period.
- `totalSpent` (`number`): The total spending amount for the filtered data.
- `byCategory` (`Array<{ category: string, amount: number, percentage: number }>`): Per-category breakdown, including the percent of the total each category represents.
- `note` (`string`): A note explaining that the returned data is placeholder/mock sample data until the real expense storage layer is built.

This tool currently uses sample/mock expense data instead of a real database, because there is no persistent expense storage yet in the app.

## Dashboard 3D element

The Dashboard includes a lightweight React Three Fiber piggy bank built entirely from low-poly Three.js primitives. It auto-rotates, responds to pointer/touch orbit gestures, and gives users a color-swatch interaction that triggers a small bounce. Users who prefer reduced motion receive a static inline SVG illustration instead of a WebGL canvas.

The added runtime dependencies increase the client bundle compared with the original dashboard, while the scene itself stays small: it uses a handful of basic geometries, one contact shadow, and a capped device pixel ratio of 1.5. On a modern desktop the scene was observed running at a stable 60 FPS; lower-powered mobile devices may settle closer to 30-60 FPS. With more time, I would connect each saved expense to a real coin-drop animation and add an accessible “recent activity” feed beside the scene.

### Error state triggers

The tool throws a clear error when:

- the requested period has no data available, such as a `week` summary when the app only has mock data for `month` and `year`, or
- the requested category has no spending for the chosen period.

In those cases, the UI shows a friendly error card instead of a raw exception.
