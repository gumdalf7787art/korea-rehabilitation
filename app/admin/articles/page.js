import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  requireStaff,
  portalEnv,
  fields,
  id,
  timestamp,
} from "../../../lib/portal";
const base = "/admin/articles";
function validateSource(value) {
  if (!value) return true;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
async function save(form) {
  "use server";
  await requireStaff();
  const { DB } = await portalEnv();
  const key = fields(form, "id"),
    version = fields(form, "version"),
    section = fields(form, "section");
  const title = fields(form, "title"),
    summary = fields(form, "summary"),
    body = fields(form, "body"),
    effective = fields(form, "effective"),
    source = fields(form, "source");
  const back =
    base + "?" + (key ? "edit=" + encodeURIComponent(key) + "&" : "");
  if (
    !["news", "insurance"].includes(section) ||
    !title ||
    title.length > 200 ||
    !summary ||
    summary.length > 500 ||
    !body ||
    body.length > 100000 ||
    !validateSource(source) ||
    (effective && !/^\d{4}-\d{2}-\d{2}$/.test(effective))
  )
    redirect(back + "message=invalid");
  const values = [
    section,
    title,
    summary,
    body,
    effective,
    source,
    form.get("publish") === "on" ? 1 : 0,
    timestamp(),
  ];
  if (key) {
    const result = await DB.prepare(
      "UPDATE articles SET section=?,title=?,summary=?,body=?,effective_on=?,source_url=?,published=?,updated_at=? WHERE id=? AND updated_at=?",
    )
      .bind(...values, key, version)
      .run();
    if (!result.meta.changes) redirect(back + "message=conflict");
  } else {
    await DB.prepare(
      "INSERT INTO articles(section,title,summary,body,effective_on,source_url,published,updated_at,id) VALUES(?,?,?,?,?,?,?,?,?)",
    )
      .bind(...values, id())
      .run();
  }
  redirect(base + "?message=saved");
}
export default async function Manage({ searchParams }) {
  await requireStaff();
  const q = await searchParams,
    { DB } = await portalEnv();
  const post = q.edit
    ? await DB.prepare("SELECT * FROM articles WHERE id=?")
        .bind(String(q.edit))
        .first()
    : null;
  if (q.edit && !post) notFound();
  const { results } = await DB.prepare(
    "SELECT id,title,published FROM articles ORDER BY updated_at DESC",
  ).all();
  const message = {
    invalid: "제목, 요약, 본문과 출처 주소를 확인해주세요.",
    saved: "저장했습니다.",
    conflict:
      "다른 담당자가 먼저 수정했습니다. 최신 내용을 확인한 뒤 다시 저장해주세요.",
  }[q.message];
  return (
    <main className="wrap page">
      <Link href="/admin">사무국 관리</Link>
      <h1>공지·보험 자료 관리</h1>
      {message && <p role="status">{message}</p>}
      <form action={save} className="panel editorForm">
        <h2>{post ? "게시물 수정" : "새 게시물"}</h2>
        <input type="hidden" name="id" value={post?.id || ""} />
        <input type="hidden" name="version" value={post?.updated_at || ""} />
        <label>
          분류
          <select name="section" defaultValue={post?.section || "news"}>
            <option value="news">의사회 소식</option>
            <option value="insurance">보험·청구</option>
          </select>
        </label>
        <label>
          제목
          <input
            required
            name="title"
            defaultValue={post?.title}
            maxLength={200}
          />
        </label>
        <label>
          요약
          <textarea
            required
            name="summary"
            defaultValue={post?.summary}
            maxLength={500}
          />
        </label>
        <label>
          본문
          <textarea
            required
            name="body"
            rows={10}
            maxLength={100000}
            defaultValue={post?.body}
          />
        </label>
        <label>
          시행일 (해당 시)
          <input
            type="date"
            name="effective"
            defaultValue={post?.effective_on}
          />
        </label>
        <label>
          원문 주소 (선택)
          <input name="source" type="url" defaultValue={post?.source_url} />
        </label>
        <label>
          <input
            type="checkbox"
            name="publish"
            defaultChecked={Boolean(post?.published)}
          />{" "}
          홈페이지에 공개
        </label>
        <button className="btn">저장</button>
      </form>
      <h2>게시물 목록</h2>
      {post && <Link href={base}>새 글 작성</Link>}
      <ul className="editorList">
        {results.map((p) => (
          <li key={p.id}>
            <Link href={base + "?edit=" + p.id}>
              {p.title} · {p.published ? "공개" : "초안"}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
