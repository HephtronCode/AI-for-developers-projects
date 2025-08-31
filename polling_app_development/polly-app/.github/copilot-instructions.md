# Copilot Instructions for Polly App

## Project Overview

- This is a Next.js (App Router) project for a polling application, bootstrapped with `create-next-app`.
- The app uses TypeScript, React, and Supabase for authentication and data storage.
- Main app logic is in the `app/` directory, with feature folders for authentication, polls, and test pages.

## Key Architecture & Patterns

- **Pages & Routing:**
  - All routes are in `app/`, using Next.js App Router conventions.
  - Dynamic routes (e.g., `[id]`) are used for poll details and editing: see `app/polls/[id]/` and `app/polls/[id]/edit/`.
- **Components:**
  - Shared UI components are in `components/ui/` (e.g., `button.tsx`, `card.tsx`).
  - Feature components (e.g., `poll-card.tsx`, `dashboard-content.tsx`) are in `components/`.
- **State & Context:**
  - Authentication state is managed via `contexts/auth-context.tsx`.
- **Server/Client Separation:**
  - Supabase client/server logic is split between `lib/supabase-client.ts` (client) and `lib/supabase-server.ts` (server).
  - Actions (e.g., `create-poll.ts`, `get-polls.ts`) in `lib/actions/` encapsulate server-side logic and are imported into pages/components as needed.

## Developer Workflows

- **Development:**
  - Start with `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`).
  - Main entry: `app/page.tsx`.
- **Database:**
  - Database schema is defined in `schema.sql`.
  - Supabase is used for backend; connection logic in `lib/supabase-client.ts` and `lib/supabase-server.ts`.
- **Testing:**
  - No explicit test framework or test files detected; manual testing via `/app/test/page.tsx`.
- **Styling:**
  - Uses global styles in `app/globals.css` and PostCSS config in `postcss.config.mjs`.

## Project-Specific Conventions

- **File Naming:**
  - Use kebab-case for files and folders.
  - UI components are in `components/ui/`.
- **Actions Pattern:**
  - All server actions are in `lib/actions/` and should be imported into pages/components.
- **Error Handling:**
  - Use `components/error-boundary.tsx` for error boundaries in React.
- **Environment:**
  - Environment checks in `lib/actions/check-env.ts`.

## Integration Points

- **Supabase:**
  - Used for authentication and data storage. Configure credentials in environment variables.
- **Next.js:**
  - Uses App Router, dynamic routing, and server/client components.

## Examples

- To add a new poll feature, create a new folder in `app/polls/` and corresponding action in `lib/actions/`.
- To add a new UI component, place it in `components/ui/` and import as needed.

Refer to this file and the `README.md` for project-specific guidance. For architectural questions, review the `app/`, `lib/`, and `components/` directories for patterns.
