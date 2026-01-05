<p align="center">
  <a href="https://shelby.xyz">
    <img src="https://avatars.githubusercontent.com/u/219037914?s=96&v=4" alt="Shelby Breakpoint 2025" width="96" height="96">
    <h3 align="center">Shelby Breakpoint 2025</h3>
  </a>
</p>

<p align="center">
  <span><a href="https://shelby.xyz">shelby.xyz</a></span>
  &nbsp;|&nbsp;
  <span><a href="https://docs.shelby.xyz">docs.shelby.xyz</a></span>
  &nbsp;|&nbsp;
  <span><a href="https://github.com/shelby">github.com/shelby</a></span>
  &nbsp;|&nbsp;
  <span><a href="https://x.com/shelbyserves">@shelbyserves</a></span>
</p>

This is a demo app shown at the Shelby Breakpoint 2025 conference. The app is a short-form video sharing platform powered by the Shelby Network.

## Features

- Video Upload and Playback - Demonstrates how to record on device and upload videos to the Shelby Network using `@shelby-protocol/react` and play them using `media-chrome` video player.
- X-Chain Wallet Support - Demonstrates how to use the `@aptos-labs/wallet-adapter-react` to support X-Chain wallets
- Geomi Gas Station Support - Demonstrates how to use the `@aptos-labs/gas-station-client` to support Geomi Gas Station
- Aptos Wallet Authentication - Demonstrates how to authenticate Aptos wallets to off-chain services using the `@aptos-labs/siwa` library

## Getting Started

### Prerequisites

- Node.js 20+ installed
- pnpm 10+ installed
- A Turso account (sign up at [turso.tech](https://turso.tech))
- A Geomi account (sign up at [geomi.dev](https://geomi.dev))

### Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Setting up the environment variables:**

   ```bash
   cp .env.example .env
   ```

3. **Set up Turso database:**

   - Create a new database in the [Turso dashboard](https://turso.tech)
   - Get your database URL and auth token
   - Set the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables in the `.env` file

4. **Run database migrations:**

   ```bash
   npm run db:push
   ```

   This will create the tables defined in `lib/db/schema.ts`.

5. **Set up Geomi API keys:**

   - Go to the [Geomi](https://geomi.dev) and login with your account
   - Setup an API key for `Shelbynet` by following the instructions in the [Geomi documentation](https://geomi.dev/docs/start)
   - Set the `NEXT_PUBLIC_APTOS_SHELBYNET_API_KEY` and `NEXT_PUBLIC_SHELBY_SHELBYNET_API_KEY` environment variables in the `.env` file using the API key you created.
   - Setup an API key for the Shelbynet Gas Station by following the instructions in the [Geomi documentation](https://geomi.dev/docs/gas-stations)
   - Set the `NEXT_PUBLIC_APTOS_SHELBYNET_GAS_STATION_API_KEY` environment variables in the `.env` file using the API key you created.

6. **Start the development server:**

   ```bash
   pnpm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Funding Accounts

It is important to fund your accounts with the appropriate tokens to cover the transaction fees.

### ShelbyUSD

To fund your account with ShelbyUSD, you can begin by running the application, click on "Profile", connect your wallet, and then click the "Copy Address" button in the header. Once you have copied your address, you can fund it with ShelbyUSD at the [ShelbyUSD Faucet](https://docs.shelby.xyz/apis/faucet/shelbyusd).

### APT

To fund your the gas station sponsor with APT, you should go to the gas station resource you setup in [Step 5](#setup-geomi-api-keys) and find the "Fee Payer Address" towards the top of the page. Copy the address by clicking it. Once you have copied the address, you can fund it with APT at the [APT Faucet](https://docs.shelby.xyz/apis/faucet/aptos).

## Database Commands

- `pnpm run db:generate` - Generate migration files from schema changes
- `pnpm run db:migrate` - Run pending migrations
- `pnpm run db:push` - Push schema changes directly to database (development)
- `pnpm run db:studio` - Open Drizzle Studio to view and edit your database

## Environment Variables

| Variable                                          | Required | Description                                                                         |
| ------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `NODE_ENV`                                        |          | The environment of the application. If not set, it will default to `development`.   |
| `NEXT_PUBLIC_ALLOWED_HOSTS`                       |          | The hosts allowed to authenticate. If not set, it will default to `localhost:3000`. |
| `NEXT_PUBLIC_APTOS_SHELBYNET_API_KEY`             | ✅       | The API key for the Aptos Shelbynet API                                             |
| `NEXT_PUBLIC_APTOS_SHELBYNET_GAS_STATION_API_KEY` | ✅       | The API key for the Aptos Shelbynet Gas Station                                     |
| `NEXT_PUBLIC_SHELBY_SHELBYNET_API_KEY`            | ✅       | The API key for the Shelby Shelbynet RPC API                                        |
| `NEXT_PUBLIC_UPLOAD_ALLOWLIST_ADDRESSES`          |          | The addresses allowed to upload videos. If empty, anyone can upload videos.         |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`                  |          | The site key for the reCAPTCHA v3. If empty, reCAPTCHA is disabled.                 |
| `TURSO_DATABASE_URL`                              | ✅       | The URL of the Turso database                                                       |
| `TURSO_AUTH_TOKEN`                                | ✅       | The authentication token for the Turso database                                     |
| `RECAPTCHA_SECRET_KEY`                            |          | The secret key for the reCAPTCHA v3. If empty, reCAPTCHA is disabled.               |
| `JWT_SECRET`                                      |          | The secret key for the JWT token. If empty, JWT will use a demo secret.             |

## Deployment

The project is deployed to Vercel and will automatically deploy when changes are pushed to the `main` branch.
