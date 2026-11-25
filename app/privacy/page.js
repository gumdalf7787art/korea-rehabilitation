import Link from "next/link";
export const metadata = {
  title: "개인정보 처리 안내",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <main className="wrap page">
      <h1>개인정보 처리 안내</h1>
      <div className="panel">
        <h2>홈페이지에서 사용하는 정보</h2>
        <p>
          가입 시 입력한 이름, 이메일, 소속과 의사면허번호는 회원 확인에
          사용합니다. 비밀번호는 해시로 보관하며 로그인 세션을 유지하기 위해
          쿠키를 사용합니다.
        </p>
        <p>
          학술행사 신청과 연회비 납부 확인 내역은 본인과 사무국이 확인합니다.
          회원 상담은 접수한 회원과 담당 사무국에서 확인할 수 있습니다.
        </p>
        <h2>회원 정보 문의</h2>
        <p>회원 정보 열람·정정·삭제 요청은 사무국으로 연락해 주세요.</p>
        <p>
          <a href="mailto:kmreha@naver.com">kmreha@naver.com</a> ·{" "}
          <a href="tel:15994897">1599-4897</a>
        </p>
        <a
          className="btn secondary"
          href={
            (process.env.NEXT_PUBLIC_LEGACY_URL || "https://www.rm.or.kr") + "/"
          }
        >
          기존 의사회 개인정보취급방침 확인
        </a>{" "}
        <Link href="/about/contact">사무국 안내</Link>
      </div>
    </main>
  );
}
