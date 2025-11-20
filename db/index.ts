import { createClient } from "@libsql/client";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient(
  process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
    ? {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : { url: "file:db/local.db" }
);

export const db = drizzle({ client, schema });
