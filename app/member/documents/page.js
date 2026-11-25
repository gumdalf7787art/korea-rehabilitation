import {
  currentMember,
  portalEnv,
  qualified,
  dateKR,
} from "../../../lib/portal";
import Link from "next/link";
import { Field, Frame, Empty } from "../ui";
export const metadata = { title: "자료 찾기" };
export default async function Documents({ searchParams }) {
  const q = await searchParams,
    member = await currentMember(),
    { DB } = await portalEnv();
  const term = String(q.q ?? "")
      .trim()
      .slice(0, 100),
    event = String(q.event ?? "").slice(0, 80);
  const files = await DB.prepare(
    "SELECT id,name,description,speaker,topic,access,created_at FROM files WHERE (access='public' OR ?=1) AND (?='' OR event_id=?) AND instr(lower(name||' '||topic||' '||speaker||' '||description),lower(?))>0 ORDER BY created_at DESC LIMIT 150",
  )
    .bind(Number(qualified(member)), event, event, term)
    .all();
  return (
    <Frame
      title="자료 찾기"
      description="강의명, 연자, 주제로 검색하세요. 승인된 정회원으로 로그인하면 회원 자료도 열 수 있습니다."
    >
      <form className="box stack">
        <Field
          title="자료 검색"
          name="q"
          type="search"
          defaultValue={term}
          maxLength={100}
        />
        {event && <input type="hidden" name="event" value={event} />}
        <button>검색</button>
      </form>
      {!member && (
        <Link href="/member/login?next=/member/documents">회원 로그인</Link>
      )}
      <div className="box">
        {files.results.length ? (
          <ul className="rows">
            {files.results.map((f) => (
              <li key={f.id}>
                <Link href={"/member/reading/" + f.id}>{f.name}</Link>
                <p className="muted">
                  {[
                    f.access === "member" ? "정회원" : "공개",
                    f.topic,
                    f.speaker,
                    dateKR(f.created_at),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {f.description && <p>{f.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>현재 공개된 검색 결과가 없습니다.</Empty>
        )}
      </div>
    </Frame>
  );
}
