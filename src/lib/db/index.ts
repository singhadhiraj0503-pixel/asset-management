import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
  max: 10,
});

// TEMPORARY DEBUG
pool
  .query(
    `
    SELECT
      current_database(),
      current_schema(),
      current_user
  `,
  )
  .then((result) => {
    console.log("DATABASE CONNECTION:", result.rows[0]);
  });

pool
  .query(
    `
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `,
  )
  .then((result) => {
    console.log("TABLES SEEN BY NEXT.JS:", result.rows);
  });

export const db = drizzle({ client: pool });

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};
