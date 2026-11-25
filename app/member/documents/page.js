import {
  currentMember,
  portalEnv,
  qualified,

} from "../../../lib/portal";
import Link from "next/link";
import BoardList from "../../board-list";
import { Frame } from "../ui";
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
    "SELECT id,name,description,speaker,topic,access,created_at FROM files WHERE (access='public' OR ?=1) AND (?='' OR event_id=?) AND instr(lower(name||' '||topic||' '||speaker||' '||description),lower(?))>0 ORDER BY created_at DESC",
  )
    .bind(Number(qualified(member)), event, event, term)
    .all();
  return (
    <Frame
      title="자료실"
      description="강의명, 연자, 주제로 검색하세요. 승인된 정회원으로 로그인하면 회원 자료도 열 수 있습니다."
    >
      {!member && (
        <Link href="/member/login?next=/member/documents">회원 로그인</Link>
      )}
      <BoardList path="/member/documents" q={term} event={event} type={q.type}
        page={Math.max(1, parseInt(q.p,10)||1)}
        rows={files.results.map(f => ({path: "/member/reading/"+f.id, title: f.name, date: f.created_at.slice(0,10)}))} />
    </Frame>
  );
}