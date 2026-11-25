import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMember, safeNext } from "../../../lib/portal";
import { login } from "../actions";
import { Frame, Field, Note } from "../ui";
export const metadata = { title: "회원 로그인" };
export default async function Login({ searchParams }) {
  const q = await searchParams,
    next = safeNext(q.next);
  if (await currentMember()) redirect(next);
  return (
    <Frame
      title="회원 로그인"
      narrow
      description="신청한 행사와 내 회원 혜택을 확인하세요."
    >
      <Note code={q.note} />
      <form action={login} className="box stack">
        <input type="hidden" name="next" value={next} />
        <Field
          title="이메일"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
        <Field
          title="비밀번호"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
        <button>로그인</button>
      </form>
      <div className="actions">
        <Link href="/member/join">회원가입</Link>
        <a href="tel:15994897">계정 문의 1599-4897</a>
      </div>
    </Frame>
  );
}
