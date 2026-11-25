import Link from "next/link";
import { notFound } from "next/navigation";
import {
  currentMember,
  dateKR,
  money,
  portalEnv,
  qualified,
  timestamp,
} from "../../../../lib/portal";
import { enroll, cancelRegistration } from "../../actions";
import { Frame, Note, statusName } from "../../ui";
export default async function Event({ params, searchParams }) {
  const { id } = await params,
    { DB } = await portalEnv(),
    member = await currentMember();
  const event = await DB.prepare(
    "SELECT e.*,(SELECT COUNT(*) FROM registrations WHERE event_id=e.id AND status='registered') AS taken FROM events e WHERE id=? AND published=1",
  )
    .bind(id)
    .first();
  if (!event) notFound();
  const reg = member
    ? await DB.prepare(
        "SELECT * FROM registrations WHERE event_id=? AND member_id=?",
      )
        .bind(id, member.id)
        .first()
    : null;
  const now = timestamp(),
    priority = Boolean(
      event.priority_opens_at &&
        event.priority_opens_at <= now &&
        now < event.opens_at,
    ),
    open =
      (event.opens_at <= now || (priority && qualified(member))) &&
      event.closes_at > now,
    active = reg && reg.status !== "cancelled",
    path = "/member/events/" + id;
  const status = priority
    ? "정회원 우선등록"
    : now < event.opens_at
      ? "접수 예정"
      : now >= event.ends_at
        ? "행사 종료"
        : !open
          ? "접수 마감"
          : event.taken >= event.capacity
            ? "대기 접수"
            : "접수 중";
  return (
    <Frame title={event.title} description={event.location}>
      <Note code={(await searchParams).note} />
      <section className="box">
        <span className="pill">{status}</span>
        <dl>
          <dt>행사 일정</dt>
          <dd>
            {dateKR(event.starts_at)} ~ {dateKR(event.ends_at)}
          </dd>
          {event.priority_opens_at && (
            <>
              <dt>정회원 우선등록 시작</dt>
              <dd>{dateKR(event.priority_opens_at)}</dd>
            </>
          )}
          <dt>일반 신청 기간</dt>
          <dd>
            {dateKR(event.opens_at)} ~ {dateKR(event.closes_at)}
          </dd>
          <dt>등록 대상</dt>
          <dd>{event.members_only ? "승인된 정회원" : "가입 회원"}</dd>
          <dt>등록비</dt>
          <dd>{event.fee ? money(event.fee) : "무료"}</dd>
          <dt>잔여 좌석</dt>
          <dd>
            {Math.max(0, event.capacity - event.taken)} / {event.capacity}석
          </dd>
        </dl>
        <p className="body">{event.description}</p>
        {active ? (
          <>
            <p className="notice">
              내 신청 상태 · {statusName[reg.status]}
              {reg.status === "waiting"
                ? " (취소 좌석 발생 시 접수 순서대로 등록)"
                : " "}
              {reg.fee > 0 && reg.status === "registered"
                ? reg.paid_at
                  ? " · 입금 확인"
                  : " · 입금 확인 전"
                : ""}
            </p>
            {open && !reg.paid_at && !reg.attended_at && (
              <form action={cancelRegistration}>
                <input type="hidden" name="event" value={id} />
                <button className="secondary">신청 취소</button>
              </form>
            )}
            {reg.paid_at && <Link href="/member/consult">취소·환불 문의</Link>}
          </>
        ) : open ? (
          member ? (
            event.members_only && !qualified(member) ? (
              <p>
                정회원 승인 후 신청할 수 있습니다.{" "}
                <Link href="/member">회원 상태 확인</Link>
              </p>
            ) : (
              <form action={enroll}>
                <input type="hidden" name="event" value={id} />
                <button>
                  {event.taken >= event.capacity ? "대기 신청" : "참가 신청"}
                </button>
              </form>
            )
          ) : (
            <Link
              className="action"
              href={"/member/login?next=" + encodeURIComponent(path)}
            >
              로그인하고 신청
            </Link>
          )
        ) : priority && !member ? (
          <Link
            className="action"
            href={"/member/login?next=" + encodeURIComponent(path)}
          >
            정회원 로그인
          </Link>
        ) : null}
      </section>
      <div className="actions">
        <Link href="/member">내 등록 확인</Link>
        <Link href={"/member/documents?event=" + encodeURIComponent(id)}>
          행사 자료
        </Link>
      </div>
    </Frame>
  );
}
