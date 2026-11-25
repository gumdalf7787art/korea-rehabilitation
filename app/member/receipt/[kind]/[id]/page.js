import { notFound } from "next/navigation";
import Link from "next/link";
import {
  portalEnv,
  requireMember,
  dateKR,
  money,
} from "../../../../../lib/portal";
export const metadata = { title: "회원 확인서" };
export default async function Receipt({ params }) {
  const { kind, id } = await params,
    user = await requireMember("/member/receipt/" + kind + "/" + id),
    { DB } = await portalEnv();
  if (!["dues", "event", "attend"].includes(kind)) notFound();
  const dues = kind === "dues",
    attendance = kind === "attend";
  const row = dues
    ? await DB.prepare(
        "SELECT amount,year,paid_at FROM dues WHERE id=? AND member_id=?",
      )
        .bind(id, user.id)
        .first()
    : await DB.prepare(
        "SELECT r.fee AS amount,r.paid_at,r.attended_at,e.title FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.id=? AND r.member_id=? AND r.status='registered'",
      )
        .bind(id, user.id)
        .first();
  if (!row || (attendance ? !row.attended_at : !row.paid_at)) notFound();
  const title = attendance
    ? "학술행사 참가확인서"
    : dues
      ? "연회비 납부확인서"
      : "학술행사 등록비 납부확인서";
  return (
    <article className="portal receipt">
      <Link href="/member" className="crumb">
        마이페이지
      </Link>
      <h1>{title}</h1>
      <section className="box">
        <h2>대한재활의학과의사회</h2>
        <dl>
          <dt>성명</dt>
          <dd>{user.name}</dd>
          <dt>소속</dt>
          <dd>{user.organization}</dd>
          <dt>항목</dt>
          <dd>{dues ? row.year + "년 연회비" : row.title}</dd>
          {!attendance && (
            <>
              <dt>납부 금액</dt>
              <dd>{money(row.amount)}</dd>
            </>
          )}
          <dt>확인일</dt>
          <dd>{dateKR(attendance ? row.attended_at : row.paid_at)}</dd>
          <dt>확인 번호</dt>
          <dd>{id}</dd>
        </dl>
        <p>
          위 회원의 {attendance ? "학술행사 참가" : "납부 내역"}을 확인합니다.
        </p>
      </section>
      <p className="muted">
        브라우저 인쇄 메뉴에서 인쇄하거나 PDF로 저장할 수 있습니다.
      </p>
    </article>
  );
}
