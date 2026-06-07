import { neon } from "@neondatabase/serverless";

export function getNeonSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing");
  }

  return neon(databaseUrl);
}

export async function getData() {
  const sql = getNeonSql();

  const data = await sql`
    SELECT
      current_database() AS database,
      current_user AS user_name,
      now() AS checked_at
  `;

  return data;
}
