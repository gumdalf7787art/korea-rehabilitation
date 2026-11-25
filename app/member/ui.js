export function Frame({ title, description, narrow = false, children }) {
  return (
    <article className={"portal" + (narrow ? " narrow" : "")}>
      <h1>{title}</h1>
      {description && <p className="intro">{description}</p>}
      {children}
    </article>
  );
}
export function Field({ title, children, ...props }) {
  return (
    <label className="field">
      {title}
      {children || <input {...props} />}
    </label>
  );
}
const notes = {
  invalid: "입력값과 필수 항목을 확인해 주세요.",
  credentials: "이메일 또는 비밀번호를 확인해 주세요.",
  rate: "요청이 많습니다. 15분 후 다시 시도해 주세요.",
  duplicate:
    "등록 정보를 확인해 주세요. 기존 회원이거나 가입에 어려움이 있으면 사무국에 문의해 주세요.",
  joined:
    "가입 신청을 접수했습니다. 사무국에서 회원 정보와 연회비를 확인합니다.",
  registered: "신청 결과를 아래에서 확인해 주세요.",
  cancelled: "신청을 취소했습니다.",
  unavailable:
    "현재 상태에서 요청을 처리할 수 없습니다. 아래의 신청 상태를 확인해 주세요.",
  approval: "정회원 승인 후 이용할 수 있습니다.",
  sent: "문의를 접수했습니다.",
  saved: "저장했습니다.",
  forbidden: "사무국 권한이 필요합니다.",
  file: "파일 형식 또는 크기, 자료 정보를 확인해 주세요.",
  missing: "대상을 찾을 수 없습니다.",
  storage:
    "파일을 저장할 수 없습니다. 연결 상태를 확인한 후 다시 시도해 주세요.",
};
export function Note({ code }) {
  return notes[code] ? (
    <p className="notice" role="status">
      {notes[code]}
    </p>
  ) : null;
}
export function Empty({ children }) {
  return <p className="muted">{children}</p>;
}
export const statusName = {
  registered: "등록",
  waiting: "대기",
  cancelled: "취소",
};
