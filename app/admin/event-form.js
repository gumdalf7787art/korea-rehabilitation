import { Field } from "../member/ui";
import { saveEvent } from "./actions";
function local(v) {
  return v
    ? new Date(Date.parse(v) + 9 * 3600000).toISOString().slice(0, 16)
    : "";
}
export default function EventForm({ event = {} }) {
  return (
    <form action={saveEvent} className="stack">
      <input type="hidden" name="event_id" value={event.id || ""} />
      <Field
        title="행사명"
        defaultValue={event.title || ""}
        name="title"
        required
        maxLength={180}
      />
      <Field
        defaultValue={event.location}
        title="장소"
        name="location"
        required
        maxLength={180}
      />
      <Field title="프로그램·연자·입금 안내">
        <textarea
          defaultValue={event.description || ""}
          name="description"
          rows={5}
          maxLength={8000}
        />
      </Field>
      <div className="pair">
        <Field
          defaultValue={local(event.starts_at)}
          title="행사 시작 (한국시간)"
          name="start"
          type="datetime-local"
          required
        />
        <Field
          defaultValue={local(event.ends_at)}
          title="행사 종료"
          name="end"
          type="datetime-local"
          required
        />
        <Field
          defaultValue={local(event.priority_opens_at)}
          title="정회원 우선등록 시작 (선택)"
          name="priority"
          type="datetime-local"
        />
        <Field
          defaultValue={local(event.opens_at)}
          title="일반 접수 시작"
          name="open"
          type="datetime-local"
          required
        />
        <Field
          defaultValue={local(event.closes_at)}
          title="접수 마감"
          name="close"
          type="datetime-local"
          required
        />
      </div>
      <Field
        defaultValue={event.capacity}
        title="정원"
        name="capacity"
        type="number"
        min={1}
        max={100000}
        required
      />
      <Field
        title="등록비 (원)"
        name="fee"
        type="number"
        min={0}
        defaultValue={event.fee || 0}
        required
      />
      <label>
        <input
          name="members_only"
          type="checkbox"
          defaultChecked={Boolean(event.members_only)}
        />{" "}
        정회원만 신청
      </label>
      <button name="mode" value={event.id ? "edit" : "new"}>
        {event.id ? "변경 저장" : "행사 공개"}
      </button>
      {event.id && (
        <button name="mode" value="copy" className="secondary">
          입력한 내용으로 새 행사 복제
        </button>
      )}
    </form>
  );
}
