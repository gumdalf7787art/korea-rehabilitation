import Link from "next/link";
import {
  dateKR,
  koreaYear,
  money,
  portalEnv,
  qualified,
  requireMember,
} from "../../lib/portal";
import { logout } from "./actions";
import { Empty, Frame, Note, statusName } from "./ui";
export const metadata = { title: "마이페이지" };
export default async function MyPage({ searchParams }) {
  const m = await requireMember(),
    { DB } = await portalEnv();
  const [payments, registrations, saved, watching] = await DB.batch([
    DB.prepare("SELECT * FROM dues WHERE member_id=? ORDER BY year DESC").bind(
      m.id,
    ),
    DB.prepare(
      "SELECT r.*,e.title,e.starts_at FROM registrations r JOIN events e ON e.id=r.event_id WHERE member_id=? ORDER BY e.starts_at DESC",
    ).bind(m.id),
    DB.prepare(
      "SELECT f.id,f.name FROM saved_files s JOIN files f ON f.id=s.file_id WHERE s.member_id=? AND (f.access='public' OR ?=1) ORDER BY s.saved_at DESC LIMIT 50",
    ).bind(m.id, Number(qualified(m))),
    DB.prepare(
      "SELECT f.id,f.name,w.seconds FROM watch_progress w JOIN files f ON f.id=w.file_id WHERE w.member_id=? AND w.seconds>0 AND (f.access='public' OR ?=1) ORDER BY w.updated_at DESC LIMIT 10",
    ).bind(m.id, Number(qualified(m))),
  ]);
  const current = payments.results.find((x) => x.year === koreaYear());
  return (
    <Frame
      title={m.name + " 회원님"}
      description={m.organization + " · " + m.email}
    >
      <Note code={(await searchParams).note} />
      <div className="pair">
        <section className="box">
          <h2>회원 자격</h2>
          <span className="pill">{qualified(m) ? "정회원" : "승인 대기"}</span>
          <p>
            {qualified(m)
              ? "정회원 교육 자료와 법률상담을 이용할 수 있습니다."
              : "사무국이 면허 정보와 입금을 확인하면 정회원으로 승인됩니다."}
          </p>
          <div className="actions">
            <Link href="/member/consult">사무국에 문의</Link>
            {m.role === "staff" && <Link href="/admin">사무국 관리</Link>}
          </div>
        </section>
        <section className="box">
          <h2>{koreaYear()}년 연회비</h2>
          <span className="pill">{current ? "납부 확인" : "납부 확인 전"}</span>
          <p>
            {current
              ? money(current.amount) + " · " + dateKR(current.paid_at)
              : "납부 방법과 입금 확인은 사무국에 문의해 주세요."}
          </p>
          {current ? (
            <Link href={"/member/receipt/dues/" + current.id}>
              납부확인서 보기
            </Link>
          ) : (
            <a href="tel:15994897">사무국 1599-4897</a>
          )}
        </section>
      </div>
      <section className="box">
        <h2>신청한 행사</h2>
        {registrations.results.length ? (
          <ul className="rows">
            {registrations.results.map((r) => (
              <li key={r.id}>
                <div className="entry">
                  <Link href={"/member/events/" + r.event_id}>{r.title}</Link>
                  <span className="pill">{statusName[r.status]}</span>
                </div>
                <p className="muted">
                  {dateKR(r.starts_at)} ·{" "}
                  {r.fee === 0
                    ? "무료"
                    : r.paid_at
                      ? "입금 확인"
                      : "등록비 " + money(r.fee)}
                </p>
                <div className="actions">
                  {r.paid_at && (
                    <Link href={"/member/receipt/event/" + r.id}>
                      등록비 납부확인서
                    </Link>
                  )}
                  {r.attended_at && (
                    <Link href={"/member/receipt/attend/" + r.id}>
                      참가확인서
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>신청한 행사가 없습니다.</Empty>
        )}
      </section>
      {(saved.results.length > 0 || watching.results.length > 0) && (
        <div className="pair">
          <section className="box">
            <h2>저장한 자료</h2>
            {saved.results.length ? (
              <ul className="rows">
                {saved.results.map((f) => (
                  <li key={f.id}>
                    <Link href={"/member/reading/" + f.id}>{f.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>저장한 자료가 없습니다.</Empty>
            )}
          </section>
          <section className="box">
            <h2>이어볼 강의</h2>
            {watching.results.length ? (
              <ul className="rows">
                {watching.results.map((f) => (
                  <li key={f.id}>
                    <Link href={"/member/reading/" + f.id}>{f.name}</Link> ·{" "}
                    {Math.floor(f.seconds / 60)}분 {f.seconds % 60}초
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>재생 중인 강의가 없습니다.</Empty>
            )}
          </section>
        </div>
      )}
      <section className="box">
        <h2>연회비 납부 내역</h2>
        {payments.results.length ? (
          <ul className="rows">
            {payments.results.map((d) => (
              <li key={d.id} className="entry">
                {d.year}년 · {money(d.amount)}
                <Link href={"/member/receipt/dues/" + d.id}>납부확인서</Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>확인된 납부 내역이 없습니다.</Empty>
        )}
      </section>
      <div className="actions">
        <Link href="/member/documents" className="action secondary">
          회원 자료
        </Link>
        <Link href="/member/consult" className="action secondary">
          내 상담
        </Link>
        <form action={logout}>
          <button className="secondary">로그아웃</button>
        </form>
      </div>
    </Frame>
  );
}
