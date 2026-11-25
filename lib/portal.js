import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const portalEnv = async () =>
  (await getCloudflareContext({ async: true })).env;
export const timestamp = () => new Date().toISOString();
export const id = () => crypto.randomUUID();
export const koreaYear = () =>
  Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Seoul",
      year: "numeric",
    }).format(new Date()),
  );
export const dateKR = (value) =>
  value
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
export const money = (value) => Number(value).toLocaleString("ko-KR") + "원";
export const fields = (form, key) => String(form.get(key) ?? "").trim();
export const sessionCookie = "kpa_session";

function hex(bytes) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export async function digest(value) {
  return hex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}
async function keyFor(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
export async function hashPassword(value) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  return salt + "." + (await keyFor(value, salt));
}
export async function checkPassword(value, stored) {
  const [salt, expected] = stored.split(".");
  const actual = await keyFor(value, salt);
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++)
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
export async function createSession(db, memberId) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const maxAge = 7 * 86400;
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(timestamp()),
    db
      .prepare("INSERT INTO sessions VALUES (?,?,?)")
      .bind(
        await digest(token),
        memberId,
        new Date(Date.now() + maxAge * 1000).toISOString(),
      ),
  ]);
  const secure =
    (await headers()).get("x-forwarded-proto") === "https" ||
    (process.env.NODE_ENV === "production" &&
      !(await headers())
        .get("host")
        ?.match(/^(localhost|127\.0\.0\.1)(:\d+)?$/));
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}
export async function currentMember() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { DB } = await portalEnv();
  return DB.prepare(
    "SELECT m.id,m.email,m.name,m.organization,m.approved_at,m.role FROM sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires_at>?",
  )
    .bind(await digest(token), timestamp())
    .first();
}
export function safeNext(value) {
  return typeof value === "string" &&
    /^\/member(?:\/[a-zA-Z0-9_/-]*)?$/.test(value)
    ? value
    : "/member";
}
export async function requireMember(path = "/member") {
  const member = await currentMember();
  if (!member)
    redirect("/member/login?next=" + encodeURIComponent(safeNext(path)));
  return member;
}
export async function requireStaff() {
  const user = await requireMember();
  if (user.role !== "staff") redirect("/member?note=forbidden");
  return user;
}
export const qualified = (user) =>
  Boolean(user && (user.approved_at || user.role === "staff"));
export async function allowedAttempt(db, type, identity, limit) {
  const now = Math.floor(Date.now() / 1000);
  const key = await digest(type + ":" + identity);
  const [, result] = await db.batch([
    db.prepare("DELETE FROM attempts WHERE expires_at<=?").bind(now),
    db
      .prepare(
        "INSERT INTO attempts(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
      )
      .bind(key, now + 900),
  ]);
  return Number(result.results[0].count) <= limit;
}
export function withNote(path, note) {
  redirect(
    path +
      (path.includes("?") ? "&" : "?") +
      "note=" +
      encodeURIComponent(note),
  );
}
