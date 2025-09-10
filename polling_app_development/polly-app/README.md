# Polly - Interactive Polling Application

Polly is a modern, interactive polling application that allows users to create, manage, and participate in polls. With a sleek, responsive UI and real-time results, Polly makes gathering opinions and insights from your audience simple and engaging.

![Polly App Banner](public/vercel.svg)

## Project Overview

Polly is built with a modern tech stack, focusing on performance, scalability, and developer experience:

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Server Actions, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom UI components
- **Testing**: Jest, React Testing Library
- **Data Visualization**: [Recharts](https://recharts.org/) for poll results charts

### Key Features

- **User Authentication**: Secure sign-up, sign-in, and session management
- **Poll Creation**: Create custom polls with multiple options
- **Poll Management**: Edit and delete your polls
- **Voting System**: One vote per user with real-time result updates
- **Poll Results Visualization**: View poll results as interactive bar and pie charts
- **Dashboard**: View all polls and manage your created polls
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## New Feature: Poll Results Visualization

Poll results are now displayed as interactive bar and pie charts after voting, using the [Recharts](https://recharts.org/) library. This provides a clear and engaging way to see poll outcomes at a glance.

- Charts are rendered by the `PollResultsChart` component in `components/ui/poll-results-chart.tsx`.
- Both bar and pie chart visualizations are available.
- Charts appear on the poll details page after a user votes.

### Example Usage

After voting on a poll, you will see:

- A bar chart showing the number of votes per option
- A pie chart visualizing the distribution of votes

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/polly-app.git
   cd polly-app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Supabase Configuration

1. Create a new Supabase project
2. Run the database schema setup:

   - Import the schema from `schema.sql` in the Supabase SQL Editor
   - This will create the necessary tables for polls, options, and votes

3. Set up authentication:
   - Enable Email/Password authentication in the Supabase dashboard
   - Configure email templates if desired

## Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage Examples

### Creating a Poll

1. Sign in to your account
2. Navigate to "Create Poll" from the dashboard
3. Fill in the poll title and description
4. Add at least two options
5. Click "Create Poll"

### Voting on a Poll

1. Browse to the polls page
2. Select a poll to view
3. Choose an option
4. Click "Submit Vote"
5. View the results displayed in real-time

### Managing Polls

1. Go to your dashboard
2. Find the poll you want to manage
3. Use the edit button to modify the poll
4. Use the delete button to remove the poll

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

The project includes:

- Unit tests for utility functions
- Integration tests for server actions
- Component tests for UI elements

## Project Structure

```
polly-app/
├── app/               # Next.js App Router pages
├── components/        # Reusable UI components
│   └── ui/
│       └── poll-results-chart.tsx   # Poll results chart component (Recharts)
├── contexts/          # React contexts (auth, etc.)
├── lib/               # Utility functions and server actions
│   ├── actions/       # Server actions (auth, polls, votes)
│   ├── sql/           # SQL queries
│   └── types.ts       # TypeScript type definitions
├── public/            # Static assets
└── ...                # Configuration files
```

## Troubleshooting

### Common Build Errors

#### Syntax Errors in Server Actions

If you encounter errors like "Return statement is not allowed here" in server action files, check for:

1. Misplaced function definitions or incomplete function blocks
2. Duplicated code blocks that may have been accidentally copied
3. Missing or extra brackets that break the function structure

Example fix for a common error in `poll-actions.ts`:

```typescript
// Incorrect:
/**
 * Function documentation
 */
    // Code that belongs to another function
    return { success: true };
  } catch (error) {
    // Error handling
  }
}

// Correct:
/**
 * Function documentation
 */
export async function updatePoll(...) {
  try {
    // Function implementation
  } catch (error) {
    // Error handling
  }
}
```

#### Environment Variables

If the application fails to connect to Supabase, verify:

1. Your `.env.local` file contains the correct Supabase URL and anonymous key
2. The environment variables are being properly loaded (check with `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
