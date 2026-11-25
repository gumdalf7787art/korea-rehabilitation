"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  allowedAttempt,
  checkPassword,
  createSession,
  digest,
  fields,
  hashPassword,
  id,
  portalEnv,
  qualified,
  requireMember,
  safeNext,
  sessionCookie,
  timestamp,
  withNote,
} from "../../lib/portal";

export async function join(form) {
  const name = fields(form, "name"),
    email = fields(form, "email").toLowerCase(),
    organization = fields(form, "organization"),
    license = fields(form, "license");
  const password = String(form.get("password") ?? "");
  if (
    !name ||
    name.length > 50 ||
    !organization ||
    organization.length > 120 ||
    !/^\d{1,10}$/.test(license) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    password.length < 10 ||
    password.length > 128 ||
    !form.has("consent")
  )
    withNote("/member/join", "invalid");
  const { DB } = await portalEnv();
  const ip = (await headers()).get("cf-connecting-ip") || "local";
  if (!(await allowedAttempt(DB, "signup", ip, 20)))
    withNote("/member/join", "rate");
  const memberId = id(),
    now = timestamp();
  const result = await DB.prepare(
    "INSERT INTO members(id,email,name,organization,license_number,password_hash,consent_at,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING",
  )
    .bind(
      memberId,
      email,
      name,
      organization,
      license,
      await hashPassword(password),
      now,
      now,
    )
    .run();
  if (!result.meta.changes) withNote("/member/join", "duplicate");
  await createSession(DB, memberId);
  redirect("/member?note=joined");
}
export async function login(form) {
  const email = fields(form, "email").toLowerCase(),
    password = String(form.get("password") ?? "");
  const next = safeNext(fields(form, "next"));
  const back = "/member/login?next=" + encodeURIComponent(next);
  if (!email || email.length > 254 || !password || password.length > 128)
    withNote(back, "credentials");
  const { DB } = await portalEnv();
  const ip = (await headers()).get("cf-connecting-ip") || "local";
  if (
    !(await allowedAttempt(DB, "login-ip", ip, 80)) ||
    !(await allowedAttempt(DB, "login-account", email, 12))
  )
    withNote(back, "rate");
  const member = await DB.prepare(
    "SELECT id,password_hash FROM members WHERE email=?",
  )
    .bind(email)
    .first();
  const valid = await checkPassword(
    password,
    member?.password_hash ||
      "00000000000000000000000000000000." + "0".repeat(64),
  );
  if (!member || !valid) withNote(back, "credentials");
  await createSession(DB, member.id);
  redirect(next);
}
export async function logout() {
  const jar = await cookies(),
    token = jar.get(sessionCookie)?.value;
  if (token) {
    const { DB } = await portalEnv();
    await DB.prepare("DELETE FROM sessions WHERE token_hash=?")
      .bind(await digest(token))
      .run();
  }
  jar.delete(sessionCookie);
  redirect("/");
}
export async function enroll(form) {
  const eventId = fields(form, "event");
  const path = "/member/events/" + encodeURIComponent(eventId);
  const m = await requireMember(path),
    { DB } = await portalEnv(),
    now = timestamp();
  const result = await DB.prepare(
    `INSERT INTO registrations(id,event_id,member_id,status,fee,created_at)
    SELECT ?,e.id,?,CASE WHEN (SELECT COUNT(*) FROM registrations WHERE event_id=e.id AND status='registered') < e.capacity THEN 'registered' ELSE 'waiting' END,e.fee,?
    FROM events e WHERE e.id=? AND e.published=1 AND (e.opens_at<=? OR (?=1 AND e.priority_opens_at<=?)) AND e.closes_at>? AND (e.members_only=0 OR ?=1)
    ON CONFLICT(event_id,member_id) DO UPDATE SET status=excluded.status,fee=excluded.fee,created_at=excluded.created_at,paid_at=NULL,attended_at=NULL WHERE registrations.status='cancelled'`,
  )
    .bind(
      id(),
      m.id,
      now,
      eventId,
      now,
      Number(qualified(m)),
      now,
      now,
      Number(qualified(m)),
    )
    .run();
  withNote(path, result.meta.changes ? "registered" : "unavailable");
}
export async function cancelRegistration(form) {
  const eventId = fields(form, "event"),
    path = "/member/events/" + encodeURIComponent(eventId);
  const m = await requireMember(path),
    { DB } = await portalEnv(),
    now = timestamp();
  const [change] = await DB.batch([
    DB.prepare(
      "UPDATE registrations SET status='cancelled' WHERE event_id=? AND member_id=? AND status IN ('waiting','registered') AND paid_at IS NULL AND attended_at IS NULL AND EXISTS(SELECT 1 FROM events WHERE id=? AND closes_at>?)",
    ).bind(eventId, m.id, eventId, now),
    DB.prepare(
      `UPDATE registrations SET status='registered' WHERE id=(
      SELECT r.id FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.event_id=? AND r.status='waiting' AND e.closes_at>? AND e.capacity>(SELECT COUNT(*) FROM registrations WHERE event_id=e.id AND status='registered') ORDER BY r.created_at,r.id LIMIT 1
    )`,
    ).bind(eventId, now),
  ]);
  withNote(path, change.meta.changes ? "cancelled" : "unavailable");
}
export async function consult(form) {
  const board = fields(form, "board");
  const path = ["qa", "insurance"].includes(board) ? "/member/consult/" + board : "/member/consult";
  const m = await requireMember(path),
    category = board ? "사무국 문의" : fields(form, "category"),
    subject = fields(form, "subject"),
    body = fields(form, "body");
  if (
    !["법률상담", "회원 고충", "공동구매 문의", "사무국 문의"].includes(
      category,
    ) ||
    !subject ||
    subject.length > 120 ||
    !body ||
    body.length > 3000
  )
    withNote(path, "invalid");
  if (category === "법률상담" && !qualified(m))
    withNote(path, "approval");
  const { DB } = await portalEnv();
  if (!(await allowedAttempt(DB, "consult", m.id, 8)))
    withNote(path, "rate");
  const now = timestamp();
  await DB.prepare(
    "INSERT INTO consultations(id,member_id,category,subject,body,updated_at,created_at,board) VALUES(?,?,?,?,?,?,?,?)",
  )
    .bind(id(), m.id, category, subject, body, now, now, ["qa","insurance"].includes(board) ? board : null)
    .run();
  withNote(path, "sent");
}

