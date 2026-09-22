import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL n'est pas defini. Copiez .env.example vers .env.");
}

const globalForDb = globalThis as unknown as {
  steenlandSql?: ReturnType<typeof postgres>;
};

const sql = globalForDb.steenlandSql ?? postgres(connectionString, { max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.steenlandSql = sql;
}

export const db = drizzle(sql, { schema });
export { schema, sql };
