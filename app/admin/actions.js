"use server";

import {
  fields,
  id,
  koreaYear,
  portalEnv,
  requireStaff,
  timestamp,
  withNote,
} from "../../lib/portal";
const back = (tab) => "/admin?tab=" + tab;
const finish = (tab, ok) => withNote(back(tab), ok ? "saved" : "unavailable");
export async function approveMember(form) {
  const staff = await requireStaff(),
    { DB } = await portalEnv(),
    member = fields(form, "member"),
    year = Number(fields(form, "year")),
    amount = Number(fields(form, "amount"));
  if (
    !member ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > koreaYear() + 1 ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > 99999999
  )
    withNote(back("members"), "invalid");
  const now = timestamp();
  const [payment] = await DB.batch([
    DB.prepare(
      "INSERT INTO dues(id,member_id,year,amount,paid_at,confirmed_by) SELECT ?,id,?,?,?,? FROM members WHERE id=? ON CONFLICT(member_id,year) DO NOTHING",
    ).bind(id(), year, amount, now, staff.id, member),
    DB.prepare(
      "UPDATE members SET approved_at=COALESCE(approved_at,?) WHERE id=? AND EXISTS(SELECT 1 FROM dues WHERE member_id=? AND year=?)",
    ).bind(now, member, member, year),
  ]);
  finish("members", payment.meta.changes);
}
function isoKST(v) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(v + ":00+09:00");
  return Number.isFinite(d.valueOf()) ? d.toISOString() : null;
}
export async function saveEvent(form) {
  await requireStaff();
  const title = fields(form, "title"),
    location = fields(form, "location"),
    description = fields(form, "description"),
    capacity = Number(fields(form, "capacity")),
    fee = Number(fields(form, "fee"));
  const [start, end, open, close] = ["start", "end", "open", "close"].map((k) =>
    isoKST(fields(form, k)),
  );
  const priorityInput = fields(form, "priority"),
    priority = priorityInput ? isoKST(priorityInput) : null;
  if (priorityInput && (!priority || !open || priority >= open))
    withNote(back("events"), "invalid");
  if (
    !title ||
    title.length > 180 ||
    !location ||
    location.length > 180 ||
    description.length > 8000 ||
    !start ||
    !end ||
    !open ||
    !close ||
    end <= start ||
    close <= open ||
    close > end ||
    !Number.isSafeInteger(capacity) ||
    capacity < 1 ||
    capacity > 100000 ||
    !Number.isSafeInteger(fee) ||
    fee < 0 ||
    fee > 99999999
  )
    withNote(back("events"), "invalid");
  const { DB } = await portalEnv();
  const values = [
    title,
    description,
    location,
    start,
    end,
    open,
    close,
    capacity,
    Number(form.has("members_only")),
    fee,
    timestamp(),
    priority,
  ];
  if (fields(form, "mode") === "edit") {
    const eid = fields(form, "event_id");
    const [change] = await DB.batch([
      DB.prepare(
        "UPDATE events SET title=?,description=?,location=?,starts_at=?,ends_at=?,opens_at=?,closes_at=?,capacity=?,members_only=?,fee=?,updated_at=?,priority_opens_at=? WHERE id=? AND ?>=(SELECT COUNT(*) FROM registrations WHERE event_id=? AND status='registered')",
      ).bind(...values, eid, capacity, eid),
      DB.prepare(
        `UPDATE registrations SET status='registered' WHERE id IN (SELECT r.id FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.event_id=? AND r.status='waiting' AND e.closes_at>? ORDER BY r.created_at,r.id LIMIT (SELECT MAX(0,capacity-(SELECT COUNT(*) FROM registrations WHERE event_id=? AND status='registered')) FROM events WHERE id=?))`,
      ).bind(eid, timestamp(), eid, eid),
    ]);
    finish("events", change.meta.changes);
  }
  await DB.prepare(
    "INSERT INTO events(id,title,description,location,starts_at,ends_at,opens_at,closes_at,capacity,members_only,fee,published,updated_at,priority_opens_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,1,?,?)",
  )
    .bind(id(), ...values)
    .run();
  finish("events", true);
}
export async function confirmRegistration(form) {
  await requireStaff();
  const { DB } = await portalEnv(),
    reg = fields(form, "registration"),
    type = fields(form, "type");
  if (!["paid", "attended"].includes(type)) withNote(back("events"), "invalid");
  const stmt =
    type === "paid"
      ? "UPDATE registrations SET paid_at=? WHERE id=? AND status='registered' AND fee>0 AND paid_at IS NULL"
      : "UPDATE registrations SET attended_at=? WHERE id=? AND status='registered' AND attended_at IS NULL AND EXISTS(SELECT 1 FROM events WHERE id=registrations.event_id AND starts_at<=?)";
  const now = timestamp(),
    args = type === "paid" ? [now, reg] : [now, reg, now];
  finish(
    "events",
    (
      await DB.prepare(stmt)
        .bind(...args)
        .run()
    ).meta.changes,
  );
}
export async function respond(form) {
  const staff = await requireStaff(),
    { DB } = await portalEnv(),
    qid = fields(form, "id"),
    answer = fields(form, "response"),
    status = fields(form, "status");
  if (
    !["확인 중", "답변 완료"].includes(status) ||
    answer.length > 5000 ||
    (status === "답변 완료" && !answer)
  )
    withNote(back("consult"), "invalid");
  const result = await DB.prepare(
    "UPDATE consultations SET response=?,status=?,answered_by=?,updated_at=? WHERE id=?",
  )
    .bind(answer, status, staff.id, timestamp(), qid)
    .run();
  finish("consult", result.meta.changes);
}
const types = {
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  hwp: "application/octet-stream",
  hwpx: "application/octet-stream",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};
