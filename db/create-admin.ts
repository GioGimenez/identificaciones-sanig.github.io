import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_TOKEN;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !authToken) {
    throw new Error("Faltan las credenciales de Turso.");
  }

  if (!email || !password || password.length < 12) {
    throw new Error(
      "Definí ADMIN_EMAIL y ADMIN_PASSWORD. La contraseña debe tener al menos 12 caracteres.",
    );
  }

  const db = createClient({ url, authToken });
  const passwordHash = await hash(password, 12);

  await db.execute({
    sql:
      "INSERT INTO users (id, email, password_hash, role, active) " +
      "VALUES (?, ?, ?, 'admin', 1) " +
      "ON CONFLICT(email) DO UPDATE SET " +
      "password_hash = excluded.password_hash, " +
      "role = 'admin', active = 1, updated_at = CURRENT_TIMESTAMP",
    args: [randomUUID(), email, passwordHash],
  });

  console.log("Usuario administrador creado o actualizado:", email);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
