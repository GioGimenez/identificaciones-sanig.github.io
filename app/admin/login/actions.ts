"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import {
  clearLoginFailures,
  createSession,
  getLoginIdentifier,
  isLoginAllowed,
  registerLoginFailure,
} from "@/lib/auth";
import { getTursoClient } from "@/lib/turso";

function loginError(message: string): never {
  redirect("/admin/login?error=" + encodeURIComponent(message));
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const identifier = await getLoginIdentifier(email);

  if (!email || !password) {
    loginError("Ingresá tu correo y contraseña.");
  }

  if (!(await isLoginAllowed(identifier))) {
    loginError("Demasiados intentos. Esperá 15 minutos y volvé a intentar.");
  }

  const db = getTursoClient();

  if (!db) {
    loginError("La autenticación no está configurada.");
  }

  const result = await db.execute({
    sql:
      "SELECT id, password_hash, role, active " +
      "FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });

  const row = result.rows[0] as
    | {
        id?: unknown;
        password_hash?: unknown;
        role?: unknown;
        active?: unknown;
      }
    | undefined;

  const userId = typeof row?.id === "string" ? row.id : null;
  const passwordHash =
    typeof row?.password_hash === "string" ? row.password_hash : null;
  if (
    !userId ||
    !passwordHash ||
    row?.role !== "admin" ||
    (row.active !== 1 && row.active !== true)
  ) {
    await registerLoginFailure(identifier);
    loginError("Correo o contraseña incorrectos.");
  }

  if (!(await compare(password, passwordHash))) {
    await registerLoginFailure(identifier);
    loginError("Correo o contraseña incorrectos.");
  }

  await clearLoginFailures(identifier);
  await createSession(userId);
  redirect("/admin");
}
