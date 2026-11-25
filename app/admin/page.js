import Link from "next/link";
import {
  dateKR,
  koreaYear,
  money,
  portalEnv,
  requireStaff,
  timestamp,
} from "../../lib/portal";
import { Empty, Field, Frame, Note, statusName } from "../member/ui";
import { approveMember, confirmRegistration, respond, upload } from "./actions";
import EventForm from "./event-form";
const tabs = {
  members: "회원·연회비",
  events: "행사·등록",
  consult: "상담",
  files: "자료",
};
const per = 30;
function Pager({ page, more, tab, query }) {
  const url = (p) =>
    "/admin?tab=" + tab + "&p=" + p + "&q=" + encodeURIComponent(query);
  return (
    <nav className="actions" aria-label="목록 페이지">
      {page > 1 && <Link href={url(page - 1)}>이전</Link>}
      <span>{page}페이지</span>
      {more && <Link href={url(page + 1)}>다음</Link>}
    </nav>
  );
}
async function Members({ db, off, query }) {
  const list = await db
    .prepare(
      "SELECT id,name,email,organization,license_number,approved_at,created_at FROM members WHERE instr(lower(name||' '||email||' '||organization),lower(?))>0 ORDER BY (approved_at IS NULL) DESC,created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(query, per + 1, off)
    .all();
  return (
    <>
      <section className="box">
        <h2>가입 신청·연회비 확인</h2>
        <form>
          <input type="hidden" name="tab" value="members" />
          <Field title="회원 이름·소속·이메일" name="q" defaultValue={query} />
          <button>회원 검색</button>
        </form>
        <p className="muted">
          면허 정보와 실제 입금 내역을 대조한 후 정회원 승인을 처리하세요. 같은
          연도의 납부 기록은 한 번만 생성됩니다.
        </p>
        {list.results.length ? (
          <ul className="rows">
            {list.results.slice(0, per).map((m) => (
              <li key={m.id}>
                <details>
                  <summary>
                    {m.name} · {m.organization} ·{" "}
                    {m.approved_at ? "승인됨" : "승인 대기"}
                  </summary>
                  <p>
                    {m.email} · 면허 {m.license_number}
                  </p>
                  <form action={approveMember} className="stack">
                    <input type="hidden" name="member" value={m.id} />
                    <Field
                      title="납부 연도"
                      name="year"
                      type="number"
                      required
                      defaultValue={koreaYear()}
                      min={2000}
                      max={koreaYear() + 1}
                    />
                    <Field
                      title="확인한 실납부 금액 (원)"
                      name="amount"
                      type="number"
                      min={1}
                      max={99999999}
                      required
                    />
                    <button>납부 확인 및 정회원 승인</button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>표시할 회원이 없습니다.</Empty>
        )}
      </section>
      <Pager
        page={off / per + 1}
        more={list.results.length > per}
        tab="members"
        query={query}
      />
    </>
  );
}
async function Events({ db, off, query }) {
  const regs = await db
    .prepare(
      "SELECT r.*,m.name,m.email,e.title,e.starts_at FROM registrations r JOIN members m ON m.id=r.member_id JOIN events e ON e.id=r.event_id WHERE instr(lower(e.title||' '||m.name||' '||m.email),lower(?))>0 ORDER BY r.created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(query, per + 1, off)
    .all();
  const events = await db
    .prepare(
      "SELECT id,title,starts_at FROM events ORDER BY starts_at DESC LIMIT 50",
    )
    .all();
  return (
    <>
      <details className="box">
        <summary>학술행사 등록</summary>
        <EventForm />
      </details>
      <details className="box">
        <summary>최근 등록 행사 {events.results.length}건</summary>
        <ul className="rows">
          {events.results.map((e) => (
            <li key={e.id}>
              <Link href={"/member/events/" + e.id}>{e.title}</Link> ·{" "}
              {dateKR(e.starts_at)} ·{" "}
              <Link href={"/admin/events/" + e.id}>수정·복제</Link>
            </li>
          ))}
        </ul>
      </details>
      <section className="box">
        <h2>신청자와 출석</h2>
        <form>
          <input type="hidden" name="tab" value="events" />
          <Field title="행사명·신청자 검색" name="q" defaultValue={query} />
          <button>검색</button>
        </form>
        {regs.results.length ? (
          <ul className="rows">
            {regs.results.slice(0, per).map((r) => (
              <li key={r.id}>
                <strong>
                  {r.name} · {r.title}
                </strong>
                <p className="muted">
                  {r.email} · {statusName[r.status]} · 등록비 {money(r.fee)}
                  {r.paid_at ? " · 입금 확인" : ""}
                  {r.attended_at ? " · 출석 확인" : ""}
                </p>
                {r.status === "registered" && (
                  <form action={confirmRegistration} className="actions">
                    <input type="hidden" name="registration" value={r.id} />
                    {r.fee > 0 && !r.paid_at && (
                      <button name="type" value="paid">
                        입금 확인
                      </button>
                    )}
                    {!r.attended_at && r.starts_at <= timestamp() && (
                      <button name="type" value="attended">
                        출석 확인
                      </button>
                    )}
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>신청자가 없습니다.</Empty>
        )}
      </section>
      <Pager
        page={off / per + 1}
        more={regs.results.length > per}
        tab="events"
        query={query}
      />
    </>
  );
}
async function Consultations({ db, off }) {
  const list = await db
    .prepare(
      "SELECT q.*,m.name FROM consultations q JOIN members m ON m.id=q.member_id ORDER BY (status='답변 완료'),created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(per + 1, off)
    .all();
  return (
    <>
      <section className="box">
        <h2>비공개 문의</h2>
        {list.results.length ? (
          <ul className="rows">
            {list.results.slice(0, per).map((q) => (
              <li key={q.id}>
                <details>
                  <summary>
                    {q.subject} · {q.status}
                  </summary>
                  <p className="muted">
                    {q.name} · {q.board === "insurance" ? "보험상담" : q.board === "qa" ? "Q&A" : q.category} · {dateKR(q.created_at)}
                  </p>
                  <p className="body">{q.body}</p>
                  <form action={respond} className="stack">
                    <input type="hidden" name="id" value={q.id} />
                    <Field title="상태">
                      <select
                        name="status"
                        defaultValue={
                          q.status === "답변 완료" ? q.status : "확인 중"
                        }
                      >
                        <option>확인 중</option>
                        <option>답변 완료</option>
                      </select>
                    </Field>
                    <Field title="답변">
                      <textarea
                        name="response"
                        rows={4}
                        defaultValue={q.response || ""}
                        maxLength={5000}
                      />
                    </Field>
                    <button>회원에게 반영</button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>접수한 문의가 없습니다.</Empty>
        )}
      </section>
      <Pager
        page={off / per + 1}
        more={list.results.length > per}
        tab="consult"
        query=""
      />
    </>
  );
}
async function Files({ db, off }) {
  const list = await db
    .prepare(
      "SELECT id,name,access,created_at FROM files ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(per + 1, off)
    .all();
  const events = await db
    .prepare("SELECT id,title FROM events ORDER BY starts_at DESC LIMIT 150")
    .all();
  return (
    <>
      <section className="box">
        <h2>자료 등록</h2>
        <form action={upload} className="stack">
          <Field title="자료명" name="name" required maxLength={180} />
          <Field title="설명">
            <textarea name="description" maxLength={2000} />
          </Field>
          <div className="pair">
            <Field title="주제" name="topic" maxLength={120} />
            <Field title="연자" name="speaker" maxLength={120} />
            <Field title="분류">
              <select name="kind">
                <option value="lecture">교육·강의</option>
                <option value="insurance">보험·청구</option>
                <option value="form">실무 서식</option>
                <option value="other">기타</option>
              </select>
            </Field>
            <Field title="열람 대상">
              <select name="access">
                <option value="member">정회원</option>
                <option value="public">전체 공개</option>
              </select>
            </Field>
          </div>
          <Field title="관련 행사">
            <select name="event">
              <option value="">해당 없음</option>
              {events.results.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </Field>
          <Field
            title="파일 (최대 10MB)"
            name="file"
            type="file"
            accept=".pdf,.mp4,.webm,.docx,.xlsx,.pptx,.hwp,.hwpx,.jpg,.jpeg,.png"
          />
          <details>
            <summary>대용량 강의 영상 연결</summary>
            <p className="muted">
              비공개 R2 버킷의 incoming/ 아래에 영문 파일명으로 먼저
              업로드하세요. 파일 선택을 비운 상태에서 객체 키를 입력합니다.
            </p>
            <Field
              title="R2 객체 키"
              name="object"
              placeholder="incoming/workshop.mp4"
              maxLength={259}
            />
          </details>
          <button>자료 게시</button>
        </form>
      </section>
      <section className="box">
        <h2>게시 자료</h2>
        {list.results.length ? (
          <ul className="rows">
            {list.results.slice(0, per).map((f) => (
              <li key={f.id}>
                <a href={"/api/files/" + f.id}>{f.name}</a> ·{" "}
                {f.access === "member" ? "정회원" : "공개"}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>등록한 자료가 없습니다.</Empty>
        )}
      </section>
      <Pager
        page={off / per + 1}
        more={list.results.length > per}
        tab="files"
        query=""
      />
    </>
  );
}
export default async function Admin({ searchParams }) {
  await requireStaff();
  const q = await searchParams,
    tab = Object.hasOwn(tabs, q.tab) ? q.tab : "members",
    query = String(q.q ?? "").slice(0, 120),
    off = (Math.min(100000, Math.max(1, parseInt(q.p, 10) || 1)) - 1) * per,
    { DB: db } = await portalEnv();
  const Component = {
    members: Members,
    events: Events,
    consult: Consultations,
    files: Files,
  }[tab];
  return (
    <Frame title="사무국 관리">
      <nav className="sections">
        {Object.entries(tabs).map(([k, v]) => (
          <Link
            key={k}
            aria-current={k === tab ? "page" : undefined}
            href={"/admin?tab=" + k}
          >
            {v}
          </Link>
        ))}
        <Link href="/admin/articles">소식·보험 게시물</Link>
        <Link href="/admin/editor">회원 병의원</Link>
      </nav>
      <Note code={q.note} />
      <Component db={db} off={off} query={query} />
    </Frame>
  );
}
