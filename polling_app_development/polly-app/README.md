# Polly - A Secure & Modern Polling Application

Polly is a full-stack, interactive polling application that allows users to create, manage, and vote on polls. It is built with a focus on security, performance, and a modern developer experience.

![Polly App Banner](public/vercel.svg)

## Project Overview

Polly is built with a modern tech stack, emphasizing robustness and security. It uses Next.js for a hybrid frontend and backend, with data managed by Supabase and user input secured at multiple layers.

### Key Features

- **Secure User Authentication**: Sign-up, sign-in, and session management via Supabase Auth.
- **Full Poll Lifecycle**: Users can create, view, edit, and delete their own polls.
- **Robust Voting System**: Enforces one vote per user per poll, with real-time result updates.
- **Data Visualization**: Poll results are displayed in interactive bar charts using Recharts.
- **Responsive Design**: A clean and modern UI that works seamlessly on desktop and mobile.

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Backend**: Next.js Server Actions
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (via shadcn/ui)
- **Validation**: Zod
- **Data Visualization**: Recharts
- **Testing**: Jest, React Testing Library

---

## Security Features

This application employs a **defense-in-depth** strategy to protect user data and ensure application integrity.

### 1. Database-Level Security (RLS)

- **PostgreSQL Row-Level Security (RLS)** is enabled on all tables in Supabase.
- **Policies**: Strict RLS policies are in place to ensure that users can only read, update, or delete data that they own (e.g., a user can only edit a poll they created). This is the foundational layer of security, enforced directly by the database.

### 2. Application-Level Validation

- **Schema Validation**: All server actions use **Zod** to enforce strict schema validation on all incoming data.
- **Protection**: This prevents malformed or malicious data from being processed, protecting against common vulnerabilities and ensuring data integrity before it even reaches the database.

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Supabase account

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/polly-app.git
    cd polly-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of the project. This file is for local development and should not be committed to git. Add your Supabase project credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Set up the Database:**
    - In your Supabase project dashboard, navigate to the **SQL Editor**.
    - Open the `schema.sql` file from this repository.
    - Copy its content and run it in the SQL Editor to create all necessary tables, policies, and functions.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Codebase Structure

The codebase is organized to be modular and maintainable.

```
polly-app/
├── app/               # Next.js App Router pages & layouts
├── components/        # Reusable React components
├── lib/               # Core application logic
│   ├── actions/       # Server Actions (business logic for mutations)
│   ├── sql/           # Reusable SQL scripts
│   └── supabase-*.ts  # Supabase client configurations
├── schema.sql         # The complete database schema for Supabase
└── ...                # Other configuration files
```

All server actions in `lib/actions/` are documented to explain their purpose, parameters, and security considerations.