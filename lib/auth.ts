import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTursoClient } from "@/lib/turso";

const SESSION_COOKIE = "identificaciones_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;

export type AuthUser = {
  id: string;
  email: string;
  role: "admin";
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function loginIdentifier(ip: string, email: string) {
  return createHash("sha256")
    .update(ip + ":" + email.toLowerCase())
    .digest("hex");
}

export async function getLoginIdentifier(email: string) {
  const headerStore = await import("next/headers").then(({ headers }) =>
    headers(),
  );
  const forwardedFor = (await headerStore).get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    (await headerStore).get("x-real-ip") ||
    "unknown";

  return loginIdentifier(ip, email);
}

export async function isLoginAllowed(identifier: string) {
  const db = getTursoClient();

  if (!db) {
    return false;
  }

  const result = await db.execute({
    sql:
      "SELECT attempts, window_started_at, blocked_until " +
      "FROM login_attempts WHERE identifier = ? LIMIT 1",
    args: [identifier],
  });
  const row = result.rows[0] as
    | {
        attempts?: unknown;
        window_started_at?: unknown;
        blocked_until?: unknown;
      }
    | undefined;

  if (!row) {
    return true;
  }

  const now = Date.now();
  const windowStarted = new Date(String(row.window_started_at)).getTime();

  if (!Number.isFinite(windowStarted) || now - windowStarted >= LOGIN_WINDOW_MS) {
    await db.execute({
      sql: "DELETE FROM login_attempts WHERE identifier = ?",
      args: [identifier],
    });
    return true;
  }

  const blockedUntil = row.blocked_until
    ? new Date(String(row.blocked_until)).getTime()
    : 0;

  return !blockedUntil || blockedUntil <= now;
}

export async function registerLoginFailure(identifier: string) {
  const db = getTursoClient();

  if (!db) {
    return;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const result = await db.execute({
    sql:
      "SELECT attempts, window_started_at FROM login_attempts " +
      "WHERE identifier = ? LIMIT 1",
    args: [identifier],
  });
  const row = result.rows[0] as
    | { attempts?: unknown; window_started_at?: unknown }
    | undefined;
  const windowStarted = row
    ? new Date(String(row.window_started_at)).getTime()
    : NaN;
  const withinWindow =
    Number.isFinite(windowStarted) &&
    now.getTime() - windowStarted < LOGIN_WINDOW_MS;
  const attempts = withinWindow ? Number(row?.attempts ?? 0) + 1 : 1;
  const blockedUntil =
    attempts >= LOGIN_MAX_ATTEMPTS
      ? new Date(now.getTime() + LOGIN_BLOCK_MS).toISOString()
      : null;

  await db.execute({
    sql:
      "INSERT INTO login_attempts " +
      "(identifier, attempts, window_started_at, blocked_until, updated_at) " +
      "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) " +
      "ON CONFLICT(identifier) DO UPDATE SET " +
      "attempts = excluded.attempts, " +
      "window_started_at = excluded.window_started_at, " +
      "blocked_until = excluded.blocked_until, " +
      "updated_at = CURRENT_TIMESTAMP",
    args: [
      identifier,
      attempts,
      withinWindow ? String(row?.window_started_at) : nowIso,
      blockedUntil,
    ],
  });
}

export async function clearLoginFailures(identifier: string) {
  const db = getTursoClient();

  if (!db) {
    return;
  }

  await db.execute({
    sql: "DELETE FROM login_attempts WHERE identifier = ?",
    args: [identifier],
  });
}

export async function createSession(userId: string) {
  const db = getTursoClient();

  if (!db) {
    throw new Error("Turso no está configurado.");
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_SECONDS * 1000,
  ).toISOString();

  await db.execute({
    sql: "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
    args: [randomUUID(), userId, tokenHash, expiresAt],
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const db = getTursoClient();

  if (!db) {
    return null;
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!rawToken) {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);
  const now = new Date().toISOString();
  const result = await db.execute({
    sql:
      "SELECT users.id, users.email, users.role " +
      "FROM sessions INNER JOIN users ON users.id = sessions.user_id " +
      "WHERE sessions.token_hash = ? " +
      "AND sessions.expires_at > ? " +
      "AND users.active = 1 LIMIT 1",
    args: [tokenHash, now],
  });

  const row = result.rows[0] as
    | { id?: unknown; email?: unknown; role?: unknown }
    | undefined;

  if (
    !row ||
    typeof row.id !== "string" ||
    typeof row.email !== "string" ||
    row.role !== "admin"
  ) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    role: "admin",
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function deleteCurrentSession() {
  const db = getTursoClient();
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (db && rawToken) {
    await db.execute({
      sql: "DELETE FROM sessions WHERE token_hash = ?",
      args: [hashSessionToken(rawToken)],
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}
