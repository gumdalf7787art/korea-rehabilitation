import { notFound } from "next/navigation";
import Link from "next/link";
import {
  currentMember,
  portalEnv,
  qualified,
  dateKR,
} from "../../../../lib/portal";
import { Frame } from "../../ui";
import { saveFile } from "../../actions";
import Player from "./player";
export default async function Reading({ params }) {
  const { id } = await params,
    m = await currentMember(),
    { DB } = await portalEnv();
  const f = await DB.prepare(
    "SELECT id,name,description,topic,speaker,mime,created_at FROM files WHERE id=? AND (access='public' OR ?=1)",
  )
    .bind(id, Number(qualified(m)))
    .first();
  if (!f) notFound();
  const [saved, position] = m
    ? await Promise.all([
        DB.prepare(
          "SELECT 1 AS saved FROM saved_files WHERE member_id=? AND file_id=?",
        )
          .bind(m.id, id)
          .first(),
        DB.prepare(
          "SELECT seconds FROM watch_progress WHERE member_id=? AND file_id=?",
        )
          .bind(m.id, id)
          .first(),
      ])
    : [null, null];
  return (
    <Frame
      title={f.name}
      description={[f.topic, f.speaker, dateKR(f.created_at)]
        .filter(Boolean)
        .join(" · ")}
    >
      <section className="box">
        {f.mime.startsWith("video/") && (
          <Player
            id={id}
            position={position?.seconds || 0}
            track={Boolean(m)}
          />
        )}
        <p className="body">{f.description}</p>
        <div className="actions">
          <a className="action" href={"/api/files/" + id}>
            원본 열기
          </a>
          {m ? (
            <form action={saveFile}>
              <input type="hidden" name="file" value={id} />
              <input
                type="hidden"
                name="mode"
                value={saved ? "remove" : "save"}
              />
              <button className="secondary">
                {saved ? "저장 해제" : "내 자료로 저장"}
              </button>
            </form>
          ) : (
            <Link
              href={
                "/member/login?next=" +
                encodeURIComponent("/member/reading/" + id)
              }
            >
              로그인하고 저장
            </Link>
          )}
        </div>
      </section>
      <Link href="/member/documents">자료 목록</Link>
    </Frame>
  );
}
