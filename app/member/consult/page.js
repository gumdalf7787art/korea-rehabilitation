import {
  dateKR,
  portalEnv,
  qualified,
  requireMember,
} from "../../../lib/portal";
import { consult } from "../actions";
import { Field, Frame, Note, Empty } from "../ui";
export const metadata = { title: "상담·문의" };
export default async function Consult({ searchParams, board }) {
  const m = await requireMember(board ? "/member/consult/" + board : "/member/consult"),
    { DB } = await portalEnv(),
    q = await searchParams;
  const items = await DB.prepare(
    "SELECT * FROM consultations WHERE member_id=? AND (? IS NULL OR board=?) ORDER BY created_at DESC",
  )
    .bind(m.id, board || null, board || null)
    .all();
  const categories = [
    "법률상담",
    "회원 고충",
    "공동구매 문의",
    "사무국 문의",
  ].filter((x) => x !== "법률상담" || qualified(m));
  return (
    <Frame
      title={board === "qa" ? "Q&A게시판" : board === "insurance" ? "보험상담" : "상담·문의"}
      description="작성한 내용과 답변은 본인과 사무국 담당자가 확인합니다. 환자의 이름, 주민번호 등 식별 정보는 입력하지 마세요."
    >
      <Note code={q.note} />
      <form action={consult} className="box stack">
        {board ? <input type="hidden" name="board" value={board} /> : <Field title="문의 유형">
          <select
            name="category"
            defaultValue={
              categories.includes(q.category) ? q.category : "사무국 문의"
            }
          >
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>}
        {!board && !qualified(m) && (
          <p className="muted">
            무료 법률상담은 정회원 승인 후 이용할 수 있습니다.
          </p>
        )}
        <Field title="제목" name="subject" required maxLength={120} />
        <Field title="내용">
          <textarea name="body" rows={5} required maxLength={3000} />
        </Field>
        <button>비공개로 접수</button>
      </form>
      <section className="box">
        <h2>내 상담 내역</h2>
        {items.results.length ? (
          <ul className="rows">
            {items.results.map((x) => (
              <li key={x.id}>
                <details>
                  <summary>
                    {x.subject} · {x.status}
                  </summary>
                  <p className="muted">
                    {x.board === "insurance" ? "보험상담" : x.board === "qa" ? "Q&A" : x.category} · {dateKR(x.created_at)}
                  </p>
                  <p className="body">{x.body}</p>
                  {x.response && (
                    <>
                      <h3>사무국 답변</h3>
                      <p className="body">{x.response}</p>
                    </>
                  )}
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>접수한 상담이 없습니다.</Empty>
        )}
      </section>
    </Frame>
  );
}
