import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;

export function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_TOKEN;

  if (!url) {
    return null;
  }

  if (!client) {
    client = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
  }

  return client;
}
