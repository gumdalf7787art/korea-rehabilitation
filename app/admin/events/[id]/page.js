import { notFound } from "next/navigation";
import Link from "next/link";
import { portalEnv, requireStaff } from "../../../../lib/portal";
import { Frame } from "../../../member/ui";
import EventForm from "../../event-form";
export default async function EditEvent({ params }) {
  await requireStaff();
  const { id } = await params,
    { DB } = await portalEnv();
  const e = await DB.prepare("SELECT * FROM events WHERE id=?")
    .bind(id)
    .first();
  if (!e) notFound();
  return (
    <Frame
      title="행사 수정·복제"
      description="기존 신청자의 등록비는 신청 당시 금액을 유지합니다. 정원을 늘리면 접수 중인 행사의 대기자가 순서대로 등록됩니다."
    >
      <section className="box">
        <EventForm event={e} />
      </section>
      <Link href="/admin?tab=events">행사 관리 목록</Link>
    </Frame>
  );
}
