import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "Faltan TURSO_DATABASE_URL/TURSO_DB_URL o TURSO_AUTH_TOKEN/TURSO_TOKEN.",
    );
  }

  const db = createClient({ url, authToken });
  const migrationsDir = resolve(process.cwd(), "db", "migrations");

  await db.execute(
    "CREATE TABLE IF NOT EXISTS _migrations (" +
      "name TEXT PRIMARY KEY, " +
      "applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP" +
      ")",
  );

  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const existing = await db.execute({
      sql: "SELECT name FROM _migrations WHERE name = ?",
      args: [file],
    });

    if (existing.rows.length > 0) {
      console.log("Ya aplicada:", file);
      continue;
    }

    const sql = await readFile(resolve(migrationsDir, file), "utf8");
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await db.execute(statement);
    }

    await db.execute({
      sql: "INSERT INTO _migrations (name) VALUES (?)",
      args: [file],
    });

    console.log("Aplicada:", file);
  }

  console.log("Migraciones completadas.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
