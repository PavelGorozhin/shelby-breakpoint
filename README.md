# Shelby Breakpoint

A Next.js project with Turso LibSQL database and Drizzle ORM, configured for Vercel deployment.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Turso** - LibSQL database (SQLite-compatible)
- **Drizzle ORM** - TypeScript ORM
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Turso account (sign up at [turso.tech](https://turso.tech))

### Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up Turso database:**

   - Create a new database in the [Turso dashboard](https://turso.tech)
   - Get your database URL and auth token
   - Create a `.env.local` file in the root directory:
     ```env
     TURSO_DATABASE_URL=libsql://your-database-url.turso.io
     TURSO_AUTH_TOKEN=your-auth-token-here
     ```

3. **Run database migrations:**

   ```bash
   npm run db:push
   ```

   This will create the tables defined in `lib/db/schema.ts`.

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Commands

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema changes directly to database (development)
- `npm run db:studio` - Open Drizzle Studio to view and edit your database

## Example API

An example API route is available at `/api/users` that demonstrates:

- `GET /api/users` - Fetch all users
- `POST /api/users` - Create a new user

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Deploy!

The project is pre-configured for Vercel deployment with `vercel.json`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Turso Documentation](https://docs.turso.tech)
- [Vercel Deployment Guide](https://vercel.com/docs)