export async function saveFile(form) {
  const fid = fields(form, "file"),
    path = "/member/reading/" + encodeURIComponent(fid);
  const m = await requireMember(path),
    { DB } = await portalEnv();
  if (fields(form, "mode") === "remove") {
    await DB.prepare("DELETE FROM saved_files WHERE member_id=? AND file_id=?")
      .bind(m.id, fid)
      .run();
  } else {
    await DB.prepare(
      "INSERT OR IGNORE INTO saved_files(member_id,file_id,saved_at) SELECT ?,id,? FROM files WHERE id=? AND (access='public' OR ?=1)",
    )
      .bind(m.id, timestamp(), fid, Number(qualified(m)))
      .run();
  }
  redirect(path);
}

export async function rememberPosition(fid, seconds) {
  if (
    typeof fid !== "string" ||
    fid.length > 80 ||
    !Number.isInteger(seconds) ||
    seconds < 0 ||
    seconds > 604800
  )
    return;
  const m = await requireMember(),
    { DB } = await portalEnv();
  await DB.prepare(
    `INSERT INTO watch_progress(member_id,file_id,seconds,updated_at) SELECT ?,id,?,? FROM files WHERE id=? AND mime LIKE 'video/%' AND (access='public' OR ?=1)
    ON CONFLICT(member_id,file_id) DO UPDATE SET seconds=excluded.seconds,updated_at=excluded.updated_at`,
  )
    .bind(m.id, seconds, timestamp(), fid, Number(qualified(m)))
    .run();
}
