import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "turso",
dbCredentials:
    process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
      ? {
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        }
      : (() => {
          console.warn('Missing Turso credentials. Falling back to local database.');
          return { url: "file:db/local.db" };
        })(),
});
