import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function database() {
  return (await getCloudflareContext({ async: true })).env.DB;
}

function textFilter(q, columns) {
  const words = q.trim().split(/\s+/).filter(Boolean).slice(0, 8);
  const clause = words
    .map(
      () =>
        "(" +
        columns
          .map((c) => "COALESCE(" + c + ", '') LIKE ? ESCAPE '!'")
          .join(" OR ") +
        ")",
    )
    .join(" AND ");
  return {
    clause: clause ? " AND " + clause : "",
    values: words.flatMap((word) =>
      columns.map(() => "%" + word.replace(/[!%_]/g, "!$&") + "%"),
    ),
  };
}

function editorArticle(row) {
  return {
    path: "/" + row.section + "/post/" + row.id,
    title: row.title,
    description: row.summary,
    date: row.updated_at.slice(0, 10),
    effective: row.effective_on,
    group: row.section === "insurance" ? "보험·청구" : "소식·정책",
    paragraphs: row.body?.split(/\r?\n\s*\r?\n/),
    source: row.source_url,
  };
}

export const getArticle = cache(async (section, id) => {
  const db = await database();
  const row = await db
    .prepare("SELECT * FROM articles WHERE id=? AND section=? AND published=1")
    .bind(id, section)
    .first();
  return row && editorArticle(row);
});
export const getPublicEvent = cache(async (id) => {
  const db = await database();
  const event = await db
    .prepare(
      "SELECT id,title,description,location,starts_at,ends_at,opens_at,closes_at,fee,members_only FROM events WHERE id=? AND published=1",
    )
    .bind(id)
    .first();
  if (!event) return null;
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const time = (iso) => formatter.format(new Date(iso));
  const closed = Date.parse(event.closes_at) < Date.now();
  return {
    path: "/education/event/" + event.id,
    title: event.title,
    description:
      event.description ||
      time(event.starts_at) + "에 열리는 대한재활의학과의사회 교육입니다.",
    facts: [
      ["행사 시작", time(event.starts_at)],
      ["행사 종료", time(event.ends_at)],
      ["장소", event.location],
      ["접수 시작", time(event.opens_at)],
      ["접수 마감", time(event.closes_at)],
      ["참가비", Number(event.fee).toLocaleString("ko-KR") + "원"],
      ["등록 대상", event.members_only ? "정회원" : "가입 회원"],
    ],
    links: [
      {
        label: closed ? "내 등록 확인" : "등록 가능 여부·신청",
        href: "/member/events/" + event.id,
      },
    ],
    event: {
      startDate: event.starts_at,
      endDate: event.ends_at,
      location: { "@type": "Place", name: event.location },
    },
  };
});

export async function listArticles(section = "", q = "") {
  const f = textFilter(q, ["title", "summary", "body"]);
  const db = await database();
  const result = await db
    .prepare(
      "SELECT id, section, title, summary, effective_on, source_url, updated_at FROM articles WHERE published=1" +
        (section ? " AND section=?" : "") +
        f.clause +
        " ORDER BY updated_at DESC",
    )
    .bind(...(section ? [section] : []), ...f.values)
    .all();
  return result.results.map(editorArticle);
}
export async function listEvents(q = "", mode = "all") {
  const db = await database();
  const f = textFilter(q, ["title", "location", "description"]);
  const past = mode === "archive";
  const window =
    mode === "all"
      ? ""
      : past
        ? " AND julianday(ends_at) < julianday('now')"
        : " AND julianday(ends_at) >= julianday('now')";
  const result = await db
    .prepare(
      "SELECT id,title,description,location,starts_at,ends_at,opens_at,closes_at FROM events WHERE published=1" +
        window +
        f.clause +
        " ORDER BY starts_at " +
        (past || mode === "all" ? "DESC" : "ASC"),
    )
    .bind(...f.values)
    .all();
  return result.results.map((e) => {
    const now = Date.now();
    let group = "접수 예정";
    if (Date.parse(e.ends_at) < now) group = "행사 종료";
    else if (Date.parse(e.closes_at) < now) group = "접수 마감";
    else if (Date.parse(e.opens_at) <= now) group = "접수 기간";
    const date = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
    }).format(new Date(e.starts_at));
    return {
      path: "/education/event/" + e.id,
      title: e.title,
      description: e.location,
      date,
      group,
    };
  });
}
export async function listPublicFiles(kind = "", q = "") {
  const db = await database();
  const f = textFilter(q, ["name", "speaker", "topic", "description"]);
  const result = await db
    .prepare(
      "SELECT id,name,description,topic,speaker,kind,created_at FROM files WHERE access='public'" +
        (kind ? " AND kind=?" : "") +
        f.clause +
        " ORDER BY created_at DESC",
    )
    .bind(...(kind ? [kind] : []), ...f.values)
    .all();
  const labels = {
    lecture: "공개 강의",
    insurance: "보험 자료",
    form: "서식",
    other: "공개 자료",
  };
  return result.results.map((row) => ({
    path: "/member/reading/" + row.id,
    title: row.name,
    description: [row.speaker, row.topic, row.description]
      .filter(Boolean)
      .join(" · "),
    group: labels[row.kind],
    date: row.created_at.slice(0, 10),
  }));
}
export async function listClinics(q = "") {
  const db = await database();
  const f = textFilter(q, ["name", "address", "region"]);
  return (
    await db
      .prepare(
        "SELECT name,address,region,phone,site_url FROM clinics WHERE published=1 AND consent_confirmed=1" +
          f.clause +
          " ORDER BY region,name",
      )
      .bind(...f.values)
      .all()
  ).results;
}
