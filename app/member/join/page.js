import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMember } from "../../../lib/portal";
import { join } from "../actions";
import { Frame, Field, Note } from "../ui";
export const metadata = { title: "회원가입" };
export default async function Join({ searchParams }) {
  if (await currentMember()) redirect("/member");
  return (
    <Frame
      title="회원가입"
      narrow
      description="의사회 회원 정보를 입력해 주세요. 신청 후 사무국이 면허 정보와 연회비 납부를 확인합니다."
    >
      <Note code={(await searchParams).note} />
      <form action={join} className="stack box">
        <Field
          title="이름"
          name="name"
          required
          maxLength={50}
          autoComplete="name"
        />
        <Field
          title="로그인 이메일"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
        <Field
          title="비밀번호 (10자 이상)"
          name="password"
          type="password"
          required
          minLength={10}
          maxLength={128}
          autoComplete="new-password"
        />
        <Field
          title="소속 의료기관"
          name="organization"
          required
          maxLength={120}
          autoComplete="organization"
        />
        <Field
          title="의사 면허번호"
          name="license"
          required
          pattern="[0-9]{1,10}"
          maxLength={10}
          inputMode="numeric"
        />
        <details>
          <summary>회원 정보 수집·이용 안내</summary>
          <p className="muted">
            대한재활의학과의사회는 가입 신청과 면허 확인, 정회원 승인, 학술행사
            등록을 위해 이름·이메일·소속·면허번호를 이용합니다. 비밀번호는
            해시로 저장합니다. 회원 정보 변경과 탈퇴는 사무국(1599-4897)에
            요청할 수 있습니다. 회원 정보 처리에 동의하지 않으면 가입 신청이
            어렵습니다.
          </p>
        </details>
        <label>
          <input name="consent" type="checkbox" required /> 회원 정보
          수집·이용에 동의합니다.
        </label>
        <button>가입 신청</button>
      </form>
      <p>
        이미 신청하셨나요? <Link href="/member/login">로그인</Link>
      </p>
    </Frame>
  );
}
