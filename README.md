# Review Rhythm

A calm, privacy-conscious review checklist web app built with Vite, React 18, TypeScript, and Supabase. Items are scoped anonymously to each browser via a persistent browser identifier.

---

## Prerequisites

- **Node.js**: Version 18.0.0 or newer ([nodejs.org](https://nodejs.org/))
- **npm**: Version 9 or newer (bundled with Node.js)
- A free **Supabase** account and project ([supabase.com](https://supabase.com/))

---

## Quick Start (Plain Language Steps)

### 1. Install Node.js
Ensure Node.js 18+ is installed on your computer:
```bash
node -v
npm -v
```

### 2. Install Project Dependencies
Run the setup command to automatically create your `.env` file (if missing) and install dependencies:
```bash
npm run setup
```
*(Or simply run `npm install`)*

### 3. Configure Environment Variables
Copy `.env.example` to `.env` if you haven't already:
```bash
cp .env.example .env
```
Open `.env` in any text editor and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```
> **Security Note:** `.env` is listed in `.gitignore` so your keys are never committed to version control.

### 4. Set Up the Database
In your Supabase project dashboard, navigate to **SQL Editor > New query** and run the two migration scripts in filename order:
1. `supabase/migrations/20261104153120_create_review_checklist_items.sql`
   - Creates the `public.review_items` table, validation constraints, and triggers.
2. `supabase/migrations/20261104153256_scope_review_items_to_browser_header.sql`
   - Sets Row Level Security (RLS) policies scoped to the `x-browser-id` HTTP request header.

### 5. Start the Development Server
```bash
npm run dev
```
Open the local URL shown in your terminal (typically [http://localhost:5173](http://localhost:5173)).

---

## Available Scripts

- `npm run dev` - Starts the Vite development server with hot reloading.
- `npm run build` - Type-checks with `tsc` and builds production assets into `dist/`.
- `npm run preview` - Runs a local web server to preview the production build.
- `npm run setup` - Initializes `.env` from template and installs dependencies.

---

## Key Features & Validation Rules

- **Browser-Scoped Privacy:** Each browser generates an anonymous UUID stored in `localStorage` and sent with requests via the `x-browser-id` header.
- **Name Requirement:** Items must have a title between 1 and 120 characters.
- **Review Date Constraint:** Review dates cannot be set to a future date.
- **Completion Requires Action:** An item cannot be marked as done without specifying a next action.