export async function upload(form) {
  await requireStaff();
  const { DB, FILES } = await portalEnv(),
    file = form.get("file"),
    existing = fields(form, "object"),
    name = fields(form, "name"),
    description = fields(form, "description"),
    topic = fields(form, "topic"),
    speaker = fields(form, "speaker"),
    eventId = fields(form, "event"),
    access = fields(form, "access"),
    kind = fields(form, "kind");
  const input = file && typeof file === "object" && file.size > 0 ? file : null;
  const filename = input?.name || existing,
    ext = filename.split(".").pop().toLowerCase(),
    mime = Object.hasOwn(types, ext) ? types[ext] : null;
  if (
    !name ||
    name.length > 180 ||
    description.length > 2000 ||
    topic.length > 120 ||
    speaker.length > 120 ||
    !mime ||
    !["public", "member"].includes(access) ||
    !["lecture", "insurance", "form", "other"].includes(kind) ||
    (!input && !existing) ||
    (input && existing) ||
    input?.size > 10 * 1024 * 1024 ||
    (existing && !/^incoming\/[A-Za-z0-9_./-]{1,250}$/.test(existing))
  )
    withNote(back("files"), "file");
  if (
    eventId &&
    !(await DB.prepare("SELECT id FROM events WHERE id=?")
      .bind(eventId)
      .first())
  )
    withNote(back("files"), "invalid");
  const fid = id(),
    key = input ? "uploads/" + fid + "." + ext : existing;
  if (
    existing &&
    ((await DB.prepare("SELECT id FROM files WHERE object_key=?")
      .bind(key)
      .first()) ||
      !(await FILES.head(key)))
  )
    withNote(back("files"), "file");
  let put = false;
  try {
    if (input) {
      await FILES.put(key, await input.arrayBuffer(), {
        httpMetadata: { contentType: mime },
      });
      put = true;
    }
    await DB.prepare(
      "INSERT INTO files(id,object_key,name,description,topic,speaker,event_id,access,kind,mime,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    )
      .bind(
        fid,
        key,
        name,
        description,
        topic,
        speaker,
        eventId || null,
        access,
        kind,
        mime,
        timestamp(),
      )
      .run();
  } catch {
    if (put) await FILES.delete(key);
    withNote(back("files"), "storage");
  }
  finish("files", true);
}
