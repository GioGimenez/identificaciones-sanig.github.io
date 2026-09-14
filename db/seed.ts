import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_TOKEN;

  if (!url) {
    throw new Error(
      "Falta TURSO_DATABASE_URL (o TURSO_DB_URL) en el archivo .env.",
    );
  }

  const turso = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  const schema = await readFile(
    new URL("./schema.sql", import.meta.url),
    "utf8",
  );
  const seed = await readFile(new URL("./seed.sql", import.meta.url), "utf8");
  const statements = [...schema.split(";"), seed]
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await turso.execute(statement);
  }

  console.log("Esquema y datos iniciales aplicados correctamente en Turso.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
